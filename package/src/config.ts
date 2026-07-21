import {constants} from "node:fs";
import {access, readdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {assertValidSkillName} from "./dependencies.js";
import type {CliArgs, PackagePaths, SkillPaths} from "./types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, "..");
const repoDir = path.resolve(packageDir, "..");
const skillRootDir = path.join(repoDir, "skill");

/**
 * @summary 빌드 패키지와 대상 skill 루트 기준 경로 묶음
 */
export const packagePaths: PackagePaths = {currentDir, packageDir, repoDir, skillRootDir};

/**
 * @helper CLI 인자 해석 결과 계산
 */
export const parseCliArgs = (args: string[]): CliArgs => {
	const all = args.includes("--all");
	const skillArg = args.find((arg) => arg.startsWith("--skill="));
	const skill = skillArg ? skillArg.slice("--skill=".length) : undefined;

	if (!all && !skill) {
		return {all: true, skill: undefined};
	}

	if (all && skill) {
		throw new Error("Use either --all or --skill=<name>, not both.");
	}

	return {all, skill};
};

/**
 * @helper 단일 skill 작업용 경로 묶음 계산
 */
export const getSkillPaths = (skillName: string, targetSkillRootDir: string = skillRootDir): SkillPaths => {
	assertValidSkillName(skillName);
	const resolvedSkillRootDir = path.resolve(targetSkillRootDir);
	const skillDir = path.resolve(resolvedSkillRootDir, skillName);

	if (path.dirname(skillDir) !== resolvedSkillRootDir) {
		throw new Error(`Skill: invalid skill name "${skillName}". Resolved path must remain an immediate child of the skill root.`);
	}

	return {
		skillName,
		skillDir,
		rulesDir: path.join(skillDir, "rules"),
		metadataPath: path.join(skillDir, "metadata.json"),
		sectionsPath: path.join(skillDir, "rules", "_sections.md"),
		outputPath: path.join(skillDir, "AGENTS.md"),
		rulesIndexPath: path.join(skillDir, "RULES_INDEX.md"),
		routingEvalsPath: path.join(skillDir, "routing-evals.json"),
	};
};

/**
 * @description `skill/` 루트 디렉터리 아래 build 후보 skill 목록 조회
 */
export const listSkillNames = async (targetSkillRootDir: string = skillRootDir): Promise<string[]> => {
	const entries = await readdir(targetSkillRootDir, {withFileTypes: true});

	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
};

/**
 * @description `rules/` 기반 build/validate 대상 skill 여부 확인
 */
export const isBuildableSkill = async (skillName: string, targetSkillRootDir: string = skillRootDir): Promise<boolean> => {
	const skillPaths = getSkillPaths(skillName, targetSkillRootDir);

	try {
		await access(skillPaths.metadataPath, constants.F_OK);
		await access(skillPaths.sectionsPath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
};
