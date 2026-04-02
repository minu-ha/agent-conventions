import {writeFile} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, parseCliArgs} from "./config.js";
import {buildRuleAnchor, buildSectionAnchor, readResolvedSkillDocuments, replaceRuleHeading} from "./parser.js";
import type {CompiledSkillSection, LoadedSkillDocument, SkillMetadata, SkillPaths, SkillRule, SkillSection} from "./types.js";

/**
 * @helper section prefix 기준 rule 목록 정렬
 */
const getRulesForSection = (section: SkillSection, rules: SkillRule[]): SkillRule[] => {
	return rules.filter((rule) => rule.prefix === section.prefix).sort((left, right) => left.title.localeCompare(right.title, "en-US"));
};

const conventionTitleBySkillName: Record<string, string> = {
	css: "CSS Convention",
	nestjs: "NestJS Convention",
	"playwright-test": "Playwright Test Convention",
	react: "React Convention",
	"tanstack-route": "TanStack Route Convention",
	typescript: "TypeScript Convention",
};
const nestedTocIndent = " ".repeat(4);

/**
 * @helper skill 이름 기준 영어 convention 표시명 계산
 */
const getConventionTitle = (skillName: string, fallbackTitle: string): string => {
	return conventionTitleBySkillName[skillName] ?? fallbackTitle;
};

/**
 * @helper inheritance 결과를 최종 markdown section 묶음으로 변환
 */
const buildCompiledSections = (rootSkillName: string, documents: LoadedSkillDocument[]): CompiledSkillSection[] => {
	const compiledSections = documents.flatMap((document) =>
		document.sections.map((section) => {
			const sectionRules = getRulesForSection(section, document.rules);

			if (sectionRules.length === 0) {
				return undefined;
			}

			const inherited = document.skillName !== rootSkillName;
			const inheritedDescription = inherited ? `이 섹션은 ${document.metadata.title}에서 상속한 공통 규칙입니다. ` : "";
			const inheritedSectionTitle = `${getConventionTitle(document.skillName, document.metadata.title)} Base - ${section.title}`;

			return {
				sourceSkillName: document.skillName,
				sourceSkillTitle: document.metadata.title,
				title: inherited ? inheritedSectionTitle : section.title,
				impact: section.impact,
				description: `${inheritedDescription}${section.description}`.trim(),
				rules: sectionRules,
			};
		}),
	);

	return compiledSections.filter((section): section is CompiledSkillSection => Boolean(section));
};

/**
 * @helper inheritance에 포함된 전체 참고 링크를 중복 없이 수집
 */
const collectReferenceLinks = (documents: LoadedSkillDocument[]): string[] => {
	return Array.from(new Set(documents.flatMap((document) => document.metadata.references ?? [])));
};

/**
 * @helper root skill이 포함하는 base skill 제목 목록 계산
 */
const collectBaseSkillTitles = (rootSkillName: string, documents: LoadedSkillDocument[]): string[] => {
	return documents
		.filter((document) => document.skillName !== rootSkillName)
		.map((document) => getConventionTitle(document.skillName, document.metadata.title));
};

/**
 * @helper metadata와 resolved section을 compiled markdown 본문으로 조립
 */
