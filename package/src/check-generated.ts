import {readFile} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, parseCliArgs} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {readResolvedSkillDocuments, readSkillDocument} from "./parser.js";
import {generateRulesIndexMarkdown} from "./routing.js";
import type {SkillPaths} from "./types.js";

/**
 * @description 단일 skill의 generated routing index 최신 상태 확인
 */
export const checkGeneratedSkill = async (skillPaths: SkillPaths): Promise<boolean> => {
	const localDocument = await readSkillDocument(skillPaths);

	if (localDocument.metadata.progressiveDisclosure !== true) {
		return false;
	}

	const documents = await readResolvedSkillDocuments(skillPaths);
	const rootDocument = documents.find((document) => document.skillName === skillPaths.skillName);

	if (!rootDocument) {
		throw new Error(`Failed to resolve root skill document for "${skillPaths.skillName}".`);
	}

	const dependencies = parseDependencyDeclaration(rootDocument.skillName, rootDocument.metadata);
	const expectedMarkdown = generateRulesIndexMarkdown(rootDocument, dependencies.companions);
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

	return true;
};

/**
 * @description CLI 입력 기준 generated routing index 최신 상태 확인
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

		const checked = await checkGeneratedSkill(getSkillPaths(skillName));

		if (checked) {
			console.log(`Checked ${path.join(skillName, "RULES_INDEX.md")}`);
		}
	}
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
