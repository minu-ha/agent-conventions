import {getSkillPaths, isBuildableSkill, listSkillNames, parseCliArgs} from "./config.js";
import {readSkillDocument, readSkillRuleFileNames} from "./parser.js";
import type {SkillPaths} from "./types.js";

/**
 * @helper 단일 skill 문서 형식을 local source 기준으로 검증
 */
const validateLocalSkill = async (skillPaths: SkillPaths): Promise<{extendsCount: number; ruleCount: number; sectionCount: number}> => {
	const document = await readSkillDocument(skillPaths);
	const {metadata, rules, sections} = document;
	const ruleFileNames = await readSkillRuleFileNames(skillPaths);

	for (const requiredKey of ["title", "version", "organization", "abstract"] as const) {
		if (!metadata[requiredKey]) {
			throw new Error(`${skillPaths.skillName}: metadata.json must include ${requiredKey}.`);
		}
	}

	if (metadata.extends !== undefined) {
		if (!Array.isArray(metadata.extends)) {
			throw new Error(`${skillPaths.skillName}: metadata.json field "extends" must be an array of skill names.`);
		}

		if (metadata.extends.some((skillName) => skillName.trim().length === 0)) {
			throw new Error(`${skillPaths.skillName}: metadata.json field "extends" must contain non-empty skill names.`);
		}

		if (new Set(metadata.extends).size !== metadata.extends.length) {
			throw new Error(`${skillPaths.skillName}: metadata.json field "extends" must not contain duplicates.`);
		}
	}

	if (sections.length === 0) {
		throw new Error(`${skillPaths.skillName}: rules/_sections.md must define at least one section.`);
	}

	const validPrefixes = new Set(sections.map((section) => section.prefix));

	for (const rule of rules) {
		if (!validPrefixes.has(rule.prefix)) {
			throw new Error(`${skillPaths.skillName}: unknown prefix "${rule.prefix}" in ${rule.fileName}.`);
		}

		if (!rule.title) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "title".`);
		}

		if (!rule.impact) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "impact".`);
		}

		if (!rule.impactDescription) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "impactDescription".`);
		}

		if (rule.tags.length === 0) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "tags".`);
		}

		if (!rule.body.includes("**Incorrect") || !rule.body.includes("**Correct")) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} must contain Incorrect and Correct sections.`);
		}
	}

	return {
		extendsCount: metadata.extends?.length ?? 0,
		ruleCount: ruleFileNames.length,
		sectionCount: sections.length,
	};
};

/**
 * @helper `extends`를 따라 base skill까지 재귀적으로 검증
 */
const validateSkillTree = async (skillPaths: SkillPaths, lineage: string[] = [], validatedSkillNames: Set<string> = new Set()): Promise<void> => {
	if (validatedSkillNames.has(skillPaths.skillName)) {
		return;
	}

	const {extendsCount} = await validateLocalSkill(skillPaths);

	if (extendsCount === 0) {
		validatedSkillNames.add(skillPaths.skillName);
		return;
	}

	const {metadata} = await readSkillDocument(skillPaths);
	const nextLineage = [...lineage, skillPaths.skillName];

	for (const inheritedSkillName of metadata.extends ?? []) {
		if (nextLineage.includes(inheritedSkillName)) {
			throw new Error(`Circular skill extends detected: ${[...nextLineage, inheritedSkillName].join(" -> ")}.`);
		}

		const buildable = await isBuildableSkill(inheritedSkillName);

		if (!buildable) {
			throw new Error(`Extended skill "${inheritedSkillName}" referenced by "${skillPaths.skillName}" is not buildable.`);
		}

		await validateSkillTree(getSkillPaths(inheritedSkillName), nextLineage, validatedSkillNames);
	}

	validatedSkillNames.add(skillPaths.skillName);
};

/**
 * @description 단일 skill의 metadata와 rule 문서 형식 검증
 */
export const validateSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const validatedSkillNames = new Set<string>();
	const {extendsCount, ruleCount, sectionCount} = await validateLocalSkill(skillPaths);

	await validateSkillTree(skillPaths, [], validatedSkillNames);

	const extendsSummary = extendsCount > 0 ? ` plus ${extendsCount} base skill(s)` : "";
	console.log(`Validated ${skillPaths.skillName}: ${ruleCount} local rule files across ${sectionCount} sections${extendsSummary}.`);
};

/**
 * @description CLI 입력 기준 skill 문서 형식 검증 실행
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

		await validateSkill(getSkillPaths(skillName));
	}
};

await main();
