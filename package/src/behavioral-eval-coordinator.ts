import {execFile} from "node:child_process";
import {createHash} from "node:crypto";
import {link, mkdir, readFile, readdir, realpath, unlink, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";

import {
	createBehavioralChildPayloadContract,
	createBehavioralEvalDispatchEnvelope,
	type BehavioralEvalDispatchEnvelope,
	validateBehavioralEvalRun,
} from "./behavioral-evals.js";
import {packagePaths} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";

/** @summary behavioral v3 matrix의 한 fresh trial 좌표 */
export interface BehavioralEvalRunCoordinate {
	/** @field protocol matrix group */
	group: "baseline" | "mixed" | "mutation";
	/** @field 실험 arm 이름 */
	arm: string;
	/** @field routing scenario ID */
	scenarioId: string;
	/** @field fresh trial 번호 */
	trial: number;
	/** @field arm, scenario, trial로 만든 immutable run ID */
	runId: string;
}

/** @summary expected output 없이 child에게 공개하는 digest-bound virtual input */
export interface BehavioralVirtualFile {
	/** @field repository-relative virtual input path */
	path: string;
	/** @field 수정 전 file 존재 상태 */
	state: "present" | "absent";
	/** @field child가 수정 전 입력으로 사용할 exact UTF-8 content */
	content: string | null;
	/** @field content raw UTF-8 bytes SHA-256 */
	sha256: string | null;
}

/** @summary coordinator가 child에게 노출해도 되는 oracle-free request */
export interface BehavioralChildRequest {
	/** @field child request schema version */
	schemaVersion: 3;
	/** @field behavioral protocol ID */
	protocolId: "progressive-loading-behavioral-v3";
	/** @field 요청이 속한 immutable run ID */
	runId: string;
	/** @field 실험 arm 이름 */
	arm: string;
	/** @field routing scenario ID */
	scenarioId: string;
	/** @field fresh trial 번호 */
	trial: number;
	/** @field child가 읽을 canonical repository root */
	repositoryRoot: string;
	/** @field coordinator가 단독 할당한 child payload 절대 경로 */
	assignedChildPayloadPath: string;
	/** @field oracle-free 작업 prompt */
	task: string;
	/** @field scenario가 선언한 변경 surface */
	files: string[];
	/** @field expected output 없이 공개하는 digest-bound virtual input */
	virtualFiles: BehavioralVirtualFile[];
	/** @field 공통 activation policy */
	activationPolicy: string;
	/** @field 후보 skill entrypoint 목록 */
	candidateSkillEntrypoints: string[];
	/** @field oracle을 제외한 arm execution policy */
	armPolicy: Record<string, unknown>;
	/** @field full-handbook arm에서만 제공하는 identity dictionary */
	identityDictionary: Record<string, string[]>;
	/** @field mutation arm의 독립 입력 */
	scenarioInput: Record<string, unknown> | null;
	/** @field arm별 routing trace 계약 */
	armRoutingContract: string;
	/** @field child payload write 및 shape 계약 */
	childPayloadContract: Record<string, unknown>;
}

/** @summary protocol raw bytes와 coordinate content binding */
export interface BehavioralProtocolBinding {
	/** @field bound protocol 절대 경로 */
	path: string;
	/** @field protocol raw bytes SHA-256 */
	sha256: string;
	/** @field selected arm canonical SHA-256 */
	armSha256: string;
	/** @field selected scenario canonical SHA-256 */
	scenarioSha256: string;
}

/** @summary 저장된 child request raw bytes binding */
export interface BehavioralChildRequestBinding {
	/** @field child request 절대 경로 */
	path: string;
	/** @field child request raw bytes SHA-256 */
	sha256: string;
	/** @field child request UTF-8 byte length */
	utf8ByteLength: number;
}

/** @summary child request와 exact dispatch를 함께 고정하는 coordinator envelope */
export interface BehavioralCoordinatorEnvelope {
	/** @field coordinator envelope schema version */
	schemaVersion: 1;
	/** @field 요청이 속한 immutable run ID */
	runId: string;
	/** @field protocol 및 selected coordinate digest binding */
	protocol: BehavioralProtocolBinding;
	/** @field canonical Git repository root */
	repositoryDir: string;
	/** @field canonical repositoryDir/skill root */
	skillRootDir: string;
	/** @field 모든 routing-evals.json raw bytes SHA-256 map */
	routingEvalRawSha256: Record<string, string>;
	/** @field 저장된 child request binding */
	childRequest: BehavioralChildRequestBinding;
	/** @field child에게 단독 할당한 payload 절대 경로 */
	assignedChildPayloadPath: string;
	/** @field source, request, dispatch를 묶은 canonical digest */
	requestContentDigest: string;
	/** @field behavioral validator가 사용하는 exact dispatch envelope */
	dispatchEnvelope: BehavioralEvalDispatchEnvelope;
}

/** @summary deterministic coordinator artifact 생성 입력 */
export interface CreateBehavioralCoordinatorArtifactsArgs {
	/** @field bound protocol 절대 경로 */
	protocolPath: string;
	/** @field 실행 대상 committed HEAD */
	repositoryHead: string;
	/** @field immutable run ID */
	runId: string;
	/** @field 실험 arm 이름 */
	arm: string;
	/** @field routing scenario ID */
	scenarioId: string;
	/** @field fresh trial 번호 */
	trial: number;
	/** @field coordinator artifact 절대 output directory */
	outputDir: string;
	/** @field canonical 검증 대상 Git repository root */
	repositoryDir?: string;
	/** @field 반드시 repositoryDir/skill과 같은 real path인 source root */
	skillRootDir?: string;
}

/** @summary 생성 완료했지만 아직 dispatch하지 않은 artifact 묶음 */
export interface BehavioralCoordinatorArtifacts {
	/** @field child에게 byte-for-byte 전달할 dispatch */
	exactDispatch: string;
	/** @field parsed child request */
	request: BehavioralChildRequest;
	/** @field deterministic child request bytes */
	requestRaw: string;
	/** @field parsed coordinator envelope */
	envelope: BehavioralCoordinatorEnvelope;
	/** @field deterministic coordinator envelope bytes */
	envelopeRaw: string;
	/** @field child request 저장 경로 */
	requestPath: string;
	/** @field coordinator envelope 저장 경로 */
	envelopePath: string;
	/** @field child payload 할당 경로 */
	childPayloadPath: string;
	/** @field merged run 저장 경로 */
	runPath: string;
}

/** @summary coordinator artifact를 no-overwrite 방식으로 저장한 결과 */
export interface PreparedBehavioralEvalDispatch {
	/** @field child에게 byte-for-byte 전달할 dispatch */
	exactDispatch: string;
	/** @field 저장된 child request 경로 */
	requestPath: string;
	/** @field 저장된 coordinator envelope 경로 */
	envelopePath: string;
	/** @field child payload 할당 경로 */
	childPayloadPath: string;
	/** @field 향후 merged run 저장 경로 */
	runPath: string;
}

/** @summary child payload merge와 검증 입력 */
export interface MergeBehavioralEvalChildPayloadArgs {
	/** @field 저장된 coordinator envelope 절대 경로 */
	envelopePath: string;
	/** @field child가 작성한 assigned payload 절대 경로 */
	childPayloadPath: string;
	/** @field merged run 절대 output directory */
	outputDir: string;
	/** @field envelope source binding과 일치해야 하는 skill root */
	skillRootDir?: string;
}

/** @summary immutable child payload를 포함한 최종 run 저장 결과 */
export interface MergedBehavioralEvalRun {
	/** @field atomic 저장된 merged run 경로 */
	runPath: string;
	/** @field immutable child payload raw bytes SHA-256 */
	childPayloadSha256: string;
}

/** @summary exact candidate score의 세 핵심 recall/precision 지표 */
export interface BehavioralCandidateMetrics {
	/** @field expected domain activation recall */
	domainActivationRecall: number;
	/** @field expected Selected rule recall */
	applicableRuleRecall: number;
	/** @field actual Selected rule exact precision */
	exactSelectionPrecision: number;
}

/** @summary post-hoc scorer 결과 */
export type BehavioralEvalScore =
	| {kind: "observational"; eligible: false; reason: string}
	| {kind: "mutation"; eligible: true; blockedGatePassed: boolean}
	| {
			kind: "candidate";
			eligible: true;
			exactMatch: boolean;
			initialExactMatch: boolean;
			driftFinalExactMatch: boolean | null;
			metrics: BehavioralCandidateMetrics;
	  };

/** @summary standalone scorer 입력 */
export interface ScoreBehavioralEvalRunArgs {
	/** @field child evidence를 포함한 merged run candidate */
	run: unknown;
	/** @field 실험 arm 이름 */
	arm: string;
	/** @field sealed routing oracle scenario ID */
	scenarioId: string;
	/** @field post-hoc routing oracle source root */
	skillRootDir?: string;
}

type JsonObject = Record<string, unknown>;

type RoutingOracleStage = {
	expectedSkills: string[];
	expectedSelected: Record<string, string[]>;
	expectedNotApplicable: Record<string, string[]>;
};

type ActualRoutingStage = {activatedSkills: string[]; selected: Record<string, string[]>; notApplicable: Record<string, string[]>};

/** @summary canonical skill source와 routing manifest raw digest snapshot */
interface BehavioralSourceSnapshot {
	/** @field canonical Git repository root */
	repositoryDir: string;
	/** @field canonical repositoryDir/skill root */
	skillRootDir: string;
	/** @field repository-relative routing-evals.json raw SHA-256 map */
	routingEvalRawSha256: Record<string, string>;
}

/** @summary requestContentDigest 생성 입력 */
interface CreateRequestContentDigestArgs {
	/** @field exact dispatch envelope */
	dispatchEnvelope: BehavioralEvalDispatchEnvelope;
	/** @field protocol raw SHA-256 */
	protocolSha256: string;
	/** @field arm canonical SHA-256 */
	armSha256: string;
	/** @field scenario canonical SHA-256 */
	scenarioSha256: string;
	/** @field child request raw SHA-256 */
	childRequestSha256: string;
	/** @field assigned child payload 절대 경로 */
	assignedChildPayloadPath: string;
	/** @field routing manifest raw SHA-256 map */
	routingEvalRawSha256: Record<string, string>;
}

const execFileAsync = promisify(execFile);
const sha256Pattern = /^sha256:[a-f0-9]{64}$/;
const commitPattern = /^[a-f0-9]{40,64}$/;
const runIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const progressiveSkillNames = ["react", "typescript", "css"] as const;
const childForbiddenFields = new Set([
	"schemaVersion",
	"runId",
	"protocolId",
	"repositoryHead",
	"arm",
	"scenarioId",
	"trial",
	"scenarioPrompt",
	"exactPrompt",
	"promptSha256",
	"promptByteLength",
	"promptRendererVersion",
	"generatedIndexDigests",
	"protocolSha256",
	"armSha256",
	"scenarioSha256",
	"requestContentDigest",
	"repositoryRoot",
	"assignedChildPayloadPath",
	"childRequestSha256",
	"childPayloadSha256",
	"stagedProvenanceSha256",
	"scoring",
]);

const childPayloadContract: Record<string, unknown> = {
	...createBehavioralChildPayloadContract(),
	forbiddenCoordinatorFields: [...childForbiddenFields].sort(),
};

/** @helper unknown JSON value를 plain object로 제한 */
const asObject = (value: unknown, label: string): JsonObject => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`${label} must be an object.`);
	}

	return value as JsonObject;
};

