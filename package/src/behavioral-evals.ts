import {createHash} from "node:crypto";
import {access} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, packagePaths} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {readSkillDocument} from "./parser.js";
import {
	generateRulesIndexMarkdown,
	getCanonicalRoutingRuleIds,
	getCanonicalRoutingTargets,
	getRoutingOrdinalPrefix,
	getRuleId,
} from "./routing.js";
import type {LoadedSkillDocument, SkillRule} from "./types.js";

/**
 * @summary behavioral run dispatch 전에 저장하는 exact prompt provenance
 */
export interface BehavioralEvalDispatchEnvelope {
	/**
	 * @field behavioral evaluation schema version
	 */
	schemaVersion: 3;
	/**
	 * @field dispatch 대상 run의 고유 ID
	 */
	runId: string;
	/**
	 * @field dispatch와 run이 따라야 하는 behavioral protocol ID
	 */
	protocolId: "progressive-loading-behavioral-v3";
	/**
	 * @field evaluation source를 고정한 committed repository HEAD
	 */
	repositoryHead: string;
	/**
	 * @field 비교 실험 arm 이름
	 */
	arm: string;
	/**
	 * @field protocol scenario ID
	 */
	scenarioId: string;
	/**
	 * @field 같은 scenario와 arm 안의 trial 번호
	 */
	trial: number;
	/**
	 * @field prompt renderer 입력이 된 원본 scenario 요청
	 */
	scenarioPrompt: string;
	/**
	 * @field child agent에게 실제 전달할 완전한 prompt
	 */
	exactPrompt: string;
	/**
	 * @field exact prompt UTF-8 bytes의 SHA-256
	 */
	promptSha256: string;
	/**
	 * @field exact prompt의 UTF-8 byte length
	 */
	promptByteLength: number;
	/**
	 * @field exact prompt 조립 규칙의 version
	 */
	promptRendererVersion: string;
	/**
	 * @field dispatch 시점 current source에서 계산한 skill별 routing digest
	 */
	generatedIndexDigests: Record<string, string>;
}

/**
 * @summary exact prompt dispatch envelope 생성 입력
 */
export interface CreateBehavioralEvalDispatchEnvelopeArgs {
	/**
	 * @field dispatch 대상 run의 고유 ID
	 */
	runId: string;
	/**
	 * @field evaluation source를 고정한 committed repository HEAD
	 */
	repositoryHead: string;
	/**
	 * @field 비교 실험 arm 이름
	 */
	arm: string;
	/**
	 * @field protocol scenario ID
	 */
	scenarioId: string;
	/**
	 * @field 같은 scenario와 arm 안의 trial 번호
	 */
	trial: number;
	/**
	 * @field prompt renderer 입력이 된 원본 scenario 요청
	 */
	scenarioPrompt: string;
	/**
	 * @field child agent에게 실제 전달할 완전한 prompt
	 */
	exactPrompt: string;
	/**
	 * @field exact prompt 조립 규칙의 version
	 */
	promptRendererVersion: string;
	/**
	 * @field dispatch 전에 current digest를 고정할 progressive skill 이름
	 */
	routingSkillNames: string[];
	/**
	 * @field routing source를 읽을 structured skill root
	 */
	skillRootDir?: string;
}

/**
 * @summary behavioral v3 run 검증 입력
 */
export interface ValidateBehavioralEvalRunArgs {
	/**
	 * @field child 결과와 coordinator metadata를 합친 run JSON
	 */
	run: unknown;
	/**
	 * @field child dispatch 전에 별도 저장한 prompt envelope
	 */
	dispatchEnvelope: unknown;
	/**
	 * @field routing source를 읽을 structured skill root
	 */
	skillRootDir?: string;
}

/**
 * @summary staged initial 또는 drift child evidence를 독립적으로 검증하는 입력
 */
export interface ValidateBehavioralEvalStageEvidenceArgs {
	/** @field 한 stage의 child-owned payload */
	payload: unknown;
	/** @field 해당 stage dispatch 전에 저장한 prompt envelope */
	dispatchEnvelope: unknown;
	/** @field routing source를 읽을 structured skill root */
	skillRootDir?: string;
}

/**
 * @summary strict JSON parsing에 사용하는 object shape
 */
type JsonObject = Record<string, unknown>;

/**
 * @summary run과 dispatch가 공유하는 exact prompt provenance
 */
type PromptProvenance = Pick<
	BehavioralEvalDispatchEnvelope,
	"schemaVersion" | "runId" | "scenarioPrompt" | "exactPrompt" | "promptSha256" | "promptByteLength" | "promptRendererVersion"
>;

/**
 * @summary fixed-point pass의 requiresSelected 전이 기록
 */
interface RoutingEdge {
	/**
	 * @field mandatory 또는 review 관계의 source qualified rule ID
	 */
	source: string;
	/**
	 * @field mandatory 또는 review 관계의 target qualified rule ID
	 */
	target: string;
}

/**
 * @summary reviewWith target의 pass-local 적용성 재평가 결과
 */
interface ReviewWithOutcome extends RoutingEdge {
	/**
	 * @field active target partition 또는 inactive companion 판정
	 */
	outcome: "Selected" | "N/A" | "Unknown" | "INACTIVE";
	/**
	 * @field target verdict를 뒷받침하는 변경 surface 근거
	 */
	evidence: string;
}

/**
 * @summary requiresSelected source의 pass-local partition 상태
 */
type RequiresSelectedSourceStatus = "Selected" | "N/A" | "Unknown";

/**
 * @summary requiresSelected edge의 pass-local 전이 결과
 */
type RequiresSelectedOutcome = "selected" | "not-propagated-unknown" | "not-propagated-na";

/**
 * @summary mandatory edge별 source 상태와 propagation 결과
 */
interface RequiresSelectedEvaluation extends RoutingEdge {
	/**
	 * @field 현재 pass에서 source가 속한 partition
	 */
	sourceStatus: RequiresSelectedSourceStatus;
	/**
	 * @field source 상태에 따라 허용된 mandatory propagation 결과
	 */
	outcome: RequiresSelectedOutcome;
}

/**
 * @summary completion gate의 pass-local 강제 선택 결과
 */
interface CompletionGateEvaluation {
	/**
	 * @field completion gate qualified rule ID
	 */
	rule: string;
	/**
	 * @field completion gate가 현재 pass에서 Selected임을 나타내는 결과
	 */
	outcome: "selected";
}

/**
 * @summary 한 번의 fixed-point routing scan 결과
 */
interface RoutingTracePass {
	/**
	 * @field 1부터 연속 증가하는 pass 번호
	 */
	pass: number;
	/**
	 * @field 이 pass에서 활성화된 progressive skill 목록
	 */
	activatedSkills: string[];
	/**
	 * @field selection 판단에 사용한 변경 surface 근거
	 */
	scopeEvidence: string[];
	/**
	 * @field 이 pass가 판정에 사용한 activated skill별 current routing digest
	 */
	generatedIndexDigests: Record<string, string>;
	/**
	 * @field activated skill별 Selected stable ID
	 */
	selected: Record<string, string[]>;
	/**
	 * @field activated skill별 N/A stable ID
	 */
	notApplicable: Record<string, string[]>;
	/**
	 * @field activated skill별 미해소 Unknown stable ID
	 */
	unknown: Record<string, string[]>;
	/**
	 * @field activated skill의 모든 requiresSelected edge별 source 상태와 결과
	 */
	requiresSelectedEvaluated: RequiresSelectedEvaluation[];
	/**
	 * @field 이 pass에서 newly Selected target으로 전이한 mandatory edge
	 */
	requiresSelectedAdded: RoutingEdge[];
	/**
	 * @field 이 pass에서 조건부 적용성을 다시 판정한 reviewWith edge
	 */
	reviewWithReevaluated: ReviewWithOutcome[];
	/**
	 * @field activated skill의 모든 completion gate별 강제 선택 결과
	 */
	completionGatesEvaluated: CompletionGateEvaluation[];
	/**
	 * @field 이 pass에서 newly Selected로 추가한 completion gate
	 */
	completionGateAdded: string[];
}

/**
 * @summary behavioral run의 fixed-point trace
 */
interface RoutingTrace {
	/**
	 * @field 순서대로 저장한 routing scan pass
	 */
	passes: RoutingTracePass[];
	/**
	 * @field identical해야 하는 마지막 두 consecutive pass 번호
	 */
	stablePair: [number, number];
	/**
	 * @field coordinator가 fixed point 도달을 선언했는지 여부
	 */
	stable: boolean;
}

/**
 * @summary 현재 source에서 계산한 한 progressive skill의 routing identity
 */
interface SkillRoutingSnapshot {
	/**
	 * @field parser가 로드한 현재 structured skill 문서
	 */
	document: LoadedSkillDocument;
	/**
	 * @field 현재 canonical routing source SHA-256
	 */
	digest: string;
	/**
	 * @field canonical index 순서의 stable rule ID
	 */
	ruleIds: string[];
	/**
	 * @field stable ID별 current ordinal
	 */
	ordinalByRuleId: Map<string, string>;
	/**
	 * @field stable ID별 parsed rule metadata
	 */
	ruleById: Map<string, SkillRule>;
}

/**
 * @summary full rule load와 receipt를 연결하는 Expanded record
 */
interface ExpandedRecord {
	/**
	 * @field current generated index ordinal
	 */
	ordinal: string;
	/**
	 * @field expanded rule stable ID
	 */
	id: string;
	/**
	 * @field 먼저 읽은 generated contract 경로
	 */
	contractPath: string;
	/**
	 * @field 실제로 확장한 full rule 경로
	 */
	fullRulePath: string;
	/**
	 * @field full source가 필요했던 구체적 사유
	 */
	reason: string;
	/**
	 * @field CRITICAL impact 때문에 의무 확장했는지 여부
	 */
	mandatoryCritical: boolean;
}

/**
 * @summary rule의 pass-local partition 상태 판정 입력
 */
interface RulePartitionStatusArgs {
	/**
	 * @field 상태를 판정할 routing pass
	 */
	pass: RoutingTracePass;
	/**
	 * @field rule owner skill 이름
	 */
	skillName: string;
	/**
	 * @field partition에서 찾을 stable rule ID
	 */
	ruleId: string;
	/**
	 * @field 오류 메시지에 사용할 qualified source label
	 */
	label: string;
}

/**
 * @summary pass의 mandatory edge 전체 평가 생성 입력
 */
interface CreateExpectedRequiresSelectedEvaluationsArgs {
	/**
	 * @field 평가할 routing pass
	 */
	pass: RoutingTracePass;
	/**
	 * @field current source에 bind된 skill snapshot
	 */
	snapshots: Map<string, SkillRoutingSnapshot>;
}

/**
 * @summary pass의 completion gate 전체 평가 생성 입력
 */
interface CreateExpectedCompletionGateEvaluationsArgs {
	/**
	 * @field 평가할 routing pass
	 */
	pass: RoutingTracePass;
	/**
	 * @field current source에 bind된 skill snapshot
	 */
	snapshots: Map<string, SkillRoutingSnapshot>;
}

/**
 * @summary object의 exact key 검증 입력
 */
interface AssertExactKeysArgs {
	/** @field key를 검증할 JSON object */
	value: JsonObject;
	/** @field 허용하면서 필수인 exact key 목록 */
	expectedKeys: readonly string[];
	/** @field 오류 메시지에 사용할 object label */
	label: string;
}

/**
 * @summary 두 문자열 배열의 exact order 비교 입력
 */
interface AssertExactStringArrayArgs {
	/** @field 실제 문자열 배열 */
	actual: string[];
	/** @field 기대 문자열 배열 */
	expected: string[];
	/** @field 불일치 시 사용할 오류 메시지 */
	message: string;
}

/**
 * @summary pass partition record key 검증 입력
 */
interface AssertPartitionRecordKeysArgs {
	/** @field activated skill 기준이 되는 routing pass */
	pass: RoutingTracePass;
	/** @field skill별 partition record */
	record: Record<string, string[]>;
	/** @field 오류 메시지에 사용할 partition label */
	label: string;
}

/**
 * @summary receipt rule reference parsing 입력
 */
interface ParseReceiptRuleReferencesArgs {
	/** @field parsing할 unknown JSON 값 */
	value: unknown;
	/** @field 오류 메시지에 사용할 receipt field label */
	label: string;
	/** @field ordinal과 stable ID를 검증할 current snapshot */
	snapshot: SkillRoutingSnapshot;
}

/**
 * @summary current ordinal과 stable ID가 결합된 receipt reference
 */
interface ReceiptRuleReference {
	/** @field current generated index ordinal */
	ordinal: string;
	/** @field current stable rule ID */
	id: string;
}

/**
 * @summary N/A exclusion group exact coverage 검증 입력
 */
interface AssertReceiptExcludedGroupsArgs {
	/** @field parsing할 exclusion group JSON 값 */
	value: unknown;
	/** @field 오류 메시지에 사용할 receipt field label */
	label: string;
	/** @field exclusion group이 정확히 덮어야 하는 N/A reference */
	notApplicableReferences: ReceiptRuleReference[];
}

/**
 * @summary Expanded record parsing 입력
 */
