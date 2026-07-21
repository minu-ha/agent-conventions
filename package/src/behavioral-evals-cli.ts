import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

import {createBehavioralEvalDispatchEnvelope, validateBehavioralEvalRun} from "./behavioral-evals.js";
import type {CreateBehavioralEvalDispatchEnvelopeArgs} from "./behavioral-evals.js";
import {packagePaths} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";

/**
 * @helper prepare/validate CLI의 optional absolute skill root 해석
 */
const parseSkillRootDir = (args: string[]): string => {
	const skillRootArgs = args.filter((argument) => argument.startsWith("--skill-root="));

	if (skillRootArgs.length > 1) {
		throw new Error("Use --skill-root=<absolute-path> at most once.");
	}

	const skillRootDir = skillRootArgs[0]?.slice("--skill-root=".length);

	if (skillRootDir !== undefined && (!skillRootDir || !path.isAbsolute(skillRootDir))) {
		throw new Error("--skill-root must be a non-empty absolute path.");
	}

	return skillRootDir ?? packagePaths.skillRootDir;
};

/**
 * @helper UTF-8 JSON file을 unknown으로 strict parse
 */
const readJsonFile = async (filePath: string, label: string): Promise<unknown> => {
	try {
		return JSON.parse(await readFile(path.resolve(filePath), "utf8")) as unknown;
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(`${label} contains invalid JSON.`, {cause: error});
		}

		throw error;
	}
};

/**
 * @api dispatch envelope prepare 또는 completed run validate CLI 실행
 */
export const behavioralEvalCliMain = async (args: string[] = process.argv.slice(2)): Promise<void> => {
	const command = args[0];
	const positionalArgs = args.slice(1).filter((argument) => !argument.startsWith("--skill-root="));
	const skillRootDir = parseSkillRootDir(args.slice(1));

	if (command === "prepare") {
		if (positionalArgs.length !== 2) {
			throw new Error("Usage: behavioral-evals-cli prepare <prepare-input.json> <dispatch-envelope.json> [--skill-root=<absolute-path>]");
		}

		const [inputPath, outputPath] = positionalArgs as [string, string];
		const input = await readJsonFile(inputPath, "prepare input");

		if (typeof input !== "object" || input === null || Array.isArray(input)) {
			throw new Error("prepare input must be a JSON object.");
		}

		const envelope = await createBehavioralEvalDispatchEnvelope({
			...(input as Omit<CreateBehavioralEvalDispatchEnvelopeArgs, "skillRootDir">),
			skillRootDir,
		});
		await writeFile(path.resolve(outputPath), `${JSON.stringify(envelope, null, 2)}\n`, {encoding: "utf8", flag: "wx"});
		return;
	}

	if (command === "validate") {
		if (positionalArgs.length !== 2) {
			throw new Error("Usage: behavioral-evals-cli validate <dispatch-envelope.json> <run.json> [--skill-root=<absolute-path>]");
		}

		const [dispatchPath, runPath] = positionalArgs as [string, string];
		const [dispatchEnvelope, run] = await Promise.all([
			readJsonFile(dispatchPath, "dispatch envelope"),
			readJsonFile(runPath, "behavioral run"),
		]);
		await validateBehavioralEvalRun({run, dispatchEnvelope, skillRootDir});
		return;
	}

	throw new Error('Use "prepare" or "validate" as the behavioral evaluation command.');
};

if (await isDirectExecution(import.meta.url)) {
	behavioralEvalCliMain().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}