/** @helper required string 값 검증 */
const asString = (value: unknown, label: string): string => {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`${label} must be a non-empty string.`);
	}

	return value;
};

/** @helper 양의 정수 값 검증 */
const asPositiveInteger = (value: unknown, label: string): number => {
	if (!Number.isInteger(value) || Number(value) < 1) {
		throw new Error(`${label} must be a positive integer.`);
	}

	return Number(value);
};

/** @helper string array 값 검증 */
const asStringArray = (value: unknown, label: string): string[] => {
	if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) {
		throw new Error(`${label} must be an array of non-empty strings.`);
	}

	return [...value] as string[];
};

/** @helper SHA-256 record 값 검증 */
const asSha256Record = (value: unknown, label: string): Record<string, string> => {
	const record = asObject(value, label);
	const entries = Object.entries(record).map(([key, digest]) => {
		if (!sha256Pattern.test(String(digest))) {
			throw new Error(`${label}.${key} must be a sha256: prefixed lowercase digest.`);
		}

		return [key, String(digest)] as const;
	});

	return Object.fromEntries(entries);
};

/** @helper exact UTF-8 bytes SHA-256 생성 */
const createSha256 = (value: string | Buffer): string => {
	return `sha256:${createHash("sha256").update(value).digest("hex")}`;
};

/** @helper JSON canonical digest를 위한 key-sorted clone 생성 */
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

/** @helper deterministic pretty JSON bytes 생성 */
const serializeJson = (value: unknown): string => {
	return `${JSON.stringify(sortJsonValue(value), null, 2)}\n`;
};

/** @helper canonical JSON SHA-256 생성 */
const createCanonicalSha256 = (value: unknown): string => {
	return createSha256(JSON.stringify(sortJsonValue(value)));
};

/** @helper protocol coordinate와 exact dispatch/request binding digest 생성 */
const createRequestContentDigest = (args: CreateRequestContentDigestArgs): string => {
	const {dispatchEnvelope, protocolSha256, armSha256, scenarioSha256, childRequestSha256, assignedChildPayloadPath, routingEvalRawSha256} =
		args;
	return createCanonicalSha256({
		schemaVersion: 3,
		protocolId: dispatchEnvelope.protocolId,
		protocolDigest: protocolSha256,
		repositoryHead: dispatchEnvelope.repositoryHead,
		arm: dispatchEnvelope.arm,
		armDigest: armSha256,
		scenarioId: dispatchEnvelope.scenarioId,
		scenarioDigest: scenarioSha256,
		trial: dispatchEnvelope.trial,
		currentIndexDigests: dispatchEnvelope.generatedIndexDigests,
		exactPromptSha256: dispatchEnvelope.promptSha256,
		promptByteLength: dispatchEnvelope.promptByteLength,
		promptRendererVersion: dispatchEnvelope.promptRendererVersion,
		childRequestSha256,
		assignedChildPayloadPath,
		routingEvalRawSha256,
	});
};

/** @helper JSON 파일을 object로 읽기 */
const readJsonObject = async (targetPath: string, label: string): Promise<{raw: string; value: JsonObject}> => {
	const raw = await readFile(targetPath, "utf8");
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		throw new Error(`${label} must contain valid JSON: ${error instanceof Error ? error.message : String(error)}`);
	}

	return {raw, value: asObject(parsed, label)};
};

/** @summary canonical skill source 검증 입력 */
interface ReadBehavioralSourceSnapshotArgs {
	/** @field 검증 대상 Git repository root */
	repositoryDir: string;
	/** @field repositoryDir/skill과 일치해야 하는 source root */
	skillRootDir: string;
}

/** @summary routing manifest 재귀 탐색 입력 */
interface CollectRoutingEvalPathsArgs {
	/** @field 현재 탐색 directory */
	currentDir: string;
	/** @field 누적 manifest 절대 경로 */
	paths: string[];
}

/** @helper skill root 아래 모든 routing-evals.json 경로를 stable order로 수집 */
const collectRoutingEvalPaths = async (args: CollectRoutingEvalPathsArgs): Promise<void> => {
	const {currentDir, paths} = args;
	const entries = await readdir(currentDir, {withFileTypes: true});

	for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, "en"))) {
		const entryPath = path.join(currentDir, entry.name);

		if (entry.isDirectory()) {
			await collectRoutingEvalPaths({currentDir: entryPath, paths});
			continue;
		}

		if ((entry.isFile() || entry.isSymbolicLink()) && entry.name === "routing-evals.json") {
			paths.push(entryPath);
		}
	}
};

/** @helper canonical repositoryDir/skill과 clean HEAD를 검증하고 routing raw digest snapshot 생성 */
const readBehavioralSourceSnapshot = async (args: ReadBehavioralSourceSnapshotArgs): Promise<BehavioralSourceSnapshot> => {
	const requestedRepositoryDir = path.resolve(args.repositoryDir);
	const repositoryDir = await realpath(requestedRepositoryDir);
	const {stdout: gitRootOutput} = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {cwd: repositoryDir});
	const gitRoot = await realpath(gitRootOutput.trim());

	if (repositoryDir !== gitRoot) {
		throw new Error("repositoryDir must resolve to the exact Git worktree root.");
	}

	const expectedSkillRootDir = await realpath(path.join(repositoryDir, "skill"));
	const skillRootDir = await realpath(path.resolve(args.skillRootDir));

	if (skillRootDir !== expectedSkillRootDir) {
		throw new Error("skillRootDir must resolve to the same real path as repositoryDir/skill.");
	}

	const {stdout: statusOutput} = await execFileAsync(
		"git",
		["status", "--porcelain=v1", "--untracked-files=all", "--", "skill", "package"],
		{cwd: repositoryDir},
	);

	if (statusOutput.length > 0) {
		throw new Error(
			"Behavioral skill source and evaluator implementation must be clean against HEAD; tracked or untracked files exist under skill/ or package/.",
		);
	}

	const routingEvalPaths: string[] = [];
	await collectRoutingEvalPaths({currentDir: skillRootDir, paths: routingEvalPaths});

	if (routingEvalPaths.length === 0) {
		throw new Error("Behavioral skill source must contain at least one routing-evals.json manifest.");
	}

	const routingEvalEntries = await Promise.all(
		routingEvalPaths.map(async (manifestPath) => {
			const relativePath = path.relative(repositoryDir, manifestPath).split(path.sep).join("/");
			return [relativePath, createSha256(await readFile(manifestPath))] as const;
		}),
	);

	return {
		repositoryDir,
		skillRootDir,
		routingEvalRawSha256: Object.fromEntries(routingEvalEntries.sort(([left], [right]) => left.localeCompare(right, "en"))),
	};
};

