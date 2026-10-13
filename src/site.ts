import {mkdir, readdir} from "node:fs/promises";
import path from "node:path";

import {slug} from "github-slugger";

import {getSkillPaths, isBuildableSkill, listSkillNames, siteOutputDir} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {normalizeHeadingTitle, readSkillDocument} from "./parser.js";
import {escapeMarkdownProse, getCanonicalRoutingOrdinals, getRuleId, getRulesForSection} from "./routing.js";
import type {LoadedSkillDocument, SkillCompanion, SkillRule, SkillSection} from "./types.js";

/**
 * 섹션 파일 이름 앞 번호 자릿수. `01-ownership.md`
 */
const sectionNumberWidth = 2;

/**
 * 사이드바 묶음. for-humanity 설정의 `navigation` 순서
 */
const navigationGroups = ["Coding", "Tool"] as const;

type NavigationGroup = (typeof navigationGroups)[number];

/**
 * @summary skill 하나가 사이드바에서 차지하는 자리
 */
interface SitePlacement {
	/**
	 * @field 사이드바에 보이는 짧은 이름
	 */
	name: string;
	/**
	 * @field 묶음 이름
	 */
	group: NavigationGroup;
	/**
	 * @field 묶음 안 순서
	 */
	order: number;
}

const placementBySkillName: Record<string, SitePlacement> = {
	react: {name: "React", group: "Coding", order: 1},
	css: {name: "CSS", group: "Coding", order: 2},
	typescript: {name: "TypeScript", group: "Coding", order: 3},
	figma: {name: "Figma", group: "Tool", order: 1},
};

/**
 * 본문 백틱 안 규칙 ID 후보. validate의 산문 참조 검사와 같은 기준
 */
const ruleReferencePattern = /`((?:[a-z][a-z0-9]*\/)?[a-z][a-z0-9]*(?:-[a-z0-9]+){3,})`/g;

/**
 * @summary 규칙 하나가 사이트에서 사는 페이지와 앵커
 */
interface RuleLocation {
	/**
	 * @field `site/` 기준 페이지 경로. `css/02-ownership.md`
	 */
	page: string;
	/**
	 * @field 페이지 안 규칙 헤딩 앵커. `#` 없음
	 */
	anchor: string;
	/**
	 * @field 규칙 번호. `HANDBOOK.md`와 같은 `2.3`
	 */
	number: string;
	/**
	 * @field 번호를 붙인 헤딩 본문
	 */
	heading: string;
	/**
	 * @field 중요도 등급
	 */
	impact: string;
}

/**
 * @summary 생성할 사이트 파일 하나
 */
export interface SiteFile {
	/**
	 * @field `site/` 기준 상대 경로
	 */
	path: string;
	/**
	 * @field UTF-8 본문
	 */
	content: string;
}

/**
 * @helper skill의 사이드바 자리. 새 skill은 표에 먼저 등록
 */
const getPlacement = (skillName: string): SitePlacement => {
	const placement = placementBySkillName[skillName];

	if (!placement) {
		throw new Error(`Skill "${skillName}" has no site placement. Add it to placementBySkillName in site.ts.`);
	}

	return placement;
};

/**
 * @helper 사이드바 순서. 묶음 순서 다음 묶음 안 순서
 */
const comparePlacement = (left: LoadedSkillDocument, right: LoadedSkillDocument): number => {
	const leftPlacement = getPlacement(left.skillName);
	const rightPlacement = getPlacement(right.skillName);

	return (
		navigationGroups.indexOf(leftPlacement.group) - navigationGroups.indexOf(rightPlacement.group) ||
		leftPlacement.order - rightPlacement.order
	);
};

/**
 * @helper YAML frontmatter scalar. 콜론, 따옴표가 들어가도 깨지지 않게 JSON 문자열로
 */
const yamlScalar = (value: string): string => JSON.stringify(value);

/**
 * @helper 섹션 페이지의 `site/` 기준 경로
 */
const sectionPagePath = (skillName: string, section: SkillSection): string => {
	return `${skillName}/${String(section.order).padStart(sectionNumberWidth, "0")}-${section.prefix}.md`;
};

/**
 * @helper 화면에 쓰는 규칙 제목. 한국어 제목이 없으면 영어 제목
 */
const ruleDisplayTitle = (rule: SkillRule): string => rule.titleKo || normalizeHeadingTitle(rule.title);

/**
 * @helper 화면에 쓰는 섹션 제목
 */
const sectionDisplayTitle = (section: SkillSection): string => section.titleKo || section.title;

/**
 * @helper 페이지 사이 상대 링크. for-humanity가 사이트 URL로 바꿈
 */
