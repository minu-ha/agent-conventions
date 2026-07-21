import {mkdir} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {readGeneratedDirectoryFileNames, replaceGeneratedFiles} from "./generated-files.js";
import {buildRuleAnchor, buildSectionAnchor, normalizeHeadingTitle, readResolvedSkillDocuments, replaceRuleHeading} from "./parser.js";
import {escapeMarkdownText, generateRuleContractMarkdown, generateRulesIndexMarkdown, getRulesForSection} from "./routing.js";
import type {CompiledSkillSection, LoadedSkillDocument, SkillCompanion, SkillMetadata, SkillPaths} from "./types.js";

/**
 * @summary compiled handbook에 표시할 companion skill 링크와 activation 선언
 */
interface CompanionSkill {
	/**
	 * @field companion skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field agent가 활성화할 convention skill 이름
	 */
	conventionName: string;
	/**
	 * @field handbook에 표시할 companion 제목
	 */
	title: string;
	/**
	 * @field legacy companion의 full handbook 상대 경로
	 */
	agentsGuidePath: string;
	/**
	 * @field progressive companion의 activation router 상대 경로
	 */
	skillEntrypointPath: string;
	/**
	 * @field progressive companion의 compact routing index 상대 경로
	 */
	rulesIndexPath: string;
	/**
	 * @field owner metadata의 companions가 선언한 direct activation mode와 조건
	 */
	declaration?: SkillCompanion;
	/**
	 * @field companion target이 compact routing index를 제공하는지 여부
	 */
	progressiveDisclosure: boolean;
}

/**
 * @summary compiled handbook markdown renderer 입력
 */
interface GenerateMarkdownArgs {
	/**
	 * @field build 대상 root skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field handbook header와 progressive mode를 제공하는 root metadata
	 */
	metadata: SkillMetadata;
	/**
	 * @field handbook 본문에 포함할 local compiled section 목록
	 */
	sections: CompiledSkillSection[];
	/**
	 * @field handbook에 안내할 direct 또는 legacy resolved companion 목록
	 */
	companionSkills: CompanionSkill[];
	/**
	 * @field handbook 마지막에 표시할 참고 링크 목록
	 */
	references: string[];
}

/**
 * @summary read-only renderer와 transactional build가 공유하는 compiled handbook 입력
 */
interface PreparedSkillBuild {
	/**
	 * @field source resolution이 끝난 root skill 문서
	 */
	rootDocument: LoadedSkillDocument;
	/**
	 * @field 현재 source에서 렌더링한 expected AGENTS.md
	 */
	localMarkdown: string;
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
const collectCompanionSkills = (rootDocument: LoadedSkillDocument, documents: LoadedSkillDocument[]): CompanionSkill[] => {
	const dependencyDeclaration = parseDependencyDeclaration(rootDocument.skillName, rootDocument.metadata);
	const documentBySkillName = new Map(documents.map((document) => [document.skillName, document]));
	const companionDeclarationBySkillName = new Map(dependencyDeclaration.companions.map((companion) => [companion.skill, companion]));
	const companionSkillNames =
		dependencyDeclaration.kind === "companions"
			? dependencyDeclaration.skillNames
			: documents.filter((document) => document.skillName !== rootDocument.skillName).map((document) => document.skillName);

	return companionSkillNames.map((skillName) => {
		const document = documentBySkillName.get(skillName);

		if (!document) {
			throw new Error(`Failed to resolve companion skill document for "${skillName}".`);
		}

		const declaration = companionDeclarationBySkillName.get(skillName);

		return {
			skillName,
			conventionName: getConventionSkillName(skillName),
			title: getConventionTitle(skillName, document.metadata.title),
			agentsGuidePath: `../${skillName}/AGENTS.md`,
			skillEntrypointPath: `../${skillName}/SKILL.md`,
			rulesIndexPath: `../${skillName}/RULES_INDEX.md`,
			...(declaration === undefined ? {} : {declaration}),
			progressiveDisclosure: document.metadata.progressiveDisclosure === true,
		};
	});
};

/**
 * @helper metadata와 resolved section을 compiled markdown 본문으로 조립
 */
export const generateMarkdown = (args: GenerateMarkdownArgs): string => {
	const {skillName, metadata, sections, companionSkills, references} = args;
	const lines: string[] = [];
	const dependencyDeclaration = parseDependencyDeclaration(skillName, metadata);
	const usesCompanionDeclarations = dependencyDeclaration.kind === "companions";
	const dependencySourceKey =
		metadata.companions !== undefined ? "metadata.json.companions" : metadata.extends !== undefined ? "metadata.json.extends" : undefined;
	const sourcePaths = ["`rules/*.md`", "`metadata.json`", ...(dependencySourceKey === undefined ? [] : [`\`${dependencySourceKey}\``])];

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
		`> 현재 skill의 ${sourcePaths.join(", ")}를 수정한 뒤 \`npm --prefix ../../package run build -- --skill=${skillName}\`로 다시 생성하세요.`,
	);

	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## 개요");
	lines.push("");
	lines.push(metadata.abstract);

