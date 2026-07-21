import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {buildRuleAnchor, buildSectionAnchor, normalizeHeadingTitle, readResolvedSkillDocuments, replaceRuleHeading} from "./parser.js";
import {generateRulesIndexMarkdown, getRulesForSection} from "./routing.js";
import type {CompiledSkillSection, LoadedSkillDocument, SkillMetadata, SkillPaths} from "./types.js";

interface CompanionSkill {
	skillName: string;
	conventionName: string;
	title: string;
	guidePath: string;
}

const conventionTitleBySkillName: Record<string, string> = {
	astro: "Astro Convention",
	"convention-audit": "Convention Audit",
	css: "CSS Convention",
	"figma-visual-parity": "Figma Visual Parity",
	nestjs: "NestJS Convention",
	"playwright-test": "Playwright Test Convention",
	react: "React Convention",
	"tanstack-route": "TanStack Route Convention",
	typescript: "TypeScript Convention",
};
const conventionSkillNameBySkillName: Record<string, string> = {
	"convention-audit": "convention-audit",
	"figma-visual-parity": "figma-visual-parity",
};
const nestedTocIndent = " ".repeat(4);

/**
 * @helper skill 이름 기준 영어 convention 표시명 계산
 */
const getConventionTitle = (skillName: string, fallbackTitle: string): string => {
	return conventionTitleBySkillName[skillName] ?? fallbackTitle;
};

/**
 * @helper skill 디렉터리 이름을 companion skill 이름으로 변환
 */
const getConventionSkillName = (skillName: string): string => {
	if (conventionSkillNameBySkillName[skillName]) {
		return conventionSkillNameBySkillName[skillName];
	}

	return `convention-${skillName}`;
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
 * @helper root skill과 함께 로드할 companion skill 메타데이터 계산
 */
const collectCompanionSkills = (rootSkillName: string, documents: LoadedSkillDocument[]): CompanionSkill[] => {
	return documents
		.filter((document) => document.skillName !== rootSkillName)
		.map((document) => ({
			skillName: document.skillName,
			conventionName: getConventionSkillName(document.skillName),
			title: getConventionTitle(document.skillName, document.metadata.title),
			guidePath: `../${document.skillName}/AGENTS.md`,
		}));
};

/**
 * @helper metadata와 resolved section을 compiled markdown 본문으로 조립
 */
export const generateMarkdown = (
	skillName: string,
	metadata: SkillMetadata,
	sections: CompiledSkillSection[],
	companionSkills: CompanionSkill[],
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
	lines.push(
		`> 현재 skill의 \`rules/*.md\`, \`metadata.json\`, \`metadata.json.extends\`를 수정한 뒤 \`npm --prefix ../../package run build -- --skill=${skillName}\`로 다시 생성하세요.`,
	);

	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## 개요");
	lines.push("");
	lines.push(metadata.abstract);

	if (companionSkills.length > 0) {
		lines.push("");
		lines.push(`이 가이드는 local ${metadata.title} 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.`);
	}
	lines.push("");

	if (companionSkills.length > 0) {
		lines.push("---");
		lines.push("");
		lines.push("## 함께 로드할 Companion Skill");
		lines.push("");

		for (const companionSkill of companionSkills) {
			lines.push(
				`- \`${companionSkill.conventionName}\` - ${companionSkill.title} 공통 규칙 guide: [${companionSkill.title}](${companionSkill.guidePath})`,
			);
		}

		lines.push("");
	}

	lines.push("---");
	lines.push("");
	lines.push("## 목차");
	lines.push("");

	for (const [sectionIndex, section] of sections.entries()) {
		const sectionOrder = sectionIndex + 1;
		const sectionTitle = normalizeHeadingTitle(section.title);

		lines.push(`${sectionOrder}. [${sectionTitle}](${buildSectionAnchor(sectionOrder, sectionTitle)}) — **${section.impact}**`);

		for (const [ruleIndex, rule] of section.rules.entries()) {
			const ruleTitle = normalizeHeadingTitle(rule.title);
			lines.push(
				`${nestedTocIndent}- ${sectionOrder}.${ruleIndex + 1} [${ruleTitle}](${buildRuleAnchor(sectionOrder, ruleIndex + 1, ruleTitle)})`,
			);
		}
	}

	lines.push("");
	lines.push("---");
	lines.push("");

	for (const [sectionIndex, section] of sections.entries()) {
		const sectionOrder = sectionIndex + 1;
		const sectionTitle = normalizeHeadingTitle(section.title);

		lines.push(`## ${sectionOrder}. ${sectionTitle}`);
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

	const companionSkills = collectCompanionSkills(skillPaths.skillName, documents);
	const localSections = buildCompiledSections(skillPaths.skillName, [rootDocument]);
	const localReferences = collectReferenceLinks([rootDocument]);
	const localMarkdown = generateMarkdown(skillPaths.skillName, rootDocument.metadata, localSections, companionSkills, localReferences);
	const dependencies = parseDependencyDeclaration(rootDocument.skillName, rootDocument.metadata);
	const rulesIndexMarkdown =
		rootDocument.metadata.progressiveDisclosure === true ? generateRulesIndexMarkdown(rootDocument, dependencies.companions) : undefined;
	const generatedResult = await replaceGeneratedFiles([
		{targetPath: skillPaths.outputPath, content: localMarkdown},
		{targetPath: skillPaths.rulesIndexPath, ...(rulesIndexMarkdown === undefined ? {} : {content: rulesIndexMarkdown})},
	]);

	console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.outputPath)}`);

	if (rulesIndexMarkdown !== undefined) {
		console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.rulesIndexPath)}`);
	} else if (generatedResult.deletedPaths.includes(skillPaths.rulesIndexPath)) {
		console.log(`Removed ${path.relative(skillPaths.skillDir, skillPaths.rulesIndexPath)}`);
	}
};

/**
 * @description CLI 입력 기준 build 대상 skill compiled guide 생성
 */
export const main = async (): Promise<void> => {
	const {all, skill, skillRootDir = packagePaths.skillRootDir} = parseCliArgs(process.argv.slice(2));
	const targetSkillNames = all ? await listSkillNames(skillRootDir) : [skill];

	for (const skillName of targetSkillNames) {
		if (!skillName) {
			continue;
		}

		const buildable = await isBuildableSkill(skillName, skillRootDir);

		if (!buildable) {
			if (all) {
				continue;
			}

			throw new Error(`Skill "${skillName}" is not buildable yet. Expected rules/_sections.md and metadata.json under skill/${skillName}.`);
		}

		await buildSkill(getSkillPaths(skillName, skillRootDir));
	}
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