/** @summary source snapshot 일치 검증 입력 */
interface AssertBehavioralSourceSnapshotArgs {
	/** @field 검증 대상 Git repository root */
	repositoryDir: string;
	/** @field 검증 대상 skill root */
	skillRootDir: string;
	/** @field envelope에 봉인된 routing manifest digest */
	expectedRoutingEvalRawSha256: Record<string, string>;
	/** @field 오류 메시지에 표시할 lifecycle stage */
	stage: string;
}

/** @helper clean source와 모든 routing manifest raw digest를 envelope snapshot에 대조 */
const assertBehavioralSourceSnapshot = async (args: AssertBehavioralSourceSnapshotArgs): Promise<BehavioralSourceSnapshot> => {
	const snapshot = await readBehavioralSourceSnapshot({repositoryDir: args.repositoryDir, skillRootDir: args.skillRootDir});

	if (createCanonicalSha256(snapshot.routingEvalRawSha256) !== createCanonicalSha256(args.expectedRoutingEvalRawSha256)) {
		throw new Error(`routing-evals.json raw bytes changed ${args.stage}.`);
	}

	return snapshot;
};

/** @helper output 파일을 같은 directory에서 atomic no-overwrite 방식으로 생성 */
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
			throw new Error(`Refusing to overwrite existing behavioral artifact: ${targetPath}`);
		}

		throw error;
	} finally {
		await unlink(temporaryPath).catch(() => undefined);
	}
};

/** @helper explicit absolute output directory 검증 */
const resolveOutputPaths = (
	outputDir: string,
	runId: string,
): Omit<BehavioralCoordinatorArtifacts, "exactDispatch" | "request" | "requestRaw" | "envelope" | "envelopeRaw"> => {
	if (!path.isAbsolute(outputDir)) {
		throw new Error("outputDir must be an explicit absolute path.");
	}

	if (!runIdPattern.test(runId)) {
		throw new Error(`runId contains an unsafe path character: ${runId}`);
	}

	const resolvedOutputDir = path.resolve(outputDir);
	return {
		requestPath: path.join(resolvedOutputDir, `${runId}.child-request.json`),
		envelopePath: path.join(resolvedOutputDir, `${runId}.dispatch-envelope.json`),
		childPayloadPath: path.join(resolvedOutputDir, `${runId}.child-payload.json`),
		runPath: path.join(resolvedOutputDir, `${runId}.run.json`),
	};
};

