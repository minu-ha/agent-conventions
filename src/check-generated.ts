import path from "node:path";

import {getSkillPaths, isBuildableSkill} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {readGeneratedDirectoryFileNames, readGeneratedRegularFile} from "./generated-files.js";
import {readSkillDocument} from "./parser.js";
import {assertProgressiveSkillEntrypoint} from "./progressive.js";
import {generateRuleContractMarkdown, generateRulesIndexMarkdown, getRuleId} from "./routing.js";
import type {SkillPaths} from "./types.js";

/**
 * @helper companion 전체를 돌며 생성물 최신 상태 확인
 */
const checkGeneratedSkillTree = async (skillPaths: SkillPaths, visiting: Set<string>, completed: Set<string>): Promise<void> => {
	if (completed.has(skillPaths.skillName)) {
		return;
	}

	if (visiting.has(skillPaths.skillName)) {
		throw new Error(`Circular generated companion check detected at "${skillPaths.skillName}".`);
	}

	visiting.add(skillPaths.skillName);
	const localDocument = await readSkillDocument(skillPaths);
	const actualContractFileNames = await readGeneratedDirectoryFileNames(skillPaths.ruleContractsDir);

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

	// contract 파일명은 번호 접두사 없는 stable ID 기준
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
};

/**
 * @description 단일 skill과 companion 전체의 라우팅 생성물 최신 상태 확인
 */
export const checkGeneratedSkill = async (skillPaths: SkillPaths): Promise<void> => {
	await checkGeneratedSkillTree(skillPaths, new Set(), new Set());
};