interface ParseExpandedRecordsArgs {
	/** @field parsing할 Expanded JSON 값 */
	value: unknown;
	/** @field 오류 메시지에 사용할 receipt field label */
	label: string;
	/** @field rule identity와 impact를 검증할 current snapshot */
	snapshot: SkillRoutingSnapshot;
}

/**
 * @summary final receipt exact match 검증 입력
 */
interface AssertFinalReceiptsArgs {
	/** @field receipt를 포함한 candidate 또는 mutation episode */
	run: JsonObject;
	/** @field load policy를 결정하는 behavioral arm */
	arm: string;
	/** @field receipt가 exact match해야 하는 final pass */
	finalPass: RoutingTracePass;
	/** @field activated skill별 current routing snapshot */
	snapshots: Map<string, SkillRoutingSnapshot>;
}

/**
 * @summary progressive declared load sequence 생성 입력
 */
interface CreateExpectedProgressiveLoadsArgs {
	/** @field Selected와 Unknown history를 제공하는 routing trace */
	trace: RoutingTrace;
	/** @field activated skill별 current routing snapshot */
	snapshots: Map<string, SkillRoutingSnapshot>;
	/** @field skill별 child-declared Expanded record */
	expandedBySkill: Map<string, ExpandedRecord[]>;
}

/**
 * @summary declared load policy 검증 입력
 */
interface AssertDeclaredLoadsArgs {
	/** @field declared load evidence를 포함한 run */
	run: JsonObject;
	/** @field 적용할 behavioral arm load policy */
	arm: string;
	/** @field contract load history를 계산할 routing trace */
	trace: RoutingTrace;
	/** @field final activated skill과 partition */
	finalPass: RoutingTracePass;
	/** @field activated skill별 current routing snapshot */
	snapshots: Map<string, SkillRoutingSnapshot>;
	/** @field skill별 Expanded record */
	expandedBySkill: Map<string, ExpandedRecord[]>;
	/** @field declared repository-relative path를 확인할 structured skill root */
	skillRootDir: string;
}

/**
 * @summary pass의 newly Selected mandatory edge 생성 입력
 */
interface CreateExpectedRequiresSelectedEdgesArgs {
	/** @field 현재 routing pass */
	pass: RoutingTracePass;
	/** @field 신규 selection 여부를 비교할 직전 pass */
	previousPass: RoutingTracePass | undefined;
	/** @field current source에 bind된 skill snapshot */
	snapshots: Map<string, SkillRoutingSnapshot>;
}

/**
 * @summary pass의 newly Selected completion gate 생성 입력
 */
interface CreateExpectedCompletionGatesArgs {
	/** @field 현재 routing pass */
	pass: RoutingTracePass;
	/** @field 신규 selection 여부를 비교할 직전 pass */
	previousPass: RoutingTracePass | undefined;
	/** @field current source에 bind된 skill snapshot */
	snapshots: Map<string, SkillRoutingSnapshot>;
}

/**
 * @summary mandatory edge exact order 비교 입력
 */
interface AssertExactEdgesArgs {
	/** @field child가 기록한 mandatory edge */
	actual: RoutingEdge[];
	/** @field current metadata에서 계산한 mandatory edge */
	expected: RoutingEdge[];
	/** @field 오류 메시지에 사용할 trace field label */
	label: string;
}

/**
 * @summary candidate routing episode 검증 입력
 */
interface ValidateCandidateRoutingEpisodeArgs {
	/** @field trace와 receipt를 포함한 candidate episode */
	episode: JsonObject;
	/** @field progressive 또는 full-handbook load policy */
	arm: "progressive" | "full-handbook";
	/** @field dispatch와 current source에 bind된 skill snapshot */
	snapshots: Map<string, SkillRoutingSnapshot>;
}

/**
 * @summary 검증을 마친 candidate routing episode
 */
interface ValidatedRoutingEpisode {
	/** @field strict schema와 fixed point를 통과한 routing trace */
	trace: RoutingTrace;
	/** @field final stable routing pass */
	finalPass: RoutingTracePass;
	/** @field load validation에 사용할 skill별 Expanded record */
	expandedBySkill: Map<string, ExpandedRecord[]>;
}

/**
 * @summary behavioral trial을 실행하는 fresh isolated Codex CLI child session 선언
 * @description forkTurns="none"은 parent conversation turn을 하나도 상속하지 않는다는 뜻이다. RTE02 후속 stage는 새 child를 만들지 않고 같은 trial session에 전달한다.
 */
const declaredBehavioralRuntime = {
	runtime: "Codex CLI isolated child session",
	requestedModel: "gpt-5.6-sol",
	requestedReasoning: "high",
	forkTurns: "none",
	oneChildPerTrial: true,
} as const;

/**
 * @api strict validator와 같은 child-owned payload shape를 request에 공개
 */
export const createBehavioralChildPayloadContract = (): Record<string, unknown> => ({
	exactObjectKeysOnly: true,
	requiredFields: [
		"runtime",
		"declaredLoadedFiles",
		"activatedSkills",
		"receipts",
		"routingTrace",
		"driftReceipt",
		"semanticVerdicts",
		"completion",
		"limitations",
		"response",
		"virtualPatch",
	],
	formats: {
		sha256: "sha256:<64 lowercase hex>",
		ordinal: "uppercase prefix plus two digits, for example R07, T05, or C14",
		qualifiedRuleRef: "<skill>/<stable-rule-id>; never include an ordinal in routing edge references",
	},
	runtime: {
		evidenceClass: "declared-telemetry-only",
		declared: {...declaredBehavioralRuntime},
		unavailable: {
			runtimeVersion: null,
			exactModelBuild: null,
			actualReasoningTelemetry: null,
			observedFileReads: null,
			childTokenUsage: null,
		},
	},
	declaredLoadedFiles: "{kind:'declared',paths:string[]}; exact keys only; paths are declarations, not observed telemetry",
	activatedSkills: "string[] in canonical activation order; [] for no-skill",
	identityDictionaryUse:
		"For full-handbook, copy from identityDictionary every ordinal and stable ID verbatim; never infer, shorten, or rewrite a stable ID from its heading. Before writing, verify each activated skill partition union exactly equals that skill's identityDictionary stable-ID sequence with no missing, extra, overlap, or duplicate value.",
	receipts:
		"Array<{skill:string,indexDigest:sha256|null,selected:Array<{ordinal:string,id:string}>,notApplicable:Array<{ordinal:string,id:string}>,unknown:Array<{ordinal:string,id:string}>,excludedGroups:Array<{ordinals:string[],reason:string}>,expanded:Array<{ordinal:string,id:string,contractPath:string,fullRulePath:string,reason:string,mandatoryCritical:boolean}>}>; exact keys only; ordinal is a string such as T05; full-handbook indexDigest is null, progressive/mutation uses the current digest",
	routingTrace:
		"null or {passes:Array<{pass:positive-integer,activatedSkills:string[],scopeEvidence:string[],generatedIndexDigests:Record<string,sha256>,selected:Record<string,string[]>,notApplicable:Record<string,string[]>,unknown:Record<string,string[]>,requiresSelectedEvaluated:Array<{source:string,target:string,sourceStatus:'Selected'|'Unknown',outcome:'selected'|'not-propagated-unknown'}>,requiresSelectedAdded:Array<{source:string,target:string}>,reviewWithReevaluated:Array<{source:string,target:string,outcome:'Selected'|'N/A'|'Unknown'|'INACTIVE',evidence:string}>,completionGatesEvaluated:Array<{rule:string,outcome:'selected'}>,completionGateAdded:string[]}>,stablePair:[positive-integer,positive-integer],stable:true}; exact keys only; selected/notApplicable/unknown values are stable rule ID strings without ordinals; source, target, and rule use qualifiedRuleRef; scopeEvidence is append-only across passes: preserve every prior string and append only new task facts or final-Selected mandatory requirements; never remove, replace, or rewrite earlier evidence; every pass exactly evaluates every disclosed mandatory edge from each Selected or Unknown source and must omit N/A sources because their contracts are not loaded; requiresSelectedAdded exactly lists every Selected mandatory edge whose target was not Selected in the previous pass; for pass 1 treat the previous selection as empty and include the edge even when the target is independently applicable; reviewWith exactly covers Selected sources; completionGatesEvaluated exactly covers every active completion gate; completionGateAdded exactly lists each completion gate that was not Selected in the previous pass, treating the previous selection for pass 1 as empty; candidate arms require at least three passes and an identical final stable pair with empty selection-changing deltas",
	driftReceipt:
		"null outside replacement-final RTE02; otherwise {routingTrace:<same exact routingTrace object>,activatedSkills:string[],receipts:<same exact receipts array>}; exact keys only",
	routingValidation: {
		passSequence: "Pass numbers are consecutive integers from 1 through N with no gap.",
		arrayValues: "All string arrays contain non-empty unique values; edge, evaluation, and gate arrays contain no duplicate item.",
		monotonic:
			"activatedSkills and every per-skill Selected set are append-only across passes; scopeEvidence follows the same append-only rule declared in routingTrace.",
		partitions:
			"In every pass, selected/notApplicable/unknown record keys exactly equal activatedSkills in the same order. Each activated skill's current rule universe is complete, disjoint, duplicate-free, and each subset follows canonical rule order.",
		stablePair:
			"stablePair names the final two consecutive passes. Their canonical state is identical, stable is true, and both requiresSelectedAdded and completionGateAdded arrays are empty.",
		transitionOrder:
			"requiresSelectedEvaluated and requiresSelectedAdded use canonical activated-skill and source-rule order, then the code-point ascending target order printed by generated contracts/indexes/handbooks; reviewWithReevaluated is an exact unique edge set whose array order is non-semantic; completion arrays use canonical rule order; no edge or gate is duplicated.",
		reviewWith:
			"Every reviewWith outcome exactly matches the target partition: Selected, N/A, Unknown, or INACTIVE when the target skill is inactive. reviewWith never forces or selects a target. Every reviewWith record requires non-empty evidence.",
		finalClosure:
			"Final Unknown is empty; every required companion is activated; every completion gate and every requiresSelected target from a final Selected source is Selected.",
	},
	receiptValidation: {
		finalMatch:
			"Receipt skill order exactly matches activatedSkills, and every Selected/N/A/Unknown ordinal-stable-ID partition exactly matches the final routing pass in canonical rule order.",
		exclusions:
			"excludedGroups use non-empty reasons; their ordinal union exactly equals N/A, with no missing ordinal and no duplicate ordinal across groups.",
		expansion:
			"Expanded records are unique, use exact contract/full-rule paths, and belong to a rule that was Selected or Unknown in some pass. Every CRITICAL Selected or Unknown rule has exactly one Expanded record; full-handbook uses Expanded=[].",
	},
	declaredLoadValidation: {
		fullHandbook:
			"full-handbook paths are exactly each activated skill's SKILL.md then AGENTS.md in activatedSkills order; no contract, RULES_INDEX, rule, or extra path is allowed.",
		progressive:
			"progressive paths first list every activated SKILL.md then RULES_INDEX.md pair in activatedSkills order; next, per activated skill and canonical rule order, list each rule that was Selected or Unknown in any pass as its contract followed immediately, when CRITICAL or explicitly Expanded, by its full rule. No extra path is allowed.",
		mutation:
			"mutation prefixes skill/convention-audit/SKILL.md and skill/convention-audit/AGENTS.md, then follows the progressive sequence for its receipt-backed Selected/Unknown rules.",
	},
	driftValidation:
		"For RTE02, the initial payload keeps driftReceipt null. The replacement-final episode uses the same routing/receipt validation and must preserve every initially activated skill and every initially Selected rule; the coordinator constructs final driftReceipt from the validated drift-stage top-level routingTrace, activatedSkills, and receipts.",
	semanticVerdicts:
		"Array<{criterion:string,verdict:'PASS'|'FAIL'|'UNKNOWN',reason:string}>; exact keys only; use [] when no criterion is declared",
	completion:
		"{status:'COMPLETE'|'BLOCKED',blocked:boolean,coverageFailCount:non-negative-integer,semanticFailCount:non-negative-integer,unknownCount:non-negative-integer,reason:string}; exact keys only; counts must equal the payload evidence; COMPLETE iff all three counts are zero; BLOCKED iff at least one count is non-zero; task infeasibility, missing virtualFiles, or a null virtualPatch is recorded in reason/limitations and is not an additional blocker",
	limitations: "string[]; use [] when none",
	response: "non-empty string",
	virtualPatch:
		"null or {files:Array<{path:string,beforeState:'present'|'absent',beforeSha256:sha256|null,afterState:'present'|'absent',after:string|null,afterSha256:sha256|null}>,summary:string}; exact keys only; file order and before state/digest exactly match virtualFiles; afterSha256 hashes exact UTF-8 after bytes",
	returnBoundary:
		"The coordinator supplies the one allowed payload path per run. Write exactly that JSON file with apply_patch, modify no other file, do not echo prompt or coordinator bindings, then return only concise status.",
});

const tracePassKeys = [
	"pass",
	"activatedSkills",
	"scopeEvidence",
	"generatedIndexDigests",
	"selected",
	"notApplicable",
	"unknown",
	"requiresSelectedEvaluated",
	"requiresSelectedAdded",
	"reviewWithReevaluated",
	"completionGatesEvaluated",
	"completionGateAdded",
] as const;