/** @api protocol runMatrix를 stable order의 exact run 좌표로 전개 */
export const enumerateBehavioralEvalRunMatrix = (protocolValue: unknown): BehavioralEvalRunCoordinate[] => {
	const protocol = asObject(protocolValue, "protocol");
	const matrix = asObject(protocol.runMatrix, "protocol.runMatrix");
	const scenarios = asObject(protocol.scenarios, "protocol.scenarios");
	const coordinates: BehavioralEvalRunCoordinate[] = [];

	const appendGroup = (group: "baseline" | "mixed" | "mutation", trialsForScenario: (scenarioId: string) => number): void => {
		const groupConfig = asObject(matrix[group], `protocol.runMatrix.${group}`);
		const scenarioIds = asStringArray(groupConfig.scenarios, `protocol.runMatrix.${group}.scenarios`);
		const arms = asStringArray(groupConfig.arms, `protocol.runMatrix.${group}.arms`);

		for (const scenarioId of scenarioIds) {
			if (!Object.hasOwn(scenarios, scenarioId)) {
				throw new Error(`protocol.runMatrix.${group} references unknown scenario "${scenarioId}".`);
			}

			for (const arm of arms) {
				for (let trial = 1; trial <= trialsForScenario(scenarioId); trial += 1) {
					coordinates.push({group, arm, scenarioId, trial, runId: `${arm}--${scenarioId}--t${trial}`});
				}
			}
		}

		const declaredCount = asPositiveInteger(groupConfig.runCount, `protocol.runMatrix.${group}.runCount`);
		const actualCount = coordinates.filter((coordinate) => coordinate.group === group).length;

		if (declaredCount !== actualCount) {
			throw new Error(`protocol.runMatrix.${group}.runCount is ${declaredCount}, but enumeration produced ${actualCount}.`);
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
	appendGroup("mixed", (scenarioId) => (scenarioId === criticalScenario ? criticalTrials : ordinaryTrials));
	const mutation = asObject(matrix.mutation, "protocol.runMatrix.mutation");
	const mutationTrials = asPositiveInteger(mutation.trialsPerScenarioArm, "protocol.runMatrix.mutation.trialsPerScenarioArm");
	appendGroup("mutation", () => mutationTrials);
	const totalFreshTrials = asPositiveInteger(matrix.totalFreshTrials, "protocol.runMatrix.totalFreshTrials");

	if (coordinates.length !== totalFreshTrials) {
		throw new Error(`protocol.runMatrix.totalFreshTrials is ${totalFreshTrials}, but enumeration produced ${coordinates.length}.`);
	}

	if (new Set(coordinates.map(({runId}) => runId)).size !== coordinates.length) {
		throw new Error("protocol.runMatrix produces duplicate run IDs.");
	}

	return coordinates;
};

/** @helper protocol virtualFiles를 expected output field 없이 strict parse */
const parseBehavioralVirtualFiles = (value: unknown, label: string): BehavioralVirtualFile[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const virtualFiles = value.map((item, index) => {
		const itemLabel = `${label}[${index}]`;
		const virtualFile = asObject(item, itemLabel);
		assertExactObjectKeys({value: virtualFile, expectedKeys: ["path", "state", "content", "sha256"], label: itemLabel});
		const filePath = asString(virtualFile.path, `${itemLabel}.path`);

		if (path.isAbsolute(filePath) || filePath.includes("\\") || path.posix.normalize(filePath) !== filePath || filePath.startsWith("../")) {
			throw new Error(`${itemLabel}.path must be a normalized repository-relative POSIX path.`);
		}

		if (virtualFile.state !== "present" && virtualFile.state !== "absent") {
			throw new Error(`${itemLabel}.state must be "present" or "absent".`);
		}

		if (virtualFile.state === "absent") {
			if (virtualFile.content !== null || virtualFile.sha256 !== null) {
				throw new Error(`${itemLabel} absent state requires null content and sha256.`);
			}

			return {path: filePath, state: "absent" as const, content: null, sha256: null};
		}

		if (typeof virtualFile.content !== "string") {
			throw new Error(`${itemLabel}.content must be a string for present state.`);
		}

		const sha256 = asString(virtualFile.sha256, `${itemLabel}.sha256`);

		if (sha256 !== createSha256(virtualFile.content)) {
			throw new Error(`${itemLabel}.sha256 must match present content UTF-8 bytes.`);
		}

		return {path: filePath, state: "present" as const, content: virtualFile.content, sha256};
	});
	const duplicatePath = virtualFiles.find(
		({path: filePath}, index) => virtualFiles.findIndex((item) => item.path === filePath) !== index,
	)?.path;

	if (duplicatePath) {
		throw new Error(`${label} must not contain duplicate path "${duplicatePath}".`);
	}

	return virtualFiles;
};

/** @summary child request 생성 입력 */
interface CreateChildRequestArgs {
	/** @field bound protocol object */
	protocol: JsonObject;
	/** @field immutable run ID */
	runId: string;
	/** @field 실험 arm 이름 */
	arm: string;
	/** @field routing scenario ID */
	scenarioId: string;
	/** @field fresh trial 번호 */
	trial: number;
	/** @field child에게 단독 할당한 payload 절대 경로 */
	assignedChildPayloadPath: string;
	/** @field canonical Git repository root */
	repositoryRoot: string;
}

/** @helper protocol scenario에서 coordinator-approved child request 구성 */
const createChildRequest = (args: CreateChildRequestArgs): BehavioralChildRequest => {
	const {protocol, runId, arm, scenarioId, trial, assignedChildPayloadPath, repositoryRoot} = args;
	const scenario = asObject(asObject(protocol.scenarios, "protocol.scenarios")[scenarioId], `protocol.scenarios.${scenarioId}`);
	const armConfig = asObject(asObject(protocol.arms, "protocol.arms")[arm], `protocol.arms.${arm}`);
	const task =
		arm === "no-skill" && typeof scenario.noSkillExactPrompt === "string"
			? scenario.noSkillExactPrompt
			: typeof scenario.trialPrompt === "string"
				? scenario.trialPrompt
				: asString(scenario.basePrompt, `protocol.scenarios.${scenarioId}.basePrompt`);
	const files = scenario.filesFinal ?? scenario.files ?? scenario.filesInitial ?? [];
	const virtualFiles = parseBehavioralVirtualFiles(scenario.virtualFiles ?? [], `protocol.scenarios.${scenarioId}.virtualFiles`);
	const coordinate = enumerateBehavioralEvalRunMatrix(protocol).find((item) => item.runId === runId);

	if (!coordinate || coordinate.arm !== arm || coordinate.scenarioId !== scenarioId || coordinate.trial !== trial) {
		throw new Error("child request coordinate must identify one exact run in protocol.runMatrix.");
	}
	const approvedArmFields = [
		"allowedReads",
		"allowedReadPatterns",
		"allowedReadSequence",
		"forbiddenReads",
		"routingPassesRequired",
		"receiptContract",
		"promptSuffix",
		"ordinalSemantics",
	];
	const armPolicy = Object.fromEntries(approvedArmFields.filter((key) => armConfig[key] !== undefined).map((key) => [key, armConfig[key]]));
	const identityDictionary: Record<string, string[]> = {};

	if (arm === "full-handbook") {
		const dictionaries = asObject(protocol.fullHandbookIdentityDictionaries, "protocol.fullHandbookIdentityDictionaries");

		for (const skillName of progressiveSkillNames) {
			identityDictionary[skillName] = asStringArray(dictionaries[skillName], `protocol.fullHandbookIdentityDictionaries.${skillName}`);
		}
	}

	return {
		schemaVersion: 3,
		protocolId: "progressive-loading-behavioral-v3",
		runId,
		arm,
		scenarioId,
		trial,
		repositoryRoot,
		assignedChildPayloadPath,
		task,
		files: asStringArray(files, `protocol.scenarios.${scenarioId}.files`),
		virtualFiles,
		activationPolicy:
			arm === "no-skill"
				? "This observational arm activates no convention skill and reads no repository convention document."
				: `Infer React, TypeScript, and CSS activation only from the task and changed-file surfaces. Resolve every repository-relative read under ${repositoryRoot}. Inspect candidate SKILL.md entrypoints only as the arm read policy allows; do not assume a domain list or expected partition.`,
		candidateSkillEntrypoints: arm === "no-skill" ? [] : progressiveSkillNames.map((skillName) => `skill/${skillName}/SKILL.md`),
		armPolicy,
		identityDictionary,
		scenarioInput: arm === "mutation" ? {suppliedReceipt: scenario.suppliedReceipt} : null,
		armRoutingContract:
			arm === "no-skill"
				? "routingTrace and driftReceipt are null; activatedSkills, receipts, and declaredLoadedFiles.paths are empty."
				: arm === "mutation"
					? "routingTrace and driftReceipt are null; return the independent auditor receipt and BLOCKED completion with coverageFailCount or unknownCount above zero."
					: "routingTrace contains at least three passes; its final two passes are identical with no selection-changing delta, final Unknown is empty, and receipts exactly match the final pass.",
		childPayloadContract: {
			...childPayloadContract,
			assignedChildPayloadPath,
			virtualPatchPolicy:
				coordinate.group === "mixed"
					? "Return a non-null virtualPatch whose paths, beforeState, and beforeSha256 values exactly cover virtualFiles in order."
					: "virtualPatch may be null; any non-null patch must exactly cover virtualFiles path, before state, and digest in order.",
			writeScope: `Write exactly ${assignedChildPayloadPath} with apply_patch and do not create or modify any other file.`,
		},
	};
};

const behavioralChildRequestKeys = [
	"activationPolicy",
	"arm",
	"armPolicy",
	"armRoutingContract",
	"assignedChildPayloadPath",
	"candidateSkillEntrypoints",
	"childPayloadContract",
	"files",
	"identityDictionary",
	"protocolId",
	"repositoryRoot",
	"runId",
	"scenarioId",
	"scenarioInput",
	"schemaVersion",
	"task",
	"trial",
	"virtualFiles",
] as const;

/** @summary exact object key 검증 입력 */
interface AssertExactObjectKeysArgs {
	/** @field 검증할 plain object */
	value: JsonObject;
	/** @field 허용되는 exact key 목록 */
	expectedKeys: readonly string[];
	/** @field 오류 메시지용 object label */
	label: string;
}

/** @helper unknown field를 허용하지 않는 exact object key 검증 */
const assertExactObjectKeys = (args: AssertExactObjectKeysArgs): void => {
	const actualKeys = Object.keys(args.value).sort((left, right) => left.localeCompare(right, "en"));
	const expectedKeys = [...args.expectedKeys].sort((left, right) => left.localeCompare(right, "en"));

	if (!isExactArray(actualKeys, expectedKeys)) {
		throw new Error(`${args.label} keys must exactly match the coordinator child request schema.`);
	}
};

/** @helper saved child request를 unknown field 없이 strict parse */
const parseBehavioralChildRequest = (value: unknown): BehavioralChildRequest => {
	const request = asObject(value, "saved child request");
	assertExactObjectKeys({value: request, expectedKeys: behavioralChildRequestKeys, label: "saved child request"});

	if (request.schemaVersion !== 3 || request.protocolId !== "progressive-loading-behavioral-v3") {
		throw new Error("saved child request must use progressive-loading-behavioral-v3 schemaVersion 3.");
	}

	const repositoryRoot = asString(request.repositoryRoot, "saved child request.repositoryRoot");
	const assignedChildPayloadPath = asString(request.assignedChildPayloadPath, "saved child request.assignedChildPayloadPath");

	if (!path.isAbsolute(repositoryRoot) || !path.isAbsolute(assignedChildPayloadPath)) {
		throw new Error("saved child request repositoryRoot and assignedChildPayloadPath must be absolute paths.");
	}

	const identityDictionaryObject = asObject(request.identityDictionary, "saved child request.identityDictionary");
	const identityDictionary = Object.fromEntries(
		Object.entries(identityDictionaryObject).map(([skillName, identities]) => [
			skillName,
			asStringArray(identities, `saved child request.identityDictionary.${skillName}`),
		]),
	);
	const scenarioInput = request.scenarioInput === null ? null : asObject(request.scenarioInput, "saved child request.scenarioInput");

	return {
		schemaVersion: 3,
		protocolId: "progressive-loading-behavioral-v3",
		runId: asString(request.runId, "saved child request.runId"),
		arm: asString(request.arm, "saved child request.arm"),
		scenarioId: asString(request.scenarioId, "saved child request.scenarioId"),
		trial: asPositiveInteger(request.trial, "saved child request.trial"),
		repositoryRoot,
		assignedChildPayloadPath,
		task: asString(request.task, "saved child request.task"),
		files: asStringArray(request.files, "saved child request.files"),
		virtualFiles: parseBehavioralVirtualFiles(request.virtualFiles, "saved child request.virtualFiles"),
		activationPolicy: asString(request.activationPolicy, "saved child request.activationPolicy"),
		candidateSkillEntrypoints: asStringArray(request.candidateSkillEntrypoints, "saved child request.candidateSkillEntrypoints"),
		armPolicy: asObject(request.armPolicy, "saved child request.armPolicy"),
		identityDictionary,
		scenarioInput,
		armRoutingContract: asString(request.armRoutingContract, "saved child request.armRoutingContract"),
		childPayloadContract: asObject(request.childPayloadContract, "saved child request.childPayloadContract"),
	};
};

/** @helper saved coordinator envelope를 coordinator-owned shape로 strict parse */
const parseBehavioralCoordinatorEnvelope = (value: unknown): BehavioralCoordinatorEnvelope => {
	const envelope = asObject(value, "coordinator envelope");
	assertExactObjectKeys({
		value: envelope,
		expectedKeys: [
			"schemaVersion",
			"runId",
			"protocol",
			"repositoryDir",
			"skillRootDir",
			"routingEvalRawSha256",
			"childRequest",
			"assignedChildPayloadPath",
			"requestContentDigest",
			"dispatchEnvelope",
		],
		label: "coordinator envelope",
	});

	if (envelope.schemaVersion !== 1) {
		throw new Error("coordinator envelope.schemaVersion must be 1.");
	}

	const protocol = asObject(envelope.protocol, "coordinator envelope.protocol");
	assertExactObjectKeys({
		value: protocol,
		expectedKeys: ["path", "sha256", "armSha256", "scenarioSha256"],
		label: "coordinator envelope.protocol",
	});
	const childRequest = asObject(envelope.childRequest, "coordinator envelope.childRequest");
	assertExactObjectKeys({
		value: childRequest,
		expectedKeys: ["path", "sha256", "utf8ByteLength"],
		label: "coordinator envelope.childRequest",
	});
	const dispatchEnvelope = asObject(envelope.dispatchEnvelope, "coordinator envelope.dispatchEnvelope");

	return {
		schemaVersion: 1,
		runId: asString(envelope.runId, "coordinator envelope.runId"),
		protocol: {
			path: asString(protocol.path, "coordinator envelope.protocol.path"),
			sha256: asString(protocol.sha256, "coordinator envelope.protocol.sha256"),
			armSha256: asString(protocol.armSha256, "coordinator envelope.protocol.armSha256"),
			scenarioSha256: asString(protocol.scenarioSha256, "coordinator envelope.protocol.scenarioSha256"),
		},
		repositoryDir: asString(envelope.repositoryDir, "coordinator envelope.repositoryDir"),
		skillRootDir: asString(envelope.skillRootDir, "coordinator envelope.skillRootDir"),
		routingEvalRawSha256: asSha256Record(envelope.routingEvalRawSha256, "coordinator envelope.routingEvalRawSha256"),
		childRequest: {
			path: asString(childRequest.path, "coordinator envelope.childRequest.path"),
			sha256: asString(childRequest.sha256, "coordinator envelope.childRequest.sha256"),
			utf8ByteLength: asPositiveInteger(childRequest.utf8ByteLength, "coordinator envelope.childRequest.utf8ByteLength"),
		},
		assignedChildPayloadPath: asString(envelope.assignedChildPayloadPath, "coordinator envelope.assignedChildPayloadPath"),
		requestContentDigest: asString(envelope.requestContentDigest, "coordinator envelope.requestContentDigest"),
		dispatchEnvelope: dispatchEnvelope as unknown as BehavioralEvalDispatchEnvelope,
	};
};

/** @summary exact dispatch 생성 입력 */
interface CreateExactDispatchArgs {
	/** @field saved child request 절대 경로 */
	requestPath: string;
	/** @field saved child request raw SHA-256 */
	requestSha256: string;
	/** @field assigned child payload 절대 경로 */
	assignedChildPayloadPath: string;
}

/** @helper child에게 byte-for-byte 전달할 short dispatch 생성 */
const createExactDispatch = (args: CreateExactDispatchArgs): string => {
	return [
		`Read and execute ${args.requestPath} (${args.requestSha256}).`,
		`Assigned payload path: ${args.assignedChildPayloadPath}. Write exactly this one file with apply_patch; create or modify no other file.`,
		"Do not echo the dispatch prompt or coordinator-owned fields; after writing valid childPayload JSON, return only concise status.",
	].join("\n");
};

/** @summary child virtualPatch file evidence */
interface BehavioralVirtualPatchFile {
	/** @field virtual input과 exact match해야 하는 repository-relative path */
	path: string;
	/** @field virtual input과 exact match해야 하는 수정 전 존재 상태 */
	beforeState: "present" | "absent";
	/** @field virtual input content raw SHA-256 */
	beforeSha256: string | null;
	/** @field child가 제안한 수정 후 존재 상태 */
	afterState: "present" | "absent";
	/** @field child가 제안한 exact UTF-8 output */
	after: string | null;
	/** @field after raw UTF-8 bytes SHA-256 */
	afterSha256: string | null;
}

/** @summary child virtualPatch evidence */
interface BehavioralVirtualPatch {
	/** @field virtual input과 exact coverage해야 하는 file patch 목록 */
	files: BehavioralVirtualPatchFile[];
	/** @field child가 작성한 patch 요약 */
	summary: string;
}

/** @helper virtual file 존재 상태를 strict parse */
const parseVirtualFileState = (value: unknown, label: string): "present" | "absent" => {
	if (value !== "present" && value !== "absent") {
		throw new Error(`${label} must be "present" or "absent".`);
	}

	return value;
};

/** @helper child virtualPatch를 strict parse하고 before/after state 계약과 after raw digest 검증 */
const parseBehavioralVirtualPatch = (value: unknown): BehavioralVirtualPatch | null => {
	if (value === null) {
		return null;
	}

	const virtualPatch = asObject(value, "child payload.virtualPatch");
	assertExactObjectKeys({value: virtualPatch, expectedKeys: ["files", "summary"], label: "child payload.virtualPatch"});

	if (!Array.isArray(virtualPatch.files)) {
		throw new Error("child payload.virtualPatch.files must be an array.");
	}

	const files = virtualPatch.files.map((item, index) => {
		const itemLabel = `child payload.virtualPatch.files[${index}]`;
		const file = asObject(item, itemLabel);
		assertExactObjectKeys({
			value: file,
			expectedKeys: ["path", "beforeState", "beforeSha256", "afterState", "after", "afterSha256"],
			label: itemLabel,
		});
		const filePath = asString(file.path, `${itemLabel}.path`);
		const beforeState = parseVirtualFileState(file.beforeState, `${itemLabel}.beforeState`);
		const afterState = parseVirtualFileState(file.afterState, `${itemLabel}.afterState`);
		let beforeSha256: string | null = null;

		if (beforeState === "present") {
			beforeSha256 = asString(file.beforeSha256, `${itemLabel}.beforeSha256`);

			if (!sha256Pattern.test(beforeSha256)) {
				throw new Error(`${itemLabel}.beforeSha256 must be a sha256: prefixed lowercase digest for present state.`);
			}
		} else if (file.beforeSha256 !== null) {
			throw new Error(`${itemLabel}.beforeSha256 must be null for absent beforeState.`);
		}

		if (afterState === "absent") {
			if (file.after !== null || file.afterSha256 !== null) {
				throw new Error(`${itemLabel} absent afterState requires null after and afterSha256.`);
			}

			return {path: filePath, beforeState, beforeSha256, afterState, after: null, afterSha256: null};
		}

		if (typeof file.after !== "string") {
			throw new Error(`${itemLabel}.after must be a string for present afterState.`);
		}

		const afterSha256 = asString(file.afterSha256, `${itemLabel}.afterSha256`);

		if (afterSha256 !== createSha256(file.after)) {
			throw new Error(`${itemLabel}.afterSha256 must match present after UTF-8 bytes.`);
		}

		return {path: filePath, beforeState, beforeSha256, afterState, after: file.after, afterSha256};
	});
	const summary = asString(virtualPatch.summary, "child payload.virtualPatch.summary");
	return {files, summary};
};

/** @summary virtualPatch와 child request input binding 검증 입력 */
interface AssertVirtualPatchBindingArgs {
	/** @field protocol matrix group */
	group: BehavioralEvalRunCoordinate["group"];
	/** @field strict parsed child virtualPatch */
	virtualPatch: BehavioralVirtualPatch | null;
	/** @field child request에 공개된 exact virtual input */
	virtualFiles: BehavioralVirtualFile[];
}

/** @helper mixed patch 필수성과 exact path/before digest coverage 검증 */
const assertVirtualPatchBinding = (args: AssertVirtualPatchBindingArgs): void => {
	if (args.group === "mixed" && args.virtualPatch === null) {
		throw new Error("mixed behavioral runs require a non-null child payload.virtualPatch.");
	}

	if (args.virtualPatch === null) {
		return;
	}

	const actualPaths = args.virtualPatch.files.map(({path: filePath}) => filePath);
	const expectedPaths = args.virtualFiles.map(({path: filePath}) => filePath);

	if (!isExactArray(actualPaths, expectedPaths)) {
		throw new Error("child payload.virtualPatch paths must exactly match saved child request virtualFiles paths.");
	}

	for (const [index, virtualFile] of args.virtualFiles.entries()) {
		if (args.virtualPatch.files[index]?.beforeState !== virtualFile.state) {
			throw new Error(`child payload.virtualPatch.files[${index}].beforeState must match saved child request virtualFiles state.`);
		}

		if (args.virtualPatch.files[index]?.beforeSha256 !== virtualFile.sha256) {
			throw new Error(`child payload.virtualPatch.files[${index}].beforeSha256 must match saved child request virtualFiles digest.`);
		}
	}
};

/** @summary bound protocol 검증 입력 */
interface AssertBoundProtocolArgs {
	/** @field 검증할 protocol object */
	protocol: JsonObject;
	/** @field 실행 대상 committed HEAD */
	repositoryHead: string;
	/** @field current generated routing digest map */
	generatedIndexDigests: Record<string, string>;
}

/** @helper protocol binding placeholder와 current digest 일치 여부 검증 */
const assertBoundProtocol = (args: AssertBoundProtocolArgs): void => {
	const {protocol, repositoryHead, generatedIndexDigests} = args;
	if (protocol.schemaVersion !== 3 || protocol.protocolId !== "progressive-loading-behavioral-v3") {
		throw new Error("protocol must be progressive-loading-behavioral-v3 schemaVersion 3.");
	}

	const repository = asObject(protocol.repository, "protocol.repository");

	if (repository.sourceHead !== repositoryHead || repository.bindingStatus !== "bound") {
		throw new Error("protocol.repository must be bound to the requested committed HEAD before dispatch.");
	}

	const generatedIndexes = asObject(protocol.generatedIndexes, "protocol.generatedIndexes");

	for (const [skillName, currentDigest] of Object.entries(generatedIndexDigests)) {
		const configuredDigest = asObject(generatedIndexes[skillName], `protocol.generatedIndexes.${skillName}`).digest;

		if (configuredDigest !== currentDigest || !sha256Pattern.test(String(configuredDigest))) {
			throw new Error(`protocol.generatedIndexes.${skillName}.digest must be bound to current source.`);
		}
	}
};

/** @api dispatch 전에 oracle-free request와 coordinator envelope를 deterministic 생성 */
export const createBehavioralCoordinatorArtifacts = async (
	args: CreateBehavioralCoordinatorArtifactsArgs,
): Promise<BehavioralCoordinatorArtifacts> => {
	if (args.scenarioId === "RTE02-owner-placement-css-drift") {
		throw new Error("RTE02-owner-placement-css-drift requires the staged coordinator; regular one-shot prepare is forbidden.");
	}

	if (!path.isAbsolute(args.protocolPath)) {
		throw new Error("protocolPath must be an absolute path.");
	}

	if (!commitPattern.test(args.repositoryHead)) {
		throw new Error("repositoryHead must be a full lowercase committed Git object ID.");
	}

	const requestedRepositoryDir = path.resolve(args.repositoryDir ?? packagePaths.repoDir);
	const sourceSnapshot = await readBehavioralSourceSnapshot({
		repositoryDir: requestedRepositoryDir,
		skillRootDir: args.skillRootDir ?? path.join(requestedRepositoryDir, "skill"),
	});
	const {repositoryDir, skillRootDir, routingEvalRawSha256} = sourceSnapshot;
	const {stdout} = await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: repositoryDir});

	if (stdout.trim() !== args.repositoryHead) {
		throw new Error("repositoryHead must exactly match the worktree's committed HEAD.");
	}

	const protocolResult = await readJsonObject(path.resolve(args.protocolPath), "protocol");
	const protocol = protocolResult.value;
	const coordinate = enumerateBehavioralEvalRunMatrix(protocol).find(
		(item) => item.runId === args.runId && item.arm === args.arm && item.scenarioId === args.scenarioId && item.trial === args.trial,
	);

	if (!coordinate) {
		throw new Error("runId/arm/scenarioId/trial must identify one exact coordinate in protocol.runMatrix.");
	}

	const paths = resolveOutputPaths(args.outputDir, args.runId);
	const request = createChildRequest({
		protocol,
		runId: args.runId,
		arm: args.arm,
		scenarioId: args.scenarioId,
		trial: args.trial,
		assignedChildPayloadPath: paths.childPayloadPath,
		repositoryRoot: repositoryDir,
	});
	const requestRaw = serializeJson(request);
	const requestSha256 = createSha256(requestRaw);
	const exactDispatch = createExactDispatch({
		requestPath: paths.requestPath,
		requestSha256,
		assignedChildPayloadPath: paths.childPayloadPath,
	});
	const scenario = asObject(asObject(protocol.scenarios, "protocol.scenarios")[args.scenarioId], `protocol.scenarios.${args.scenarioId}`);
	const dispatchEnvelope = await createBehavioralEvalDispatchEnvelope({
		runId: args.runId,
		repositoryHead: args.repositoryHead,
		arm: args.arm,
		scenarioId: args.scenarioId,
		trial: args.trial,
		scenarioPrompt: request.task,
		exactPrompt: exactDispatch,
		promptRendererVersion: "behavioral-prompt-renderer-v3",
		routingSkillNames: [...progressiveSkillNames],
		skillRootDir,
	});
	assertBoundProtocol({protocol, repositoryHead: args.repositoryHead, generatedIndexDigests: dispatchEnvelope.generatedIndexDigests});
	const protocolSha256 = createSha256(protocolResult.raw);
	const armSha256 = createCanonicalSha256(asObject(asObject(protocol.arms, "protocol.arms")[args.arm], `protocol.arms.${args.arm}`));
	const scenarioSha256 = createCanonicalSha256(scenario);
	const requestContentDigest = createRequestContentDigest({
		dispatchEnvelope,
		protocolSha256,
		armSha256,
		scenarioSha256,
		childRequestSha256: requestSha256,
		assignedChildPayloadPath: paths.childPayloadPath,
		routingEvalRawSha256,
	});
	const envelope: BehavioralCoordinatorEnvelope = {
		schemaVersion: 1,
		runId: args.runId,
		protocol: {path: path.resolve(args.protocolPath), sha256: protocolSha256, armSha256, scenarioSha256},
		repositoryDir,
		skillRootDir,
		routingEvalRawSha256,
		childRequest: {path: paths.requestPath, sha256: requestSha256, utf8ByteLength: Buffer.byteLength(requestRaw, "utf8")},
		assignedChildPayloadPath: paths.childPayloadPath,
		requestContentDigest,
		dispatchEnvelope,
	};

	return {...paths, exactDispatch, request, requestRaw, envelope, envelopeRaw: serializeJson(envelope)};
};

