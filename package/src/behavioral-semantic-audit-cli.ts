import {writeFile} from "node:fs/promises";
import path from "node:path";

import {
	aggregateBehavioralSemanticAuditResults,
	commitBehavioralSemanticAuditCriteria,
	createBehavioralSemanticAuditMatrix,
	mergeBehavioralSemanticAuditReviewerPayload,
	prepareBehavioralSemanticAuditBatch,
	writeBehavioralSemanticAuditMatrix,
} from "./behavioral-semantic-audit.js";
import {isDirectExecution} from "./entrypoint.js";

/** @summary semantic audit CLI option 조회 입력 */
interface ReadCliOptionArgs {
	/** @field command 뒤 raw CLI args */
	args: string[];
	/** @field -- 접두사를 제외한 option 이름 */
	name: string;
	/** @field option 필수 여부 */
	required?: boolean;
}

/** @helper --name=value CLI option 조회 */
const readCliOption = (args: ReadCliOptionArgs): string | undefined => {
	const prefix = `--${args.name}=`;
	const value = args.args.find((item) => item.startsWith(prefix))?.slice(prefix.length);

	if (args.required && !value) throw new Error(`Missing required option --${args.name}=...`);
	return value;
};

/** @helper required absolute-or-relative option resolve */
const readPathOption = (args: ReadCliOptionArgs): string => path.resolve(readCliOption({...args, required: true})!);

/** @helper optional no-overwrite JSON output 또는 stdout 출력 */
const emitJson = async (value: unknown, outputPath: string | undefined): Promise<void> => {
	const raw = `${JSON.stringify(value, null, 2)}\n`;

	if (!outputPath) {
		process.stdout.write(raw);
		return;
	}

	try {
		await writeFile(path.resolve(outputPath), raw, {encoding: "utf8", flag: "wx"});
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") {
			throw new Error(`Refusing to overwrite existing semantic audit output: ${path.resolve(outputPath)}`);
		}

		throw error;
	}
};

const helpText = `Independent behavioral semantic application audit

Commands:
  commit-criteria --criteria=<path> --commitment=<path> --skill-root=<path> --protocol=<path>
  matrix --criteria=<path> --commitment=<path> --runs-dir=<path> --skill-root=<path> --protocol=<path> [--output=<path>]
  prepare --matrix=<path> --batch=<opaque-id> --output-dir=<path> --skill-root=<path> --protocol=<path>
  merge --envelope=<path> --payload=<path> --output-dir=<path> --skill-root=<path> --protocol=<path>
  aggregate --matrix=<path> --results-dir=<path> --skill-root=<path> --protocol=<path> [--output=<path>]
`;

/** @api semantic application audit CLI */
export const behavioralSemanticAuditCliMain = async (args: string[]): Promise<void> => {
	const [command, ...options] = args;

	if (!command || command === "--help" || command === "help") {
		process.stdout.write(helpText);
		return;
	}

	if (command === "commit-criteria") {
		const result = await commitBehavioralSemanticAuditCriteria({
			criteriaPath: readPathOption({args: options, name: "criteria"}),
			commitmentPath: readPathOption({args: options, name: "commitment"}),
			skillRootDir: readPathOption({args: options, name: "skill-root"}),
			publicProtocolPath: readPathOption({args: options, name: "protocol"}),
		});
		await emitJson(result, undefined);
		return;
	}

	if (command === "matrix") {
		const matrixArgs = {
			criteriaPath: readPathOption({args: options, name: "criteria"}),
			commitmentPath: readPathOption({args: options, name: "commitment"}),
			candidateRunsDir: readPathOption({args: options, name: "runs-dir"}),
			skillRootDir: readPathOption({args: options, name: "skill-root"}),
			publicProtocolPath: readPathOption({args: options, name: "protocol"}),
		};
		const outputPath = readCliOption({args: options, name: "output"});

		if (outputPath) {
			const result = await writeBehavioralSemanticAuditMatrix({...matrixArgs, matrixPath: path.resolve(outputPath)});
			await emitJson(result, undefined);
			return;
		}

		await emitJson(await createBehavioralSemanticAuditMatrix(matrixArgs), undefined);
		return;
	}

	if (command === "prepare") {
		const result = await prepareBehavioralSemanticAuditBatch({
			matrixPath: readPathOption({args: options, name: "matrix"}),
			batchId: readCliOption({args: options, name: "batch", required: true})!,
			outputDir: readPathOption({args: options, name: "output-dir"}),
			skillRootDir: readPathOption({args: options, name: "skill-root"}),
			publicProtocolPath: readPathOption({args: options, name: "protocol"}),
		});
		await emitJson(result, undefined);
		return;
	}

	if (command === "merge") {
		const result = await mergeBehavioralSemanticAuditReviewerPayload({
			envelopePath: readPathOption({args: options, name: "envelope"}),
			reviewerPayloadPath: readPathOption({args: options, name: "payload"}),
			outputDir: readPathOption({args: options, name: "output-dir"}),
			skillRootDir: readPathOption({args: options, name: "skill-root"}),
			publicProtocolPath: readPathOption({args: options, name: "protocol"}),
		});
		await emitJson(result, undefined);
		return;
	}

	if (command === "aggregate") {
		const aggregate = await aggregateBehavioralSemanticAuditResults({
			matrixPath: readPathOption({args: options, name: "matrix"}),
			resultsDir: readPathOption({args: options, name: "results-dir"}),
			skillRootDir: readPathOption({args: options, name: "skill-root"}),
			publicProtocolPath: readPathOption({args: options, name: "protocol"}),
		});
		await emitJson(aggregate, readCliOption({args: options, name: "output"}));
		return;
	}

	throw new Error(`Unknown semantic audit command "${command}".\n\n${helpText}`);
};

if (await isDirectExecution(import.meta.url)) {
	behavioralSemanticAuditCliMain(process.argv.slice(2)).catch((error: unknown) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
}
