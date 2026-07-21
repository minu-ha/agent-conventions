import {constants} from "node:fs";
import {access, readFile} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {readSkillDocument} from "./parser.js";
import {assertProgressiveCompanionSource, assertProgressiveSkillEntrypoint} from "./progressive.js";
import {generateRulesIndexMarkdown} from "./routing.js";
import type {SkillPaths} from "./types.js";

/**
 * @description 단일 skill의 generated routing index 최신 상태 확인
 */
export const checkGeneratedSkill = async (skillPaths: SkillPaths): Promise<boolean> => {
	const localDocument = await readSkillDocument(skillPaths);

	if (localDocument.metadata.progressiveDisclosure !== true) {
		try {
			await access(skillPaths.rulesIndexPath, constants.F_OK);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
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
		actualMarkdown = await readFile(skillPaths.rulesIndexPath, "utf8");
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

	for (const companionPaths of directCompanionPaths) {
		try {
			await readFile(companionPaths.rulesIndexPath, "utf8");
		} catch (error) {
			const errorCode = (error as NodeJS.ErrnoException).code;

			if (errorCode === "ENOENT") {
				throw new Error(
					`${skillPaths.skillName}: generated companion RULES_INDEX.md link is missing for "${companionPaths.skillName}" at ${companionPaths.rulesIndexPath}. Build the companion skill first.`,
				);
			}

			throw new Error(
				`${skillPaths.skillName}: companion RULES_INDEX.md for "${companionPaths.skillName}" is not a readable file at ${companionPaths.rulesIndexPath}.`,
				{cause: error},
			);
		}
	}

	return true;
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