	if (companionSkills.length > 0) {
		lines.push("");
		lines.push(
			usesCompanionDeclarations
				? `이 가이드는 local ${metadata.title} 규칙만 담고 있습니다. companion skill은 아래 mode와 appliesWhen에 따라 활성화합니다.`
				: `이 가이드는 local ${metadata.title} 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.`,
		);
	}
	lines.push("");

	if (companionSkills.length > 0) {
		lines.push("---");
		lines.push("");
		lines.push(usesCompanionDeclarations ? "## Companion Skill 활성화" : "## 함께 로드할 Companion Skill");
		lines.push("");

		for (const companionSkill of companionSkills) {
			if (usesCompanionDeclarations) {
				const declaration = companionSkill.declaration;

				if (!declaration) {
					throw new Error(`Skill "${skillName}" is missing companion declaration for "${companionSkill.skillName}".`);
				}

				const condition = declaration.appliesWhen === undefined ? "" : ` · appliesWhen: ${escapeMarkdownText(declaration.appliesWhen)}`;
				const companionGuide = companionSkill.progressiveDisclosure
					? `[RULES_INDEX.md](${companionSkill.rulesIndexPath})`
					: `[AGENTS.md](${companionSkill.agentsGuidePath})`;
				lines.push(
					`- \`${companionSkill.conventionName}\` - ${companionSkill.title} · mode: \`${declaration.mode}\`${condition} · [SKILL.md](${companionSkill.skillEntrypointPath}) · ${companionGuide}`,
				);
				continue;
			}

			lines.push(
				`- \`${companionSkill.conventionName}\` - ${companionSkill.title} 공통 규칙 guide: [${companionSkill.title}](${companionSkill.agentsGuidePath})`,
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
			let renderedRule = replaceRuleHeading(rule.body.trim(), sectionOrder, ruleOrder, rule.title);

			if (metadata.progressiveDisclosure === true && rule.appliesWhen !== undefined) {
				const headingEnd = renderedRule.indexOf("\n");

				if (headingEnd < 0) {
					throw new Error(`Rule "${rule.title}" is missing a heading boundary for handbook rendering.`);
				}

				const routingMetadata = [`**Applies when:** ${escapeMarkdownText(rule.appliesWhen)}`];

				if (rule.requiresSelected.length > 0) {
					routingMetadata.push(
						`**Requires selected:** ${rule.requiresSelected.map((target) => `\`${escapeMarkdownText(target)}\``).join(", ")} · N/A 불가`,
					);
				}

				if (rule.requiredOnCompletion) {
					routingMetadata.push("**Required on completion:** 활성 skill의 완료 receipt에서 Selected이며 N/A 불가");
				}

				if (rule.reviewWith.length > 0) {
					routingMetadata.push(`**Review with:** ${rule.reviewWith.map((target) => `\`${escapeMarkdownText(target)}\``).join(", ")}`);
				}

				renderedRule = `${renderedRule.slice(0, headingEnd)}\n\n${routingMetadata.join("\n\n")}${renderedRule.slice(headingEnd)}`;
			}

			lines.push(renderedRule);
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
 * @helper skill source와 companion closure에서 현재 compiled handbook 입력 준비
 */
const prepareSkillBuild = async (skillPaths: SkillPaths): Promise<PreparedSkillBuild> => {
	const documents = await readResolvedSkillDocuments(skillPaths);
	const rootDocument = documents.find((document) => document.skillName === skillPaths.skillName);

	if (!rootDocument) {
		throw new Error(`Failed to resolve root skill document for "${skillPaths.skillName}".`);
	}

	const companionSkills = collectCompanionSkills(rootDocument, documents);
	const localSections = buildCompiledSections(skillPaths.skillName, [rootDocument]);
	const localReferences = collectReferenceLinks([rootDocument]);

	return {
		rootDocument,
		localMarkdown: generateMarkdown({
			skillName: skillPaths.skillName,
			metadata: rootDocument.metadata,
			sections: localSections,
			companionSkills,
			references: localReferences,
		}),
	};
};

/**
 * @description 단일 skill의 현재 source 기준 expected `AGENTS.md`를 write 없이 렌더링
 */
export const generateCompiledSkillMarkdown = async (skillPaths: SkillPaths): Promise<string> => {
	return (await prepareSkillBuild(skillPaths)).localMarkdown;
};

/**
 * @description 단일 skill의 compiled `AGENTS.md` 생성
 */
export const buildSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const {rootDocument, localMarkdown} = await prepareSkillBuild(skillPaths);
	const dependencies = parseDependencyDeclaration(rootDocument.skillName, rootDocument.metadata);
	const rulesIndexMarkdown =
		rootDocument.metadata.progressiveDisclosure === true ? generateRulesIndexMarkdown(rootDocument, dependencies.companions) : undefined;
	const contractMarkdownByFileName = new Map(
		rootDocument.metadata.progressiveDisclosure === true
			? rootDocument.rules.map((rule) => [rule.fileName, generateRuleContractMarkdown(rule)] as const)
			: [],
	);
	const existingContractFileNames = await readGeneratedDirectoryFileNames(skillPaths.ruleContractsDir);
	const contractFileNames = Array.from(new Set([...existingContractFileNames, ...contractMarkdownByFileName.keys()])).sort((left, right) =>
		left.localeCompare(right, "en-US"),
	);

	if (contractMarkdownByFileName.size > 0) {
		await mkdir(skillPaths.ruleContractsDir, {recursive: true});
	}

	const generatedResult = await replaceGeneratedFiles([
		{targetPath: skillPaths.outputPath, content: localMarkdown},
		{targetPath: skillPaths.rulesIndexPath, ...(rulesIndexMarkdown === undefined ? {} : {content: rulesIndexMarkdown})},
		...contractFileNames.map((fileName) => ({
			targetPath: path.join(skillPaths.ruleContractsDir, fileName),
			...(contractMarkdownByFileName.has(fileName) ? {content: contractMarkdownByFileName.get(fileName)} : {}),
		})),
	]);

	console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.outputPath)}`);

	if (rulesIndexMarkdown !== undefined) {
		console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.rulesIndexPath)}`);
	} else if (generatedResult.deletedPaths.includes(skillPaths.rulesIndexPath)) {
		console.log(`Removed ${path.relative(skillPaths.skillDir, skillPaths.rulesIndexPath)}`);
	}

	if (contractMarkdownByFileName.size > 0) {
		console.log(`Wrote contracts (${contractMarkdownByFileName.size})`);
	} else {
		const removedContractCount = generatedResult.deletedPaths.filter(
			(targetPath) => path.dirname(targetPath) === skillPaths.ruleContractsDir,
		).length;

		if (removedContractCount > 0) {
			console.log(`Removed contracts (${removedContractCount})`);
		}
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