/** @api coordinator-owned request와 envelope를 dispatch 전에 atomic 저장 */
export const prepareBehavioralEvalDispatch = async (
	args: CreateBehavioralCoordinatorArtifactsArgs,
): Promise<PreparedBehavioralEvalDispatch> => {
	const artifacts = await createBehavioralCoordinatorArtifacts(args);
	await assertBehavioralSourceSnapshot({
		repositoryDir: artifacts.envelope.repositoryDir,
		skillRootDir: artifacts.envelope.skillRootDir,
		expectedRoutingEvalRawSha256: artifacts.envelope.routingEvalRawSha256,
		stage: "before dispatch preparation",
	});
	await mkdir(path.dirname(artifacts.requestPath), {recursive: true});
	await writeAtomicNoOverwrite(artifacts.requestPath, artifacts.requestRaw);

	try {
		await writeAtomicNoOverwrite(artifacts.envelopePath, artifacts.envelopeRaw);
		await assertBehavioralSourceSnapshot({
			repositoryDir: artifacts.envelope.repositoryDir,
			skillRootDir: artifacts.envelope.skillRootDir,
			expectedRoutingEvalRawSha256: artifacts.envelope.routingEvalRawSha256,
			stage: "during dispatch preparation",
		});
	} catch (error) {
		await unlink(artifacts.requestPath).catch(() => undefined);
		await unlink(artifacts.envelopePath).catch(() => undefined);
		throw error;
	}

	return {
		exactDispatch: artifacts.exactDispatch,
		requestPath: artifacts.requestPath,
		envelopePath: artifacts.envelopePath,
		childPayloadPath: artifacts.childPayloadPath,
		runPath: artifacts.runPath,
	};
};

