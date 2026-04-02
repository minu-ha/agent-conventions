import {getSkillPaths, isBuildableSkill, listSkillNames, parseCliArgs} from "./config.js";
import {readSkillMetadata, readSkillRuleFileNames, readSkillRules, readSkillSections} from "./parser.js";
import type {SkillPaths} from "./types.js";

/**
 * @description 단일 skill의 metadata와 rule 문서 형식 검증
 */
export const validateSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const metadata = await readSkillMetadata(skillPaths);
	const sections = await readSkillSections(skillPaths);
	const ruleFileNames = await readSkillRuleFileNames(skillPaths);
	const rules = await readSkillRules(skillPaths);

	for (const requiredKey of ["title", "version", "organization", "abstract"] as const) {
		if (!metadata[requiredKey]) {
			throw new Error(`${skillPaths.skillName}: metadata.json must include ${requiredKey}.`);
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

	console.log(`Validated ${skillPaths.skillName}: ${ruleFileNames.length} rule files across ${sections.length} sections.`);
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