const runKeys = [
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
	"runtime",
	"virtualPatch",
	"declaredLoadedFiles",
	"activatedSkills",
	"receipts",
	"routingTrace",
	"driftReceipt",
	"semanticVerdicts",
	"completion",
	"limitations",
	"response",
	"protocolSha256",
	"armSha256",
	"scenarioSha256",
	"requestContentDigest",
	"childRequestSha256",
	"childPayloadSha256",
	"stagedProvenanceSha256",
	"scoring",
] as const;

const receiptKeys = ["skill", "indexDigest", "selected", "notApplicable", "unknown", "excludedGroups", "expanded"] as const;

const sha256Pattern = /^sha256:[a-f0-9]{64}$/;

const assertJsonObject = (value: unknown, label: string): JsonObject => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`${label} must be an object.`);
	}

	return value as JsonObject;
};

const assertExactKeys = (args: AssertExactKeysArgs): void => {
	const {value, expectedKeys, label} = args;
	const actualKeys = Object.keys(value);
	const expectedKeySet = new Set(expectedKeys);

	for (const key of actualKeys) {
		if (!expectedKeySet.has(key)) {
			throw new Error(`${label} has unknown field "${key}".`);
		}
	}

	for (const key of expectedKeys) {
		if (!Object.hasOwn(value, key)) {
			throw new Error(`${label} is missing required field "${key}".`);
		}
	}
};

const parseNonEmptyString = (value: unknown, label: string): string => {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`${label} must be a non-empty string.`);
	}

	return value;
};

const parseNonNegativeInteger = (value: unknown, label: string): number => {
	if (!Number.isSafeInteger(value) || (value as number) < 0) {
		throw new Error(`${label} must be a non-negative safe integer.`);
	}

	return value as number;
};

const parsePositiveInteger = (value: unknown, label: string): number => {
	const parsed = parseNonNegativeInteger(value, label);

	if (parsed === 0) {
		throw new Error(`${label} must be greater than zero.`);
	}

	return parsed;
};

const parseBoolean = (value: unknown, label: string): boolean => {
	if (typeof value !== "boolean") {
		throw new Error(`${label} must be a boolean.`);
	}

	return value;
};

const parseStringArray = (value: unknown, label: string): string[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const values = value.map((item, index) => parseNonEmptyString(item, `${label}[${index}]`));
	const duplicate = values.find((item, index) => values.indexOf(item) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate value "${duplicate}".`);
	}

	return values;
};

const parseStringRecord = (value: unknown, label: string): Record<string, string[]> => {
	const source = assertJsonObject(value, label);
	const parsed: Record<string, string[]> = {};

	for (const [key, fieldValue] of Object.entries(source)) {
		parseNonEmptyString(key, `${label} key`);
		parsed[key] = parseStringArray(fieldValue, `${label}.${key}`);
	}

	return parsed;
};

const parseDigestRecord = (value: unknown, label: string): Record<string, string> => {
	const source = assertJsonObject(value, label);
	const parsed: Record<string, string> = {};

	for (const [skillName, fieldValue] of Object.entries(source)) {
		parseNonEmptyString(skillName, `${label} key`);
		const digest = parseNonEmptyString(fieldValue, `${label}.${skillName}`);

		if (!sha256Pattern.test(digest)) {
			throw new Error(`${label}.${skillName} must use sha256:<64 lowercase hex> format.`);
		}

		parsed[skillName] = digest;
	}

	if (Object.keys(parsed).length === 0) {
		throw new Error(`${label} must bind at least one current generated routing digest.`);
	}

	return parsed;
};

const parseSha256 = (value: unknown, label: string): string => {
	const digest = parseNonEmptyString(value, label);

	if (!sha256Pattern.test(digest)) {
		throw new Error(`${label} must use sha256:<64 lowercase hex> format.`);
	}

	return digest;
};

const assertScoringShape = (value: unknown): void => {
	if (value === null) {
		return;
	}

	const scoring = assertJsonObject(value, "run.scoring");
	const kind = parseNonEmptyString(scoring.kind, "run.scoring.kind");

	if (kind === "observational") {
		assertExactKeys({value: scoring, expectedKeys: ["kind", "eligible", "reason"], label: "run.scoring"});

		if (scoring.eligible !== false) {
			throw new Error("run.scoring.eligible must be false for observational scoring.");
		}

		parseNonEmptyString(scoring.reason, "run.scoring.reason");
		return;
	}

	if (kind === "mutation") {
		assertExactKeys({value: scoring, expectedKeys: ["kind", "eligible", "blockedGatePassed"], label: "run.scoring"});

		if (scoring.eligible !== true) {
			throw new Error("run.scoring.eligible must be true for mutation scoring.");
		}

		parseBoolean(scoring.blockedGatePassed, "run.scoring.blockedGatePassed");
		return;
	}

	if (kind === "candidate") {
		assertExactKeys({
			value: scoring,
			expectedKeys: ["kind", "eligible", "exactMatch", "initialExactMatch", "driftFinalExactMatch", "metrics"],
			label: "run.scoring",
		});

		if (scoring.eligible !== true) {
			throw new Error("run.scoring.eligible must be true for candidate scoring.");
		}

		parseBoolean(scoring.exactMatch, "run.scoring.exactMatch");
		parseBoolean(scoring.initialExactMatch, "run.scoring.initialExactMatch");

		if (scoring.driftFinalExactMatch !== null) {
			parseBoolean(scoring.driftFinalExactMatch, "run.scoring.driftFinalExactMatch");
		}

		const metrics = assertJsonObject(scoring.metrics, "run.scoring.metrics");
		assertExactKeys({
			value: metrics,
			expectedKeys: ["domainActivationRecall", "applicableRuleRecall", "exactSelectionPrecision"],
			label: "run.scoring.metrics",
		});

		for (const metricName of ["domainActivationRecall", "applicableRuleRecall", "exactSelectionPrecision"] as const) {
			const metric = metrics[metricName];

			if (typeof metric !== "number" || !Number.isFinite(metric) || metric < 0 || metric > 1) {
				throw new Error(`run.scoring.metrics.${metricName} must be a finite number between 0 and 1.`);
			}
		}

		return;
	}

	throw new Error('run.scoring.kind must be "observational", "mutation", or "candidate".');
};

const assertRuntimeDisclosureShape = (value: unknown): void => {
	const runtime = assertJsonObject(value, "run.runtime");
	assertExactKeys({value: runtime, expectedKeys: ["evidenceClass", "declared", "unavailable"], label: "run.runtime"});

	if (runtime.evidenceClass !== "declared-telemetry-only") {
		throw new Error('run.runtime.evidenceClass must be "declared-telemetry-only".');
	}

	const declared = assertJsonObject(runtime.declared, "run.runtime.declared");
	assertExactKeys({
		value: declared,
		expectedKeys: ["runtime", "requestedModel", "requestedReasoning", "forkTurns", "oneChildPerTrial"],
		label: "run.runtime.declared",
	});
	const declaredStringValues = {
		runtime: declaredBehavioralRuntime.runtime,
		requestedModel: declaredBehavioralRuntime.requestedModel,
		requestedReasoning: declaredBehavioralRuntime.requestedReasoning,
		forkTurns: declaredBehavioralRuntime.forkTurns,
	} as const;

	for (const [fieldName, expectedValue] of Object.entries(declaredStringValues)) {
		if (declared[fieldName] !== expectedValue) {
			throw new Error(`run.runtime.declared.${fieldName} must be "${expectedValue}".`);
		}
	}

	if (declared.oneChildPerTrial !== declaredBehavioralRuntime.oneChildPerTrial) {
		throw new Error("run.runtime.declared.oneChildPerTrial must be true.");
	}

	const unavailable = assertJsonObject(runtime.unavailable, "run.runtime.unavailable");
	assertExactKeys({
		value: unavailable,
		expectedKeys: ["runtimeVersion", "exactModelBuild", "actualReasoningTelemetry", "observedFileReads", "childTokenUsage"],
		label: "run.runtime.unavailable",
	});

	for (const fieldName of Object.keys(unavailable)) {
		if (unavailable[fieldName] !== null) {
			throw new Error(`run.runtime.unavailable.${fieldName} must be null.`);
		}
	}
};

const assertVirtualPatchShape = (value: unknown): void => {
	if (value === null) {
		return;
	}

	const virtualPatch = assertJsonObject(value, "run.virtualPatch");
	assertExactKeys({value: virtualPatch, expectedKeys: ["files", "summary"], label: "run.virtualPatch"});
	parseNonEmptyString(virtualPatch.summary, "run.virtualPatch.summary");

	if (!Array.isArray(virtualPatch.files)) {
		throw new Error("run.virtualPatch.files must be an array.");
	}

	const paths: string[] = [];

	for (const [index, item] of virtualPatch.files.entries()) {
		const label = `run.virtualPatch.files[${index}]`;
		const file = assertJsonObject(item, label);
		assertExactKeys({value: file, expectedKeys: ["path", "beforeState", "beforeSha256", "afterState", "after", "afterSha256"], label});
		const filePath = parseNonEmptyString(file.path, `${label}.path`);
		const beforeState = parseNonEmptyString(file.beforeState, `${label}.beforeState`);

		if (beforeState !== "present" && beforeState !== "absent") {
			throw new Error(`${label}.beforeState must be present or absent.`);
		}

		if (beforeState === "present") {
			if (typeof file.beforeSha256 !== "string" || !sha256Pattern.test(file.beforeSha256)) {
				throw new Error(`${label}.beforeSha256 must be a sha256 digest when beforeState is present.`);
			}
		} else if (file.beforeSha256 !== null) {
			throw new Error(`${label}.beforeSha256 must be null when beforeState is absent.`);
		}

		const afterState = parseNonEmptyString(file.afterState, `${label}.afterState`);

		if (afterState !== "present" && afterState !== "absent") {
			throw new Error(`${label}.afterState must be present or absent.`);
		}

		if (afterState === "absent") {
			if (file.after !== null || file.afterSha256 !== null) {
				throw new Error(`${label}.after and afterSha256 must be null when afterState is absent.`);
			}

			paths.push(filePath);
			continue;
		}

		if (typeof file.after !== "string") {
			throw new Error(`${label}.after must be a string when afterState is present.`);
		}

		if (typeof file.afterSha256 !== "string" || !sha256Pattern.test(file.afterSha256)) {
			throw new Error(`${label}.afterSha256 must be a sha256 digest when afterState is present.`);
		}

		if (file.afterSha256 !== createSha256(file.after)) {
			throw new Error(`${label}.afterSha256 does not match after UTF-8 bytes.`);
		}

		paths.push(filePath);
	}

	const duplicatePath = paths.find((filePath, index) => paths.indexOf(filePath) !== index);

	if (duplicatePath) {
		throw new Error(`run.virtualPatch.files must not contain duplicate path "${duplicatePath}".`);
	}
};

const assertRunEvidenceShape = (run: JsonObject): void => {
	assertExactKeys({value: run, expectedKeys: runKeys, label: "run"});
	assertRuntimeDisclosureShape(run.runtime);
	assertVirtualPatchShape(run.virtualPatch);
	parseStringArray(run.limitations, "run.limitations");
	parseNonEmptyString(run.response, "run.response");

	for (const fieldName of [
		"protocolSha256",
		"armSha256",
		"scenarioSha256",
		"requestContentDigest",
		"childRequestSha256",
		"childPayloadSha256",
	] as const) {
		parseSha256(run[fieldName], `run.${fieldName}`);
	}

	if (run.scenarioId === "RTE02-owner-placement-css-drift") {
		parseSha256(run.stagedProvenanceSha256, "run.stagedProvenanceSha256");
	} else if (run.stagedProvenanceSha256 !== null) {
		throw new Error("run.stagedProvenanceSha256 must be null outside staged RTE02 runs.");
	}

	assertScoringShape(run.scoring);
};

const parseRoutingEdges = (value: unknown, label: string): RoutingEdge[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const edges = value.map((item, index) => {
		const edge = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({value: edge, expectedKeys: ["source", "target"], label: `${label}[${index}]`});

		return {
			source: parseNonEmptyString(edge.source, `${label}[${index}].source`),
			target: parseNonEmptyString(edge.target, `${label}[${index}].target`),
		};
	});
	const edgeKeys = edges.map(({source, target}) => `${source}->${target}`);
	const duplicate = edgeKeys.find((edgeKey, index) => edgeKeys.indexOf(edgeKey) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate edge "${duplicate}".`);
	}

	return edges;
};