/** @helper routing receipt array를 scorer용 stage로 정규화 */
const parseActualRoutingStage = (value: unknown, label: string): ActualRoutingStage => {
	const stage = asObject(value, label);
	const activatedSkills = asStringArray(stage.activatedSkills, `${label}.activatedSkills`);

	if (!Array.isArray(stage.receipts)) {
		throw new Error(`${label}.receipts must be an array.`);
	}

	const selected: Record<string, string[]> = {};
	const notApplicable: Record<string, string[]> = {};

	for (const [index, receiptValue] of stage.receipts.entries()) {
		const receipt = asObject(receiptValue, `${label}.receipts[${index}]`);
		const skill = asString(receipt.skill, `${label}.receipts[${index}].skill`);
		const parseIds = (items: unknown, partition: string): string[] => {
			if (!Array.isArray(items)) {
				throw new Error(`${label}.receipts[${index}].${partition} must be an array.`);
			}

			return items.map((item, itemIndex) =>
				asString(
					asObject(item, `${label}.receipts[${index}].${partition}[${itemIndex}]`).id,
					`${label}.receipts[${index}].${partition}[${itemIndex}].id`,
				),
			);
		};

		selected[skill] = parseIds(receipt.selected, "selected");
		notApplicable[skill] = parseIds(receipt.notApplicable, "notApplicable");
	}

	return {activatedSkills, selected, notApplicable};
};

/** @helper routing manifest stage를 strict scorer oracle로 정규화 */
const parseRoutingOracleStage = (value: unknown, label: string): RoutingOracleStage => {
	const source = asObject(value, label);
	const parseMap = (mapValue: unknown, mapLabel: string): Record<string, string[]> => {
		const map = asObject(mapValue, mapLabel);
		return Object.fromEntries(Object.entries(map).map(([skill, ids]) => [skill, asStringArray(ids, `${mapLabel}.${skill}`)]));
	};

	return {
		expectedSkills: asStringArray(source.expectedSkills, `${label}.expectedSkills`),
		expectedSelected: parseMap(source.expectedSelected, `${label}.expectedSelected`),
		expectedNotApplicable: parseMap(source.expectedNotApplicable, `${label}.expectedNotApplicable`),
	};
};

/** @helper 두 string array가 순서까지 exact인지 확인 */
const isExactArray = (left: string[], right: string[]): boolean =>
	left.length === right.length && left.every((value, index) => value === right[index]);

/** @helper actual routing stage와 sealed oracle의 exact match 계산 */
const isExactRoutingStage = (actual: ActualRoutingStage, expected: RoutingOracleStage): boolean => {
	if (!isExactArray(actual.activatedSkills, expected.expectedSkills)) {
		return false;
	}

	return expected.expectedSkills.every(
		(skillName) =>
			isExactArray(actual.selected[skillName] ?? [], expected.expectedSelected[skillName] ?? []) &&
			isExactArray(actual.notApplicable[skillName] ?? [], expected.expectedNotApplicable[skillName] ?? []),
	);
};

