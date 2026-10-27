import {readFileSync} from "node:fs";
import {mkdir, readdir} from "node:fs/promises";
import path from "node:path";

import {slug} from "github-slugger";

import {getSkillPaths, isBuildableSkill, listSkillNames, siteOutputDir} from "./config.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {normalizeHeadingTitle, readSkillDocument} from "./parser.js";
import {snippetLinePattern} from "./snippets.js";
import {escapeMarkdownProse, getRuleId, getRulesForSection} from "./routing.js";
import type {LoadedSkillDocument, SkillCompanion, SkillRule, SkillSection} from "./types.js";

/**
 * 섹션 파일 이름 앞 번호 자릿수. `01-ownership.md`
 */
const sectionNumberWidth = 2;

/**
 * 사이드바 묶음. 루트 `for-humanity.config.ts`의 `navigation`과 순서 일치
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
	testing: {name: "Testing", group: "Coding", order: 4},
	figma: {name: "Figma", group: "Tool", order: 1},
	blueprint: {name: "Blueprint", group: "Tool", order: 2},
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
	 * @field 규칙 번호. `2.3` 꼴
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
	/**
	 * @field 규칙 파일이 있는 폴더. `<<<` 상대 경로의 기준
	 */
	rulesDir: string;
	/**
	 * @field 사이트로 복사할 예제 파일. 사이트 경로 → 복사본 본문
	 */
	copies: Map<string, string>;
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
 * 예제 머리말 줄. `rule-body.ts` 의 examplePattern 과 같은 형태
 */
const exampleLabelPattern = /^\*\*(Incorrect|Correct)(?:\s+(\d+))?\s*(?:\((.+)\))?\s*:?\*\*$/;

/**
 * 사이트 안에서 예제 파일 복사본이 사는 폴더. 섹션 페이지가 `<<<` 로 가리킴
 */
const exampleCopyDir = "examples";

/**
 * 줄 표기만 있는 주석 줄. 제목으로 올릴 경로 주석 앞에 붙어 있으면 같이 뺌
 */
const notationLinePattern =
	/^\s*(?:\{\/\* \[!code [^\]]+\] \*\/\}|\/\/ \[!code [^\]]+\]|\/\* \[!code [^\]]+\] \*\/|# \[!code [^\]]+\])\s*$/;

/**
 * 파일 경로만 적은 첫 줄 주석. 설명이 붙은 주석은 코드에 남김
 */
