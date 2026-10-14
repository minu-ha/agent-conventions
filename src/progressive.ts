import {readFile} from "node:fs/promises";

import type {LoadedSkillDocument, SkillPaths} from "./types.js";

/**
 * @api skill 활성화 진입점 파일 가독성 검증
 */
export const assertProgressiveSkillEntrypoint = async (skillPaths: SkillPaths, document: LoadedSkillDocument): Promise<void> => {
	try {
		await readFile(skillPaths.skillEntrypointPath, "utf8");
	} catch (error) {
		const errorCode = (error as NodeJS.ErrnoException).code;

		if (errorCode === "ENOENT") {
			throw new Error(`${document.skillName}: skill is missing readable SKILL.md at ${skillPaths.skillEntrypointPath}.`);
		}

		throw new Error(`${document.skillName}: SKILL.md is not a readable file at ${skillPaths.skillEntrypointPath}.`, {cause: error});
	}
};