/** @helper candidate stage의 recall/precision 계산 */
const createCandidateMetrics = (actual: ActualRoutingStage, expected: RoutingOracleStage): BehavioralCandidateMetrics => {
	const actualSkills = new Set(actual.activatedSkills);
	const domainMatches = expected.expectedSkills.filter((skillName) => actualSkills.has(skillName)).length;
	const expectedSelected = Object.entries(expected.expectedSelected).flatMap(([skill, ids]) => ids.map((id) => `${skill}/${id}`));
	const actualSelected = Object.entries(actual.selected).flatMap(([skill, ids]) => ids.map((id) => `${skill}/${id}`));
	const actualSelectedSet = new Set(actualSelected);
	const expectedSelectedSet = new Set(expectedSelected);
	const selectedMatches = expectedSelected.filter((id) => actualSelectedSet.has(id)).length;
	const precisionMatches = actualSelected.filter((id) => expectedSelectedSet.has(id)).length;

	return {
		domainActivationRecall: expected.expectedSkills.length === 0 ? 1 : domainMatches / expected.expectedSkills.length,
		applicableRuleRecall: expectedSelected.length === 0 ? 1 : selectedMatches / expectedSelected.length,
		exactSelectionPrecision:
			actualSelected.length === 0 ? (expectedSelected.length === 0 ? 1 : 0) : precisionMatches / actualSelected.length,
	};
};

/** @helper scenario ID와 일치하는 sealed routing oracle를 completion 후 조회 */
const readRoutingOracle = async (scenarioId: string, skillRootDir: string): Promise<JsonObject> => {
	const entries = await readdir(skillRootDir, {withFileTypes: true});
	const matches: JsonObject[] = [];

	for (const entry of entries.filter((item) => item.isDirectory()).sort((left, right) => left.name.localeCompare(right.name, "en"))) {
		const manifestPath = path.join(skillRootDir, entry.name, "routing-evals.json");
		let manifest: JsonObject;

		try {
			manifest = (await readJsonObject(manifestPath, `${entry.name} routing manifest`)).value;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error instanceof Error && /ENOENT/.test(error.message))) {
				continue;
			}

			throw error;
		}

		if (!Array.isArray(manifest.scenarios)) {
			throw new Error(`${entry.name} routing manifest scenarios must be an array.`);
		}

		for (const scenarioValue of manifest.scenarios) {
			const scenario = asObject(scenarioValue, `${entry.name} routing scenario`);

			if (scenario.id === scenarioId) {
				matches.push(scenario);
			}
		}
	}

	if (matches.length !== 1) {
		throw new Error(`Expected exactly one sealed routing oracle for scenario "${scenarioId}", found ${matches.length}.`);
	}

	return matches[0]!;
};

/** @api immutable child completion 뒤에만 호출하는 post-hoc oracle scorer */
export const scoreBehavioralEvalRun = async (args: ScoreBehavioralEvalRunArgs): Promise<BehavioralEvalScore> => {
	if (args.arm === "no-skill") {
		return {kind: "observational", eligible: false, reason: "no-skill arm"};
	}

	if (args.scenarioId.startsWith("BASELINE-")) {
		return {kind: "observational", eligible: false, reason: "baseline scenario"};
	}

	const run = asObject(args.run, "run");

	if (args.arm === "mutation") {
		const completion = asObject(run.completion, "run.completion");
		const blockedGatePassed =
			completion.status === "BLOCKED" && (Number(completion.coverageFailCount) > 0 || Number(completion.unknownCount) > 0);
		return {kind: "mutation", eligible: true, blockedGatePassed};
	}

	if (args.arm !== "full-handbook" && args.arm !== "progressive") {
		throw new Error(`Unsupported behavioral scoring arm "${args.arm}".`);
	}

	const oracle = await readRoutingOracle(args.scenarioId, args.skillRootDir ?? packagePaths.skillRootDir);
	const expectedInitial = parseRoutingOracleStage(oracle, `oracle.${args.scenarioId}`);
	const actualInitial = parseActualRoutingStage(run, "run");
	const initialExactMatch = isExactRoutingStage(actualInitial, expectedInitial);
	const completion = asObject(run.completion, "run.completion");
	const candidateGatePassed =
		completion.status === "COMPLETE" &&
		completion.blocked === false &&
		completion.coverageFailCount === 0 &&
		completion.semanticFailCount === 0 &&
		completion.unknownCount === 0;
	let finalExpected = expectedInitial;
	let finalActual = actualInitial;
	let driftFinalExactMatch: boolean | null = null;

	if (oracle.scopeDrift !== undefined) {
		finalExpected = parseRoutingOracleStage(oracle.scopeDrift, `oracle.${args.scenarioId}.scopeDrift`);
		finalActual = parseActualRoutingStage(run.driftReceipt, "run.driftReceipt");
		driftFinalExactMatch = isExactRoutingStage(finalActual, finalExpected);
	}

	return {
		kind: "candidate",
		eligible: true,
		exactMatch: candidateGatePassed && initialExactMatch && (driftFinalExactMatch ?? true),
		initialExactMatch,
		driftFinalExactMatch,
		metrics: createCandidateMetrics(finalActual, finalExpected),
	};
};

