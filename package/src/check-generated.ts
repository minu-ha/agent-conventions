import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {readGeneratedDirectoryFileNames, readGeneratedRegularFile} from "./generated-files.js";
import {readSkillDocument} from "./parser.js";
import {assertProgressiveCompanionSource, assertProgressiveSkillEntrypoint} from "./progressive.js";
import {generateRuleContractMarkdown, generateRulesIndexMarkdown, getRuleId} from "./routing.js";
import type {SkillPaths} from "./types.js";

/**
 * @helper progressive companion closure를 순회하며 generated output 최신 상태 확인
 */
const checkGeneratedSkillTree = async (skillPaths: SkillPaths, visiting: Set<string>, completed: Set<string>): Promise<boolean> => {
	if (completed.has(skillPaths.skillName)) {
		return true;
	}

	if (visiting.has(skillPaths.skillName)) {
		throw new Error(`Circular generated companion check detected at "${skillPaths.skillName}".`);
	}

	visiting.add(skillPaths.skillName);
	const localDocument = await readSkillDocument(skillPaths);
	const actualContractFileNames = await readGeneratedDirectoryFileNames(skillPaths.ruleContractsDir);

	if (localDocument.metadata.progressiveDisclosure !== true) {
		try {
			await readGeneratedRegularFile(skillPaths.rulesIndexPath);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				if (actualContractFileNames.length > 0) {
					throw new Error(
						`${skillPaths.skillName}: unexpected generated contract files while progressiveDisclosure is disabled: ${actualContractFileNames.join(", ")}. Run the skill build to remove them.`,
					);
				}

				visiting.delete(skillPaths.skillName);
				completed.add(skillPaths.skillName);
				return false;
			}

			throw error;
		}

		throw new Error(
			`${skillPaths.skillName}: unexpected generated RULES_INDEX.md at ${skillPaths.rulesIndexPath} while progressiveDisclosure is disabled. Run the skill build to remove it.`,
		);
	}

	await assertProgressiveSkillEntrypoint(skillPaths, localDocument);
	const dependencies = parseDependencyDeclaration(localDocument.skillName, localDocument.metadata);
	const targetSkillRootDir = path.dirname(skillPaths.skillDir);
	const directCompanionPaths: SkillPaths[] = [];

	for (const companion of dependencies.companions) {
		if (!(await isBuildableSkill(companion.skill, targetSkillRootDir))) {
			throw new Error(`Companion skill "${companion.skill}" referenced by "${localDocument.skillName}" is not buildable.`);
		}

		const companionPaths = getSkillPaths(companion.skill, targetSkillRootDir);
		const companionDocument = await readSkillDocument(companionPaths);
		assertProgressiveCompanionSource(localDocument, companionDocument);
		await assertProgressiveSkillEntrypoint(companionPaths, companionDocument);
		directCompanionPaths.push(companionPaths);
	}

	const expectedMarkdown = generateRulesIndexMarkdown(localDocument, dependencies.companions);
	let actualMarkdown: string;

	try {
		actualMarkdown = await readGeneratedRegularFile(skillPaths.rulesIndexPath);
	} catch (error) {
		const errorCode = (error as NodeJS.ErrnoException).code;

		if (errorCode === "ENOENT") {
			throw new Error(`${skillPaths.skillName}: missing generated RULES_INDEX.md at ${skillPaths.rulesIndexPath}. Run the skill build.`);
		}

		throw error;
	}

	if (actualMarkdown !== expectedMarkdown) {
		throw new Error(`${skillPaths.skillName}: stale generated RULES_INDEX.md at ${skillPaths.rulesIndexPath}. Run the skill build.`);
	}

	// contract 파일명은 번호 prefix 없는 stable ID 기준이다.
	const expectedContracts = new Map<string, string>(
		localDocument.rules.map((rule) => [`${getRuleId(rule)}.md`, generateRuleContractMarkdown(rule)]),
	);

	for (const [fileName, expectedContract] of expectedContracts) {
		const contractPath = path.join(skillPaths.ruleContractsDir, fileName);
		let actualContract: string;

		try {
			actualContract = await readGeneratedRegularFile(contractPath);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw new Error(`${skillPaths.skillName}: missing generated contract "${fileName}" at ${contractPath}. Run the skill build.`);
			}

			throw error;
		}

		if (actualContract !== expectedContract) {
			throw new Error(`${skillPaths.skillName}: stale generated contract "${fileName}" at ${contractPath}. Run the skill build.`);
		}
	}

	const unexpectedContractFileNames = actualContractFileNames.filter((fileName) => !expectedContracts.has(fileName));

	if (unexpectedContractFileNames.length > 0) {
		throw new Error(
			`${skillPaths.skillName}: unexpected generated contract files: ${unexpectedContractFileNames.join(", ")}. Run the skill build.`,
		);
	}

	for (const companionPaths of directCompanionPaths) {
		await checkGeneratedSkillTree(companionPaths, visiting, completed);
	}

	visiting.delete(skillPaths.skillName);
	completed.add(skillPaths.skillName);
	return true;
};

/**
 * @description 단일 skill과 progressive companion closure의 generated routing 산출물 최신 상태 확인
 */
export const checkGeneratedSkill = async (skillPaths: SkillPaths): Promise<boolean> => {
	return await checkGeneratedSkillTree(skillPaths, new Set(), new Set());
};

/**
 * @description CLI 입력 기준 generated routing index 최신 상태 확인
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

		const checked = await checkGeneratedSkill(getSkillPaths(skillName, skillRootDir));

		if (checked) {
			console.log(`Checked ${path.join(skillName, "RULES_INDEX.md")}`);
		}
	}
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
