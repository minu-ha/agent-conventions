import {mkdir, readdir} from "node:fs/promises";
import path from "node:path";

import {slug} from "github-slugger";

import {getSkillPaths, isBuildableSkill, listSkillNames, siteOutputDir} from "./config.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {normalizeHeadingTitle, readSkillDocument} from "./parser.js";
import {escapeMarkdownProse, getRuleId, getRulesForSection} from "./routing.js";
import type {LoadedSkillDocument, SkillCompanion, SkillRule, SkillSection} from "./types.js";

/**
 * 섹션 파일 이름 앞 번호 자릿수. `01-ownership.md`
 */
const sectionNumberWidth = 2;

/**
 * 사이드바 묶음. `docs/for-humanity.config.mjs` 의 `navigation` 과 같은 순서
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
	 * @field 생성 폴더 기준 페이지 경로. `css/02-ownership.md`
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
	 * @field 규칙을 소유한 skill 이름
	 */
	skill: string;
	/**
	 * @field 사람이 읽는 한 줄 요지. frontmatter `impactDescription`
	 */
	summary: string;
}

/**
 * @summary 생성할 사이트 파일 하나
 */
export interface SiteFile {
	/**
	 * @field 생성 폴더 기준 상대 경로
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
					skill: document.skillName,
					summary: rule.impactDescription ?? "",
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
}

/**
 * @helper 규칙 참조를 `skill/id` 키로 해석. 같은 skill 안 참조는 skill 이름 생략 가능
 */
const resolveReference = (reference: string, context: RuleRenderContext): RuleLocation | undefined => {
	return context.locations.get(reference.includes("/") ? reference : `${context.document.skillName}/${reference}`);
};

/**
 * @helper 다른 skill 규칙이면 앞에 붙이는 skill 이름. 같은 skill 이면 빈 문자열
 */
const skillPrefix = (target: RuleLocation, context: RuleRenderContext): string => {
	return target.skill === context.document.skillName ? "" : `${getPlacement(target.skill).name} `;
};

/**
 * @helper 산문 속 규칙 ID를 사람이 읽는 링크로. `규칙 2.4` 꼴이라 조사가 자연스럽게 붙음. 해석되지 않으면 코드 스팬 그대로
 */
const renderReference = (reference: string, context: RuleRenderContext): string => {
	const target = resolveReference(reference, context);

	return target
		? `[${skillPrefix(target, context)}규칙 ${target.number}](${relativeLink(context.page, target.page, target.anchor)})`
		: `\`${reference}\``;
};

/**
 * @helper 규칙 끝의 함께 보기 목록. 필수 관계와 재검토 관계를 사람에게는 한 목록으로
 */
const renderRelated = (rule: SkillRule, context: RuleRenderContext): string[] => {
	const items = [...new Set([...rule.requiresSelected, ...rule.reviewWith])]
		.map((reference) => resolveReference(reference, context))
		.filter((target): target is RuleLocation => target !== undefined)
		.map((target) => `- [${skillPrefix(target, context)}${target.heading}](${relativeLink(context.page, target.page, target.anchor)})`);

	return items.length === 0 ? [] : ["", "**함께 보기**", "", ...items];
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
 * 예제 라벨 줄. `rule-body.ts` 의 examplePattern 과 같은 형태
 */
const exampleLabelPattern = /^\*\*(Incorrect|Correct)(?:\s+(\d+))?\s*(?:\((.+)\))?\s*:?\*\*$/;

/**
 * @summary 라벨 줄 다음 코드 펜스에 붙일 for-humanity 코드 라벨
 */
interface PendingCodeLabel {
	/**
	 * @field 펜스 메타의 색. 잘못된 예는 bad, 올바른 예는 good
	 */
	tone: "bad" | "good";
	/**
	 * @field 첫 펜스에만 붙는 제목. 같은 라벨의 둘째 블록부터는 띠만
	 */
	title: string;
}

/**
 * @helper `**Incorrect 1 (설명):**` 줄을 지우고 뒤따르는 코드 펜스 메타를 `bad 잘못된 예 1 · 설명` 꼴로. 언어 없는 펜스는 text
 */
const labelExampleFences = (lines: string[]): string[] => {
	const out: string[] = [];
	let inFence = false;
	let pending: PendingCodeLabel | undefined;

	for (const line of lines) {
		if (line.startsWith("```")) {
			if (!inFence && pending !== undefined) {
				const language = line.slice("```".length).trim() || "text";

				out.push(`\`\`\`${language} ${pending.tone}${pending.title === "" ? "" : ` ${pending.title}`}`);
				pending = {tone: pending.tone, title: ""};
				inFence = true;
				continue;
			}

			inFence = !inFence;
			out.push(line);
			continue;
		}

		const match = inFence ? null : exampleLabelPattern.exec(line);

		if (match === null) {
			out.push(line);
			continue;
		}

		const kind = match[1] === "Incorrect" ? "잘못된 예" : "올바른 예";
		const number = match[2] === undefined ? "" : ` ${match[2]}`;
		const description = (match[3] ?? "").replace(/`/g, "").trim();

		pending = {tone: match[1] === "Incorrect" ? "bad" : "good", title: `${kind}${number}${description === "" ? "" : ` · ${description}`}`};
	}

	return out;
};

/**
 * @helper 요지를 완결 문장으로. frontmatter 의 괄호 설명은 마침표 없이 끝남
 */
const toSummarySentence = (summary: string): string => (summary === "" || /[.!?]$/.test(summary) ? summary : `${summary}.`);

/**
 * @helper 규칙 본문 하나를 섹션 페이지 조각으로. 번호 헤딩, 등급 없는 요지, 사람용 링크, 라벨 코드, 함께 보기
 * @description 등급, 순번, ID, 적용 조건은 에이전트의 인덱스와 계약에만 나감. 사람용 페이지에는 싣지 않음
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

	if (impactIndex >= 0) {
		// 등급은 빼고 괄호 안 설명만 요지로 남김
		lines.splice(impactIndex, 1, ...(location.summary === "" ? [] : [toSummarySentence(location.summary)]));
	}

	return [...linkRuleReferences(labelExampleFences(lines), context), ...renderRelated(rule, context)].join("\n");
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
	const context: RuleRenderContext = {document, page, locations};
	const lines = [
		"---",
		`name: ${yamlScalar(`${section.order}. ${sectionDisplayTitle(section)}`)}`,
		`label: ${yamlScalar(`규칙 ${rules.length}개`)}`,
		`group: ${placement.group}`,
		// 파일 위치 기준 참조. 생성 폴더가 어디에 끼워져도 같은 skill 개요를 가리킴
		`parent: ../${document.skillName}`,
		`order: ${section.order}`,
		"---",
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
 * @helper companion 한 줄. 어느 규칙집을 언제 같이 읽는지
 */
const renderCompanion = (companion: SkillCompanion): string => {
	const link = `[${getPlacement(companion.skill).name}](${companion.skill}.md)`;

	if (companion.mode === "required") {
		return `- ${link} 규칙은 항상 함께 봅니다.`;
	}

	if (companion.appliesWhen === undefined) {
		return `- ${link} 규칙은 관련 변경이 있을 때 함께 봅니다.`;
	}

	return `- ${link} 규칙은 다음 변경이 있을 때 함께 봅니다. ${escapeMarkdownProse(companion.appliesWhen)}`;
};

/**
 * 초록 끝의 정본 안내. 저장소를 고치는 사람의 정보라 사람용 사이트에서는 뺌
 */
const sourceNoteSentence = " 규칙 본문의 정본은 `rules/*.md`입니다.";

/**
 * @helper 표 칸에 넣을 글. 세로줄만 이스케이프
 */
const tableCell = (value: string): string => value.replace(/\|/g, "\\|");

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
		document.metadata.abstract.replace(sourceNoteSentence, ""),
		"",
	];
	const companions = document.metadata.companions ?? [];

	if (companions.length > 0) {
		lines.push("## 함께 보는 규칙", "", ...companions.map(renderCompanion), "");
	}

	lines.push("## 규칙", "");

	for (const section of document.sections) {
		const rules = getRulesForSection(section, document.rules);

		if (rules.length === 0) {
			continue;
		}

		const sectionPage = sectionPagePath(document.skillName, section);

		lines.push(`### ${section.order}. ${sectionDisplayTitle(section)}`, "");
		lines.push(`${section.description} [섹션 페이지](${sectionPage})`, "");
		lines.push("| 규칙 | 요지 |", "| --- | --- |");

		for (const rule of rules) {
			const location = locations.get(`${document.skillName}/${getRuleId(rule)}`);

			if (!location) {
				throw new Error(`Rule "${rule.title}" has no site location.`);
			}

			lines.push(`| [${location.heading}](${relativeLink(page, location.page, location.anchor)}) | ${tableCell(location.summary)} |`);
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
	const files: SiteFile[] = [];

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
 * @helper 지금 생성 폴더에 있는 Markdown 상대 경로
 */
const listSiteMarkdownFiles = async (): Promise<string[]> => {
	try {
		const entries = await readdir(siteOutputDir, {recursive: true, withFileTypes: true});

		return entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
			.map((entry) => path.relative(siteOutputDir, path.join(entry.parentPath, entry.name)));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}

		throw error;
	}
};

/**
 * @description 생성 폴더를 현재 원본 기준으로 다시 씀. 사라진 섹션의 옛 페이지는 지움
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
