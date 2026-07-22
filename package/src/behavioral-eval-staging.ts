import {execFile} from "node:child_process";
import {createHash} from "node:crypto";
import {link, mkdir, readFile, realpath, unlink, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";

import {scoreBehavioralEvalRun} from "./behavioral-eval-coordinator.js";
import {
	assertBehavioralFullHandbookIdentityDictionary,
	createBehavioralChildPayloadContract,
	createBehavioralEvalDispatchEnvelope,
	type BehavioralEvalDispatchEnvelope,
	validateBehavioralEvalRun,
	validateBehavioralEvalStageEvidence,
} from "./behavioral-evals.js";
import {packagePaths} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";

const execFileAsync = promisify(execFile);
const stagedScenarioId = "RTE02-owner-placement-css-drift" as const;
const stagedProtocolId = "progressive-loading-behavioral-v3" as const;
const progressiveSkillNames = ["react", "typescript", "css"] as const;
const sha256Pattern = /^sha256:[a-f0-9]{64}$/;
const commitPattern = /^[a-f0-9]{40,64}$/;
const runIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const agentTargetPattern = /^\/root(?:\/[a-z0-9][a-z0-9_-]*)+$/;

type JsonObject = Record<string, unknown>;
type VirtualFileState = "present" | "absent";

/** @summary staged request가 공개하는 exact virtual file state */
export interface StagedBehavioralVirtualFile {
	/** @field normalized repository-relative POSIX path */
	path: string;
	/** @field stage 시작 시 virtual file 존재 상태 */
	state: VirtualFileState;
	/** @field present이면 exact UTF-8 content, absent이면 null */
	content: string | null;
	/** @field present content raw digest, absent이면 null */
	sha256: string | null;
}

/** @summary current validator schema와 동일한 virtual patch file evidence */
export interface StagedBehavioralVirtualPatchFile {
	/** @field normalized repository-relative POSIX path */
	path: string;
	/** @field patch 전 virtual state */
	beforeState: VirtualFileState;
	/** @field present before bytes digest, absent이면 null */
	beforeSha256: string | null;
	/** @field patch 후 virtual state */
	afterState: VirtualFileState;
	/** @field present after exact UTF-8 content, absent이면 null */
	after: string | null;
	/** @field present after bytes digest, absent이면 null */
	afterSha256: string | null;
}

/** @summary child가 payload 안에만 기록하는 virtual implementation */
export interface StagedBehavioralVirtualPatch {
	/** @field request virtualFiles와 exact order로 대응하는 patch */
	files: StagedBehavioralVirtualPatchFile[];
	/** @field child가 작성한 non-empty implementation summary */
	summary: string;
}

/** @summary RTE02 initial child에게만 공개하는 oracle-free request */
export interface StagedInitialChildRequest {
	schemaVersion: 3;
	protocolId: typeof stagedProtocolId;
	stage: "initial";
	runId: string;
	arm: string;
	scenarioId: typeof stagedScenarioId;
	trial: number;
	repositoryRoot: string;
	agentTarget: string;
	assignedChildPayloadPath: string;
	task: string;
	files: string[];
	virtualFiles: StagedBehavioralVirtualFile[];
	activationPolicy: string;
	candidateSkillEntrypoints: string[];
	armPolicy: Record<string, unknown>;
	identityDictionary: Record<string, string[]>;
	childPayloadContract: Record<string, unknown>;
}

/** @summary sealed initial 뒤 같은 agent에게만 공개하는 drift request */
export interface StagedFollowupChildRequest {
	schemaVersion: 3;
	protocolId: typeof stagedProtocolId;
	stage: "drift";
	runId: string;
	arm: string;
	scenarioId: typeof stagedScenarioId;
	trial: number;
	repositoryRoot: string;
	agentTarget: string;
	assignedChildPayloadPath: string;
	initialSeal: {path: string; sha256: string};
	initialPayload: {path: string; sha256: string; utf8ByteLength: number; virtualPatchSha256: string};
	task: string;
	files: string[];
	filesAdded: string[];
	virtualFiles: StagedBehavioralVirtualFile[];
	activationPolicy: string;
	candidateSkillEntrypoints: string[];
	armPolicy: Record<string, unknown>;
	identityDictionary: Record<string, string[]>;
	childPayloadContract: Record<string, unknown>;
}

interface StagedProtocolBinding {
	path: string;
	sha256: string;
	armSha256: string;
	fullScenarioSha256: string;
	stageScenarioSha256: string;
}

interface StagedChildRequestBinding {
	path: string;
	sha256: string;
	utf8ByteLength: number;
}

/** @summary initial request와 source를 dispatch 전에 고정하는 envelope */
export interface StagedInitialEnvelope {
	schemaVersion: 1;
	kind: "behavioral-staged-initial";
	runId: string;
	protocol: StagedProtocolBinding;
	repositoryDir: string;
	skillRootDir: string;
	agentTarget: string;
	childRequest: StagedChildRequestBinding;
	assignedChildPayloadPath: string;
	requestContentDigest: string;
	dispatchEnvelope: BehavioralEvalDispatchEnvelope;
}

/** @summary immutable initial payload와 agent target을 묶는 seal */
export interface StagedInitialSeal {
	schemaVersion: 1;
	mode: "same-agent-followup-v1";
	runId: string;
	repositoryHead: string;
	arm: string;
	scenarioId: typeof stagedScenarioId;
	trial: number;
	agentTarget: string;
	initialEnvelope: {path: string; sha256: string};
	initialRequest: {path: string; sha256: string; utf8ByteLength: number};
	initialPayload: {path: string; sha256: string; utf8ByteLength: number; canonicalSha256: string; virtualPatchSha256: string};
}

/** @summary drift request가 initial seal과 동일 source를 사용했음을 고정하는 envelope */
export interface StagedFollowupEnvelope {
	schemaVersion: 1;
	kind: "behavioral-staged-followup";
	runId: string;
	protocol: StagedProtocolBinding;
	repositoryDir: string;
	skillRootDir: string;
	agentTarget: string;
	initialEnvelope: {path: string; sha256: string};
	initialSeal: {path: string; sha256: string};
	initialPayload: {path: string; sha256: string; utf8ByteLength: number; virtualPatchSha256: string};
	childRequest: StagedChildRequestBinding;
	assignedChildPayloadPath: string;
	requestContentDigest: string;
	dispatchEnvelope: BehavioralEvalDispatchEnvelope;
}

/** @summary coordinator가 final run에 주입할 staged provenance */
export interface StagedBehavioralProvenance {
	mode: "same-agent-followup-v1";
	agentTarget: string;
	initial: {
		envelopeSha256: string;
		requestSha256: string;
		promptSha256: string;
		promptByteLength: number;
		promptRendererVersion: string;
		requestContentDigest: string;
		payloadSha256: string;
		payloadByteLength: number;
		virtualPatchSha256: string;
	};
	initialSealSha256: string;
	followup: {
		envelopeSha256: string;
		requestSha256: string;
		promptSha256: string;
		promptByteLength: number;
		promptRendererVersion: string;
		payloadSha256: string;
		payloadByteLength: number;
		virtualPatchSha256: string;
		requestContentDigest: string;
	};
	combined: {payloadSha256: string; payloadByteLength: number; virtualPatchSha256: string};
}

/** @summary initial artifact 생성 입력 */
export interface CreateStagedInitialArtifactsArgs {
	protocolPath: string;
	repositoryHead: string;
	runId: string;
	arm: string;
	trial: number;
	agentTarget: string;
	outputDir: string;
	repositoryDir?: string;
	skillRootDir?: string;
}

/** @summary 아직 저장하지 않은 deterministic initial artifacts */
export interface StagedInitialArtifacts {
	exactDispatch: string;
	request: StagedInitialChildRequest;
	requestRaw: string;
	envelope: StagedInitialEnvelope;
	envelopeRaw: string;
	requestPath: string;
	envelopePath: string;
	childPayloadPath: string;
	sealPath: string;
	combinedChildPayloadPath: string;
	mergeProvenancePath: string;
}

/** @summary 저장 완료한 initial dispatch paths */
export interface PreparedStagedInitialDispatch {
	exactDispatch: string;
	requestPath: string;
	envelopePath: string;
	childPayloadPath: string;
	sealPath: string;
	agentTarget: string;
}

/** @summary initial payload seal 입력 */
export interface SealStagedInitialPayloadArgs {
	envelopePath: string;
	childPayloadPath: string;
	agentTarget: string;
	outputDir: string;
}

/** @summary atomic initial seal 결과 */
export interface SealedStagedInitialPayload {
	seal: StagedInitialSeal;
	sealRaw: string;
	sealPath: string;
	sealSha256: string;
}

/** @summary follow-up artifact 생성 입력 */
export interface CreateStagedFollowupArtifactsArgs {
	initialEnvelopePath: string;
	initialSealPath: string;
	outputDir: string;
}

/** @summary 아직 저장하지 않은 deterministic follow-up artifacts */
export interface StagedFollowupArtifacts {
	exactDispatch: string;
	request: StagedFollowupChildRequest;
	requestRaw: string;
	envelope: StagedFollowupEnvelope;
	envelopeRaw: string;
	requestPath: string;
	envelopePath: string;
	childPayloadPath: string;
}

/** @summary 저장 완료한 follow-up dispatch paths */
export interface PreparedStagedFollowupDispatch extends StagedFollowupArtifacts {}

/** @summary staged payload merge 입력 */
export interface MergeStagedBehavioralPayloadsArgs {
	initialEnvelopePath: string;
	initialSealPath: string;
	followupEnvelopePath: string;
	initialChildPayloadPath: string;
	driftChildPayloadPath: string;
	agentTarget: string;
	outputDir: string;
}

/** @summary deterministic combined child payload과 coordinator provenance */
export interface MergedStagedBehavioralPayloads {
	combinedChildPayloadPath: string;
	mergeProvenancePath: string;
	provenance: StagedBehavioralProvenance;
}

/** @summary staged merge artifact를 final validated/scored run으로 만드는 입력 */
export interface FinalizeStagedBehavioralRunArgs {
	initialEnvelopePath: string;
	initialSealPath: string;
	followupEnvelopePath: string;
	combinedChildPayloadPath: string;
	mergeProvenancePath: string;
	outputDir: string;
	skillRootDir?: string;
}

/** @summary atomic staged final run 결과 */
export interface FinalizedStagedBehavioralRun {
	runPath: string;
	childPayloadSha256: string;
	stagedProvenanceSha256: string;
}

const initialPayloadKeys = [
	"runtime",
	"declaredLoadedFiles",
	"virtualPatch",
	"activatedSkills",
	"receipts",
	"routingTrace",
	"driftReceipt",
	"semanticVerdicts",
	"completion",
	"limitations",
	"response",
] as const;
const driftPayloadKeys = initialPayloadKeys.filter((key) => key !== "driftReceipt");

const asObject = (value: unknown, label: string): JsonObject => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`${label} must be an object.`);
	}

	return value as JsonObject;
};