const relativeLink = (fromPage: string, toPage: string, anchor: string): string => {
	if (fromPage === toPage) {
		return `#${anchor}`;
	}

	return `${path.posix.relative(path.posix.dirname(fromPage), toPage)}#${anchor}`;
};

/**
 * @helper 모든 skill의 규칙을 `skill/id` 키로 페이지, 앵커에 매핑
 * @description 앵커는 for-humanity가 헤딩 글에 github-slugger를 적용한 값과 같아야 함. 백틱만 떼면 같은 입력
 */
const collectRuleLocations = (documents: LoadedSkillDocument[]): Map<string, RuleLocation> => {
	const locations = new Map<string, RuleLocation>();

	for (const document of documents) {
		for (const section of document.sections) {
			getRulesForSection(section, document.rules).forEach((rule, index) => {
				const number = `${section.order}.${index + 1}`;
				const heading = `${number} ${ruleDisplayTitle(rule)}`;

				locations.set(`${document.skillName}/${getRuleId(rule)}`, {
					page: sectionPagePath(document.skillName, section),
					anchor: slug(heading.replace(/`/g, "")),
					number,
					heading,
					impact: rule.impact,
				});
			});
		}
	}

	return locations;
};

/**
 * @summary 규칙 하나를 렌더링하는 데 필요한 문맥
 */
interface RuleRenderContext {
	/**
	 * @field 규칙을 소유한 skill 문서
	 */
	document: LoadedSkillDocument;
	/**
	 * @field 이 규칙이 실리는 페이지
	 */
	page: string;
	/**
	 * @field 전체 규칙 위치 색인
	 */
	locations: Map<string, RuleLocation>;
	/**
	 * @field 규칙 ID별 라우팅 순번
	 */
	ordinalByRuleId: Map<string, string>;
}

/**
 * @helper 규칙 참조를 `skill/id` 키로 해석. 같은 skill 안 참조는 skill 이름 생략 가능
 */
const resolveReference = (reference: string, context: RuleRenderContext): RuleLocation | undefined => {
	return context.locations.get(reference.includes("/") ? reference : `${context.document.skillName}/${reference}`);
};

/**
 * @helper 규칙 ID 하나를 링크로. 해석되지 않으면 코드 스팬 그대로
 */
const renderReference = (reference: string, context: RuleRenderContext): string => {
	const target = resolveReference(reference, context);

	return target ? `[\`${reference}\`](${relativeLink(context.page, target.page, target.anchor)})` : `\`${reference}\``;
};

/**
 * @helper 산문 줄의 백틱 규칙 ID를 링크로 교체. 코드 펜스 안은 그대로
 */
const linkRuleReferences = (lines: string[], context: RuleRenderContext): string[] => {
	let inFence = false;

	return lines.map((line) => {
		if (line.startsWith("```")) {
			inFence = !inFence;
			return line;
		}

		if (inFence) {
			return line;
		}

		return line.replace(ruleReferencePattern, (_match, reference: string) => renderReference(reference, context));
	});
};

/**
 * @helper 헤딩과 Impact 줄 아래에 끼우는 규칙 메타. 순번, ID, 관계, 적용 조건
 */
const renderRuleMeta = (rule: SkillRule, context: RuleRenderContext): string[] => {
	const ruleId = getRuleId(rule);
	const ordinal = context.ordinalByRuleId.get(ruleId);

	if (!ordinal) {
		throw new Error(`Rule "${rule.title}" is missing its canonical routing ordinal.`);
	}

	const meta = [`- **Rule:** \`${ordinal}\` \`${ruleId}\` ${normalizeHeadingTitle(rule.title)}`];

	if (rule.requiresSelected.length > 0) {
		meta.push(`- **함께 적용:** ${rule.requiresSelected.map((target) => renderReference(target, context)).join(", ")}`);
	}

	if (rule.reviewWith.length > 0) {
		meta.push(`- **함께 보기:** ${rule.reviewWith.map((target) => renderReference(target, context)).join(", ")}`);
	}

	if (rule.requiredOnCompletion) {
		meta.push("- **마무리:** 작업을 끝낼 때 항상 적용합니다.");
	}

	const bullets = rule.appliesWhenBullets ?? [];

	if (bullets.length === 0 && rule.appliesWhen !== undefined) {
		bullets.push(rule.appliesWhen);
	}

	if (bullets.length === 0) {
		return meta;
	}

	return [...meta, "", ":::note[언제 적용할까요?]", ...bullets.map((bullet) => `- ${escapeMarkdownProse(bullet)}`), ":::"];
};

/**
 * @helper 규칙 본문 하나를 섹션 페이지 조각으로. 헤딩 교체, 메타 삽입, 참조 링크
 */
const renderRule = (rule: SkillRule, context: RuleRenderContext): string => {
	const location = context.locations.get(`${context.document.skillName}/${getRuleId(rule)}`);

	if (!location) {
		throw new Error(`Rule "${rule.title}" has no site location.`);
	}

	const lines = rule.body.trim().split("\n");
	const headingIndex = lines.findIndex((line) => line.startsWith("## "));

	if (headingIndex < 0) {
		throw new Error(`Rule "${rule.title}" is missing its "## " heading.`);
	}

	lines[headingIndex] = `## ${location.heading}`;

	const impactIndex = lines.findIndex((line, index) => index > headingIndex && line.startsWith("**Impact:"));
	const insertAt = (impactIndex < 0 ? headingIndex : impactIndex) + 1;
	// 메타는 링크를 끝낸 뒤에 끼움. 먼저 끼우면 Rule 줄의 자기 ID가 자기 헤딩으로 가는 링크가 됨
	const linked = linkRuleReferences(lines, context);

	linked.splice(insertAt, 0, "", ...renderRuleMeta(rule, context));

	return linked.join("\n");
};

/**
 * @summary 섹션 페이지 렌더링 입력
 */
interface SectionPageArgs {
	document: LoadedSkillDocument;
	section: SkillSection;
	rules: SkillRule[];
	locations: Map<string, RuleLocation>;
}

/**
 * @helper 섹션 하나가 페이지 하나. 규칙은 `##`, 규칙 안 소제목은 원문 `###` 그대로
 */
const renderSectionPage = (args: SectionPageArgs): string => {
	const {document, section, rules, locations} = args;
	const placement = getPlacement(document.skillName);
	const page = sectionPagePath(document.skillName, section);
	const context: RuleRenderContext = {document, page, locations, ordinalByRuleId: getCanonicalRoutingOrdinals(document)};
	const lines = [
		"---",
		`name: ${yamlScalar(`${section.order}. ${sectionDisplayTitle(section)}`)}`,
		`label: ${yamlScalar(section.title)}`,
		`group: ${placement.group}`,
		`parent: ${document.skillName}`,
		`order: ${section.order}`,
		"---",
		"",
		`**Impact: ${section.impact}**`,
		"",
		section.description,
		"",
	];

	for (const rule of rules) {
		lines.push(renderRule(rule, context), "");
	}

	return lines.join("\n");
};

/**
 * @helper companion 한 줄. 어느 skill을 언제 함께 적용하는지
 */
const renderCompanion = (companion: SkillCompanion): string => {
	const link = `[${getPlacement(companion.skill).name}](${companion.skill}.md)`;

	if (companion.mode === "required") {
		return `- ${link}: 항상 함께 적용합니다.`;
	}

	if (companion.appliesWhen === undefined) {
		return `- ${link}: 관련 변경이 있을 때 함께 적용합니다.`;
	}

	return `- ${link}: 다음 조건에서 함께 적용합니다. ${escapeMarkdownProse(companion.appliesWhen)}`;
};

/**
 * @helper skill 개요 페이지. 초록, companion, 섹션별 규칙 표
 */
const renderOverviewPage = (document: LoadedSkillDocument, locations: Map<string, RuleLocation>): string => {
	const placement = getPlacement(document.skillName);
	const page = `${document.skillName}.md`;
	const lines = [
		"---",
		`name: ${yamlScalar(placement.name)}`,
		`label: ${yamlScalar(document.metadata.title)}`,
		`group: ${placement.group}`,
		`order: ${placement.order}`,
		"---",
		"",
		document.metadata.abstract,
		"",
	];
	const companions = document.metadata.companions ?? [];

	if (companions.length > 0) {
		lines.push("## 함께 따르는 규칙", "", ...companions.map(renderCompanion), "");
	}

	lines.push("## 규칙", "");

	for (const section of document.sections) {
		const rules = getRulesForSection(section, document.rules);

		if (rules.length === 0) {
			continue;
		}

		const sectionPage = sectionPagePath(document.skillName, section);

		lines.push(`### ${section.order}. ${sectionDisplayTitle(section)}`, "");
		lines.push(`[${section.title}](${sectionPage}) **${section.impact}**`, "");
		lines.push("| 규칙 | 영향도 |", "| --- | --- |");

		for (const rule of rules) {
			const location = locations.get(`${document.skillName}/${getRuleId(rule)}`);

			if (!location) {
				throw new Error(`Rule "${rule.title}" has no site location.`);
			}

			lines.push(`| [${location.heading}](${relativeLink(page, location.page, location.anchor)}) | ${location.impact} |`);
		}

		lines.push("");
	}

	const references = document.metadata.references ?? [];

	if (references.length > 0) {
		lines.push("## 참고 자료", "", ...references.map((reference) => `- ${reference}`), "");
	}

	return lines.join("\n");
};

/**
 * @helper 홈. skill 표와 생성 경로 안내
 */
const renderHomePage = (documents: LoadedSkillDocument[]): string => {
	const lines = [
		"# 팀 컨벤션",
		"",
		"React, CSS, TypeScript, Figma 코딩 규칙을 사람이 읽는 사이트입니다.",
		"정본은 저장소의 `skill/<skill>/rules/*.md`이고, 이 사이트는 `npm run site`가 거기서 생성합니다.",
		"",
		"| 스킬 | 규칙 수 | 함께 적용 |",
		"| --- | --- | --- |",
	];

	for (const document of documents) {
		const placement = getPlacement(document.skillName);
		const companions = (document.metadata.companions ?? []).map(
			(companion) => `[${getPlacement(companion.skill).name}](${companion.skill}.md) ${companion.mode === "required" ? "항상" : "조건부"}`,
		);

		lines.push(
			`| [${placement.name}](${document.skillName}.md) | ${document.rules.length} | ${companions.length > 0 ? companions.join(", ") : "없음"} |`,
		);
	}

	lines.push("");

	return lines.join("\n");
};

/**
 * @helper for-humanity 사이트 설정. 묶음 순서와 상태 표지 끄기
 */
const renderConfig = (): string => {
	return [
		"/*",
		" * 생성 파일. 원본은 src/site.ts",
		" */",
		"export default {",
		'\ttitle: "팀 컨벤션",',
		'\tdescription: "React, CSS, TypeScript, Figma 코딩 규칙",',
		`\tnavigation: ${JSON.stringify([...navigationGroups])},`,
		"\tstatus: [],",
		"};",
		"",
	].join("\n");
};

/**
 * @api `skill/` 전체를 for-humanity Markdown 파일 목록으로 렌더링. 쓰기 없음
 */
export const generateSiteFiles = async (): Promise<SiteFile[]> => {
	const documents: LoadedSkillDocument[] = [];

	for (const skillName of await listSkillNames()) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		const document = await readSkillDocument(getSkillPaths(skillName));

		if (document.metadata.progressiveDisclosure !== true) {
			continue;
		}

		documents.push(document);
	}

	documents.sort(comparePlacement);

	const locations = collectRuleLocations(documents);
	const files: SiteFile[] = [
		{path: "for-humanity.config.mjs", content: renderConfig()},
		{path: "README.md", content: renderHomePage(documents)},
	];

	for (const document of documents) {
		files.push({path: `${document.skillName}.md`, content: renderOverviewPage(document, locations)});

		for (const section of document.sections) {
			const rules = getRulesForSection(section, document.rules);

			if (rules.length === 0) {
				continue;
			}

			files.push({path: sectionPagePath(document.skillName, section), content: renderSectionPage({document, section, rules, locations})});
		}
	}

	return files;
};

/**
 * @helper 지금 `site/`에 있는 Markdown 상대 경로. for-humanity 출력 `dist/`는 제외
 */
const listSiteMarkdownFiles = async (): Promise<string[]> => {
	try {
		const entries = await readdir(siteOutputDir, {recursive: true, withFileTypes: true});

		return entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
			.map((entry) => path.relative(siteOutputDir, path.join(entry.parentPath, entry.name)))
			.filter((relativePath) => !relativePath.startsWith(`dist${path.sep}`));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}

		throw error;
	}
};

/**
 * @description `site/`를 현재 원본 기준으로 다시 씀. 사라진 섹션의 옛 페이지는 지움
 */
export const buildSite = async (): Promise<void> => {
	const files = await generateSiteFiles();
	const targetPaths = new Set(files.map((file) => file.path));
	const stalePaths = (await listSiteMarkdownFiles()).filter((relativePath) => !targetPaths.has(relativePath));

	for (const directory of new Set(files.map((file) => path.dirname(path.join(siteOutputDir, file.path))))) {
		await mkdir(directory, {recursive: true});
	}

	await replaceGeneratedFiles([
		...files.map((file) => ({targetPath: path.join(siteOutputDir, file.path), content: file.content})),
		...stalePaths.map((relativePath) => ({targetPath: path.join(siteOutputDir, relativePath)})),
	]);
	console.log(`Wrote site (${files.length} files${stalePaths.length > 0 ? `, removed ${stalePaths.length}` : ""})`);
};

/**
 * @description CLI 진입점
 */
export const main = async (): Promise<void> => {
	await buildSite();
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