const parseRequiresSelectedEvaluations = (value: unknown, label: string): RequiresSelectedEvaluation[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const evaluations = value.map((item, index) => {
		const evaluation = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({value: evaluation, expectedKeys: ["source", "target", "sourceStatus", "outcome"], label: `${label}[${index}]`});
		const sourceStatus = parseNonEmptyString(evaluation.sourceStatus, `${label}[${index}].sourceStatus`);
		const outcome = parseNonEmptyString(evaluation.outcome, `${label}[${index}].outcome`);

		if (sourceStatus !== "Selected" && sourceStatus !== "N/A" && sourceStatus !== "Unknown") {
			throw new Error(`${label}[${index}].sourceStatus must be Selected, N/A, or Unknown.`);
		}

		if (outcome !== "selected" && outcome !== "not-propagated-unknown" && outcome !== "not-propagated-na") {
			throw new Error(`${label}[${index}].outcome must be selected, not-propagated-unknown, or not-propagated-na.`);
		}

		return {
			source: parseNonEmptyString(evaluation.source, `${label}[${index}].source`),
			target: parseNonEmptyString(evaluation.target, `${label}[${index}].target`),
			sourceStatus,
			outcome,
		} as RequiresSelectedEvaluation;
	});
	const evaluationKeys = evaluations.map(({source, target}) => `${source}->${target}`);
	const duplicate = evaluationKeys.find((evaluationKey, index) => evaluationKeys.indexOf(evaluationKey) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate requiresSelected edge "${duplicate}".`);
	}

	return evaluations;
};

const parseReviewOutcomes = (value: unknown, label: string): ReviewWithOutcome[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const outcomes = value.map((item, index) => {
		const outcome = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({value: outcome, expectedKeys: ["source", "target", "outcome", "evidence"], label: `${label}[${index}]`});
		const verdict = parseNonEmptyString(outcome.outcome, `${label}[${index}].outcome`);

		if (verdict !== "Selected" && verdict !== "N/A" && verdict !== "Unknown" && verdict !== "INACTIVE") {
			throw new Error(`${label}[${index}].outcome must be Selected, N/A, Unknown, or INACTIVE.`);
		}

		return {
			source: parseNonEmptyString(outcome.source, `${label}[${index}].source`),
			target: parseNonEmptyString(outcome.target, `${label}[${index}].target`),
			outcome: verdict,
			evidence: parseNonEmptyString(outcome.evidence, `${label}[${index}].evidence`),
		} as ReviewWithOutcome;
	});
	const outcomeKeys = outcomes.map(({source, target}) => `${source}->${target}`);
	const duplicate = outcomeKeys.find((outcomeKey, index) => outcomeKeys.indexOf(outcomeKey) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate reviewWith edge "${duplicate}".`);
	}

	return outcomes;
};

