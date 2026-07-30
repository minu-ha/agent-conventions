import {constants} from "node:fs";
import {access, lstat, readdir, realpath} from "node:fs/promises";
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
 * @summary 사람이 읽는 생성 viewer 문서 경로
 */
export const viewerOutputPath = path.join(repoDir, "docs", "conventions.html");

/**
 * @helper configured skill root가 symlink가 아닌 실제 directory인지 검증
 */
const assertRealSkillRootDirectory = async (targetSkillRootDir: string): Promise<void> => {
	const resolvedSkillRootDir = path.resolve(targetSkillRootDir);
	const rootStats = await lstat(resolvedSkillRootDir);

	if (!rootStats.isDirectory()) {
		throw new Error(`Skill root must be a real directory, not a symlink or file: ${resolvedSkillRootDir}`);
	}
};

/**
 * @helper CLI 인자 해석 결과 계산
 */
export const parseCliArgs = (args: string[]): CliArgs => {
	const all = args.includes("--all");
	const skillArg = args.find((arg) => arg.startsWith("--skill="));
	const skill = skillArg ? skillArg.slice("--skill=".length) : undefined;
	const skillRootArgs = args.filter((arg) => arg.startsWith("--skill-root="));

	if (skillRootArgs.length > 1) {
		throw new Error("Use --skill-root=<absolute-path> at most once.");
	}

	const rawSkillRootDir = skillRootArgs[0]?.slice("--skill-root=".length);

	if (rawSkillRootDir !== undefined && (!rawSkillRootDir || !path.isAbsolute(rawSkillRootDir))) {
		throw new Error("--skill-root must be a non-empty absolute path.");
	}

	const parsedSkillRoot = rawSkillRootDir ? {skillRootDir: path.resolve(rawSkillRootDir)} : {};

	if (!all && !skill) {
		return {all: true, skill: undefined, ...parsedSkillRoot};
	}

	if (all && skill) {
		throw new Error("Use either --all or --skill=<name>, not both.");
	}

	return {all, skill, ...parsedSkillRoot};
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
		skillEntrypointPath: path.join(skillDir, "SKILL.md"),
		sectionsPath: path.join(skillDir, "rules", "_sections.md"),
		outputPath: path.join(skillDir, "HANDBOOK.md"),
		rulesIndexPath: path.join(skillDir, "RULES_INDEX.md"),
		ruleContractsDir: path.join(skillDir, "contracts"),
		routingEvalsPath: path.join(skillDir, "routing-evals.json"),
	};
};

/**
 * @api configured root와 skill이 symlink가 아닌 실제 direct-child directory인지 검증
 */
export const assertRealSkillDirectory = async (skillPaths: SkillPaths): Promise<void> => {
	const configuredSkillRootDir = path.dirname(skillPaths.skillDir);
	await assertRealSkillRootDirectory(configuredSkillRootDir);
	const skillStats = await lstat(skillPaths.skillDir);

	if (!skillStats.isDirectory()) {
		throw new Error(`Skill must be a real directory, not a symlink or file: ${skillPaths.skillDir}`);
	}

	const [realSkillRootDir, realSkillDir] = await Promise.all([realpath(configuredSkillRootDir), realpath(skillPaths.skillDir)]);

	if (path.dirname(realSkillDir) !== realSkillRootDir) {
		throw new Error(`Skill directory must remain a real direct child of its configured root: ${skillPaths.skillDir}`);
	}
};

/**
 * @description `skill/` 루트 디렉터리 아래 build 후보 skill 목록 조회
 */
export const listSkillNames = async (targetSkillRootDir: string = skillRootDir): Promise<string[]> => {
	await assertRealSkillRootDirectory(targetSkillRootDir);
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
		await assertRealSkillDirectory(skillPaths);
		await access(skillPaths.metadataPath, constants.F_OK);
		await access(skillPaths.sectionsPath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
};