const pathCommentPattern = /^(?:\/\/|#|\/\*)\s*([\w@./-]+\.(?:tsx?|css|m?js|json|md|txt|grit))\s*(?:\*\/)?\s*$/;

/**
 * @summary 사이트로 복사할 예제 파일 하나
 */
interface ExampleCopy {
	/**
	 * @field 복사본 본문. 제목으로 올린 경로 주석은 뺀 상태
	 */
	content: string;
	/**
	 * @field 제목 띠에 올릴 파일 경로. 첫 줄이 경로 주석이 아니면 없음
	 */
	title?: string;
}

/**
 * @helper 예제 파일을 읽어 첫 줄의 경로 주석을 제목으로 올림. 그 앞의 줄 표기 주석도 함께 뺌
 */
const toExampleCopy = (sourcePath: string): ExampleCopy => {
	const lines = readFileSync(sourcePath, "utf8").split("\n");
	const first = lines.findIndex((line) => !notationLinePattern.test(line));
	const title = first < 0 ? undefined : pathCommentPattern.exec(lines[first] ?? "")?.[1];

	if (title === undefined) {
		return {content: lines.join("\n")};
	}

	const rest = lines.slice(first + 1);

	while ((rest[0] ?? "").trim() === "") {
		rest.shift();
	}

	return {content: rest.join("\n"), title};
};

/**
 * @helper 예제 전부를 설명 한 줄과 `<<<` 줄로. 번호와 Incorrect, Correct 글자는 안 보이고 블록 색이 판정을 말함
 * @description 원문의 `<<<` 가 가리키는 파일을 사이트 폴더로 복사하도록 context.copies 에 적고, 줄 표기 주석은 파일 안에 있어 그대로 살아남
 */
const renderExamples = (rule: SkillRule, context: RuleRenderContext): string[] => {
	const lines = rule.source.trim().split("\n");
	const start = lines.findIndex((line) => exampleLabelPattern.test(line));

	if (start < 0) {
		return [];
	}

	const out: string[] = [];
	let tone: "bad" | "good" = "bad";

	for (const line of lines.slice(start)) {
		const label = exampleLabelPattern.exec(line);

		if (label !== null) {
			tone = label[1] === "Incorrect" ? "bad" : "good";
			const description = (label[3] ?? "").trim();

			if (description !== "") {
				out.push(toSummarySentence(description), "");
			}

			continue;
		}

		const snippet = snippetLinePattern.exec(line);

		if (snippet === null) {
			if (line.trim() !== "") {
				out.push(line);
			}

			continue;
		}

		const [, reference = ""] = snippet;
		const sourcePath = path.resolve(context.rulesDir, reference);
		// rules/ 기준 `../examples/<id>/<file>` → 사이트의 `examples/<skill>/<id>/<file>`
		const insideExamples = path.posix.normalize(path.posix.join("rules", reference)).replace(/^examples\//, "");
		const copyPath = `${exampleCopyDir}/${context.document.skillName}/${insideExamples}`;

		const copy = toExampleCopy(sourcePath);
		const title = copy.title === undefined ? "" : ` [${copy.title}]`;

		context.copies.set(copyPath, copy.content);
		out.push(`<<< ${path.posix.relative(path.posix.dirname(context.page), copyPath)} ${tone} line-numbers${title}`, "");
	}

	while (out.length > 0 && (out.at(-1) ?? "").trim() === "") {
		out.pop();
	}

	return out;
};

/**
 * @helper 요지를 완결 문장으로. frontmatter 의 괄호 설명은 마침표 없이 끝남
 */
const toSummarySentence = (summary: string): string => (summary === "" || /[.!?]$/.test(summary) ? summary : `${summary}.`);

/**
 * @helper 규칙 본문 하나를 섹션 페이지 조각으로. 번호 헤딩, 등급 없는 요지, 사람용 링크, 머리말 붙은 예제, 함께 보기
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

	// 산문은 첫 예제 머리말 앞까지. 예제는 분해한 뒤 다시 그림
	const firstExample = lines.findIndex((line) => /^\*\*(?:Incorrect|Correct)\b/.test(line));
	const prose = firstExample < 0 ? lines : lines.slice(0, firstExample);

	while (prose.length > 0 && (prose.at(-1) ?? "").trim() === "") {
		prose.pop();
	}

	return [...linkRuleReferences(prose, context), "", ...renderExamples(rule, context), ...renderRelated(rule, context)].join("\n");
};

/**
 * @summary 섹션 페이지 렌더링 입력
 */
interface SectionPageArgs {
	document: LoadedSkillDocument;
	section: SkillSection;
	rules: SkillRule[];
	locations: Map<string, RuleLocation>;
	copies: Map<string, string>;
}

/**
 * @helper 섹션 하나가 페이지 하나. 규칙은 `##`, 규칙 안 소제목은 원문 `###` 그대로
 */
const renderSectionPage = (args: SectionPageArgs): string => {
	const {document, section, rules, locations, copies} = args;
	const placement = getPlacement(document.skillName);
	const page = sectionPagePath(document.skillName, section);
	const context: RuleRenderContext = {document, page, locations, rulesDir: getSkillPaths(document.skillName).rulesDir, copies};
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

		documents.push(await readSkillDocument(getSkillPaths(skillName)));
	}

	documents.sort(comparePlacement);

	const locations = collectRuleLocations(documents);
	const copies = new Map<string, string>();
	const files: SiteFile[] = [];

	for (const document of documents) {
		files.push({path: `${document.skillName}.md`, content: renderOverviewPage(document, locations)});

		for (const section of document.sections) {
			const rules = getRulesForSection(section, document.rules);

			if (rules.length === 0) {
				continue;
			}

			files.push({
				path: sectionPagePath(document.skillName, section),
				content: renderSectionPage({document, section, rules, locations, copies}),
			});
		}
	}

	// 예제 파일 복사본. for-humanity 는 문서 폴더 안의 파일만 읽음
	for (const [copyPath, content] of [...copies].sort(([left], [right]) => left.localeCompare(right, "en-US"))) {
		files.push({path: copyPath, content});
	}

	return files;
};

/**
 * @helper 지금 생성 폴더에 있는 파일 상대 경로. 페이지와 예제 복사본 전부
 */
const listSiteFiles = async (): Promise<string[]> => {
	try {
		const entries = await readdir(siteOutputDir, {recursive: true, withFileTypes: true});

		return entries.filter((entry) => entry.isFile()).map((entry) => path.relative(siteOutputDir, path.join(entry.parentPath, entry.name)));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}

		throw error;
	}
};

/**
 * @description 생성 폴더를 현재 원본 기준으로 다시 씀. 사라진 섹션의 옛 페이지와 옛 예제 복사본은 지움
 */
export const buildSite = async (): Promise<void> => {
	const files = await generateSiteFiles();
	const targetPaths = new Set(files.map((file) => file.path));
	const stalePaths = (await listSiteFiles()).filter((relativePath) => !targetPaths.has(relativePath));

	for (const directory of new Set(files.map((file) => path.dirname(path.join(siteOutputDir, file.path))))) {
		await mkdir(directory, {recursive: true});
	}

	await replaceGeneratedFiles([
		...files.map((file) => ({targetPath: path.join(siteOutputDir, file.path), content: file.content})),
		...stalePaths.map((relativePath) => ({targetPath: path.join(siteOutputDir, relativePath)})),
	]);
	console.log(`Wrote site (${files.length} files${stalePaths.length > 0 ? `, removed ${stalePaths.length}` : ""})`);
};