const asString = (value: unknown, label: string): string => {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`${label} must be a non-empty string.`);
	}

	return value;
};

const asPositiveInteger = (value: unknown, label: string): number => {
	if (!Number.isSafeInteger(value) || Number(value) < 1) {
		throw new Error(`${label} must be a positive safe integer.`);
	}

	return Number(value);
};

const asStringArray = (value: unknown, label: string): string[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const values = value.map((item, index) => asString(item, `${label}[${index}]`));
	const duplicate = values.find((item, index) => values.indexOf(item) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate value "${duplicate}".`);
	}

	return values;
};

const assertExactKeys = (value: JsonObject, keys: readonly string[], label: string): void => {
	const expected = new Set(keys);

	for (const key of Object.keys(value)) {
		if (!expected.has(key)) {
			throw new Error(`${label} has unknown field "${key}".`);
		}
	}

	for (const key of keys) {
		if (!Object.hasOwn(value, key)) {
			throw new Error(`${label} is missing required field "${key}".`);
		}
	}
};

const createSha256 = (value: string | Buffer): string => `sha256:${createHash("sha256").update(value).digest("hex")}`;

const parseSha256 = (value: unknown, label: string): string => {
	const digest = asString(value, label);

	if (!sha256Pattern.test(digest)) {
		throw new Error(`${label} must use sha256:<64 lowercase hex> format.`);
	}

	return digest;
};

const sortJsonValue = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sortJsonValue);
	}

	if (typeof value === "object" && value !== null) {
		return Object.fromEntries(
			Object.entries(value as JsonObject)
				.sort(([left], [right]) => left.localeCompare(right, "en"))
				.map(([key, child]) => [key, sortJsonValue(child)]),
		);
	}

	return value;
};

const serializeJson = (value: unknown): string => `${JSON.stringify(sortJsonValue(value), null, 2)}\n`;
const createCanonicalSha256 = (value: unknown): string => createSha256(JSON.stringify(sortJsonValue(value)));

const readJsonObject = async (targetPath: string, label: string): Promise<{raw: string; value: JsonObject}> => {
	const raw = await readFile(targetPath, "utf8");
	let value: unknown;

	try {
		value = JSON.parse(raw);
	} catch (error) {
		throw new Error(`${label} must contain valid JSON: ${error instanceof Error ? error.message : String(error)}`);
	}

	return {raw, value: asObject(value, label)};
};

const writeAtomicNoOverwrite = async (targetPath: string, content: string): Promise<void> => {
	const temporaryPath = path.join(
		path.dirname(targetPath),
		`.${path.basename(targetPath)}.${process.pid}.${createHash("sha256").update(targetPath).digest("hex").slice(0, 12)}.tmp`,
	);

	try {
		await writeFile(temporaryPath, content, {encoding: "utf8", flag: "wx"});
		await link(temporaryPath, targetPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") {
			throw new Error(`Refusing to overwrite existing staged behavioral artifact: ${targetPath}`);
		}

		throw error;
	} finally {
		await unlink(temporaryPath).catch(() => undefined);
	}
};

const assertAbsolutePath = (targetPath: string, label: string): string => {
	if (!path.isAbsolute(targetPath)) {
		throw new Error(`${label} must be an explicit absolute path.`);
	}

	return path.resolve(targetPath);
};

const assertNormalizedRepositoryPath = (filePath: string, label: string): string => {
	if (
		path.isAbsolute(filePath) ||
		filePath.includes("\\") ||
		path.posix.normalize(filePath) !== filePath ||
		filePath.startsWith("../") ||
		filePath === ".."
	) {
		throw new Error(`${label} must be a normalized repository-relative POSIX path.`);
	}

	return filePath;
};

const parseVirtualFile = (value: unknown, label: string): StagedBehavioralVirtualFile => {
	const file = asObject(value, label);
	const hasState = Object.hasOwn(file, "state");
	assertExactKeys(file, hasState ? ["path", "state", "content", "sha256"] : ["path", "content", "sha256"], label);
	const filePath = assertNormalizedRepositoryPath(asString(file.path, `${label}.path`), `${label}.path`);
	const state = hasState ? asString(file.state, `${label}.state`) : "present";

	if (state !== "present" && state !== "absent") {
		throw new Error(`${label}.state must be present or absent.`);
	}

	if (state === "absent") {
		if (file.content !== null || file.sha256 !== null) {
			throw new Error(`${label}.content and sha256 must be null when state is absent.`);
		}

		return {path: filePath, state, content: null, sha256: null};
	}

	if (typeof file.content !== "string") {
		throw new Error(`${label}.content must be a string when state is present.`);
	}

	const digest = parseSha256(file.sha256, `${label}.sha256`);

	if (digest !== createSha256(file.content)) {
		throw new Error(`${label}.sha256 must match content UTF-8 bytes.`);
	}

	return {path: filePath, state, content: file.content, sha256: digest};
};

const parseScenarioVirtualFiles = (scenario: JsonObject): StagedBehavioralVirtualFile[] => {
	const source = scenario.virtualFiles ?? [];

	if (!Array.isArray(source)) {
		throw new Error(`protocol.scenarios.${stagedScenarioId}.virtualFiles must be an array.`);
	}

	const files = source.map((item, index) => parseVirtualFile(item, `protocol.scenarios.${stagedScenarioId}.virtualFiles[${index}]`));
	const duplicate = files.find(({path: filePath}, index) => files.findIndex((item) => item.path === filePath) !== index)?.path;

	if (duplicate) {
		throw new Error(`protocol.scenarios.${stagedScenarioId}.virtualFiles must not contain duplicate path "${duplicate}".`);
	}

	return files;
};

const selectVirtualFiles = (
	allVirtualFiles: StagedBehavioralVirtualFile[],
	filePaths: string[],
	label: string,
): StagedBehavioralVirtualFile[] => {
	const byPath = new Map(allVirtualFiles.map((file) => [file.path, file]));

	return filePaths.map((filePath, index) => {
		const file = byPath.get(filePath);

		if (!file) {
			throw new Error(`${label}[${index}] "${filePath}" requires one public virtualFiles entry.`);
		}

		return file;
	});
};

const parseVirtualPatch = (value: unknown, label: string): StagedBehavioralVirtualPatch => {
	const patch = asObject(value, label);
	assertExactKeys(patch, ["files", "summary"], label);
	const summary = asString(patch.summary, `${label}.summary`);

	if (!Array.isArray(patch.files)) {
		throw new Error(`${label}.files must be an array.`);
	}

	const files = patch.files.map((item, index) => {
		const fileLabel = `${label}.files[${index}]`;
		const file = asObject(item, fileLabel);
		assertExactKeys(file, ["path", "beforeState", "beforeSha256", "afterState", "after", "afterSha256"], fileLabel);
		const filePath = assertNormalizedRepositoryPath(asString(file.path, `${fileLabel}.path`), `${fileLabel}.path`);
		const beforeState = asString(file.beforeState, `${fileLabel}.beforeState`);
		const afterState = asString(file.afterState, `${fileLabel}.afterState`);

		if ((beforeState !== "present" && beforeState !== "absent") || (afterState !== "present" && afterState !== "absent")) {
			throw new Error(`${fileLabel} beforeState and afterState must be present or absent.`);
		}

		let beforeSha256: string | null;

		if (beforeState === "absent") {
			if (file.beforeSha256 !== null) {
				throw new Error(`${fileLabel}.beforeSha256 must be null when beforeState is absent.`);
			}
			beforeSha256 = null;
		} else {
			beforeSha256 = parseSha256(file.beforeSha256, `${fileLabel}.beforeSha256`);
		}

		let after: string | null;
		let afterSha256: string | null;

		if (afterState === "absent") {
			if (file.after !== null || file.afterSha256 !== null) {
				throw new Error(`${fileLabel}.after and afterSha256 must be null when afterState is absent.`);
			}
			after = null;
			afterSha256 = null;
		} else {
			if (typeof file.after !== "string") {
				throw new Error(`${fileLabel}.after must be a string when afterState is present.`);
			}
			after = file.after;
			afterSha256 = parseSha256(file.afterSha256, `${fileLabel}.afterSha256`);

			if (afterSha256 !== createSha256(after)) {
				throw new Error(`${fileLabel}.afterSha256 does not match after UTF-8 bytes.`);
			}
		}

		return {path: filePath, beforeState, beforeSha256, afterState, after, afterSha256} as StagedBehavioralVirtualPatchFile;
	});
	const duplicate = files.find(({path: filePath}, index) => files.findIndex((item) => item.path === filePath) !== index)?.path;

	if (duplicate) {
		throw new Error(`${label}.files must not contain duplicate path "${duplicate}".`);
	}

	return {files, summary};
};

const assertVirtualPatchBinding = (
	patch: StagedBehavioralVirtualPatch,
	virtualFiles: StagedBehavioralVirtualFile[],
	label: string,
): void => {
	const actualPaths = patch.files.map(({path: filePath}) => filePath);
	const expectedPaths = virtualFiles.map(({path: filePath}) => filePath);

	if (actualPaths.join("\0") !== expectedPaths.join("\0")) {
		throw new Error(`${label}.files paths must exactly match the saved stage virtualFiles paths in order.`);
	}

	for (const [index, virtualFile] of virtualFiles.entries()) {
		const patchFile = patch.files[index]!;

		if (patchFile.beforeState !== virtualFile.state || patchFile.beforeSha256 !== virtualFile.sha256) {
			throw new Error(`${label}.files[${index}] before state and digest must match the saved stage virtualFiles binding.`);
		}
	}
};

/** @summary public-before에서 replacement-final-after까지 두 stage patch를 합성 */
export const composeStagedVirtualPatches = (args: {
	publicVirtualFiles: StagedBehavioralVirtualFile[];
	initialPatch: StagedBehavioralVirtualPatch;
	driftPatch: StagedBehavioralVirtualPatch;
}): StagedBehavioralVirtualPatch => {
	const publicByPath = new Map(args.publicVirtualFiles.map((file) => [file.path, file]));
	const initialByPath = new Map(args.initialPatch.files.map((file) => [file.path, file]));
	const driftPaths = args.driftPatch.files.map(({path: filePath}) => filePath);
	const publicPaths = args.publicVirtualFiles.map(({path: filePath}) => filePath);

	if (driftPaths.join("\0") !== publicPaths.join("\0")) {
		throw new Error("drift patch paths must exactly match public replacement-final paths in order.");
	}

	for (const initialFile of args.initialPatch.files) {
		const publicFile = publicByPath.get(initialFile.path);

		if (!publicFile) {
			throw new Error(`initial patch path "${initialFile.path}" is absent from the replacement-final public surface.`);
		}

		if (initialFile.beforeState !== publicFile.state || initialFile.beforeSha256 !== publicFile.sha256) {
			throw new Error(`initial patch path "${initialFile.path}" does not match its public before binding.`);
		}
	}

	const files = args.publicVirtualFiles.map((publicFile, index) => {
		const initialFile = initialByPath.get(publicFile.path);
		const driftFile = args.driftPatch.files[index]!;
		const expectedDriftBeforeState = initialFile ? initialFile.afterState : publicFile.state;
		const expectedDriftBeforeSha256 = initialFile ? initialFile.afterSha256 : publicFile.sha256;

		if (driftFile.beforeState !== expectedDriftBeforeState || driftFile.beforeSha256 !== expectedDriftBeforeSha256) {
			throw new Error(`drift patch path "${publicFile.path}" does not continue from the exact initial stage after binding.`);
		}

		return {
			path: publicFile.path,
			beforeState: publicFile.state,
			beforeSha256: publicFile.sha256,
			afterState: driftFile.afterState,
			after: driftFile.after,
			afterSha256: driftFile.afterSha256,
		};
	});

	return {files, summary: "Composed initial and replacement-final virtual patches."};
};

const parseStagePayload = (
	value: unknown,
	stage: "initial" | "drift",
): {source: JsonObject; virtualPatch: StagedBehavioralVirtualPatch} => {
	const label = `${stage} child payload`;
	const payload = asObject(value, label);
	assertExactKeys(payload, stage === "initial" ? initialPayloadKeys : driftPayloadKeys, label);

	if (stage === "initial" && payload.driftReceipt !== null) {
		throw new Error("initial child payload.driftReceipt must be null before follow-up disclosure.");
	}

	const virtualPatch = parseVirtualPatch(payload.virtualPatch, `${label}.virtualPatch`);
	return {source: payload, virtualPatch};
};

const getStagePaths = (outputDir: string, runId: string) => {
	const resolvedOutputDir = assertAbsolutePath(outputDir, "outputDir");

	if (!runIdPattern.test(runId)) {
		throw new Error(`runId contains an unsafe path character: ${runId}`);
	}

	return {
		initialRequestPath: path.join(resolvedOutputDir, `${runId}.initial-child-request.json`),
		initialEnvelopePath: path.join(resolvedOutputDir, `${runId}.initial-dispatch-envelope.json`),
		initialChildPayloadPath: path.join(resolvedOutputDir, `${runId}.initial-child-payload.json`),
		initialSealPath: path.join(resolvedOutputDir, `${runId}.initial-seal.json`),
		followupRequestPath: path.join(resolvedOutputDir, `${runId}.followup-child-request.json`),
		followupEnvelopePath: path.join(resolvedOutputDir, `${runId}.followup-dispatch-envelope.json`),
		driftChildPayloadPath: path.join(resolvedOutputDir, `${runId}.drift-child-payload.json`),
		combinedChildPayloadPath: path.join(resolvedOutputDir, `${runId}.combined-child-payload.json`),
		mergeProvenancePath: path.join(resolvedOutputDir, `${runId}.staged-merge.json`),
	};
};

const assertMatrixCoordinate = (protocol: JsonObject, arm: string, trial: number, runId: string): void => {
	const matrix = asObject(protocol.runMatrix, "protocol.runMatrix");
	const scenarios = asObject(protocol.scenarios, "protocol.scenarios");
	const coordinates: string[] = [];
	const appendGroup = (groupName: "baseline" | "mixed" | "mutation", trials: (scenarioId: string) => number): void => {
		const group = asObject(matrix[groupName], `protocol.runMatrix.${groupName}`);
		const scenarioIds = asStringArray(group.scenarios, `protocol.runMatrix.${groupName}.scenarios`);
		const arms = asStringArray(group.arms, `protocol.runMatrix.${groupName}.arms`);
		const groupStart = coordinates.length;

		for (const currentScenarioId of scenarioIds) {
			if (!Object.hasOwn(scenarios, currentScenarioId)) {
				throw new Error(`protocol matrix references unknown scenario "${currentScenarioId}".`);
			}

			for (const currentArm of arms) {
				for (let currentTrial = 1; currentTrial <= trials(currentScenarioId); currentTrial += 1) {
					coordinates.push(`${currentArm}--${currentScenarioId}--t${currentTrial}`);
				}
			}
		}

		if (asPositiveInteger(group.runCount, `protocol.runMatrix.${groupName}.runCount`) !== coordinates.length - groupStart) {
			throw new Error(`protocol.runMatrix.${groupName}.runCount does not match its coordinates.`);
		}
	};

	const baseline = asObject(matrix.baseline, "protocol.runMatrix.baseline");
	const baselineTrials = asPositiveInteger(baseline.trialsPerScenarioArm, "protocol.runMatrix.baseline.trialsPerScenarioArm");
	appendGroup("baseline", () => baselineTrials);
	const mixed = asObject(matrix.mixed, "protocol.runMatrix.mixed");
	const criticalScenario = asString(mixed.criticalScenario, "protocol.runMatrix.mixed.criticalScenario");
	const ordinaryTrials = asPositiveInteger(
		mixed.trialsPerNonCriticalScenarioArm,
		"protocol.runMatrix.mixed.trialsPerNonCriticalScenarioArm",
	);
	const criticalTrials = asPositiveInteger(mixed.trialsPerCriticalScenarioArm, "protocol.runMatrix.mixed.trialsPerCriticalScenarioArm");
	appendGroup("mixed", (currentScenarioId) => (currentScenarioId === criticalScenario ? criticalTrials : ordinaryTrials));
	const mutation = asObject(matrix.mutation, "protocol.runMatrix.mutation");
	const mutationTrials = asPositiveInteger(mutation.trialsPerScenarioArm, "protocol.runMatrix.mutation.trialsPerScenarioArm");
	appendGroup("mutation", () => mutationTrials);
	const totalFreshTrials = asPositiveInteger(matrix.totalFreshTrials, "protocol.runMatrix.totalFreshTrials");

	if (totalFreshTrials !== 66 || coordinates.length !== 66 || new Set(coordinates).size !== 66) {
		throw new Error("staged behavioral evaluation requires the unchanged exact 66-run matrix.");
	}

	if (runId !== `${arm}--${stagedScenarioId}--t${trial}` || !coordinates.includes(runId)) {
		throw new Error("runId, arm, RTE02 scenario, and trial must identify one existing 66-run matrix coordinate.");
	}
};

const scopeDriftReceiptDirective =
	"For scope drift, also return driftReceipt {routingTrace,activatedSkills,receipts} with an independently stable replacement-final trace that preserves initial activated skills and Selected rules.";

const getApprovedArmPolicy = (protocol: JsonObject, arm: string, stage: "initial" | "drift"): Record<string, unknown> => {
	const armConfig = asObject(asObject(protocol.arms, "protocol.arms")[arm], `protocol.arms.${arm}`);
	const approvedFields = [
		"allowedReads",
		"allowedReadPatterns",
		"allowedReadSequence",
		"forbiddenReads",
		"routingPassesRequired",
		"receiptContract",
		"ordinalSemantics",
	];

	const armPolicy: Record<string, unknown> = Object.fromEntries(
		approvedFields.filter((key) => armConfig[key] !== undefined).map((key) => [key, armConfig[key]]),
	);

	if (arm !== "no-skill") {
		const generatedIndexes = asObject(protocol.generatedIndexes, "protocol.generatedIndexes");
		armPolicy.currentGeneratedIndexDigests = Object.fromEntries(
			progressiveSkillNames.map((skillName) => {
				const generatedIndex = asObject(generatedIndexes[skillName], `protocol.generatedIndexes.${skillName}`);
				const digest = asString(generatedIndex.digest, `protocol.generatedIndexes.${skillName}.digest`);

				if (!sha256Pattern.test(digest)) {
					throw new Error(`protocol.generatedIndexes.${skillName}.digest must be SHA-256.`);
				}

				return [skillName, digest];
			}),
		);
		armPolicy.generatedIndexDigestContract =
			"This mechanical dictionary contains all three current routing digests and discloses no activated-skill oracle. generatedIndexDigests must contain exactly activatedSkills in every routing pass, preserve activatedSkills order, and use the matching values from this dictionary.";
	}

	const rawPromptSuffix = asString(armConfig.promptSuffix, `protocol.arms.${arm}.promptSuffix`);

	if ((arm === "full-handbook" || arm === "progressive") && !rawPromptSuffix.includes(scopeDriftReceiptDirective)) {
		throw new Error(`protocol.arms.${arm}.promptSuffix must contain the known scope-drift receipt directive before staged sanitization.`);
	}

	const stageSafePromptSuffix = rawPromptSuffix.replace(scopeDriftReceiptDirective, "").replace(/\s+/g, " ").trim();
	armPolicy.promptSuffix =
		stage === "initial"
			? `${stageSafePromptSuffix} Initial-stage output uses the disclosed task only: return a complete top-level stage payload and keep driftReceipt null.`
			: `${stageSafePromptSuffix} Replacement-final stage output returns complete top-level routingTrace, activatedSkills, receipts, and declaredLoadedFiles as the complete cumulative context, not a stage delta. Omit driftReceipt; the coordinator constructs final driftReceipt from these validated top-level fields.`;

	return armPolicy;
};

const getIdentityDictionary = (protocol: JsonObject, arm: string): Record<string, string[]> => {
	if (arm !== "full-handbook") {
		return {};
	}

	const dictionaries = asObject(protocol.fullHandbookIdentityDictionaries, "protocol.fullHandbookIdentityDictionaries");
	return Object.fromEntries(
		progressiveSkillNames.map((skillName) => [
			skillName,
			asStringArray(dictionaries[skillName], `protocol.fullHandbookIdentityDictionaries.${skillName}`),
		]),
	);
};

const getActivationPolicy = (arm: string, repositoryRoot: string): string =>
	arm === "no-skill"
		? "This observational arm activates no convention skill and reads no repository convention document."
		: `Infer React, TypeScript, and CSS activation only from this stage task and virtual changed-file surfaces. Resolve every repository-relative read under ${repositoryRoot}; do not assume an expected domain or rule partition.`;

const getCandidateEntrypoints = (arm: string): string[] =>
	arm === "no-skill" ? [] : progressiveSkillNames.map((skillName) => `skill/${skillName}/SKILL.md`);

const getInitialPayloadContract = (assignedPath: string): Record<string, unknown> => ({
	...createBehavioralChildPayloadContract(),
	requiredFields: [...initialPayloadKeys],
	driftReceipt: "must be null; future scope drift has not been disclosed",
	virtualPatch:
		"{files:[{path,beforeState:'present'|'absent',beforeSha256:string|null,afterState:'present'|'absent',after:string|null,afterSha256:string|null}],summary}; paths and before state/digest exactly match virtualFiles",
	writeBoundary: `Write exactly ${assignedPath} with apply_patch; create or modify no other file, including every virtual source path.`,
});

const getDriftPayloadContract = (assignedPath: string): Record<string, unknown> => ({
	...createBehavioralChildPayloadContract(),
	requiredFields: [...driftPayloadKeys],
	driftReceipt: "omitted from this drift-stage payload; the coordinator constructs final driftReceipt after validating this stage",
	virtualPatch:
		"Return the complete replacement-final virtual snapshot. Paths and before state/digest exactly match this follow-up request virtualFiles.",
	writeBoundary: `Write exactly ${assignedPath} with apply_patch; do not edit the sealed initial payload or any virtual source path.`,
});

const assertRepositoryBinding = async (repositoryDir: string, skillRootDir: string, repositoryHead: string): Promise<void> => {
	const [realRepositoryDir, realSkillRootDir] = await Promise.all([realpath(repositoryDir), realpath(skillRootDir)]);
	const expectedSkillRootDir = await realpath(path.join(realRepositoryDir, "skill"));

	if (realSkillRootDir !== expectedSkillRootDir) {
		throw new Error("skillRootDir must resolve to the bound repositoryDir/skill path.");
	}

	const {stdout: gitRootOutput} = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {cwd: realRepositoryDir});

	if ((await realpath(gitRootOutput.trim())) !== realRepositoryDir) {
		throw new Error("repositoryDir must resolve to the exact staged Git worktree root.");
	}

	const {stdout: statusOutput} = await execFileAsync(
		"git",
		["status", "--porcelain=v1", "--untracked-files=all", "--", "skill", "package"],
		{cwd: realRepositoryDir},
	);

	if (statusOutput.length > 0) {
		throw new Error("Staged skill source and evaluator implementation must be clean against HEAD under skill/ and package/.");
	}

	const {stdout} = await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: realRepositoryDir});

	if (stdout.trim() !== repositoryHead) {
		throw new Error("repositoryHead must exactly match the worktree committed HEAD.");
	}
};

const assertBoundProtocol = (protocol: JsonObject, repositoryHead: string, generatedIndexDigests: Record<string, string>): void => {
	if (protocol.schemaVersion !== 3 || protocol.protocolId !== stagedProtocolId) {
		throw new Error("protocol must be progressive-loading-behavioral-v3 schemaVersion 3.");
	}

	const repository = asObject(protocol.repository, "protocol.repository");

	if (repository.sourceHead !== repositoryHead || repository.bindingStatus !== "bound") {
		throw new Error("protocol.repository must be bound to the requested committed HEAD.");
	}

	const indexes = asObject(protocol.generatedIndexes, "protocol.generatedIndexes");

	for (const [skillName, digest] of Object.entries(generatedIndexDigests)) {
		if (asObject(indexes[skillName], `protocol.generatedIndexes.${skillName}`).digest !== digest) {
			throw new Error(`protocol.generatedIndexes.${skillName}.digest must match current source.`);
		}
	}
};

const createExactDispatch = (
	requestPath: string,
	requestSha256: string,
	childPayloadPath: string,
	stage: "initial" | "drift",
	agentTarget: string,
): string =>
	[
		`Read and execute ${requestPath} (${requestSha256}).`,
		`Bound isolated Codex child session: ${agentTarget}. The external orchestrator must dispatch this stage to exactly this external child session target.`,
		`Assigned ${stage} payload path: ${childPayloadPath}. Write exactly this one file with apply_patch; create or modify no other file.`,
		"Do not echo coordinator-owned fields; after writing valid JSON, return only concise status.",
	].join("\n");

const createInitialRequestContentDigest = (args: {
	protocolSha256: string;
	armSha256: string;
	fullScenarioSha256: string;
	stageScenarioSha256: string;
	dispatchEnvelope: BehavioralEvalDispatchEnvelope;
	childRequestSha256: string;
	agentTarget: string;
}): string =>
	createCanonicalSha256({
		schemaVersion: 1,
		stage: "initial",
		protocolId: stagedProtocolId,
		protocolSha256: args.protocolSha256,
		armSha256: args.armSha256,
		fullScenarioSha256: args.fullScenarioSha256,
		stageScenarioSha256: args.stageScenarioSha256,
		repositoryHead: args.dispatchEnvelope.repositoryHead,
		runId: args.dispatchEnvelope.runId,
		arm: args.dispatchEnvelope.arm,
		trial: args.dispatchEnvelope.trial,
		generatedIndexDigests: args.dispatchEnvelope.generatedIndexDigests,
		promptSha256: args.dispatchEnvelope.promptSha256,
		promptByteLength: args.dispatchEnvelope.promptByteLength,
		promptRendererVersion: args.dispatchEnvelope.promptRendererVersion,
		childRequestSha256: args.childRequestSha256,
		agentTarget: args.agentTarget,
	});

/** @api future drift를 노출하지 않는 deterministic RTE02 initial artifacts 생성 */
export const createStagedInitialArtifacts = async (args: CreateStagedInitialArtifactsArgs): Promise<StagedInitialArtifacts> => {
	if (!commitPattern.test(args.repositoryHead)) {
		throw new Error("repositoryHead must be a full lowercase committed Git object ID.");
	}

	if (!agentTargetPattern.test(args.agentTarget)) {
		throw new Error("agentTarget must be one canonical /root/... external child session target before initial dispatch.");
	}

	const protocolPath = assertAbsolutePath(args.protocolPath, "protocolPath");
	const outputDir = assertAbsolutePath(args.outputDir, "outputDir");
	const repositoryDir = path.resolve(args.repositoryDir ?? packagePaths.repoDir);
	const skillRootDir = path.resolve(args.skillRootDir ?? packagePaths.skillRootDir);
	await assertRepositoryBinding(repositoryDir, skillRootDir, args.repositoryHead);
	const protocolResult = await readJsonObject(protocolPath, "protocol");
	const protocol = protocolResult.value;

	if (args.arm === "full-handbook") {
		await assertBehavioralFullHandbookIdentityDictionary(protocol.fullHandbookIdentityDictionaries, skillRootDir);
	}

	assertMatrixCoordinate(protocol, args.arm, args.trial, args.runId);
	const scenario = asObject(asObject(protocol.scenarios, "protocol.scenarios")[stagedScenarioId], `protocol.scenarios.${stagedScenarioId}`);
	const initialTask = asString(scenario.basePrompt, `protocol.scenarios.${stagedScenarioId}.basePrompt`);
	const initialFiles = asStringArray(scenario.filesInitial, `protocol.scenarios.${stagedScenarioId}.filesInitial`);
	const virtualFiles = selectVirtualFiles(parseScenarioVirtualFiles(scenario), initialFiles, "initial files");
	const paths = getStagePaths(outputDir, args.runId);
	const request: StagedInitialChildRequest = {
		schemaVersion: 3,
		protocolId: stagedProtocolId,
		stage: "initial",
		runId: args.runId,
		arm: args.arm,
		scenarioId: stagedScenarioId,
		trial: args.trial,
		repositoryRoot: repositoryDir,
		agentTarget: args.agentTarget,
		assignedChildPayloadPath: paths.initialChildPayloadPath,
		task: initialTask,
		files: initialFiles,
		virtualFiles,
		activationPolicy: getActivationPolicy(args.arm, repositoryDir),
		candidateSkillEntrypoints: getCandidateEntrypoints(args.arm),
		armPolicy: getApprovedArmPolicy(protocol, args.arm, "initial"),
		identityDictionary: getIdentityDictionary(protocol, args.arm),
		childPayloadContract: getInitialPayloadContract(paths.initialChildPayloadPath),
	};
	const requestRaw = serializeJson(request);
	const requestSha256 = createSha256(requestRaw);
	const exactDispatch = createExactDispatch(
		paths.initialRequestPath,
		requestSha256,
		paths.initialChildPayloadPath,
		"initial",
		args.agentTarget,
	);
	const dispatchEnvelope = await createBehavioralEvalDispatchEnvelope({
		runId: args.runId,
		repositoryHead: args.repositoryHead,
		arm: args.arm,
		scenarioId: stagedScenarioId,
		trial: args.trial,
		scenarioPrompt: initialTask,
		exactPrompt: exactDispatch,
		promptRendererVersion: "behavioral-prompt-renderer-v3-initial",
		routingSkillNames: [...progressiveSkillNames],
		skillRootDir,
	});
	assertBoundProtocol(protocol, args.repositoryHead, dispatchEnvelope.generatedIndexDigests);
	const arm = asObject(asObject(protocol.arms, "protocol.arms")[args.arm], `protocol.arms.${args.arm}`);
	const initialScenario = {basePrompt: initialTask, filesInitial: initialFiles, virtualFiles};
	const protocolBinding: StagedProtocolBinding = {
		path: protocolPath,
		sha256: createSha256(protocolResult.raw),
		armSha256: createCanonicalSha256(arm),
		fullScenarioSha256: createCanonicalSha256(scenario),
		stageScenarioSha256: createCanonicalSha256(initialScenario),
	};
	const requestContentDigest = createInitialRequestContentDigest({
		protocolSha256: protocolBinding.sha256,
		armSha256: protocolBinding.armSha256,
		fullScenarioSha256: protocolBinding.fullScenarioSha256,
		stageScenarioSha256: protocolBinding.stageScenarioSha256,
		dispatchEnvelope,
		childRequestSha256: requestSha256,
		agentTarget: args.agentTarget,
	});
	const envelope: StagedInitialEnvelope = {
		schemaVersion: 1,
		kind: "behavioral-staged-initial",
		runId: args.runId,
		protocol: protocolBinding,
		repositoryDir,
		skillRootDir,
		agentTarget: args.agentTarget,
		childRequest: {path: paths.initialRequestPath, sha256: requestSha256, utf8ByteLength: Buffer.byteLength(requestRaw, "utf8")},
		assignedChildPayloadPath: paths.initialChildPayloadPath,
		requestContentDigest,
		dispatchEnvelope,
	};

	return {
		exactDispatch,
		request,
		requestRaw,
		envelope,
		envelopeRaw: serializeJson(envelope),
		requestPath: paths.initialRequestPath,
		envelopePath: paths.initialEnvelopePath,
		childPayloadPath: paths.initialChildPayloadPath,
		sealPath: paths.initialSealPath,
		combinedChildPayloadPath: paths.combinedChildPayloadPath,
		mergeProvenancePath: paths.mergeProvenancePath,
	};
};

/** @api initial request와 envelope를 atomic no-overwrite 저장 */
export const prepareStagedInitialDispatch = async (args: CreateStagedInitialArtifactsArgs): Promise<PreparedStagedInitialDispatch> => {
	const artifacts = await createStagedInitialArtifacts(args);
	await mkdir(path.dirname(artifacts.requestPath), {recursive: true});
	await writeAtomicNoOverwrite(artifacts.requestPath, artifacts.requestRaw);

	try {
		await writeAtomicNoOverwrite(artifacts.envelopePath, artifacts.envelopeRaw);
	} catch (error) {
		await unlink(artifacts.requestPath).catch(() => undefined);
		throw error;
	}

	return {
		exactDispatch: artifacts.exactDispatch,
		requestPath: artifacts.requestPath,
		envelopePath: artifacts.envelopePath,
		childPayloadPath: artifacts.childPayloadPath,
		sealPath: artifacts.sealPath,
		agentTarget: artifacts.envelope.agentTarget,
	};
};

const parseInitialEnvelope = (value: unknown): StagedInitialEnvelope => {
	const envelope = asObject(value, "initial envelope");
	assertExactKeys(
		envelope,
		[
			"schemaVersion",
			"kind",
			"runId",
			"protocol",
			"repositoryDir",
			"skillRootDir",
			"agentTarget",
			"childRequest",
			"assignedChildPayloadPath",
			"requestContentDigest",
			"dispatchEnvelope",
		],
		"initial envelope",
	);

	if (envelope.schemaVersion !== 1 || envelope.kind !== "behavioral-staged-initial") {
		throw new Error("initial envelope kind or schemaVersion is invalid.");
	}

	return envelope as unknown as StagedInitialEnvelope;
};

const verifyInitialEnvelope = async (
	envelopePath: string,
): Promise<{
	envelope: StagedInitialEnvelope;
	envelopeRaw: string;
	request: StagedInitialChildRequest;
	requestRaw: string;
	protocol: JsonObject;
	protocolRaw: string;
}> => {
	const envelopeResult = await readJsonObject(assertAbsolutePath(envelopePath, "initialEnvelopePath"), "initial envelope");
	const envelope = parseInitialEnvelope(envelopeResult.value);
	const protocolResult = await readJsonObject(envelope.protocol.path, "bound protocol");

	if (createSha256(protocolResult.raw) !== envelope.protocol.sha256) {
		throw new Error("bound protocol raw bytes changed after initial dispatch preparation.");
	}

	await assertRepositoryBinding(envelope.repositoryDir, envelope.skillRootDir, envelope.dispatchEnvelope.repositoryHead);
	assertBoundProtocol(protocolResult.value, envelope.dispatchEnvelope.repositoryHead, envelope.dispatchEnvelope.generatedIndexDigests);
	const requestResult = await readJsonObject(envelope.childRequest.path, "initial child request");

	if (
		createSha256(requestResult.raw) !== envelope.childRequest.sha256 ||
		Buffer.byteLength(requestResult.raw, "utf8") !== envelope.childRequest.utf8ByteLength
	) {
		throw new Error("initial child request raw bytes changed after dispatch preparation.");
	}

	const request = requestResult.value as unknown as StagedInitialChildRequest;

	if (
		!agentTargetPattern.test(envelope.agentTarget) ||
		request.stage !== "initial" ||
		request.runId !== envelope.runId ||
		request.agentTarget !== envelope.agentTarget ||
		request.assignedChildPayloadPath !== envelope.assignedChildPayloadPath ||
		request.task !== envelope.dispatchEnvelope.scenarioPrompt
	) {
		throw new Error("initial child request identity does not match its envelope.");
	}

	const exactDispatch = createExactDispatch(
		envelope.childRequest.path,
		envelope.childRequest.sha256,
		envelope.assignedChildPayloadPath,
		"initial",
		envelope.agentTarget,
	);

	if (exactDispatch !== envelope.dispatchEnvelope.exactPrompt) {
		throw new Error("initial exact dispatch no longer matches the saved request binding.");
	}

	const currentDigest = createInitialRequestContentDigest({
		protocolSha256: envelope.protocol.sha256,
		armSha256: envelope.protocol.armSha256,
		fullScenarioSha256: envelope.protocol.fullScenarioSha256,
		stageScenarioSha256: envelope.protocol.stageScenarioSha256,
		dispatchEnvelope: envelope.dispatchEnvelope,
		childRequestSha256: envelope.childRequest.sha256,
		agentTarget: envelope.agentTarget,
	});

	if (currentDigest !== envelope.requestContentDigest) {
		throw new Error("initial requestContentDigest no longer matches the saved bindings.");
	}

	return {
		envelope,
		envelopeRaw: envelopeResult.raw,
		request,
		requestRaw: requestResult.raw,
		protocol: protocolResult.value,
		protocolRaw: protocolResult.raw,
	};
};

/** @api initial payload bytes, virtual patch, agent target을 immutable seal로 저장 */
export const sealStagedInitialPayload = async (args: SealStagedInitialPayloadArgs): Promise<SealedStagedInitialPayload> => {
	const verified = await verifyInitialEnvelope(args.envelopePath);
	const childPayloadPath = assertAbsolutePath(args.childPayloadPath, "childPayloadPath");

	if (childPayloadPath !== path.resolve(verified.envelope.assignedChildPayloadPath)) {
		throw new Error("initial child payload path must exactly match the assigned path.");
	}

	if (!agentTargetPattern.test(args.agentTarget)) {
		throw new Error("agentTarget must be one canonical /root/... external child session target.");
	}

	if (args.agentTarget !== verified.envelope.agentTarget) {
		throw new Error("seal agentTarget must exactly match the pre-bound initial agent target.");
	}

	const payloadResult = await readJsonObject(childPayloadPath, "initial child payload");
	const parsedPayload = parseStagePayload(payloadResult.value, "initial");
	assertVirtualPatchBinding(parsedPayload.virtualPatch, verified.request.virtualFiles, "initial child payload.virtualPatch");
	await validateBehavioralEvalStageEvidence({
		payload: parsedPayload.source,
		dispatchEnvelope: verified.envelope.dispatchEnvelope,
		skillRootDir: verified.envelope.skillRootDir,
	});
	const paths = getStagePaths(args.outputDir, verified.envelope.runId);
	const seal: StagedInitialSeal = {
		schemaVersion: 1,
		mode: "same-agent-followup-v1",
		runId: verified.envelope.runId,
		repositoryHead: verified.envelope.dispatchEnvelope.repositoryHead,
		arm: verified.envelope.dispatchEnvelope.arm,
		scenarioId: stagedScenarioId,
		trial: verified.envelope.dispatchEnvelope.trial,
		agentTarget: verified.envelope.agentTarget,
		initialEnvelope: {path: path.resolve(args.envelopePath), sha256: createSha256(verified.envelopeRaw)},
		initialRequest: {
			path: verified.envelope.childRequest.path,
			sha256: verified.envelope.childRequest.sha256,
			utf8ByteLength: verified.envelope.childRequest.utf8ByteLength,
		},
		initialPayload: {
			path: childPayloadPath,
			sha256: createSha256(payloadResult.raw),
			utf8ByteLength: Buffer.byteLength(payloadResult.raw, "utf8"),
			canonicalSha256: createCanonicalSha256(parsedPayload.source),
			virtualPatchSha256: createCanonicalSha256(parsedPayload.virtualPatch),
		},
	};
	const sealRaw = serializeJson(seal);
	await mkdir(path.dirname(paths.initialSealPath), {recursive: true});
	await writeAtomicNoOverwrite(paths.initialSealPath, sealRaw);
	return {seal, sealRaw, sealPath: paths.initialSealPath, sealSha256: createSha256(sealRaw)};
};

const parseInitialSeal = (value: unknown): StagedInitialSeal => {
	const seal = asObject(value, "initial seal");
	assertExactKeys(
		seal,
		[
			"schemaVersion",
			"mode",
			"runId",
			"repositoryHead",
			"arm",
			"scenarioId",
			"trial",
			"agentTarget",
			"initialEnvelope",
			"initialRequest",
			"initialPayload",
		],
		"initial seal",
	);

	if (seal.schemaVersion !== 1 || seal.mode !== "same-agent-followup-v1" || seal.scenarioId !== stagedScenarioId) {
		throw new Error("initial seal identity is invalid.");
	}

	return seal as unknown as StagedInitialSeal;
};

const verifyInitialSeal = async (args: {
	initialEnvelopePath: string;
	initialSealPath: string;
}): Promise<{
	verifiedInitial: Awaited<ReturnType<typeof verifyInitialEnvelope>>;
	seal: StagedInitialSeal;
	sealRaw: string;
	payload: JsonObject;
	payloadRaw: string;
	virtualPatch: StagedBehavioralVirtualPatch;
}> => {
	const verifiedInitial = await verifyInitialEnvelope(args.initialEnvelopePath);
	const sealResult = await readJsonObject(assertAbsolutePath(args.initialSealPath, "initialSealPath"), "initial seal");
	const seal = parseInitialSeal(sealResult.value);

	if (
		seal.runId !== verifiedInitial.envelope.runId ||
		seal.repositoryHead !== verifiedInitial.envelope.dispatchEnvelope.repositoryHead ||
		seal.arm !== verifiedInitial.envelope.dispatchEnvelope.arm ||
		seal.trial !== verifiedInitial.envelope.dispatchEnvelope.trial ||
		seal.agentTarget !== verifiedInitial.envelope.agentTarget ||
		seal.initialEnvelope.path !== path.resolve(args.initialEnvelopePath) ||
		seal.initialEnvelope.sha256 !== createSha256(verifiedInitial.envelopeRaw)
	) {
		throw new Error("initial seal does not match the supplied initial envelope.");
	}

	const payloadResult = await readJsonObject(seal.initialPayload.path, "sealed initial payload");

	if (
		createSha256(payloadResult.raw) !== seal.initialPayload.sha256 ||
		Buffer.byteLength(payloadResult.raw, "utf8") !== seal.initialPayload.utf8ByteLength
	) {
		throw new Error("initial payload changed and no longer matches its immutable seal.");
	}

	const parsedPayload = parseStagePayload(payloadResult.value, "initial");

	if (
		createCanonicalSha256(parsedPayload.source) !== seal.initialPayload.canonicalSha256 ||
		createCanonicalSha256(parsedPayload.virtualPatch) !== seal.initialPayload.virtualPatchSha256
	) {
		throw new Error("initial payload canonical content does not match its seal.");
	}

	assertVirtualPatchBinding(parsedPayload.virtualPatch, verifiedInitial.request.virtualFiles, "sealed initial payload.virtualPatch");
	await validateBehavioralEvalStageEvidence({
		payload: parsedPayload.source,
		dispatchEnvelope: verifiedInitial.envelope.dispatchEnvelope,
		skillRootDir: verifiedInitial.envelope.skillRootDir,
	});
	return {
		verifiedInitial,
		seal,
		sealRaw: sealResult.raw,
		payload: parsedPayload.source,
		payloadRaw: payloadResult.raw,
		virtualPatch: parsedPayload.virtualPatch,
	};
};

const createFollowupVirtualFiles = (
	finalPaths: string[],
	initialPatch: StagedBehavioralVirtualPatch,
	publicVirtualFiles: StagedBehavioralVirtualFile[],
): StagedBehavioralVirtualFile[] => {
	const patchByPath = new Map(initialPatch.files.map((file) => [file.path, file]));
	const publicByPath = new Map(publicVirtualFiles.map((file) => [file.path, file]));

	return finalPaths.map((filePath, index) => {
		const patchFile = patchByPath.get(filePath);

		if (patchFile) {
			return {path: filePath, state: patchFile.afterState, content: patchFile.after, sha256: patchFile.afterSha256};
		}

		const publicFile = publicByPath.get(filePath);

		if (!publicFile) {
			throw new Error(`final files[${index}] "${filePath}" has no sealed-initial or public virtual baseline.`);
		}

		return publicFile;
	});
};

const createFollowupRequestContentDigest = (args: {
	protocol: StagedProtocolBinding;
	dispatchEnvelope: BehavioralEvalDispatchEnvelope;
	childRequestSha256: string;
	agentTarget: string;
	initialEnvelopeSha256: string;
	initialSealSha256: string;
	initialPayloadSha256: string;
	initialVirtualPatchSha256: string;
}): string =>
	createCanonicalSha256({
		schemaVersion: 1,
		stage: "drift",
		protocolId: stagedProtocolId,
		protocol: args.protocol,
		repositoryHead: args.dispatchEnvelope.repositoryHead,
		runId: args.dispatchEnvelope.runId,
		arm: args.dispatchEnvelope.arm,
		trial: args.dispatchEnvelope.trial,
		generatedIndexDigests: args.dispatchEnvelope.generatedIndexDigests,
		agentTarget: args.agentTarget,
		initialEnvelopeSha256: args.initialEnvelopeSha256,
		initialSealSha256: args.initialSealSha256,
		initialPayloadSha256: args.initialPayloadSha256,
		initialVirtualPatchSha256: args.initialVirtualPatchSha256,
		promptSha256: args.dispatchEnvelope.promptSha256,
		promptByteLength: args.dispatchEnvelope.promptByteLength,
		promptRendererVersion: args.dispatchEnvelope.promptRendererVersion,
		childRequestSha256: args.childRequestSha256,
	});

/** @api sealed initial에서만 파생되는 deterministic follow-up artifacts 생성 */
export const createStagedFollowupArtifacts = async (args: CreateStagedFollowupArtifactsArgs): Promise<StagedFollowupArtifacts> => {
	const verified = await verifyInitialSeal(args);
	const {verifiedInitial, seal} = verified;
	const scenario = asObject(
		asObject(verifiedInitial.protocol.scenarios, "protocol.scenarios")[stagedScenarioId],
		`protocol.scenarios.${stagedScenarioId}`,
	);
	const task = asString(scenario.scopeDriftPrompt, `protocol.scenarios.${stagedScenarioId}.scopeDriftPrompt`);
	const finalFiles = asStringArray(scenario.filesFinal, `protocol.scenarios.${stagedScenarioId}.filesFinal`);
	const initialFileSet = new Set(verifiedInitial.request.files);
	const filesAdded = finalFiles.filter((filePath) => !initialFileSet.has(filePath));
	const virtualFiles = createFollowupVirtualFiles(finalFiles, verified.virtualPatch, parseScenarioVirtualFiles(scenario));
	const paths = getStagePaths(args.outputDir, seal.runId);
	const sealSha256 = createSha256(verified.sealRaw);
	const request: StagedFollowupChildRequest = {
		schemaVersion: 3,
		protocolId: stagedProtocolId,
		stage: "drift",
		runId: seal.runId,
		arm: seal.arm,
		scenarioId: stagedScenarioId,
		trial: seal.trial,
		repositoryRoot: verifiedInitial.envelope.repositoryDir,
		agentTarget: seal.agentTarget,
		assignedChildPayloadPath: paths.driftChildPayloadPath,
		initialSeal: {path: path.resolve(args.initialSealPath), sha256: sealSha256},
		initialPayload: {
			path: seal.initialPayload.path,
			sha256: seal.initialPayload.sha256,
			utf8ByteLength: seal.initialPayload.utf8ByteLength,
			virtualPatchSha256: seal.initialPayload.virtualPatchSha256,
		},
		task,
		files: finalFiles,
		filesAdded,
		virtualFiles,
		activationPolicy: getActivationPolicy(seal.arm, verifiedInitial.envelope.repositoryDir),
		candidateSkillEntrypoints: getCandidateEntrypoints(seal.arm),
		armPolicy: getApprovedArmPolicy(verifiedInitial.protocol, seal.arm, "drift"),
		identityDictionary: getIdentityDictionary(verifiedInitial.protocol, seal.arm),
		childPayloadContract: getDriftPayloadContract(paths.driftChildPayloadPath),
	};
	const requestRaw = serializeJson(request);
	const requestSha256 = createSha256(requestRaw);
	const exactDispatch = createExactDispatch(
		paths.followupRequestPath,
		requestSha256,
		paths.driftChildPayloadPath,
		"drift",
		seal.agentTarget,
	);
	const dispatchEnvelope = await createBehavioralEvalDispatchEnvelope({
		runId: seal.runId,
		repositoryHead: seal.repositoryHead,
		arm: seal.arm,
		scenarioId: stagedScenarioId,
		trial: seal.trial,
		scenarioPrompt: task,
		exactPrompt: exactDispatch,
		promptRendererVersion: "behavioral-prompt-renderer-v3-drift",
		routingSkillNames: [...progressiveSkillNames],
		skillRootDir: verifiedInitial.envelope.skillRootDir,
	});
	const followupScenario = {scopeDriftPrompt: task, filesFinal: finalFiles, filesAdded, virtualFiles};
	const protocolBinding: StagedProtocolBinding = {
		...verifiedInitial.envelope.protocol,
		stageScenarioSha256: createCanonicalSha256(followupScenario),
	};
	const requestContentDigest = createFollowupRequestContentDigest({
		protocol: protocolBinding,
		dispatchEnvelope,
		childRequestSha256: requestSha256,
		agentTarget: seal.agentTarget,
		initialEnvelopeSha256: seal.initialEnvelope.sha256,
		initialSealSha256: sealSha256,
		initialPayloadSha256: seal.initialPayload.sha256,
		initialVirtualPatchSha256: seal.initialPayload.virtualPatchSha256,
	});
	const envelope: StagedFollowupEnvelope = {
		schemaVersion: 1,
		kind: "behavioral-staged-followup",
		runId: seal.runId,
		protocol: protocolBinding,
		repositoryDir: verifiedInitial.envelope.repositoryDir,
		skillRootDir: verifiedInitial.envelope.skillRootDir,
		agentTarget: seal.agentTarget,
		initialEnvelope: {path: path.resolve(args.initialEnvelopePath), sha256: seal.initialEnvelope.sha256},
		initialSeal: {path: path.resolve(args.initialSealPath), sha256: sealSha256},
		initialPayload: {
			path: seal.initialPayload.path,
			sha256: seal.initialPayload.sha256,
			utf8ByteLength: seal.initialPayload.utf8ByteLength,
			virtualPatchSha256: seal.initialPayload.virtualPatchSha256,
		},
		childRequest: {path: paths.followupRequestPath, sha256: requestSha256, utf8ByteLength: Buffer.byteLength(requestRaw, "utf8")},
		assignedChildPayloadPath: paths.driftChildPayloadPath,
		requestContentDigest,
		dispatchEnvelope,
	};

	return {
		exactDispatch,
		request,
		requestRaw,
		envelope,
		envelopeRaw: serializeJson(envelope),
		requestPath: paths.followupRequestPath,
		envelopePath: paths.followupEnvelopePath,
		childPayloadPath: paths.driftChildPayloadPath,
	};
};

/** @api follow-up request와 envelope를 atomic no-overwrite 저장 */
export const prepareStagedFollowupDispatch = async (args: CreateStagedFollowupArtifactsArgs): Promise<PreparedStagedFollowupDispatch> => {
	const artifacts = await createStagedFollowupArtifacts(args);
	await mkdir(path.dirname(artifacts.requestPath), {recursive: true});
	await writeAtomicNoOverwrite(artifacts.requestPath, artifacts.requestRaw);

	try {
		await writeAtomicNoOverwrite(artifacts.envelopePath, artifacts.envelopeRaw);
	} catch (error) {
		await unlink(artifacts.requestPath).catch(() => undefined);
		throw error;
	}

	return artifacts;
};

const parseFollowupEnvelope = (value: unknown): StagedFollowupEnvelope => {
	const envelope = asObject(value, "follow-up envelope");
	assertExactKeys(
		envelope,
		[
			"schemaVersion",
			"kind",
			"runId",
			"protocol",
			"repositoryDir",
			"skillRootDir",
			"agentTarget",
			"initialEnvelope",
			"initialSeal",
			"initialPayload",
			"childRequest",
			"assignedChildPayloadPath",
			"requestContentDigest",
			"dispatchEnvelope",
		],
		"follow-up envelope",
	);

	if (envelope.schemaVersion !== 1 || envelope.kind !== "behavioral-staged-followup") {
		throw new Error("follow-up envelope kind or schemaVersion is invalid.");
	}

	return envelope as unknown as StagedFollowupEnvelope;
};

const verifyFollowupEnvelope = async (args: {followupEnvelopePath: string; initialEnvelopePath: string; initialSealPath: string}) => {
	const initial = await verifyInitialSeal({initialEnvelopePath: args.initialEnvelopePath, initialSealPath: args.initialSealPath});
	const envelopeResult = await readJsonObject(assertAbsolutePath(args.followupEnvelopePath, "followupEnvelopePath"), "follow-up envelope");
	const envelope = parseFollowupEnvelope(envelopeResult.value);

	if (
		envelope.runId !== initial.seal.runId ||
		envelope.agentTarget !== initial.seal.agentTarget ||
		envelope.initialEnvelope.sha256 !== initial.seal.initialEnvelope.sha256 ||
		envelope.initialSeal.sha256 !== createSha256(initial.sealRaw) ||
		envelope.initialPayload.sha256 !== initial.seal.initialPayload.sha256
	) {
		throw new Error("follow-up envelope does not match the immutable initial seal and same agent target.");
	}

	const protocolResult = await readJsonObject(envelope.protocol.path, "follow-up bound protocol");

	if (createSha256(protocolResult.raw) !== envelope.protocol.sha256) {
		throw new Error("bound protocol raw bytes changed after follow-up preparation.");
	}

	await assertRepositoryBinding(envelope.repositoryDir, envelope.skillRootDir, envelope.dispatchEnvelope.repositoryHead);
	assertBoundProtocol(protocolResult.value, envelope.dispatchEnvelope.repositoryHead, envelope.dispatchEnvelope.generatedIndexDigests);
	const requestResult = await readJsonObject(envelope.childRequest.path, "follow-up child request");

	if (
		createSha256(requestResult.raw) !== envelope.childRequest.sha256 ||
		Buffer.byteLength(requestResult.raw, "utf8") !== envelope.childRequest.utf8ByteLength
	) {
		throw new Error("follow-up child request raw bytes changed after preparation.");
	}

	const request = requestResult.value as unknown as StagedFollowupChildRequest;

	if (
		request.stage !== "drift" ||
		request.runId !== envelope.runId ||
		request.agentTarget !== envelope.agentTarget ||
		request.assignedChildPayloadPath !== envelope.assignedChildPayloadPath
	) {
		throw new Error("follow-up child request identity does not match its envelope.");
	}

	const exactDispatch = createExactDispatch(
		envelope.childRequest.path,
		envelope.childRequest.sha256,
		envelope.assignedChildPayloadPath,
		"drift",
		envelope.agentTarget,
	);

	if (exactDispatch !== envelope.dispatchEnvelope.exactPrompt) {
		throw new Error("follow-up exact dispatch no longer matches the request binding.");
	}

	const currentDigest = createFollowupRequestContentDigest({
		protocol: envelope.protocol,
		dispatchEnvelope: envelope.dispatchEnvelope,
		childRequestSha256: envelope.childRequest.sha256,
		agentTarget: envelope.agentTarget,
		initialEnvelopeSha256: envelope.initialEnvelope.sha256,
		initialSealSha256: envelope.initialSeal.sha256,
		initialPayloadSha256: envelope.initialPayload.sha256,
		initialVirtualPatchSha256: envelope.initialPayload.virtualPatchSha256,
	});

	if (currentDigest !== envelope.requestContentDigest) {
		throw new Error("follow-up requestContentDigest no longer matches the staged bindings.");
	}

	return {initial, envelope, envelopeRaw: envelopeResult.raw, request, requestRaw: requestResult.raw};
};

const createVerifiedStagedCombination = async (args: Omit<MergeStagedBehavioralPayloadsArgs, "outputDir">) => {
	const verified = await verifyFollowupEnvelope(args);

	if (args.agentTarget !== verified.initial.seal.agentTarget || args.agentTarget !== verified.envelope.agentTarget) {
		throw new Error("merge requires the same agent target used for both initial and follow-up turns.");
	}

	const initialPayloadPath = assertAbsolutePath(args.initialChildPayloadPath, "initialChildPayloadPath");
	const driftPayloadPath = assertAbsolutePath(args.driftChildPayloadPath, "driftChildPayloadPath");

	if (
		initialPayloadPath !== path.resolve(verified.initial.seal.initialPayload.path) ||
		driftPayloadPath !== path.resolve(verified.envelope.assignedChildPayloadPath)
	) {
		throw new Error("merge payload paths must exactly match the two assigned staged paths.");
	}

	const initialPayloadResult = await readJsonObject(initialPayloadPath, "sealed initial payload");

	if (createSha256(initialPayloadResult.raw) !== verified.initial.seal.initialPayload.sha256) {
		throw new Error("initial payload changed and no longer matches its immutable seal.");
	}

	const initialPayload = parseStagePayload(initialPayloadResult.value, "initial");
	const driftPayloadResult = await readJsonObject(driftPayloadPath, "drift child payload");
	const driftPayload = parseStagePayload(driftPayloadResult.value, "drift");
	assertVirtualPatchBinding(driftPayload.virtualPatch, verified.request.virtualFiles, "drift child payload.virtualPatch");
	await validateBehavioralEvalStageEvidence({
		payload: driftPayload.source,
		dispatchEnvelope: verified.envelope.dispatchEnvelope,
		skillRootDir: verified.envelope.skillRootDir,
	});
	const scenario = asObject(
		asObject(verified.initial.verifiedInitial.protocol.scenarios, "protocol.scenarios")[stagedScenarioId],
		`protocol.scenarios.${stagedScenarioId}`,
	);
	const publicVirtualFiles = selectVirtualFiles(
		parseScenarioVirtualFiles(scenario),
		verified.request.files,
		"replacement-final public files",
	);
	const composedVirtualPatch = composeStagedVirtualPatches({
		publicVirtualFiles,
		initialPatch: initialPayload.virtualPatch,
		driftPatch: driftPayload.virtualPatch,
	});
	const driftReceipt =
		verified.envelope.dispatchEnvelope.arm === "no-skill"
			? null
			: {
					activatedSkills: driftPayload.source.activatedSkills,
					receipts: driftPayload.source.receipts,
					routingTrace: driftPayload.source.routingTrace,
				};
	const combinedPayload: JsonObject = {
		...driftPayload.source,
		virtualPatch: composedVirtualPatch,
		activatedSkills: initialPayload.source.activatedSkills,
		receipts: initialPayload.source.receipts,
		routingTrace: initialPayload.source.routingTrace,
		driftReceipt,
	};
	const combinedRaw = serializeJson(combinedPayload);
	const provenance: StagedBehavioralProvenance = {
		mode: "same-agent-followup-v1",
		agentTarget: args.agentTarget,
		initial: {
			envelopeSha256: verified.initial.seal.initialEnvelope.sha256,
			requestSha256: verified.initial.seal.initialRequest.sha256,
			promptSha256: verified.initial.verifiedInitial.envelope.dispatchEnvelope.promptSha256,
			promptByteLength: verified.initial.verifiedInitial.envelope.dispatchEnvelope.promptByteLength,
			promptRendererVersion: verified.initial.verifiedInitial.envelope.dispatchEnvelope.promptRendererVersion,
			requestContentDigest: verified.initial.verifiedInitial.envelope.requestContentDigest,
			payloadSha256: verified.initial.seal.initialPayload.sha256,
			payloadByteLength: verified.initial.seal.initialPayload.utf8ByteLength,
			virtualPatchSha256: verified.initial.seal.initialPayload.virtualPatchSha256,
		},
		initialSealSha256: createSha256(verified.initial.sealRaw),
		followup: {
			envelopeSha256: createSha256(verified.envelopeRaw),
			requestSha256: verified.envelope.childRequest.sha256,
			promptSha256: verified.envelope.dispatchEnvelope.promptSha256,
			promptByteLength: verified.envelope.dispatchEnvelope.promptByteLength,
			promptRendererVersion: verified.envelope.dispatchEnvelope.promptRendererVersion,
			payloadSha256: createSha256(driftPayloadResult.raw),
			payloadByteLength: Buffer.byteLength(driftPayloadResult.raw, "utf8"),
			virtualPatchSha256: createCanonicalSha256(driftPayload.virtualPatch),
			requestContentDigest: verified.envelope.requestContentDigest,
		},
		combined: {
			payloadSha256: createSha256(combinedRaw),
			payloadByteLength: Buffer.byteLength(combinedRaw, "utf8"),
			virtualPatchSha256: createCanonicalSha256(composedVirtualPatch),
		},
	};

	return {verified, combinedPayload, combinedRaw, provenance};
};

const createStagedMergeProvenanceRaw = (args: {
	runId: string;
	combinedChildPayloadPath: string;
	provenance: StagedBehavioralProvenance;
}): string =>
	serializeJson({
		schemaVersion: 1,
		runId: args.runId,
		combinedChildPayloadPath: args.combinedChildPayloadPath,
		provenance: args.provenance,
		integration: {
			coordinatorInput: args.combinedChildPayloadPath,
			validatorShape: "driftReceipt is null for no-skill or exactly {routingTrace,activatedSkills,receipts} for candidate arms",
			stagedProvenanceBinding: "final run stagedProvenanceSha256 must equal these exact sidecar raw bytes",
			requiredScorerStage: "invoke existing post-hoc score only after combined run validation",
		},
	});

/** @api initial/drift raw payload를 검증해 deterministic combined child payload 생성 */
export const mergeStagedBehavioralPayloads = async (args: MergeStagedBehavioralPayloadsArgs): Promise<MergedStagedBehavioralPayloads> => {
	const combination = await createVerifiedStagedCombination(args);
	const paths = getStagePaths(args.outputDir, combination.verified.envelope.runId);
	const provenanceRaw = createStagedMergeProvenanceRaw({
		runId: combination.verified.envelope.runId,
		combinedChildPayloadPath: paths.combinedChildPayloadPath,
		provenance: combination.provenance,
	});
	await mkdir(path.dirname(paths.combinedChildPayloadPath), {recursive: true});
	await writeAtomicNoOverwrite(paths.combinedChildPayloadPath, combination.combinedRaw);

	try {
		await writeAtomicNoOverwrite(paths.mergeProvenancePath, provenanceRaw);
	} catch (error) {
		await unlink(paths.combinedChildPayloadPath).catch(() => undefined);
		throw error;
	}

	return {
		combinedChildPayloadPath: paths.combinedChildPayloadPath,
		mergeProvenancePath: paths.mergeProvenancePath,
		provenance: combination.provenance,
	};
};

/** @api staged sidecar raw hash를 final run에 결박하고 validate, score, atomic 저장 */
export const finalizeStagedBehavioralRun = async (args: FinalizeStagedBehavioralRunArgs): Promise<FinalizedStagedBehavioralRun> => {
	const initialEnvelopePath = assertAbsolutePath(args.initialEnvelopePath, "initialEnvelopePath");
	const initialSealPath = assertAbsolutePath(args.initialSealPath, "initialSealPath");
	const followupEnvelopePath = assertAbsolutePath(args.followupEnvelopePath, "followupEnvelopePath");
	const combinedChildPayloadPath = assertAbsolutePath(args.combinedChildPayloadPath, "combinedChildPayloadPath");
	const mergeProvenancePath = assertAbsolutePath(args.mergeProvenancePath, "mergeProvenancePath");
	const outputDir = assertAbsolutePath(args.outputDir, "outputDir");
	const staged = await verifyFollowupEnvelope({initialEnvelopePath, initialSealPath, followupEnvelopePath});
	const skillRootDir = path.resolve(args.skillRootDir ?? staged.envelope.skillRootDir);

	if ((await realpath(skillRootDir)) !== (await realpath(staged.envelope.skillRootDir))) {
		throw new Error("finalizer skillRootDir must exactly match the staged envelope source binding.");
	}

	const combinationArgs: Omit<MergeStagedBehavioralPayloadsArgs, "outputDir"> = {
		initialEnvelopePath,
		initialSealPath,
		followupEnvelopePath,
		initialChildPayloadPath: staged.initial.seal.initialPayload.path,
		driftChildPayloadPath: staged.envelope.assignedChildPayloadPath,
		agentTarget: staged.envelope.agentTarget,
	};
	const combination = await createVerifiedStagedCombination(combinationArgs);
	const combinedRaw = await readFile(combinedChildPayloadPath, "utf8");

	if (combinedRaw !== combination.combinedRaw) {
		throw new Error("combined child payload raw bytes do not match the two immutable staged payload bindings.");
	}

	const provenanceRaw = await readFile(mergeProvenancePath, "utf8");
	const expectedProvenanceRaw = createStagedMergeProvenanceRaw({
		runId: combination.verified.envelope.runId,
		combinedChildPayloadPath,
		provenance: combination.provenance,
	});

	if (provenanceRaw !== expectedProvenanceRaw) {
		throw new Error("staged merge provenance raw bytes do not match the immutable staged binding.");
	}

	const stagedProvenanceSha256 = createSha256(provenanceRaw);
	const childPayloadSha256 = createSha256(combinedRaw);
	const dispatch = combination.verified.initial.verifiedInitial.envelope.dispatchEnvelope;
	const requestContentDigest = createCanonicalSha256({
		schemaVersion: 1,
		mode: "same-agent-followup-v1",
		initialRequestContentDigest: combination.verified.initial.verifiedInitial.envelope.requestContentDigest,
		followupRequestContentDigest: combination.verified.envelope.requestContentDigest,
		initialSealSha256: combination.provenance.initialSealSha256,
		stagedProvenanceSha256,
		childPayloadSha256,
	});
	const childRequestSha256 = createCanonicalSha256({
		schemaVersion: 1,
		initialRequestSha256: combination.provenance.initial.requestSha256,
		followupRequestSha256: combination.provenance.followup.requestSha256,
	});
	const run: JsonObject = {
		...dispatch,
		...combination.combinedPayload,
		protocolSha256: combination.verified.initial.verifiedInitial.envelope.protocol.sha256,
		armSha256: combination.verified.initial.verifiedInitial.envelope.protocol.armSha256,
		scenarioSha256: combination.verified.initial.verifiedInitial.envelope.protocol.fullScenarioSha256,
		requestContentDigest,
		childRequestSha256,
		childPayloadSha256,
		stagedProvenanceSha256,
		scoring: null,
	};
	const assertFinalizerInputsUnchanged = async (stage: string): Promise<void> => {
		const [currentCombinedRaw, currentProvenanceRaw, refreshedCombination] = await Promise.all([
			readFile(combinedChildPayloadPath, "utf8"),
			readFile(mergeProvenancePath, "utf8"),
			createVerifiedStagedCombination(combinationArgs),
		]);

		if (
			currentCombinedRaw !== combinedRaw ||
			currentProvenanceRaw !== provenanceRaw ||
			refreshedCombination.combinedRaw !== combination.combinedRaw ||
			serializeJson(refreshedCombination.provenance) !== serializeJson(combination.provenance)
		) {
			throw new Error(`staged inputs changed ${stage}.`);
		}
	};

	await validateBehavioralEvalRun({run, dispatchEnvelope: dispatch, skillRootDir});
	await assertFinalizerInputsUnchanged("after validation and before post-hoc scoring");
	const scoring = await scoreBehavioralEvalRun({run, arm: dispatch.arm, scenarioId: dispatch.scenarioId, skillRootDir});
	await assertFinalizerInputsUnchanged("during post-hoc scoring");
	const runPath = path.join(outputDir, `${dispatch.runId}.run.json`);
	await mkdir(path.dirname(runPath), {recursive: true});
	await writeAtomicNoOverwrite(runPath, serializeJson({...run, scoring}));
	return {runPath, childPayloadSha256, stagedProvenanceSha256};
};

const helpText = `Behavioral staged RTE02 coordinator

The external orchestrator creates one fresh isolated Codex CLI child session per trial with no inherited
conversation turns (forkTurns=none), then dispatches both stages to that same bound child session target.

Commands:
  prepare-initial --protocol=<absolute-path> --head=<commit> --run-id=<id> --arm=<arm> --trial=<n> --agent-target=</root/...> --output-dir=<absolute-path> [--repository-dir=<path>] [--skill-root=<path>]
  seal-initial --envelope=<absolute-path> --payload=<absolute-path> --agent-target=</root/...> --output-dir=<absolute-path>
  prepare-followup --initial-envelope=<absolute-path> --initial-seal=<absolute-path> --output-dir=<absolute-path>
  merge-staged --initial-envelope=<absolute-path> --initial-seal=<absolute-path> --followup-envelope=<absolute-path> --initial-payload=<absolute-path> --drift-payload=<absolute-path> --agent-target=</root/...> --output-dir=<absolute-path>
  finalize-staged --initial-envelope=<absolute-path> --initial-seal=<absolute-path> --followup-envelope=<absolute-path> --combined-payload=<absolute-path> --merge-provenance=<absolute-path> --output-dir=<absolute-path> [--skill-root=<absolute-path>]
`;

const readCliOption = (args: string[], name: string, required = true): string | undefined => {
	const prefix = `--${name}=`;
	const matches = args.filter((arg) => arg.startsWith(prefix));

	if (matches.length > 1) {
		throw new Error(`Use --${name}=... at most once.`);
	}

	const value = matches[0]?.slice(prefix.length);

	if (required && !value) {
		throw new Error(`Missing required --${name}=... option.`);
	}

	return value;
};

/** @api staged RTE02 CLI entrypoint */
export const runBehavioralEvalStagingCli = async (args: string[]): Promise<void> => {
	const [command, ...options] = args;

	if (!command || command === "help" || command === "--help" || command === "-h") {
		process.stdout.write(helpText);
		return;
	}

	if (command === "prepare-initial") {
		const prepared = await prepareStagedInitialDispatch({
			protocolPath: path.resolve(readCliOption(options, "protocol")!),
			repositoryHead: readCliOption(options, "head")!,
			runId: readCliOption(options, "run-id")!,
			arm: readCliOption(options, "arm")!,
			trial: asPositiveInteger(Number(readCliOption(options, "trial")), "--trial"),
			agentTarget: readCliOption(options, "agent-target")!,
			outputDir: path.resolve(readCliOption(options, "output-dir")!),
			repositoryDir: readCliOption(options, "repository-dir", false),
			skillRootDir: readCliOption(options, "skill-root", false),
		});
		process.stdout.write(serializeJson(prepared));
		return;
	}

	if (command === "seal-initial") {
		const sealed = await sealStagedInitialPayload({
			envelopePath: path.resolve(readCliOption(options, "envelope")!),
			childPayloadPath: path.resolve(readCliOption(options, "payload")!),
			agentTarget: readCliOption(options, "agent-target")!,
			outputDir: path.resolve(readCliOption(options, "output-dir")!),
		});
		process.stdout.write(serializeJson({sealPath: sealed.sealPath, sealSha256: sealed.sealSha256}));
		return;
	}

	if (command === "prepare-followup") {
		const prepared = await prepareStagedFollowupDispatch({
			initialEnvelopePath: path.resolve(readCliOption(options, "initial-envelope")!),
			initialSealPath: path.resolve(readCliOption(options, "initial-seal")!),
			outputDir: path.resolve(readCliOption(options, "output-dir")!),
		});
		process.stdout.write(
			serializeJson({
				exactDispatch: prepared.exactDispatch,
				requestPath: prepared.requestPath,
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				agentTarget: prepared.request.agentTarget,
			}),
		);
		return;
	}

	if (command === "merge-staged") {
		const merged = await mergeStagedBehavioralPayloads({
			initialEnvelopePath: path.resolve(readCliOption(options, "initial-envelope")!),
			initialSealPath: path.resolve(readCliOption(options, "initial-seal")!),
			followupEnvelopePath: path.resolve(readCliOption(options, "followup-envelope")!),
			initialChildPayloadPath: path.resolve(readCliOption(options, "initial-payload")!),
			driftChildPayloadPath: path.resolve(readCliOption(options, "drift-payload")!),
			agentTarget: readCliOption(options, "agent-target")!,
			outputDir: path.resolve(readCliOption(options, "output-dir")!),
		});
		process.stdout.write(serializeJson(merged));
		return;
	}

	if (command === "finalize-staged") {
		const finalized = await finalizeStagedBehavioralRun({
			initialEnvelopePath: path.resolve(readCliOption(options, "initial-envelope")!),
			initialSealPath: path.resolve(readCliOption(options, "initial-seal")!),
			followupEnvelopePath: path.resolve(readCliOption(options, "followup-envelope")!),
			combinedChildPayloadPath: path.resolve(readCliOption(options, "combined-payload")!),
			mergeProvenancePath: path.resolve(readCliOption(options, "merge-provenance")!),
			outputDir: path.resolve(readCliOption(options, "output-dir")!),
			skillRootDir: readCliOption(options, "skill-root", false),
		});
		process.stdout.write(serializeJson(finalized));
		return;
	}

	throw new Error(`Unknown staged behavioral command "${command}".\n${helpText}`);
};

if (await isDirectExecution(import.meta.url)) {
	runBehavioralEvalStagingCli(process.argv.slice(2)).catch((error: unknown) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
}