export const generateMarkdown = (
	skillName: string,
	metadata: SkillMetadata,
	sections: CompiledSkillSection[],
	baseSkillTitles: string[],
	references: string[],
): string => {
	const lines: string[] = [];

	lines.push(`# ${metadata.title}`);
	lines.push("");
	lines.push(`- 버전: ${metadata.version}`);
	lines.push(`- 조직: ${metadata.organization}`);

	if (metadata.date) {
		lines.push(`- 날짜: ${metadata.date}`);
	}

	lines.push("");
	lines.push("> **생성된 문서입니다. 직접 수정하지 마세요.**");
	lines.push(">");
	lines.push(`> 현재 skill의 \`rules/*.md\`, \`metadata.json\`, \`metadata.json.extends\`로 연결된 base skill source를 수정한 뒤 \`npm --prefix package run build -- --skill=${skillName}\`로 다시 생성하세요.`);
	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## 개요");
	lines.push("");
	lines.push(metadata.abstract);

	if (baseSkillTitles.length > 0) {
		lines.push("");
		lines.push(`이 가이드는 ${baseSkillTitles.map((title) => `\`${title}\``).join(", ")}을 공통 기반 스킬로 함께 포함합니다.`);
	}
	lines.push("");

	if (baseSkillTitles.length > 0) {
		lines.push("---");
		lines.push("");
		lines.push("## 함께 포함된 기반 스킬");
		lines.push("");

		for (const baseSkillTitle of baseSkillTitles) {
			lines.push(`- ${baseSkillTitle}`);
		}

		lines.push("");
	}

	lines.push("---");
	lines.push("");
	lines.push("## 목차");
	lines.push("");

	for (const [sectionIndex, section] of sections.entries()) {
		const sectionOrder = sectionIndex + 1;

		lines.push(`${sectionOrder}. [${section.title}](${buildSectionAnchor(sectionOrder, section.title)}) — **${section.impact}**`);

		for (const [ruleIndex, rule] of section.rules.entries()) {
			lines.push(`${nestedTocIndent}- ${sectionOrder}.${ruleIndex + 1} [${rule.title}](${buildRuleAnchor(sectionOrder, ruleIndex + 1, rule.title)})`);
		}
	}

	lines.push("");
	lines.push("---");
	lines.push("");

	for (const [sectionIndex, section] of sections.entries()) {
		const sectionOrder = sectionIndex + 1;

		lines.push(`## ${sectionOrder}. ${section.title}`);
		lines.push("");
		lines.push(`**Impact: ${section.impact}**`);
		lines.push("");
		lines.push(section.description);
		lines.push("");

		for (const [ruleIndex, rule] of section.rules.entries()) {
			const ruleOrder = ruleIndex + 1;
			lines.push(replaceRuleHeading(rule.body.trim(), sectionOrder, ruleOrder, rule.title));
			lines.push("");
		}
	}

	if (references.length > 0) {
		lines.push("## 참고 자료");
		lines.push("");

		for (const reference of references) {
			lines.push(`- ${reference}`);
		}

		lines.push("");
	}

	return lines.join("\n");
};

/**
 * @description 단일 skill의 compiled `AGENTS.md` 생성
 */
export const buildSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const documents = await readResolvedSkillDocuments(skillPaths);
	const rootDocument = documents.find((document) => document.skillName === skillPaths.skillName);

	if (!rootDocument) {
		throw new Error(`Failed to resolve root skill document for "${skillPaths.skillName}".`);
	}

	const compiledSections = buildCompiledSections(skillPaths.skillName, documents);
	const baseSkillTitles = collectBaseSkillTitles(skillPaths.skillName, documents);
	const references = collectReferenceLinks(documents);
	const markdown = generateMarkdown(skillPaths.skillName, rootDocument.metadata, compiledSections, baseSkillTitles, references);

	await writeFile(skillPaths.outputPath, markdown, "utf8");
	console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.outputPath)}`);
};

/**
 * @description CLI 입력 기준 build 대상 skill compiled guide 생성
 */
export const main = async (): Promise<void> => {
	const {all, skill} = parseCliArgs(process.argv.slice(2));
	const targetSkillNames = all ? await listSkillNames() : [skill];

	for (const skillName of targetSkillNames) {
		if (!skillName) {
			continue;
		}

		const buildable = await isBuildableSkill(skillName);

		if (!buildable) {
			if (all) {
				continue;
			}

			throw new Error(`Skill "${skillName}" is not buildable yet. Expected rules/_sections.md and metadata.json under skill/${skillName}.`);
		}

		await buildSkill(getSkillPaths(skillName));
	}
};

await main();