/** @api immutable child payload를 coordinator envelope와 merge, validate, score, atomic 저장 */
export const mergeBehavioralEvalChildPayload = async (args: MergeBehavioralEvalChildPayloadArgs): Promise<MergedBehavioralEvalRun> => {
	if (!path.isAbsolute(args.envelopePath) || !path.isAbsolute(args.childPayloadPath) || !path.isAbsolute(args.outputDir)) {
		throw new Error("envelopePath, childPayloadPath, and outputDir must be explicit absolute paths.");
	}

	const envelopeResult = await readJsonObject(path.resolve(args.envelopePath), "coordinator envelope");
	const envelope = parseBehavioralCoordinatorEnvelope(envelopeResult.value);
	const dispatch = envelope.dispatchEnvelope;

	if (dispatch.scenarioId === "RTE02-owner-placement-css-drift") {
		throw new Error("RTE02-owner-placement-css-drift requires the staged coordinator; regular one-shot merge is forbidden.");
	}

	const repositoryDir = path.resolve(asString(envelope.repositoryDir, "envelope.repositoryDir"));
	const envelopeSkillRootDir = path.resolve(asString(envelope.skillRootDir, "envelope.skillRootDir"));
	const routingEvalRawSha256 = asSha256Record(envelope.routingEvalRawSha256, "envelope.routingEvalRawSha256");
	const sourceSnapshot = await assertBehavioralSourceSnapshot({
		repositoryDir,
		skillRootDir: args.skillRootDir ?? envelopeSkillRootDir,
		expectedRoutingEvalRawSha256: routingEvalRawSha256,
		stage: "before child payload merge",
	});

	if (sourceSnapshot.skillRootDir !== envelopeSkillRootDir) {
		throw new Error("envelope.skillRootDir must be the canonical repositoryDir/skill source bound during preparation.");
	}

	if (envelope.runId !== dispatch.runId) {
		throw new Error("Coordinator envelope runId must match its dispatch envelope.");
	}

	const protocolResult = await readJsonObject(path.resolve(envelope.protocol.path), "bound protocol");

	if (createSha256(protocolResult.raw) !== envelope.protocol.sha256) {
		throw new Error("Bound protocol raw bytes changed after dispatch preparation.");
	}

	const protocolArms = asObject(protocolResult.value.arms, "protocol.arms");
	const protocolScenarios = asObject(protocolResult.value.scenarios, "protocol.scenarios");
	const currentArmSha256 = createCanonicalSha256(asObject(protocolArms[dispatch.arm], `protocol.arms.${dispatch.arm}`));
	const currentScenarioSha256 = createCanonicalSha256(
		asObject(protocolScenarios[dispatch.scenarioId], `protocol.scenarios.${dispatch.scenarioId}`),
	);

	if (currentArmSha256 !== envelope.protocol.armSha256 || currentScenarioSha256 !== envelope.protocol.scenarioSha256) {
		throw new Error("Bound arm or scenario content changed after dispatch preparation.");
	}

	const coordinate = enumerateBehavioralEvalRunMatrix(protocolResult.value).find(
		(item) =>
			item.runId === dispatch.runId &&
			item.arm === dispatch.arm &&
			item.scenarioId === dispatch.scenarioId &&
			item.trial === dispatch.trial,
	);

	if (!coordinate) {
		throw new Error("dispatch coordinate must identify one exact run in the bound protocol matrix.");
	}

	const {stdout} = await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: sourceSnapshot.repositoryDir});

	if (stdout.trim() !== dispatch.repositoryHead) {
		throw new Error("Repository HEAD drifted after dispatch preparation.");
	}

	assertBoundProtocol({
		protocol: protocolResult.value,
		repositoryHead: dispatch.repositoryHead,
		generatedIndexDigests: dispatch.generatedIndexDigests,
	});
	const assignedChildPayloadPath = path.resolve(asString(envelope.assignedChildPayloadPath, "envelope.assignedChildPayloadPath"));

	if (assignedChildPayloadPath !== path.resolve(args.childPayloadPath)) {
		throw new Error("childPayloadPath must exactly match the path assigned before dispatch.");
	}

	const requestResult = await readJsonObject(path.resolve(envelope.childRequest.path), "saved child request");

	if (
		createSha256(requestResult.raw) !== envelope.childRequest.sha256 ||
		Buffer.byteLength(requestResult.raw, "utf8") !== envelope.childRequest.utf8ByteLength
	) {
		throw new Error("Saved child request content no longer matches the coordinator envelope binding.");
	}

	const request = parseBehavioralChildRequest(requestResult.value);

	if (
		request.runId !== dispatch.runId ||
		request.arm !== dispatch.arm ||
		request.scenarioId !== dispatch.scenarioId ||
		request.trial !== dispatch.trial
	) {
		throw new Error("saved child request runId/arm/scenarioId/trial must exactly match the dispatch coordinate.");
	}

	if (request.repositoryRoot !== sourceSnapshot.repositoryDir) {
		throw new Error("saved child request repositoryRoot must exactly match envelope repositoryDir.");
	}

	if (request.assignedChildPayloadPath !== assignedChildPayloadPath) {
		throw new Error("saved child request assignedChildPayloadPath must exactly match the envelope assignment.");
	}

	const expectedExactDispatch = createExactDispatch({
		requestPath: path.resolve(envelope.childRequest.path),
		requestSha256: envelope.childRequest.sha256,
		assignedChildPayloadPath,
	});

	if (dispatch.exactPrompt !== expectedExactDispatch) {
		throw new Error("exact dispatch must exactly match the saved child request path, digest, and assigned payload path.");
	}

	const expectedRequest = createChildRequest({
		protocol: protocolResult.value,
		runId: dispatch.runId,
		arm: dispatch.arm,
		scenarioId: dispatch.scenarioId,
		trial: dispatch.trial,
		assignedChildPayloadPath,
		repositoryRoot: sourceSnapshot.repositoryDir,
	});

	if (serializeJson(request) !== serializeJson(expectedRequest)) {
		throw new Error("saved child request must exactly match the coordinator-approved request content.");
	}

	const currentRequestContentDigest = createRequestContentDigest({
		dispatchEnvelope: dispatch,
		protocolSha256: envelope.protocol.sha256,
		armSha256: envelope.protocol.armSha256,
		scenarioSha256: envelope.protocol.scenarioSha256,
		childRequestSha256: envelope.childRequest.sha256,
		assignedChildPayloadPath,
		routingEvalRawSha256,
	});

	if (currentRequestContentDigest !== envelope.requestContentDigest) {
		throw new Error("Coordinator requestContentDigest no longer matches the bound request and dispatch.");
	}

	const childResult = await readJsonObject(assignedChildPayloadPath, "child payload");
	const forbiddenField = Object.keys(childResult.value).find((key) => childForbiddenFields.has(key));

	if (forbiddenField) {
		throw new Error(`child payload field "${forbiddenField}" is forbidden because it is coordinator-owned.`);
	}

	const virtualPatch = parseBehavioralVirtualPatch(childResult.value.virtualPatch);
	assertVirtualPatchBinding({group: coordinate.group, virtualPatch, virtualFiles: request.virtualFiles});

	const childPayloadSha256 = createSha256(childResult.raw);
	const run: JsonObject = {
		...dispatch,
		...childResult.value,
		protocolSha256: envelope.protocol.sha256,
		armSha256: envelope.protocol.armSha256,
		scenarioSha256: envelope.protocol.scenarioSha256,
		requestContentDigest: envelope.requestContentDigest,
		childRequestSha256: envelope.childRequest.sha256,
		childPayloadSha256,
		stagedProvenanceSha256: null,
		scoring: null,
	};

	await validateBehavioralEvalRun({run, dispatchEnvelope: dispatch, skillRootDir: sourceSnapshot.skillRootDir});

	if ((await readFile(assignedChildPayloadPath, "utf8")) !== childResult.raw) {
		throw new Error("child payload changed after validation and before oracle scoring.");
	}

	await assertBehavioralSourceSnapshot({
		repositoryDir: sourceSnapshot.repositoryDir,
		skillRootDir: sourceSnapshot.skillRootDir,
		expectedRoutingEvalRawSha256: routingEvalRawSha256,
		stage: "before post-hoc oracle scoring",
	});

	const scoring = await scoreBehavioralEvalRun({
		run,
		arm: dispatch.arm,
		scenarioId: dispatch.scenarioId,
		skillRootDir: sourceSnapshot.skillRootDir,
	});

	await assertBehavioralSourceSnapshot({
		repositoryDir: sourceSnapshot.repositoryDir,
		skillRootDir: sourceSnapshot.skillRootDir,
		expectedRoutingEvalRawSha256: routingEvalRawSha256,
		stage: "during post-hoc oracle scoring",
	});

	if ((await readFile(assignedChildPayloadPath, "utf8")) !== childResult.raw) {
		throw new Error("child payload changed during post-hoc oracle scoring.");
	}

	const runPath = resolveOutputPaths(args.outputDir, dispatch.runId).runPath;
	await mkdir(path.dirname(runPath), {recursive: true});
	await writeAtomicNoOverwrite(runPath, serializeJson({...run, scoring}));
	return {runPath, childPayloadSha256};
};

const helpText = `Behavioral v3 coordinator (manual orchestration boundary)

This CLI creates and validates coordinator-owned files only. It never spawns a collaboration child.
An external orchestrator must send the exactDispatch bytes unchanged. The child writes exactly its
assigned childPayload path with apply_patch and no other file; the orchestrator then invokes merge.

Commands:
  matrix --protocol=<absolute-path>
  prepare --protocol=<absolute-path> --head=<commit> --run-id=<id> --arm=<arm> --scenario=<id> --trial=<n> --output-dir=<absolute-path> [--repository-dir=<path>] [--skill-root=<path>]
  merge --envelope=<absolute-path> --payload=<absolute-path> --output-dir=<absolute-path> [--skill-root=<path>]
`;

/** @summary CLI option 조회 입력 */
interface ReadCliOptionArgs {
	/** @field command 뒤의 raw option 목록 */
	args: string[];
	/** @field -- 접두사를 제외한 option 이름 */
	name: string;
	/** @field option 필수 여부 */
	required?: boolean;
}

/** @helper --name=value CLI option 조회 */
const readCliOption = (args: ReadCliOptionArgs): string | undefined => {
	const {name, required = true} = args;
	const prefix = `--${name}=`;
	const matches = args.args.filter((arg) => arg.startsWith(prefix));

	if (matches.length > 1) {
		throw new Error(`Use --${name}=... at most once.`);
	}

	const value = matches[0]?.slice(prefix.length);

	if (required && !value) {
		throw new Error(`Missing required --${name}=... option.`);
	}

	return value;
};

/** @api coordinator CLI 실행 */
export const runBehavioralEvalCoordinatorCli = async (args: string[]): Promise<void> => {
	const [command, ...options] = args;

	if (!command || command === "help" || command === "--help" || command === "-h") {
		process.stdout.write(helpText);
		return;
	}

	if (command === "matrix") {
		const targetProtocolPath = path.resolve(readCliOption({args: options, name: "protocol"})!);
		const protocol = (await readJsonObject(targetProtocolPath, "protocol")).value;
		process.stdout.write(serializeJson(enumerateBehavioralEvalRunMatrix(protocol)));
		return;
	}

	if (command === "prepare") {
		const prepared = await prepareBehavioralEvalDispatch({
			protocolPath: path.resolve(readCliOption({args: options, name: "protocol"})!),
			repositoryHead: readCliOption({args: options, name: "head"})!,
			runId: readCliOption({args: options, name: "run-id"})!,
			arm: readCliOption({args: options, name: "arm"})!,
			scenarioId: readCliOption({args: options, name: "scenario"})!,
			trial: asPositiveInteger(Number(readCliOption({args: options, name: "trial"})), "--trial"),
			outputDir: path.resolve(readCliOption({args: options, name: "output-dir"})!),
			repositoryDir: readCliOption({args: options, name: "repository-dir", required: false}),
			skillRootDir: readCliOption({args: options, name: "skill-root", required: false}),
		});
		process.stdout.write(serializeJson(prepared));
		return;
	}

	if (command === "merge") {
		const merged = await mergeBehavioralEvalChildPayload({
			envelopePath: path.resolve(readCliOption({args: options, name: "envelope"})!),
			childPayloadPath: path.resolve(readCliOption({args: options, name: "payload"})!),
			outputDir: path.resolve(readCliOption({args: options, name: "output-dir"})!),
			skillRootDir: readCliOption({args: options, name: "skill-root", required: false}),
		});
		process.stdout.write(serializeJson(merged));
		return;
	}

	throw new Error(`Unknown coordinator command "${command}".\n${helpText}`);
};

if (await isDirectExecution(import.meta.url)) {
	runBehavioralEvalCoordinatorCli(process.argv.slice(2)).catch((error: unknown) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
}