const parseCompletionGateEvaluations = (value: unknown, label: string): CompletionGateEvaluation[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const evaluations = value.map((item, index) => {
		const evaluation = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({value: evaluation, expectedKeys: ["rule", "outcome"], label: `${label}[${index}]`});

		if (evaluation.outcome !== "selected") {
			throw new Error(`${label}[${index}].outcome must be selected.`);
		}

		return {rule: parseNonEmptyString(evaluation.rule, `${label}[${index}].rule`), outcome: "selected" as const};
	});
	const duplicate = evaluations.map(({rule}) => rule).find((rule, index, rules) => rules.indexOf(rule) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate completion gate "${duplicate}".`);
	}

	return evaluations;
};

/**
 * @helper UTF-8 문자열의 lowercase SHA-256 identity 생성
 */
const createSha256 = (value: string): string => {
	return `sha256:${createHash("sha256").update(value).digest("hex")}`;
};

const assertPromptProvenance = (value: JsonObject, label: string): PromptProvenance => {
	const schemaVersion = parsePositiveInteger(value.schemaVersion, `${label}.schemaVersion`);

	if (schemaVersion !== 3) {
		throw new Error(`${label}.schemaVersion must be 3.`);
	}

	const exactPrompt = parseNonEmptyString(value.exactPrompt, `${label}.exactPrompt`);
	const promptSha256 = parseNonEmptyString(value.promptSha256, `${label}.promptSha256`);
	const promptByteLength = parseNonNegativeInteger(value.promptByteLength, `${label}.promptByteLength`);

	if (!sha256Pattern.test(promptSha256)) {
		throw new Error(`${label}.promptSha256 must use sha256:<64 lowercase hex> format.`);
	}

	if (promptSha256 !== createSha256(exactPrompt)) {
		throw new Error(`${label}.promptSha256 does not match exactPrompt.`);
	}

	if (promptByteLength !== Buffer.byteLength(exactPrompt, "utf8")) {
		throw new Error(`${label}.promptByteLength does not match exactPrompt UTF-8 bytes.`);
	}

	return {
		schemaVersion: 3,
		runId: parseNonEmptyString(value.runId, `${label}.runId`),
		scenarioPrompt: parseNonEmptyString(value.scenarioPrompt, `${label}.scenarioPrompt`),
		exactPrompt,
		promptSha256,
		promptByteLength,
		promptRendererVersion: parseNonEmptyString(value.promptRendererVersion, `${label}.promptRendererVersion`),
	};
};

/**
 * @api child dispatch 전에 exact prompt hash와 UTF-8 byte length를 고정
 */
export const createBehavioralEvalDispatchEnvelope = (
	args: CreateBehavioralEvalDispatchEnvelopeArgs,
): Promise<BehavioralEvalDispatchEnvelope> => {
	return createBehavioralEvalDispatchEnvelopeFromCurrentSource(args);
};

/**
 * @api current routing source를 읽어 digest-bound dispatch envelope 생성
 */
const createBehavioralEvalDispatchEnvelopeFromCurrentSource = async (
	args: CreateBehavioralEvalDispatchEnvelopeArgs,
): Promise<BehavioralEvalDispatchEnvelope> => {
	const runId = parseNonEmptyString(args.runId, "dispatch.runId");
	const repositoryHead = parseNonEmptyString(args.repositoryHead, "dispatch.repositoryHead");
	const arm = parseNonEmptyString(args.arm, "dispatch.arm");
	const scenarioId = parseNonEmptyString(args.scenarioId, "dispatch.scenarioId");
	const trial = parsePositiveInteger(args.trial, "dispatch.trial");
	const scenarioPrompt = parseNonEmptyString(args.scenarioPrompt, "dispatch.scenarioPrompt");
	const exactPrompt = parseNonEmptyString(args.exactPrompt, "dispatch.exactPrompt");
	const promptRendererVersion = parseNonEmptyString(args.promptRendererVersion, "dispatch.promptRendererVersion");
	const routingSkillNames = parseStringArray(args.routingSkillNames, "dispatch.routingSkillNames");
	const skillRootDir = args.skillRootDir ?? packagePaths.skillRootDir;
	const generatedIndexDigests: Record<string, string> = {};

	if (routingSkillNames.length === 0) {
		throw new Error("dispatch.routingSkillNames must bind at least one progressive skill.");
	}

	for (const skillName of routingSkillNames) {
		generatedIndexDigests[skillName] = (await readSkillRoutingSnapshot(skillName, skillRootDir)).digest;
	}

	return {
		schemaVersion: 3,
		runId,
		protocolId: "progressive-loading-behavioral-v3",
		repositoryHead,
		arm,
		scenarioId,
		trial,
		scenarioPrompt,
		exactPrompt,
		promptSha256: createSha256(exactPrompt),
		promptByteLength: Buffer.byteLength(exactPrompt, "utf8"),
		promptRendererVersion,
		generatedIndexDigests,
	};
};

const parseDispatchEnvelope = (value: unknown): BehavioralEvalDispatchEnvelope => {
	const source = assertJsonObject(value, "dispatchEnvelope");
	assertExactKeys({
		value: source,
		expectedKeys: [
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
		],
		label: "dispatchEnvelope",
	});
	const prompt = assertPromptProvenance(source, "dispatchEnvelope");
	const protocolId = parseNonEmptyString(source.protocolId, "dispatchEnvelope.protocolId");

	if (protocolId !== "progressive-loading-behavioral-v3") {
		throw new Error('dispatchEnvelope.protocolId must be "progressive-loading-behavioral-v3".');
	}

	return {
		...prompt,
		protocolId,
		repositoryHead: parseNonEmptyString(source.repositoryHead, "dispatchEnvelope.repositoryHead"),
		arm: parseNonEmptyString(source.arm, "dispatchEnvelope.arm"),
		scenarioId: parseNonEmptyString(source.scenarioId, "dispatchEnvelope.scenarioId"),
		trial: parsePositiveInteger(source.trial, "dispatchEnvelope.trial"),
		generatedIndexDigests: parseDigestRecord(source.generatedIndexDigests, "dispatchEnvelope.generatedIndexDigests"),
	};
};

const parseTracePass = (value: unknown, index: number): RoutingTracePass => {
	const label = `run.routingTrace.passes[${index}]`;
	const source = assertJsonObject(value, label);
	assertExactKeys({value: source, expectedKeys: tracePassKeys, label});

	return {
		pass: parsePositiveInteger(source.pass, `${label}.pass`),
		activatedSkills: parseStringArray(source.activatedSkills, `${label}.activatedSkills`),
		scopeEvidence: parseStringArray(source.scopeEvidence, `${label}.scopeEvidence`),
		generatedIndexDigests: parseDigestRecord(source.generatedIndexDigests, `${label}.generatedIndexDigests`),
		selected: parseStringRecord(source.selected, `${label}.selected`),
		notApplicable: parseStringRecord(source.notApplicable, `${label}.notApplicable`),
		unknown: parseStringRecord(source.unknown, `${label}.unknown`),
		requiresSelectedEvaluated: parseRequiresSelectedEvaluations(source.requiresSelectedEvaluated, `${label}.requiresSelectedEvaluated`),
		requiresSelectedAdded: parseRoutingEdges(source.requiresSelectedAdded, `${label}.requiresSelectedAdded`),
		reviewWithReevaluated: parseReviewOutcomes(source.reviewWithReevaluated, `${label}.reviewWithReevaluated`),
		completionGatesEvaluated: parseCompletionGateEvaluations(source.completionGatesEvaluated, `${label}.completionGatesEvaluated`),
		completionGateAdded: parseStringArray(source.completionGateAdded, `${label}.completionGateAdded`),
	};
};

const parseRoutingTrace = (value: unknown): RoutingTrace => {
	const source = assertJsonObject(value, "run.routingTrace");
	assertExactKeys({value: source, expectedKeys: ["passes", "stablePair", "stable"], label: "run.routingTrace"});

	if (!Array.isArray(source.passes) || source.passes.length < 3) {
		throw new Error("run.routingTrace.passes must contain at least three passes: one initial pass plus the final stable pair.");
	}

	if (!Array.isArray(source.stablePair) || source.stablePair.length !== 2) {
		throw new Error("run.routingTrace.stablePair must contain exactly two pass numbers.");
	}

	return {
		passes: source.passes.map(parseTracePass),
		stablePair: [
			parsePositiveInteger(source.stablePair[0], "run.routingTrace.stablePair[0]"),
			parsePositiveInteger(source.stablePair[1], "run.routingTrace.stablePair[1]"),
		],
		stable: parseBoolean(source.stable, "run.routingTrace.stable"),
	};
};

const getQualifiedTarget = (ownerSkill: string, target: string): string => {
	return target.includes("/") ? target : `${ownerSkill}/${target}`;
};

const getQualifiedRuleParts = (qualifiedRuleId: string, label: string): [string, string] => {
	const separatorIndex = qualifiedRuleId.indexOf("/");

	if (separatorIndex <= 0 || separatorIndex === qualifiedRuleId.length - 1 || qualifiedRuleId.indexOf("/", separatorIndex + 1) !== -1) {
		throw new Error(`${label} must use <skill>/<stable-rule-id> format.`);
	}

	return [qualifiedRuleId.slice(0, separatorIndex), qualifiedRuleId.slice(separatorIndex + 1)];
};

/**
 * @api structured skill source와 generated index identity 로드
 */
const readSkillRoutingSnapshot = async (skillName: string, skillRootDir: string): Promise<SkillRoutingSnapshot> => {
	const document = await readSkillDocument(getSkillPaths(skillName, skillRootDir));

	if (document.metadata.progressiveDisclosure !== true) {
		throw new Error(`Activated skill "${skillName}" must enable progressiveDisclosure.`);
	}

	const dependencies = parseDependencyDeclaration(document.skillName, document.metadata);
	const indexMarkdown = generateRulesIndexMarkdown(document, dependencies.companions);
	const digest = indexMarkdown.match(/Routing digest: `([^`]+)`/)?.[1];

	if (!digest || !sha256Pattern.test(digest)) {
		throw new Error(`Failed to derive current routing digest for skill "${skillName}".`);
	}

	const ruleIds = getCanonicalRoutingRuleIds(document);
	const ordinalPrefix = getRoutingOrdinalPrefix(skillName);

	return {
		document,
		digest,
		ruleIds,
		ordinalByRuleId: new Map(ruleIds.map((ruleId, index) => [ruleId, `${ordinalPrefix}${String(index + 1).padStart(2, "0")}`])),
		ruleById: new Map(document.rules.map((rule) => [getRuleId(rule), rule])),
	};
};

/**
 * @api full-handbook ordinal/title/stable-ID dictionary를 current canonical source와 exact 비교
 */
export const assertBehavioralFullHandbookIdentityDictionary = async (
	value: unknown,
	skillRootDir = packagePaths.skillRootDir,
): Promise<void> => {
	const dictionary = assertJsonObject(value, "full-handbook identity dictionary");
	const skillNames = ["react", "typescript", "css"];
	const allowedKeys = new Set(["semantics", "promptOverheadLimitation", ...skillNames]);
	const unexpectedKey = Object.keys(dictionary).find((key) => !allowedKeys.has(key));

	if (unexpectedKey) {
		throw new Error(`full-handbook identity dictionary contains unexpected key "${unexpectedKey}".`);
	}

	for (const skillName of skillNames) {
		const snapshot = await readSkillRoutingSnapshot(skillName, skillRootDir);
		const ordinalPrefix = getRoutingOrdinalPrefix(skillName);
		const expected = snapshot.ruleIds.map((ruleId, index) => {
			const title = snapshot.ruleById.get(ruleId)!.title.replace(/`/g, "");
			return `${ordinalPrefix}${String(index + 1).padStart(2, "0")}|${title}|${ruleId}`;
		});
		const actual = parseStringArray(dictionary[skillName], `full-handbook identity dictionary.${skillName}`);
		assertExactStringArray({
			actual,
			expected,
			message: `full-handbook identity dictionary for ${skillName} must exactly match current canonical source identities.`,
		});
	}
};

const assertExactStringArray = (args: AssertExactStringArrayArgs): void => {
	const {actual, expected, message} = args;

	if (actual.length !== expected.length || actual.some((item, index) => item !== expected[index])) {
		throw new Error(message);
	}
};

const createCanonicalTraceState = (pass: RoutingTracePass): string => {
	const orderedSkills = [...pass.activatedSkills].sort();
	const normalizeRecord = (record: Record<string, string[]>) =>
		Object.fromEntries(orderedSkills.map((skillName) => [skillName, [...(record[skillName] ?? [])].sort()]));

	return JSON.stringify({
		activatedSkills: orderedSkills,
		scopeEvidence: [...pass.scopeEvidence].sort(),
		generatedIndexDigests: Object.fromEntries(orderedSkills.map((skillName) => [skillName, pass.generatedIndexDigests[skillName]])),
		selected: normalizeRecord(pass.selected),
		notApplicable: normalizeRecord(pass.notApplicable),
		unknown: normalizeRecord(pass.unknown),
		requiresSelectedOutcomes: pass.requiresSelectedEvaluated
			.map(({source, target, sourceStatus, outcome}) => ({source, target, sourceStatus, outcome}))
			.sort((left, right) => `${left.source}->${left.target}`.localeCompare(`${right.source}->${right.target}`, "en")),
		reviewWithOutcomes: pass.reviewWithReevaluated
			.map(({source, target, outcome, evidence}) => ({source, target, outcome, evidence}))
			.sort((left, right) => `${left.source}->${left.target}`.localeCompare(`${right.source}->${right.target}`, "en")),
		completionGateOutcomes: pass.completionGatesEvaluated
			.map(({rule, outcome}) => ({rule, outcome}))
			.sort((left, right) => left.rule.localeCompare(right.rule, "en")),
	});
};

const assertTraceFixedPoint = (trace: RoutingTrace): void => {
	for (const [index, pass] of trace.passes.entries()) {
		if (pass.pass !== index + 1) {
			throw new Error(`run.routingTrace pass numbers must be consecutive from 1; received ${pass.pass} at index ${index}.`);
		}

		const previous = trace.passes[index - 1];

		if (!previous) {
			continue;
		}

		for (const skillName of previous.activatedSkills) {
			if (!pass.activatedSkills.includes(skillName)) {
				throw new Error(`run.routingTrace activated skill set must be monotonic; removed "${skillName}" at pass ${pass.pass}.`);
			}
		}

		for (const evidence of previous.scopeEvidence) {
			if (!pass.scopeEvidence.includes(evidence)) {
				throw new Error(`run.routingTrace scope evidence must be monotonic; removed evidence at pass ${pass.pass}.`);
			}
		}

		for (const skillName of previous.activatedSkills) {
			for (const selectedRuleId of previous.selected[skillName] ?? []) {
				if (!(pass.selected[skillName] ?? []).includes(selectedRuleId)) {
					throw new Error(
						`run.routingTrace Selected set must be monotonic; removed "${skillName}/${selectedRuleId}" at pass ${pass.pass}.`,
					);
				}
			}
		}
	}

	const finalPass = trace.passes.at(-1)!;
	const previousPass = trace.passes.at(-2)!;
	const expectedStablePair: [number, number] = [previousPass.pass, finalPass.pass];

	if (trace.stablePair[0] !== expectedStablePair[0] || trace.stablePair[1] !== expectedStablePair[1]) {
		throw new Error("run.routingTrace.stablePair must identify the final two consecutive passes.");
	}

	if (!trace.stable) {
		throw new Error("run.routingTrace.stable must be true after two consecutive identical passes.");
	}

	if (createCanonicalTraceState(previousPass) !== createCanonicalTraceState(finalPass)) {
		throw new Error("The final two routing passes must have identical canonical state.");
	}

	for (const stablePass of [previousPass, finalPass]) {
		if (stablePass.requiresSelectedAdded.length > 0 || stablePass.completionGateAdded.length > 0) {
			throw new Error("Both stable-pair passes must have empty selection-changing deltas.");
		}
	}
};

const assertPartitionRecordKeys = (args: AssertPartitionRecordKeysArgs): void => {
	const {pass, record, label} = args;
	const recordSkills = Object.keys(record);
	assertExactStringArray({
		actual: recordSkills,
		expected: pass.activatedSkills,
		message: `${label} keys must exactly match activatedSkills in order.`,
	});
};

const assertTracePartitions = (trace: RoutingTrace, snapshots: Map<string, SkillRoutingSnapshot>): void => {
	for (const pass of trace.passes) {
		assertExactStringArray({
			actual: Object.keys(pass.generatedIndexDigests),
			expected: pass.activatedSkills,
			message: `run.routingTrace pass ${pass.pass}.generatedIndexDigests keys must exactly match activatedSkills in order.`,
		});

		for (const skillName of pass.activatedSkills) {
			const snapshot = snapshots.get(skillName);

			if (!snapshot) {
				throw new Error(`run.routingTrace pass ${pass.pass} references unloaded skill "${skillName}".`);
			}

			if (pass.generatedIndexDigests[skillName] !== snapshot.digest) {
				throw new Error(`run.routingTrace pass ${pass.pass} generatedIndexDigests.${skillName} must match the current routing digest.`);
			}
		}

		for (const [recordName, record] of [
			["selected", pass.selected],
			["notApplicable", pass.notApplicable],
			["unknown", pass.unknown],
		] as const) {
			assertPartitionRecordKeys({pass, record, label: `run.routingTrace pass ${pass.pass}.${recordName}`});
		}

		for (const skillName of pass.activatedSkills) {
			const snapshot = snapshots.get(skillName);

			if (!snapshot) {
				throw new Error(`run.routingTrace pass ${pass.pass} references unloaded skill "${skillName}".`);
			}

			const partitions = [pass.selected[skillName] ?? [], pass.notApplicable[skillName] ?? [], pass.unknown[skillName] ?? []];
			const flattened = partitions.flat();
			const duplicate = flattened.find((ruleId, index) => flattened.indexOf(ruleId) !== index);

			if (duplicate) {
				throw new Error(`run.routingTrace pass ${pass.pass} partition overlaps at "${skillName}/${duplicate}".`);
			}

			assertExactStringArray({
				actual: [...flattened].sort((left, right) => snapshot.ruleIds.indexOf(left) - snapshot.ruleIds.indexOf(right)),
				expected: snapshot.ruleIds,
				message: `run.routingTrace pass ${pass.pass} must partition the complete current rule universe for "${skillName}".`,
			});

			for (const [partitionName, ruleIds] of [
				["selected", pass.selected[skillName] ?? []],
				["notApplicable", pass.notApplicable[skillName] ?? []],
				["unknown", pass.unknown[skillName] ?? []],
			] as const) {
				const ruleSet = new Set(ruleIds);
				const canonicalSubset = snapshot.ruleIds.filter((ruleId) => ruleSet.has(ruleId));
				assertExactStringArray({
					actual: ruleIds,
					expected: canonicalSubset,
					message: `run.routingTrace pass ${pass.pass}.${partitionName}.${skillName} must follow current canonical order.`,
				});
			}
		}
	}
};

const assertRequiredSkillClosure = (finalPass: RoutingTracePass, snapshots: Map<string, SkillRoutingSnapshot>): void => {
	for (const skillName of finalPass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;
		const dependencies = parseDependencyDeclaration(skillName, snapshot.document.metadata);
		const requiredSkills =
			dependencies.kind === "extends"
				? dependencies.skillNames
				: dependencies.companions.filter(({mode}) => mode === "required").map(({skill}) => skill);

		for (const requiredSkill of requiredSkills) {
			if (!finalPass.activatedSkills.includes(requiredSkill)) {
				throw new Error(`Activated skill "${skillName}" requires companion "${requiredSkill}" in the final routing receipt.`);
			}
		}
	}
};

const assertMandatoryRuleClosure = (finalPass: RoutingTracePass, snapshots: Map<string, SkillRoutingSnapshot>): void => {
	for (const skillName of finalPass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;
		const selectedRuleIds = new Set(finalPass.selected[skillName] ?? []);

		for (const rule of snapshot.document.rules) {
			const ruleId = getRuleId(rule);

			if (rule.requiredOnCompletion && !selectedRuleIds.has(ruleId)) {
				throw new Error(`completionGate "${skillName}/${ruleId}" must be Selected in the final routing receipt.`);
			}

			if (!selectedRuleIds.has(ruleId)) {
				continue;
			}

			for (const target of getCanonicalRoutingTargets(rule.requiresSelected)) {
				const qualifiedTarget = getQualifiedTarget(skillName, target);
				const [targetSkill, targetRuleId] = getQualifiedRuleParts(qualifiedTarget, `${skillName}/${ruleId} requiresSelected`);

				if (!finalPass.activatedSkills.includes(targetSkill) || !(finalPass.selected[targetSkill] ?? []).includes(targetRuleId)) {
					throw new Error(
						`requiresSelected target "${qualifiedTarget}" from "${skillName}/${ruleId}" must be Selected in the final routing receipt.`,
					);
				}
			}
		}
	}
};

const parseReceiptRuleReferences = (args: ParseReceiptRuleReferencesArgs): ReceiptRuleReference[] => {
	const {value, label, snapshot} = args;

	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	return value.map((item, index) => {
		const reference = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({value: reference, expectedKeys: ["ordinal", "id"], label: `${label}[${index}]`});
		const id = parseNonEmptyString(reference.id, `${label}[${index}].id`);
		const ordinal = parseNonEmptyString(reference.ordinal, `${label}[${index}].ordinal`);

		if (snapshot.ordinalByRuleId.get(id) !== ordinal) {
			throw new Error(`${label}[${index}] must use the current ordinal/stable-ID pair for "${id}".`);
		}

		return {ordinal, id};
	});
};

const assertReceiptExcludedGroups = (args: AssertReceiptExcludedGroupsArgs): void => {
	const {value, label, notApplicableReferences} = args;

	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const groupedOrdinals: string[] = [];

	for (const [index, item] of value.entries()) {
		const group = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({value: group, expectedKeys: ["ordinals", "reason"], label: `${label}[${index}]`});
		const ordinals = parseStringArray(group.ordinals, `${label}[${index}].ordinals`);
		parseNonEmptyString(group.reason, `${label}[${index}].reason`);
		groupedOrdinals.push(...ordinals);
	}

	const duplicate = groupedOrdinals.find((ordinal, index) => groupedOrdinals.indexOf(ordinal) !== index);

	if (duplicate) {
		throw new Error(`${label} must not group N/A ordinal "${duplicate}" more than once.`);
	}

	assertExactStringArray({
		actual: [...groupedOrdinals].sort(),
		expected: notApplicableReferences.map(({ordinal}) => ordinal).sort(),
		message: `${label} ordinal union must exactly equal the final N/A partition.`,
	});
};

const parseExpandedRecords = (args: ParseExpandedRecordsArgs): ExpandedRecord[] => {
	const {value, label, snapshot} = args;

	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	const records = value.map((item, index) => {
		const record = assertJsonObject(item, `${label}[${index}]`);
		assertExactKeys({
			value: record,
			expectedKeys: ["ordinal", "id", "contractPath", "fullRulePath", "reason", "mandatoryCritical"],
			label: `${label}[${index}]`,
		});
		const id = parseNonEmptyString(record.id, `${label}[${index}].id`);
		const ordinal = parseNonEmptyString(record.ordinal, `${label}[${index}].ordinal`);
		const rule = snapshot.ruleById.get(id);

		if (!rule || snapshot.ordinalByRuleId.get(id) !== ordinal) {
			throw new Error(`${label}[${index}] must use a current ordinal/stable-ID pair.`);
		}

		const expectedContractPath = `skill/${snapshot.document.skillName}/contracts/${id}.md`;
		const expectedFullRulePath = `skill/${snapshot.document.skillName}/rules/${id}.md`;
		const contractPath = parseNonEmptyString(record.contractPath, `${label}[${index}].contractPath`);
		const fullRulePath = parseNonEmptyString(record.fullRulePath, `${label}[${index}].fullRulePath`);

		if (contractPath !== expectedContractPath || fullRulePath !== expectedFullRulePath) {
			throw new Error(`${label}[${index}] contractPath and fullRulePath must match "${id}".`);
		}

		const mandatoryCritical = parseBoolean(record.mandatoryCritical, `${label}[${index}].mandatoryCritical`);

		if (mandatoryCritical !== (rule.impact === "CRITICAL")) {
			throw new Error(`${label}[${index}].mandatoryCritical must match current rule impact.`);
		}

		return {
			ordinal,
			id,
			contractPath,
			fullRulePath,
			reason: parseNonEmptyString(record.reason, `${label}[${index}].reason`),
			mandatoryCritical,
		};
	});
	const duplicate = records.map(({id}) => id).find((id, index, ids) => ids.indexOf(id) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate Expanded record "${duplicate}".`);
	}

	return records;
};

const assertFinalReceipts = (args: AssertFinalReceiptsArgs): Map<string, ExpandedRecord[]> => {
	const {run, arm, finalPass, snapshots} = args;
	const activatedSkills = parseStringArray(run.activatedSkills, "run.activatedSkills");
	assertExactStringArray({
		actual: activatedSkills,
		expected: finalPass.activatedSkills,
		message: "run.activatedSkills and the final routing trace pass must exactly match.",
	});

	if (!Array.isArray(run.receipts)) {
		throw new Error("run.receipts must be an array.");
	}

	const receiptSkills = run.receipts.map((item, index) =>
		parseNonEmptyString(assertJsonObject(item, `run.receipts[${index}]`).skill, `run.receipts[${index}].skill`),
	);
	assertExactStringArray({
		actual: receiptSkills,
		expected: finalPass.activatedSkills,
		message: "Final receipts must exactly match the activated skill order.",
	});
	const expandedBySkill = new Map<string, ExpandedRecord[]>();

	for (const [index, item] of run.receipts.entries()) {
		const label = `run.receipts[${index}]`;
		const receipt = assertJsonObject(item, label);
		assertExactKeys({value: receipt, expectedKeys: receiptKeys, label});
		const skillName = receiptSkills[index]!;
		const snapshot = snapshots.get(skillName)!;
		const receiptPartitions = {
			selected: Array.isArray(receipt.selected)
				? receipt.selected.map((reference) => assertJsonObject(reference, `${label}.selected`).id)
				: [],
			notApplicable: Array.isArray(receipt.notApplicable)
				? receipt.notApplicable.map((reference) => assertJsonObject(reference, `${label}.notApplicable`).id)
				: [],
			unknown: Array.isArray(receipt.unknown) ? receipt.unknown.map((reference) => assertJsonObject(reference, `${label}.unknown`).id) : [],
		};

		for (const [partitionName, ids] of Object.entries(receiptPartitions)) {
			if (
				ids.some((id) => typeof id !== "string") ||
				ids.join("\0") !== (finalPass[partitionName as keyof RoutingTracePass] as Record<string, string[]>)[skillName]?.join("\0")
			) {
				throw new Error(`Final receipt must exactly match the last routing trace partition for "${skillName}".`);
			}
		}

		const selected = parseReceiptRuleReferences({value: receipt.selected, label: `${label}.selected`, snapshot});
		const notApplicable = parseReceiptRuleReferences({value: receipt.notApplicable, label: `${label}.notApplicable`, snapshot});
		parseReceiptRuleReferences({value: receipt.unknown, label: `${label}.unknown`, snapshot});

		if (arm === "full-handbook") {
			if (receipt.indexDigest !== null) {
				throw new Error(`${label}.indexDigest must be null for the full-handbook arm.`);
			}
		} else if (receipt.indexDigest !== snapshot.digest) {
			throw new Error(`${label}.indexDigest must match the current routing digest for "${skillName}".`);
		}

		assertReceiptExcludedGroups({value: receipt.excludedGroups, label: `${label}.excludedGroups`, notApplicableReferences: notApplicable});

		const expandedRecords = parseExpandedRecords({value: receipt.expanded, label: `${label}.expanded`, snapshot});
		expandedBySkill.set(skillName, expandedRecords);

		if (selected.length !== finalPass.selected[skillName]?.length) {
			throw new Error(`Final receipt must exactly match the last routing trace partition for "${skillName}".`);
		}
	}

	return expandedBySkill;
};

const parseDeclaredLoadedFiles = (value: unknown): string[] => {
	const source = assertJsonObject(value, "run.declaredLoadedFiles");
	assertExactKeys({value: source, expectedKeys: ["kind", "paths"], label: "run.declaredLoadedFiles"});

	if (source.kind !== "declared") {
		throw new Error('run.declaredLoadedFiles.kind must be "declared".');
	}

	return parseStringArray(source.paths, "run.declaredLoadedFiles.paths");
};

const createExpectedProgressiveLoads = (args: CreateExpectedProgressiveLoadsArgs): string[] => {
	const {trace, snapshots, expandedBySkill} = args;
	const paths: string[] = [];
	const finalPass = trace.passes.at(-1)!;

	for (const skillName of finalPass.activatedSkills) {
		paths.push(`skill/${skillName}/SKILL.md`, `skill/${skillName}/RULES_INDEX.md`);
	}

	for (const skillName of finalPass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;
		const guidanceRuleIds = new Set(
			trace.passes.flatMap((pass) => [...(pass.selected[skillName] ?? []), ...(pass.unknown[skillName] ?? [])]),
		);
		const expandedByRuleId = new Map((expandedBySkill.get(skillName) ?? []).map((record) => [record.id, record]));

		for (const expandedRecord of expandedByRuleId.values()) {
			if (!guidanceRuleIds.has(expandedRecord.id)) {
				throw new Error(`Expanded record must belong to a rule that was Selected or Unknown: "${skillName}/${expandedRecord.id}".`);
			}
		}

		for (const ruleId of snapshot.ruleIds) {
			if (!guidanceRuleIds.has(ruleId)) {
				continue;
			}

			const contractPath = `skill/${skillName}/contracts/${ruleId}.md`;
			paths.push(contractPath);
			const rule = snapshot.ruleById.get(ruleId)!;
			const expandedRecord = expandedByRuleId.get(ruleId);

			if (rule.impact === "CRITICAL" && !expandedRecord) {
				throw new Error(`CRITICAL Selected/Unknown rule "${skillName}/${ruleId}" requires exactly one Expanded record.`);
			}

			if (expandedRecord) {
				paths.push(expandedRecord.fullRulePath);
			}
		}
	}

	return paths;
};

/**
 * @api child-declared repository-relative load path의 실제 파일 존재 확인
 */
const assertDeclaredLoadFilesExist = async (loadedPaths: string[], skillRootDir: string): Promise<void> => {
	const repositoryRoot = path.dirname(path.resolve(skillRootDir));

	for (const loadedPath of loadedPaths) {
		if (path.isAbsolute(loadedPath) || loadedPath.includes("..")) {
			throw new Error(`Declared loaded file must be a repository-relative path: "${loadedPath}".`);
		}

		await access(path.join(repositoryRoot, loadedPath));
	}
};

const assertDeclaredLoads = async (args: AssertDeclaredLoadsArgs): Promise<void> => {
	const {run, arm, trace, finalPass, snapshots, expandedBySkill, skillRootDir} = args;
	const loadedPaths = parseDeclaredLoadedFiles(run.declaredLoadedFiles);
	let expectedPaths: string[];

	if (arm === "no-skill") {
		if (
			finalPass.activatedSkills.length > 0 ||
			loadedPaths.length > 0 ||
			Array.from(expandedBySkill.values()).some((records) => records.length > 0)
		) {
			throw new Error("no-skill arm must have no activated skills, receipts, declared loads, or Expanded records.");
		}

		expectedPaths = [];
	} else if (arm === "full-handbook") {
		if (Array.from(expandedBySkill.values()).some((records) => records.length > 0)) {
			throw new Error("full-handbook arm must not contain Expanded records.");
		}

		expectedPaths = finalPass.activatedSkills.flatMap((skillName) => [`skill/${skillName}/SKILL.md`, `skill/${skillName}/AGENTS.md`]);

		if (loadedPaths.join("\0") !== expectedPaths.join("\0")) {
			throw new Error("full-handbook declared loads must contain only each activated SKILL.md and AGENTS.md in order.");
		}
	} else if (arm === "progressive" || arm === "mutation") {
		const progressivePaths = createExpectedProgressiveLoads({trace, snapshots, expandedBySkill});
		expectedPaths =
			arm === "mutation" ? ["skill/convention-audit/SKILL.md", "skill/convention-audit/AGENTS.md", ...progressivePaths] : progressivePaths;

		for (const skillName of finalPass.activatedSkills) {
			const snapshot = snapshots.get(skillName)!;
			const guidanceRuleIds = new Set(
				trace.passes.flatMap((pass) => [...(pass.selected[skillName] ?? []), ...(pass.unknown[skillName] ?? [])]),
			);

			for (const ruleId of snapshot.ruleIds.filter((candidateRuleId) => guidanceRuleIds.has(candidateRuleId))) {
				const rule = snapshot.ruleById.get(ruleId)!;
				const contractPath = `skill/${skillName}/contracts/${ruleId}.md`;
				const contractIndex = loadedPaths.indexOf(contractPath);

				if (rule.impact === "CRITICAL" && loadedPaths[contractIndex + 1] !== `skill/${skillName}/rules/${ruleId}.md`) {
					throw new Error("A CRITICAL Selected/Unknown contract must be followed immediately by its full rule.");
				}
			}
		}

		const expectedPathSet = new Set(expectedPaths);
		const unrecordedFullRule = loadedPaths.find((loadedPath) => /\/rules\/[^/]+\.md$/.test(loadedPath) && !expectedPathSet.has(loadedPath));

		if (unrecordedFullRule) {
			throw new Error(`A non-CRITICAL full-rule load must have exactly one matching Expanded record: "${unrecordedFullRule}".`);
		}

		if (loadedPaths.join("\0") !== expectedPaths.join("\0")) {
			throw new Error(`${arm} declared loads must exactly follow SKILL/index/Selected-or-Unknown contract/full-rule sequence.`);
		}
	} else {
		throw new Error(`Unsupported behavioral arm "${arm}".`);
	}

	await assertDeclaredLoadFilesExist(expectedPaths, skillRootDir);
};

const createExpectedRequiresSelectedEdges = (args: CreateExpectedRequiresSelectedEdgesArgs): RoutingEdge[] => {
	const {pass, previousPass, snapshots} = args;
	const edges: RoutingEdge[] = [];

	for (const skillName of pass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;

		for (const ruleId of pass.selected[skillName] ?? []) {
			const rule = snapshot.ruleById.get(ruleId)!;

			for (const target of getCanonicalRoutingTargets(rule.requiresSelected)) {
				const qualifiedTarget = getQualifiedTarget(skillName, target);
				const [targetSkill, targetRuleId] = getQualifiedRuleParts(qualifiedTarget, `${skillName}/${ruleId} requiresSelected`);
				const targetIsNew = !(previousPass?.selected[targetSkill] ?? []).includes(targetRuleId);

				if (targetIsNew && (pass.selected[targetSkill] ?? []).includes(targetRuleId)) {
					edges.push({source: `${skillName}/${ruleId}`, target: qualifiedTarget});
				}
			}
		}
	}

	return edges;
};

const getRulePartitionStatus = (args: RulePartitionStatusArgs): RequiresSelectedSourceStatus => {
	const {pass, skillName, ruleId, label} = args;

	if ((pass.selected[skillName] ?? []).includes(ruleId)) {
		return "Selected";
	}

	if ((pass.notApplicable[skillName] ?? []).includes(ruleId)) {
		return "N/A";
	}

	if ((pass.unknown[skillName] ?? []).includes(ruleId)) {
		return "Unknown";
	}

	throw new Error(`${label} is missing from pass ${pass.pass} partition.`);
};

const createExpectedRequiresSelectedEvaluations = (args: CreateExpectedRequiresSelectedEvaluationsArgs): RequiresSelectedEvaluation[] => {
	const {pass, snapshots} = args;
	const evaluations: RequiresSelectedEvaluation[] = [];

	for (const skillName of pass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;

		for (const ruleId of snapshot.ruleIds) {
			const rule = snapshot.ruleById.get(ruleId)!;
			const source = `${skillName}/${ruleId}`;
			const sourceStatus = getRulePartitionStatus({pass, skillName, ruleId, label: `requiresSelected source "${source}"`});

			if (sourceStatus === "N/A") {
				continue;
			}

			for (const target of getCanonicalRoutingTargets(rule.requiresSelected)) {
				const qualifiedTarget = getQualifiedTarget(skillName, target);
				const [targetSkill, targetRuleId] = getQualifiedRuleParts(qualifiedTarget, `${source} requiresSelected`);
				let outcome: RequiresSelectedOutcome;

				if (sourceStatus === "Selected") {
					if (!pass.activatedSkills.includes(targetSkill) || !(pass.selected[targetSkill] ?? []).includes(targetRuleId)) {
						throw new Error(`Selected requiresSelected source "${source}" must select target "${qualifiedTarget}" in pass ${pass.pass}.`);
					}

					outcome = "selected";
				} else if (sourceStatus === "Unknown") {
					outcome = "not-propagated-unknown";
				} else outcome = "not-propagated-unknown";

				evaluations.push({source, target: qualifiedTarget, sourceStatus, outcome});
			}
		}
	}

	return evaluations;
};

const createExpectedReviewOutcomes = (
	pass: RoutingTracePass,
	snapshots: Map<string, SkillRoutingSnapshot>,
): Omit<ReviewWithOutcome, "evidence">[] => {
	const outcomes: Omit<ReviewWithOutcome, "evidence">[] = [];

	for (const skillName of pass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;
		const sourceIds = new Set(pass.selected[skillName] ?? []);

		for (const ruleId of snapshot.ruleIds) {
			if (!sourceIds.has(ruleId)) {
				continue;
			}

			const rule = snapshot.ruleById.get(ruleId)!;

			for (const target of getCanonicalRoutingTargets(rule.reviewWith)) {
				const qualifiedTarget = getQualifiedTarget(skillName, target);
				const [targetSkill, targetRuleId] = getQualifiedRuleParts(qualifiedTarget, `${skillName}/${ruleId} reviewWith`);
				let outcome: ReviewWithOutcome["outcome"] = "INACTIVE";

				if (pass.activatedSkills.includes(targetSkill)) {
					if ((pass.selected[targetSkill] ?? []).includes(targetRuleId)) {
						outcome = "Selected";
					} else if ((pass.notApplicable[targetSkill] ?? []).includes(targetRuleId)) {
						outcome = "N/A";
					} else if ((pass.unknown[targetSkill] ?? []).includes(targetRuleId)) {
						outcome = "Unknown";
					} else {
						throw new Error(`reviewWith target "${qualifiedTarget}" is missing from pass ${pass.pass} partition.`);
					}
				}

				outcomes.push({source: `${skillName}/${ruleId}`, target: qualifiedTarget, outcome});
			}
		}
	}

	return outcomes;
};

const createExpectedCompletionGates = (args: CreateExpectedCompletionGatesArgs): string[] => {
	const {pass, previousPass, snapshots} = args;
	const gates: string[] = [];

	for (const skillName of pass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;

		for (const ruleId of pass.selected[skillName] ?? []) {
			if (snapshot.ruleById.get(ruleId)?.requiredOnCompletion && !(previousPass?.selected[skillName] ?? []).includes(ruleId)) {
				gates.push(`${skillName}/${ruleId}`);
			}
		}
	}

	return gates;
};

const createExpectedCompletionGateEvaluations = (args: CreateExpectedCompletionGateEvaluationsArgs): CompletionGateEvaluation[] => {
	const {pass, snapshots} = args;
	const evaluations: CompletionGateEvaluation[] = [];

	for (const skillName of pass.activatedSkills) {
		const snapshot = snapshots.get(skillName)!;

		for (const ruleId of snapshot.ruleIds) {
			if (!snapshot.ruleById.get(ruleId)?.requiredOnCompletion) {
				continue;
			}

			if (!(pass.selected[skillName] ?? []).includes(ruleId)) {
				throw new Error(`completionGate "${skillName}/${ruleId}" must be Selected in pass ${pass.pass}.`);
			}

			evaluations.push({rule: `${skillName}/${ruleId}`, outcome: "selected"});
		}
	}

	return evaluations;
};

const assertExactEdges = (args: AssertExactEdgesArgs): void => {
	const {actual, expected, label} = args;
	const serialize = (edges: RoutingEdge[]) => edges.map(({source, target}) => `${source}->${target}`);
	assertExactStringArray({
		actual: serialize(actual),
		expected: serialize(expected),
		message: `${label} must exactly record current source metadata transitions.`,
	});
};

const assertTraceTransitions = (trace: RoutingTrace, snapshots: Map<string, SkillRoutingSnapshot>): void => {
	for (const [index, pass] of trace.passes.entries()) {
		const previousPass = trace.passes[index - 1];
		const expectedRequiresSelectedEvaluations = createExpectedRequiresSelectedEvaluations({pass, snapshots});
		assertExactStringArray({
			actual: pass.requiresSelectedEvaluated.map(({source, target}) => `${source}->${target}`),
			expected: expectedRequiresSelectedEvaluations.map(({source, target}) => `${source}->${target}`),
			message: `run.routingTrace pass ${pass.pass}.requiresSelectedEvaluated must exactly cover every disclosed mandatory edge from Selected or Unknown sources.`,
		});

		for (const [evaluationIndex, actualEvaluation] of pass.requiresSelectedEvaluated.entries()) {
			const expectedEvaluation = expectedRequiresSelectedEvaluations[evaluationIndex]!;
			const edge = `${actualEvaluation.source}->${actualEvaluation.target}`;

			if (actualEvaluation.sourceStatus !== expectedEvaluation.sourceStatus) {
				throw new Error(`requiresSelected sourceStatus for "${edge}" must be "${expectedEvaluation.sourceStatus}" in pass ${pass.pass}.`);
			}

			if (actualEvaluation.outcome !== expectedEvaluation.outcome) {
				throw new Error(`requiresSelected outcome for "${edge}" must be "${expectedEvaluation.outcome}" in pass ${pass.pass}.`);
			}
		}

		for (const edge of pass.requiresSelectedAdded) {
			const [sourceSkill, sourceRuleId] = getQualifiedRuleParts(edge.source, `pass ${pass.pass} requiresSelectedAdded.source`);
			const [targetSkill, targetRuleId] = getQualifiedRuleParts(edge.target, `pass ${pass.pass} requiresSelectedAdded.target`);

			if (!(pass.selected[sourceSkill] ?? []).includes(sourceRuleId)) {
				throw new Error(`requiresSelectedAdded source "${edge.source}" must be Selected in the same pass.`);
			}

			if (!(pass.selected[targetSkill] ?? []).includes(targetRuleId)) {
				throw new Error(`requiresSelectedAdded target "${edge.target}" must be Selected in the same pass.`);
			}
		}

		assertExactEdges({
			actual: pass.requiresSelectedAdded,
			expected: createExpectedRequiresSelectedEdges({pass, previousPass, snapshots}),
			label: `run.routingTrace pass ${pass.pass}.requiresSelectedAdded`,
		});
		const expectedReviewOutcomes = createExpectedReviewOutcomes(pass, snapshots);
		const expectedReviewOutcomeByEdge = new Map(expectedReviewOutcomes.map((outcome) => [`${outcome.source}->${outcome.target}`, outcome]));

		if (
			pass.reviewWithReevaluated.length !== expectedReviewOutcomes.length ||
			pass.reviewWithReevaluated.some(({source, target}) => !expectedReviewOutcomeByEdge.has(`${source}->${target}`))
		) {
			throw new Error(`run.routingTrace pass ${pass.pass}.reviewWithReevaluated must exactly cover final Selected source edges.`);
		}

		for (const actualOutcome of pass.reviewWithReevaluated) {
			const edge = `${actualOutcome.source}->${actualOutcome.target}`;
			const expectedOutcome = expectedReviewOutcomeByEdge.get(edge)!;

			if (actualOutcome.outcome !== expectedOutcome.outcome) {
				throw new Error(
					`reviewWith outcome for "${actualOutcome.source}->${actualOutcome.target}" must match target partition verdict "${expectedOutcome.outcome}".`,
				);
			}

			if (actualOutcome.outcome === "INACTIVE" && actualOutcome.evidence.trim().length === 0) {
				throw new Error(`Inactive reviewWith target "${actualOutcome.target}" requires non-empty evidence.`);
			}
		}
		assertExactStringArray({
			actual: pass.completionGatesEvaluated.map(({rule, outcome}) => `${rule}:${outcome}`),
			expected: createExpectedCompletionGateEvaluations({pass, snapshots}).map(({rule, outcome}) => `${rule}:${outcome}`),
			message: `run.routingTrace pass ${pass.pass}.completionGatesEvaluated must exactly cover every current completion gate.`,
		});
		assertExactStringArray({
			actual: pass.completionGateAdded,
			expected: createExpectedCompletionGates({pass, previousPass, snapshots}),
			message: `run.routingTrace pass ${pass.pass}.completionGateAdded must exactly record newly Selected completion gates.`,
		});
	}
};

const assertCompletion = (run: JsonObject, finalPass?: RoutingTracePass): void => {
	const completion = assertJsonObject(run.completion, "run.completion");
	assertExactKeys({
		value: completion,
		expectedKeys: ["status", "blocked", "coverageFailCount", "semanticFailCount", "unknownCount", "reason"],
		label: "run.completion",
	});
	const status = parseNonEmptyString(completion.status, "run.completion.status");
	const blocked = parseBoolean(completion.blocked, "run.completion.blocked");
	const coverageFailCount = parseNonNegativeInteger(completion.coverageFailCount, "run.completion.coverageFailCount");
	const semanticFailCount = parseNonNegativeInteger(completion.semanticFailCount, "run.completion.semanticFailCount");
	const unknownCount = parseNonNegativeInteger(completion.unknownCount, "run.completion.unknownCount");
	parseNonEmptyString(completion.reason, "run.completion.reason");

	if (!Array.isArray(run.semanticVerdicts)) {
		throw new Error("run.semanticVerdicts must be an array.");
	}

	let actualSemanticFailCount = 0;
	let actualSemanticUnknownCount = 0;

	for (const [index, item] of run.semanticVerdicts.entries()) {
		const verdict = assertJsonObject(item, `run.semanticVerdicts[${index}]`);
		assertExactKeys({value: verdict, expectedKeys: ["criterion", "verdict", "reason"], label: `run.semanticVerdicts[${index}]`});
		parseNonEmptyString(verdict.criterion, `run.semanticVerdicts[${index}].criterion`);
		parseNonEmptyString(verdict.reason, `run.semanticVerdicts[${index}].reason`);
		const verdictValue = parseNonEmptyString(verdict.verdict, `run.semanticVerdicts[${index}].verdict`);

		if (verdictValue !== "PASS" && verdictValue !== "FAIL" && verdictValue !== "UNKNOWN") {
			throw new Error(`run.semanticVerdicts[${index}].verdict must be PASS, FAIL, or UNKNOWN.`);
		}

		actualSemanticFailCount += verdictValue === "FAIL" ? 1 : 0;
		actualSemanticUnknownCount += verdictValue === "UNKNOWN" ? 1 : 0;
	}

	const routingUnknownCount = finalPass ? Object.values(finalPass.unknown).reduce((total, ruleIds) => total + ruleIds.length, 0) : 0;
	const actualUnknownCount = routingUnknownCount + actualSemanticUnknownCount;

	if ((status !== "COMPLETE" && status !== "BLOCKED") || blocked !== (status === "BLOCKED")) {
		throw new Error("run.completion status and blocked flag must consistently encode COMPLETE or BLOCKED.");
	}

	if (semanticFailCount !== actualSemanticFailCount) {
		throw new Error("run.completion.semanticFailCount must equal semantic FAIL verdict count.");
	}

	if (unknownCount !== actualUnknownCount) {
		throw new Error("run.completion.unknownCount must equal routing and semantic UNKNOWN counts.");
	}

	const hasBlocker = coverageFailCount > 0 || semanticFailCount > 0 || unknownCount > 0;

	if ((status === "COMPLETE" && hasBlocker) || (status === "BLOCKED" && !hasBlocker)) {
		throw new Error(
			"COMPLETE requires coverageFailCount, semanticFailCount, and total Unknown count to be zero; otherwise BLOCKED is required.",
		);
	}
};

/** @helper mutation arm을 단일 coverage failure 증거로 제한 */
const assertMutationCompletionAccounting = (run: JsonObject): void => {
	if (!Array.isArray(run.semanticVerdicts) || run.semanticVerdicts.length !== 0) {
		throw new Error(
			"mutation arm requires exact coverage-only accounting: semanticVerdicts=[], BLOCKED, blocked=true, coverageFailCount=1, semanticFailCount=0, and unknownCount=0.",
		);
	}

	const completion = assertJsonObject(run.completion, "run.completion");
	const status = parseNonEmptyString(completion.status, "run.completion.status");
	const blocked = parseBoolean(completion.blocked, "run.completion.blocked");
	const coverageFailCount = parseNonNegativeInteger(completion.coverageFailCount, "run.completion.coverageFailCount");
	const semanticFailCount = parseNonNegativeInteger(completion.semanticFailCount, "run.completion.semanticFailCount");
	const unknownCount = parseNonNegativeInteger(completion.unknownCount, "run.completion.unknownCount");

	if (status !== "BLOCKED" || blocked !== true || coverageFailCount !== 1 || semanticFailCount !== 0 || unknownCount !== 0) {
		throw new Error(
			"mutation arm requires exact coverage-only accounting: semanticVerdicts=[], BLOCKED, blocked=true, coverageFailCount=1, semanticFailCount=0, and unknownCount=0.",
		);
	}
};

const createReceiptBackedPass = (run: JsonObject): RoutingTracePass => {
	const activatedSkills = parseStringArray(run.activatedSkills, "run.activatedSkills");
	const runDigests = parseDigestRecord(run.generatedIndexDigests, "run.generatedIndexDigests");

	if (!Array.isArray(run.receipts)) {
		throw new Error("run.receipts must be an array.");
	}

	const selected: Record<string, string[]> = {};
	const notApplicable: Record<string, string[]> = {};
	const unknown: Record<string, string[]> = {};

	for (const [index, item] of run.receipts.entries()) {
		const receipt = assertJsonObject(item, `run.receipts[${index}]`);
		const skillName = parseNonEmptyString(receipt.skill, `run.receipts[${index}].skill`);
		const readIds = (value: unknown, label: string): string[] => {
			if (!Array.isArray(value)) {
				throw new Error(`${label} must be an array.`);
			}

			return value.map((reference, referenceIndex) =>
				parseNonEmptyString(assertJsonObject(reference, `${label}[${referenceIndex}]`).id, `${label}[${referenceIndex}].id`),
			);
		};

		selected[skillName] = readIds(receipt.selected, `run.receipts[${index}].selected`);
		notApplicable[skillName] = readIds(receipt.notApplicable, `run.receipts[${index}].notApplicable`);
		unknown[skillName] = readIds(receipt.unknown, `run.receipts[${index}].unknown`);
	}

	return {
		pass: 1,
		activatedSkills,
		scopeEvidence: [],
		generatedIndexDigests: Object.fromEntries(activatedSkills.map((skillName) => [skillName, runDigests[skillName]])),
		selected,
		notApplicable,
		unknown,
		requiresSelectedEvaluated: [],
		requiresSelectedAdded: [],
		reviewWithReevaluated: [],
		completionGatesEvaluated: [],
		completionGateAdded: [],
	};
};

const assertCandidateFinalUnknownResolved = (finalPass: RoutingTracePass): void => {
	const unknownCount = Object.values(finalPass.unknown).reduce((total, ruleIds) => total + ruleIds.length, 0);

	if (unknownCount !== 0) {
		throw new Error(`Candidate routing final Unknown count must be zero; received ${unknownCount}.`);
	}
};

const validateCandidateRoutingEpisode = (args: ValidateCandidateRoutingEpisodeArgs): ValidatedRoutingEpisode => {
	const {episode, arm, snapshots} = args;
	const trace = parseRoutingTrace(episode.routingTrace);
	assertTraceFixedPoint(trace);
	const activatedSkillNames = Array.from(new Set(trace.passes.flatMap(({activatedSkills}) => activatedSkills)));

	for (const skillName of activatedSkillNames) {
		if (!snapshots.has(skillName)) {
			throw new Error(`Activated skill "${skillName}" must be bound in dispatch generatedIndexDigests.`);
		}
	}

	assertTracePartitions(trace, snapshots);
	const finalPass = trace.passes.at(-1)!;
	assertCandidateFinalUnknownResolved(finalPass);
	assertRequiredSkillClosure(finalPass, snapshots);
	assertMandatoryRuleClosure(finalPass, snapshots);
	const expandedBySkill = assertFinalReceipts({run: episode, arm, finalPass, snapshots});
	assertTraceTransitions(trace, snapshots);

	return {trace, finalPass, expandedBySkill};
};

const assertScopeDriftMonotonic = (initialPass: RoutingTracePass, driftPass: RoutingTracePass): void => {
	for (const skillName of initialPass.activatedSkills) {
		if (!driftPass.activatedSkills.includes(skillName)) {
			throw new Error(`run.driftReceipt must preserve initially activated skill "${skillName}".`);
		}

		for (const ruleId of initialPass.selected[skillName] ?? []) {
			if (!(driftPass.selected[skillName] ?? []).includes(ruleId)) {
				throw new Error(`run.driftReceipt must preserve initially Selected rule "${skillName}/${ruleId}".`);
			}
		}
	}
};

/**
 * @api staged initial/drift payload의 fixed point, declared loads, completion을 stage별 독립 검증
 */
export const validateBehavioralEvalStageEvidence = async (args: ValidateBehavioralEvalStageEvidenceArgs): Promise<void> => {
	const {payload: payloadValue, dispatchEnvelope: dispatchValue, skillRootDir = packagePaths.skillRootDir} = args;
	const dispatch = parseDispatchEnvelope(dispatchValue);
	const payload = assertJsonObject(payloadValue, "stage payload");
	assertRuntimeDisclosureShape(payload.runtime);
	assertVirtualPatchShape(payload.virtualPatch);
	parseStringArray(payload.limitations, "stage payload.limitations");
	parseNonEmptyString(payload.response, "stage payload.response");
	const snapshots = new Map<string, SkillRoutingSnapshot>();

	for (const [skillName, expectedDigest] of Object.entries(dispatch.generatedIndexDigests)) {
		const snapshot = await readSkillRoutingSnapshot(skillName, skillRootDir);

		if (snapshot.digest !== expectedDigest) {
			throw new Error(`stage dispatch digest for "${skillName}" must match the current routing digest.`);
		}

		snapshots.set(skillName, snapshot);
	}

	if (dispatch.arm === "no-skill") {
		if (payload.routingTrace !== null) {
			throw new Error("no-skill stage requires routingTrace to be null.");
		}

		if (parseStringArray(payload.activatedSkills, "stage payload.activatedSkills").length > 0) {
			throw new Error("no-skill stage must not activate convention skills.");
		}

		if (!Array.isArray(payload.receipts) || payload.receipts.length > 0) {
			throw new Error("no-skill stage must use an empty receipts array.");
		}

		if (parseDeclaredLoadedFiles(payload.declaredLoadedFiles).length > 0) {
			throw new Error("no-skill stage must declare an empty loaded-file context.");
		}

		assertCompletion(payload);
		return;
	}

	if (dispatch.arm !== "progressive" && dispatch.arm !== "full-handbook") {
		throw new Error(`Staged evidence does not support behavioral arm "${dispatch.arm}".`);
	}

	const episode = validateCandidateRoutingEpisode({episode: payload, arm: dispatch.arm, snapshots});
	await assertDeclaredLoads({
		run: payload,
		arm: dispatch.arm,
		trace: episode.trace,
		finalPass: episode.finalPass,
		snapshots,
		expandedBySkill: episode.expandedBySkill,
		skillRootDir,
	});
	assertCompletion(payload, episode.finalPass);
};

/**
 * @api dispatch provenance와 current routing source에 대해 behavioral v3 run 검증
 */
export const validateBehavioralEvalRun = async (args: ValidateBehavioralEvalRunArgs): Promise<void> => {
	const {run: runValue, dispatchEnvelope: dispatchValue, skillRootDir = packagePaths.skillRootDir} = args;
	const dispatch = parseDispatchEnvelope(dispatchValue);
	const run = assertJsonObject(runValue, "run");
	assertRunEvidenceShape(run);
	const runPrompt = assertPromptProvenance(run, "run");

	if (runPrompt.runId !== dispatch.runId) {
		throw new Error("run.runId must exactly match the saved dispatch envelope.");
	}

	if (runPrompt.scenarioPrompt !== dispatch.scenarioPrompt) {
		throw new Error("run.scenarioPrompt must exactly match the saved dispatch envelope.");
	}

	if (runPrompt.exactPrompt !== dispatch.exactPrompt) {
		throw new Error("run.exactPrompt must exactly match the saved dispatch envelope.");
	}

	if (
		runPrompt.promptSha256 !== dispatch.promptSha256 ||
		runPrompt.promptByteLength !== dispatch.promptByteLength ||
		runPrompt.promptRendererVersion !== dispatch.promptRendererVersion
	) {
		throw new Error("run prompt hash, byte length, and renderer version must exactly match the saved dispatch envelope.");
	}

	if (parseNonEmptyString(run.protocolId, "run.protocolId") !== dispatch.protocolId) {
		throw new Error("run.protocolId must exactly match the saved dispatch envelope.");
	}

	if (parseNonEmptyString(run.repositoryHead, "run.repositoryHead") !== dispatch.repositoryHead) {
		throw new Error("run.repositoryHead must exactly match the saved dispatch envelope.");
	}

	const arm = parseNonEmptyString(run.arm, "run.arm");

	if (arm !== dispatch.arm) {
		throw new Error("run.arm must exactly match the saved dispatch envelope.");
	}

	if (parseNonEmptyString(run.scenarioId, "run.scenarioId") !== dispatch.scenarioId) {
		throw new Error("run.scenarioId must exactly match the saved dispatch envelope.");
	}

	if (parsePositiveInteger(run.trial, "run.trial") !== dispatch.trial) {
		throw new Error("run.trial must exactly match the saved dispatch envelope.");
	}

	const runDigests = parseDigestRecord(run.generatedIndexDigests, "run.generatedIndexDigests");
	const dispatchDigestEntries = Object.entries(dispatch.generatedIndexDigests);
	const runDigestEntries = Object.entries(runDigests);

	if (
		dispatchDigestEntries.length !== runDigestEntries.length ||
		dispatchDigestEntries.some(
			([skillName, digest], index) => runDigestEntries[index]?.[0] !== skillName || runDigestEntries[index]?.[1] !== digest,
		)
	) {
		throw new Error("run.generatedIndexDigests must exactly match the saved dispatch envelope.");
	}

	const snapshots = new Map<string, SkillRoutingSnapshot>();

	for (const [skillName, expectedDigest] of dispatchDigestEntries) {
		const snapshot = await readSkillRoutingSnapshot(skillName, skillRootDir);

		if (snapshot.digest !== expectedDigest) {
			throw new Error(`dispatch digest for "${skillName}" must match the current routing digest.`);
		}

		snapshots.set(skillName, snapshot);
	}

	if (arm === "no-skill") {
		if (run.routingTrace !== null) {
			throw new Error("no-skill arm requires routingTrace to be null.");
		}

		if (run.driftReceipt !== null) {
			throw new Error("no-skill arm requires driftReceipt to be null.");
		}

		if (parseStringArray(run.activatedSkills, "run.activatedSkills").length > 0) {
			throw new Error("no-skill arm must not activate convention skills.");
		}

		if (!Array.isArray(run.receipts) || run.receipts.length > 0) {
			throw new Error("no-skill arm must use an empty receipts array.");
		}

		if (parseDeclaredLoadedFiles(run.declaredLoadedFiles).length > 0) {
			throw new Error("no-skill arm must declare an empty loaded-file context.");
		}

		assertCompletion(run);
		return;
	}

	if (arm === "mutation") {
		if (run.routingTrace !== null) {
			throw new Error("mutation arm requires routingTrace to be null and uses an independent audit receipt.");
		}

		if (run.driftReceipt !== null) {
			throw new Error("mutation arm requires driftReceipt to be null.");
		}

		if (dispatch.scenarioId !== "RTE08-mutation-selected-to-na") {
			throw new Error("mutation arm currently requires the sealed RTE08 selected-to-N/A scenario.");
		}

		const finalPass = createReceiptBackedPass(run);
		const mutationTrace: RoutingTrace = {passes: [finalPass], stablePair: [1, 1], stable: false};

		for (const skillName of finalPass.activatedSkills) {
			if (!snapshots.has(skillName)) {
				throw new Error(`Activated skill "${skillName}" must be bound in dispatch generatedIndexDigests.`);
			}
		}

		assertTracePartitions(mutationTrace, snapshots);
		assertRequiredSkillClosure(finalPass, snapshots);
		assertMandatoryRuleClosure(finalPass, snapshots);
		const expandedBySkill = assertFinalReceipts({run, arm, finalPass, snapshots});

		if (!(finalPass.selected.react ?? []).includes("events-run-user-actions-in-handlers-not-effects")) {
			throw new Error("Mutation audit must not leave disputed React R26 in N/A; auditor receipt must select it.");
		}

		await assertDeclaredLoads({run, arm, trace: mutationTrace, finalPass, snapshots, expandedBySkill, skillRootDir});

		assertMutationCompletionAccounting(run);
		assertCompletion(run, finalPass);

		return;
	}

	if (arm !== "progressive" && arm !== "full-handbook") {
		throw new Error(`Unsupported behavioral arm "${arm}".`);
	}

	const initialEpisode = validateCandidateRoutingEpisode({episode: run, arm, snapshots});
	let completionEpisode = initialEpisode;

	if (dispatch.scenarioId === "RTE02-owner-placement-css-drift") {
		const driftReceipt = assertJsonObject(run.driftReceipt, "run.driftReceipt");
		assertExactKeys({value: driftReceipt, expectedKeys: ["routingTrace", "activatedSkills", "receipts"], label: "run.driftReceipt"});
		const driftEpisode = validateCandidateRoutingEpisode({episode: driftReceipt, arm, snapshots});
		assertScopeDriftMonotonic(initialEpisode.finalPass, driftEpisode.finalPass);
		completionEpisode = driftEpisode;
	} else if (run.driftReceipt !== null) {
		throw new Error("run.driftReceipt must be null when the scenario has no replacement-final scope drift.");
	}

	await assertDeclaredLoads({
		run,
		arm,
		trace: completionEpisode.trace,
		finalPass: completionEpisode.finalPass,
		snapshots,
		expandedBySkill: completionEpisode.expandedBySkill,
		skillRootDir,
	});
	assertCompletion(run, completionEpisode.finalPass);
};
