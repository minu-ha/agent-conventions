import path from "node:path";

import {generateCompiledSkillMarkdown} from "./build.js";
import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {readGeneratedRegularFile} from "./generated-files.js";
import type {SkillPaths} from "./types.js";

/**
 * @description 단일 skill의 compiled `AGENTS.md`가 현재 source renderer와 일치하는지 write 없이 확인
 */
export const checkGeneratedHandbook = async (skillPaths: SkillPaths): Promise<void> => {
	const expectedHandbook = await generateCompiledSkillMarkdown(skillPaths);
	let actualHandbook: string;

	try {
		actualHandbook = await readGeneratedRegularFile(skillPaths.outputPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(`${skillPaths.skillName}: missing generated AGENTS.md at ${skillPaths.outputPath}. Run the skill build.`);
		}

		throw error;
	}

	if (actualHandbook !== expectedHandbook) {
		throw new Error(`${skillPaths.skillName}: stale generated AGENTS.md at ${skillPaths.outputPath}. Run the skill build.`);
	}
};

/**
 * @description CLI 입력 기준 compiled handbook freshness 확인
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

		const skillPaths = getSkillPaths(skillName, skillRootDir);
		await checkGeneratedHandbook(skillPaths);
		console.log(`Checked ${path.join(skillName, "AGENTS.md")}`);
	}
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
