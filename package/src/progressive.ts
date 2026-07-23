import {readFile} from "node:fs/promises";

import type {LoadedSkillDocument, SkillPaths} from "./types.js";

/**
 * @api progressive skill activation entrypoint 파일 가독성 검증
 */
export const assertProgressiveSkillEntrypoint = async (skillPaths: SkillPaths, document: LoadedSkillDocument): Promise<void> => {
	if (document.metadata.progressiveDisclosure !== true) {
		return;
	}

	try {
		await readFile(skillPaths.skillEntrypointPath, "utf8");
	} catch (error) {
		const errorCode = (error as NodeJS.ErrnoException).code;

		if (errorCode === "ENOENT") {
			throw new Error(`${document.skillName}: progressive skill is missing readable SKILL.md at ${skillPaths.skillEntrypointPath}.`);
		}

		throw new Error(`${document.skillName}: progressive SKILL.md is not a readable file at ${skillPaths.skillEntrypointPath}.`, {
			cause: error,
		});
	}
};

/**
 * @helper progressive owner가 가리키는 direct companion source 계약 검증
 */
export const assertProgressiveCompanionSource = (ownerDocument: LoadedSkillDocument, companionDocument: LoadedSkillDocument): void => {
	if (ownerDocument.metadata.progressiveDisclosure !== true) {
		return;
	}

	if (companionDocument.metadata.progressiveDisclosure !== true) {
		throw new Error(
			`${ownerDocument.skillName}: companion "${companionDocument.skillName}" must declare progressiveDisclosure: true so SKILL.md and generated RULES_INDEX.md links stay valid.`,
		);
	}
};
