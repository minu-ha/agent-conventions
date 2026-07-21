import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {mkdir, mkdtemp, readFile, readdir, realpath, rm, unlink, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {promisify} from "node:util";

import {mergeBehavioralEvalChildPayload} from "./behavioral-eval-coordinator.js";
import {finalizeStagedBehavioralRun} from "./behavioral-eval-staging.js";

/** @summary semantic audit에서 사용하는 SHA-256 commitment */
export interface SemanticAuditCriteriaCommitment {
	/** @field commitment schema version */
	schemaVersion: 1;
	/** @field semantic audit protocol ID */
	protocolId: "behavioral-semantic-audit-v1";
	/** @field criteria reveal의 stable set ID */
	criteriaSetId: string;
	/** @field criteria reveal raw UTF-8 bytes SHA-256 */
	criteriaSha256: string;
	/** @field criteria reveal raw UTF-8 byte length */
	criteriaByteLength: number;
}

/** @summary blinded request에 공개하는 최소 criteria raw binding */
export interface SemanticAuditReviewerCriteriaCommitment {
	/** @field criteria reveal raw UTF-8 bytes SHA-256 */
	criteriaSha256: string;
	/** @field criteria reveal raw UTF-8 byte length */
	criteriaByteLength: number;
}

/** @summary criteria commitment 저장 입력 */
export interface CommitBehavioralSemanticAuditCriteriaArgs {
	/** @field reveal 전 원본 criteria JSON 경로 */
	criteriaPath: string;
	/** @field criteria raw commitment를 저장할 경로 */
	commitmentPath: string;
	/** @field current rules와 routing oracle을 읽을 skill root */
	skillRootDir: string;
	/** @field public before virtual files를 제공하는 bound behavioral protocol */
	publicProtocolPath: string;
}

/** @summary 저장된 criteria commitment 결과 */
export interface CommittedBehavioralSemanticAuditCriteria {
	/** @field 저장된 commitment 경로 */
	commitmentPath: string;
	/** @field strict validation을 통과한 commitment */
	commitment: SemanticAuditCriteriaCommitment;
}

/** @summary present/absent state를 보존하는 public virtual patch file */
export interface SemanticAuditVirtualPatchFile {
	/** @field repository-relative artifact path */
	path: string;
	/** @field 변경 전 file 존재 상태 */
	beforeState: "present" | "absent";
	/** @field 변경 전 raw content SHA-256 또는 absent의 null */
	beforeSha256: string | null;
	/** @field 변경 후 file 존재 상태 */
	afterState: "present" | "absent";
	/** @field 변경 후 exact UTF-8 content 또는 absent의 null */
	after: string | null;
	/** @field 변경 후 raw content SHA-256 또는 absent의 null */
	afterSha256: string | null;
}

/** @summary reviewer에게 공개할 current virtual patch schema */
export interface SemanticAuditVirtualPatch {
	/** @field 변경 전후 state가 포함된 file patch 목록 */
	files: SemanticAuditVirtualPatchFile[];
	/** @field child 작성 요약이며 reviewer request에는 공개하지 않는 값 */
	summary: string;
}

/** @summary semantic criterion reveal */
export interface SemanticAuditCriterion {
	/** @field scenario 안에서 고유한 criterion ID */
	id: string;
	/** @field initial/final/process 판정 stage */
	stage: string;
	/** @field current expected Selected에 속해야 하는 qualified rule refs */
	ruleRefs: string[];
	/** @field 독립 reviewer가 판정할 semantic requirement */
	requirement: string;
	/** @field evidence가 다뤄야 하는 repository-relative paths */
	evidencePaths: string[];
	/** @field PASS에 필요한 관찰 */
	requiredObservations: string[];
	/** @field 존재하면 FAIL인 관찰 */
	forbiddenObservations: string[];
	/** @field criterion별 quote/absence evidence policy */
	evidencePolicy: string;
}

/** @summary semantic 판정 대신 process gate로만 확인하는 expected ruleRef */
export interface SemanticAuditProcessOnlyRuleRef {
	/** @field current expected Selected qualified ruleRef */
	ruleRef: string;
	/** @field semantic artifact criterion에서 제외하는 non-empty reason */
	reason: string;
}

/** @summary scenario별 blinded negative control reveal */
export interface SemanticAuditNegativeControl {
	/** @field reviewer가 반드시 FAIL해야 하는 criterion ID */
	targetCriterionId: string;
	/** @field 지정 criterion을 의도적으로 위반한 public virtual patch */
	virtualPatch: SemanticAuditVirtualPatch;
}

/** @summary 한 scenario의 semantic criteria reveal */
export interface SemanticAuditScenarioCriteria {
	/** @field routing oracle와 candidate run이 공유하는 scenario ID */
	scenarioId: string;
	/** @field normalized public fixture scenario canonical SHA-256 */
	publicFixtureScenarioSha256: string;
	/** @field reviewer가 exact once로 판정할 criteria */
	criteria: SemanticAuditCriterion[];
	/** @field expected Selected이지만 artifact semantic criterion이 아닌 refs */
	processOnlyRuleRefs: SemanticAuditProcessOnlyRuleRef[];
	/** @field batch blindness와 reviewer calibration을 검증할 negative control */
	negativeControl: SemanticAuditNegativeControl;
}

/** @summary raw commitment 대상 semantic criteria reveal */
export interface SemanticAuditCriteriaReveal {
	/** @field criteria reveal schema version */
	schemaVersion: 1;
	/** @field criteria set stable ID */
	criteriaSetId: string;
	/** @field candidate source committed repository HEAD */
	repositoryHead: string;
	/** @field criteria가 사용한 current generated routing digests */
	generatedIndexDigests: Record<string, string>;
	/** @field normalized 8-scenario public fixture set canonical SHA-256 */
	publicFixtureSetSha256: string;
	/** @field verdict/evidence/process/control policy */
	rubric: SemanticAuditRubric;
	/** @field 정확히 8개 eligible scenario의 criteria */
	scenarios: SemanticAuditScenarioCriteria[];
	/** @field criteria seal authoring provenance */
	authoringProvenance: SemanticAuditAuthoringProvenance;
}

/** @summary criteria reviewer policy reveal */
export interface SemanticAuditRubric {
	/** @field 허용 reviewer verdicts */
	verdicts: ["PASS", "FAIL", "UNKNOWN"];
	/** @field artifact quote/path evidence policy */
	evidencePolicy: string;
	/** @field process-only ruleRef policy */
	processOnlyPolicy: string;
	/** @field blinded negative-control policy */
	negativeControlPolicy: string;
}

/** @summary criteria commitment authoring provenance */
export interface SemanticAuditAuthoringProvenance {
	/** @field criteria authoring UTC timestamp */
	authoredAtUtc: string;
	/** @field source behavioral protocol repository-relative path */
	publicProtocolPath: string;
	/** @field raw seal policy */
	sealPolicy: string;
}

/** @summary behavioral protocol에서 normalize한 public before file */
export interface SemanticAuditPublicVirtualFile {
	/** @field repository-relative public fixture path */
	path: string;
	/** @field public before file 존재 상태 */
	state: "present" | "absent";
	/** @field exact public before UTF-8 content 또는 absent의 null */
	content: string | null;
	/** @field exact public before raw SHA-256 또는 absent의 null */
	sha256: string | null;
}

/** @summary one scenario의 normalized public before fixture */
export interface SemanticAuditPublicFixtureScenario {
	/** @field source scenario ID */
	scenarioId: string;
	/** @field protocol에서 공개된 exact virtual files */
	virtualFiles: SemanticAuditPublicVirtualFile[];
}

/** @summary 8개 mixed scenario의 normalized public fixture set */
export interface SemanticAuditPublicFixtureSet {
	/** @field normalized fixture schema version */
	schemaVersion: 1;
	/** @field normalized fixture set stable ID */
	fixtureSetId: "progressive-loading-public-virtual-fixtures-v1";
	/** @field scenario ID 순으로 정렬한 public fixtures */
	scenarios: SemanticAuditPublicFixtureScenario[];
}

/** @summary matrix 안의 immutable sample binding */
export interface SemanticAuditMatrixSample {
	/** @field reviewer에게 공개하는 deterministic opaque sample ID */
	sampleId: string;
	/** @field candidate 또는 blinded negative control 구분 */
	kind: "candidate" | "negative-control";
	/** @field coordinator만 보유하는 source scenario ID */
	scenarioId: string;
	/** @field semantic task text */
	task: string;
	/** @field public present/absent virtual patch */
	virtualPatch: SemanticAuditVirtualPatch;
	/** @field candidate run 절대 경로 또는 negative control의 null */
	candidateRunPath: string | null;
	/** @field candidate run raw bytes SHA-256 또는 negative control의 null */
	candidateRunSha256: string | null;
	/** @field candidate run 안 virtualPatch exact raw JSON bytes SHA-256 */
	virtualPatchRawSha256: string;
	/** @field negative control의 target criterion 또는 candidate의 null */
	targetCriterionId: string | null;
}

/** @summary scenario 하나를 감춘 reviewer batch */
export interface SemanticAuditMatrixBatch {
	/** @field deterministic opaque batch ID */
	batchId: string;
	/** @field coordinator만 보유하는 source scenario ID */
	scenarioId: string;
	/** @field deterministic shuffle가 적용된 candidate와 negative control */
	samples: SemanticAuditMatrixSample[];
}

/** @summary 34/8/8 semantic application audit matrix */
export interface BehavioralSemanticAuditMatrix {
	/** @field matrix schema version */
	schemaVersion: 1;
	/** @field semantic audit protocol ID */
	protocolId: "behavioral-semantic-audit-v1";
	/** @field criteria raw commitment과 reveal binding */
	criteria: SemanticAuditCriteriaBinding;
	/** @field source protocol와 normalized public fixture binding */
	publicFixtures: SemanticAuditPublicFixtureBinding;
	/** @field current rule source root */
	skillRootDir: string;
	/** @field immutable candidate run directory */
	candidateRunsDir: string;
	/** @field eligible candidate sample count */
	candidateCount: 34;
	/** @field scenario-isolated blind batch count */
	batchCount: 8;
	/** @field blind batch별 negative control count */
	negativeControlCount: 8;
	/** @field deterministic scenario batches */
	batches: SemanticAuditMatrixBatch[];
}

/** @summary criteria commitment/reveal file binding */
export interface SemanticAuditCriteriaBinding {
	/** @field commitment file 절대 경로 */
	commitmentPath: string;
	/** @field commitment file raw SHA-256 */
	commitmentSha256: string;
	/** @field reveal file 절대 경로 */
	criteriaPath: string;
	/** @field reveal raw SHA-256 */
	criteriaSha256: string;
	/** @field reveal raw UTF-8 byte length */
	criteriaByteLength: number;
}

/** @summary semantic matrix 생성 입력 */
export interface CreateBehavioralSemanticAuditMatrixArgs {
	/** @field criteria reveal JSON 경로 */
	criteriaPath: string;
	/** @field reveal 전에 저장한 raw commitment 경로 */
	commitmentPath: string;
	/** @field merged behavioral candidate run directory */
	candidateRunsDir: string;
	/** @field current rules와 routing oracle을 읽을 skill root */
	skillRootDir: string;
	/** @field mixed scenario public before files를 제공하는 protocol */
	publicProtocolPath: string;
}

/** @summary semantic matrix 저장 입력 */
export interface WriteBehavioralSemanticAuditMatrixArgs extends CreateBehavioralSemanticAuditMatrixArgs {
	/** @field deterministic matrix JSON 저장 경로 */
	matrixPath: string;
}

/** @summary 저장된 semantic matrix */
export interface WrittenBehavioralSemanticAuditMatrix {
	/** @field no-overwrite로 저장된 matrix 경로 */
	matrixPath: string;
	/** @field matrix raw SHA-256 */
	matrixSha256: string;
	/** @field strict 생성된 matrix */
	matrix: BehavioralSemanticAuditMatrix;
}

/** @summary reviewer에게 공개하는 current rule source */
export interface SemanticAuditRuleReference {
	/** @field qualified current rule reference */
	ref: string;
	/** @field current full rule source exact UTF-8 content */
	content: string;
	/** @field current full rule raw SHA-256 */
	sha256: string;
}

/** @summary reviewer가 검사할 after-state artifact */
export interface SemanticAuditArtifactState {
	/** @field file 존재 상태 */
	state: "present" | "absent";
	/** @field exact UTF-8 content 또는 absent의 null */
	content: string | null;
	/** @field exact raw SHA-256 또는 absent의 null */
	sha256: string | null;
}

/** @summary reviewer가 비교할 before/after artifact */
export interface SemanticAuditArtifact {
	/** @field repository-relative artifact path */
	path: string;
	/** @field public protocol에서 bind한 변경 전 state/content */
	before: SemanticAuditArtifactState;
	/** @field candidate virtualPatch에서 bind한 변경 후 state/content */
	after: SemanticAuditArtifactState;
}

/** @summary blinded reviewer request sample */
export interface SemanticAuditReviewerSample {
	/** @field opaque sample ID */
	sampleId: string;
	/** @field scenario identity를 포함하지 않는 semantic task */
	task: string;
	/** @field exact once로 판정할 committed criteria */
	criteria: SemanticAuditCriterion[];
	/** @field criteria가 참조한 current rule source */
	ruleReferences: SemanticAuditRuleReference[];
	/** @field reviewer가 quote와 absence를 확인할 after artifacts */
	artifacts: SemanticAuditArtifact[];
}

/** @summary oracle와 child self verdict를 제거한 blind reviewer request */
export interface SemanticAuditReviewerRequest {
	/** @field reviewer request schema version */
	schemaVersion: 1;
	/** @field semantic audit protocol ID */
	protocolId: "behavioral-semantic-audit-v1";
	/** @field opaque batch ID */
	batchId: string;
	/** @field revealed criteria가 사전 commitment와 일치함을 보여주는 raw binding */
	criteriaCommitment: SemanticAuditReviewerCriteriaCommitment;
	/** @field deterministic shuffle된 blind samples */
	samples: SemanticAuditReviewerSample[];
	/** @field reviewer payload evidence 계약 */
	evidenceContract: string;
	/** @field reviewer가 작성할 strict payload의 exact nested schema */
	reviewerPayloadContract: Record<string, unknown>;
	/** @field reviewer가 단독 작성할 payload 절대 경로 */
	assignedReviewerPayloadPath: string;
}

/** @summary envelope 안의 coordinator-only sample binding */
export interface SemanticAuditSampleBinding {
	/** @field opaque reviewer sample ID */
	sampleId: string;
	/** @field candidate 또는 negative control */
	kind: "candidate" | "negative-control";
	/** @field sealed source scenario ID */
	scenarioId: string;
	/** @field candidate run 절대 경로 또는 negative control의 null */
	candidateRunPath: string | null;
	/** @field candidate run raw SHA-256 또는 negative control의 null */
	candidateRunSha256: string | null;
	/** @field exact virtualPatch raw SHA-256 */
	virtualPatchRawSha256: string;
	/** @field negative control designated criterion 또는 candidate의 null */
	targetCriterionId: string | null;
}

/** @summary reviewer request와 immutable source를 묶는 coordinator envelope */
export interface SemanticAuditReviewerEnvelope {
	/** @field envelope schema version */
	schemaVersion: 1;
	/** @field semantic audit protocol ID */
	protocolId: "behavioral-semantic-audit-v1";
	/** @field opaque batch ID */
	batchId: string;
	/** @field matrix file path/raw digest/byte binding */
	matrix: SemanticAuditFileBinding;
	/** @field criteria commitment/reveal binding */
	criteria: SemanticAuditCriteriaBinding;
	/** @field public protocol와 normalized fixture binding */
	publicFixtures: SemanticAuditPublicFixtureBinding;
	/** @field current rule source root */
	skillRootDir: string;
	/** @field exact reviewer request file binding */
	request: SemanticAuditFileBinding;
	/** @field reviewer에게 byte-for-byte 전달할 prompt */
	exactPrompt: string;
	/** @field exact prompt raw SHA-256 */
	promptSha256: string;
	/** @field exact prompt UTF-8 byte length */
	promptByteLength: number;
	/** @field prompt renderer version */
	promptRendererVersion: "semantic-reviewer-dispatch-v1";
	/** @field reviewer에게 단독 할당한 payload 경로 */
	reviewerPayloadPath: string;
	/** @field merged result 저장 예정 경로 */
	resultPath: string;
	/** @field coordinator-only sample source bindings */
	sampleBindings: SemanticAuditSampleBinding[];
}

/** @summary raw file path/hash/length binding */
export interface SemanticAuditFileBinding {
	/** @field bound absolute file path */
	path: string;
	/** @field raw file bytes SHA-256 */
	sha256: string;
	/** @field raw UTF-8 byte length */
	byteLength: number;
}

/** @summary source protocol와 normalized fixture hashes */
export interface SemanticAuditPublicFixtureBinding extends SemanticAuditFileBinding {
	/** @field normalized fixture-set canonical SHA-256 */
	fixtureSetSha256: string;
}

/** @summary blind reviewer batch 준비 입력 */
export interface PrepareBehavioralSemanticAuditBatchArgs {
	/** @field committed semantic matrix 경로 */
	matrixPath: string;
	/** @field 준비할 opaque batch ID */
	batchId: string;
	/** @field request/envelope/payload를 배치할 output directory */
	outputDir: string;
	/** @field current rules를 recheck할 skill root */
	skillRootDir: string;
	/** @field matrix와 exact match해야 하는 public protocol path */
	publicProtocolPath: string;
}

/** @summary no-overwrite로 준비된 blind reviewer dispatch */
export interface PreparedBehavioralSemanticAuditBatch {
	/** @field byte-for-byte reviewer dispatch prompt */
	exactPrompt: string;
	/** @field exact prompt SHA-256 */
	promptSha256: string;
	/** @field exact request SHA-256 */
	requestSha256: string;
	/** @field exact envelope SHA-256 */
	envelopeSha256: string;
	/** @field saved reviewer request path */
	requestPath: string;
	/** @field saved coordinator envelope path */
	envelopePath: string;
	/** @field reviewer에게 단독 할당한 payload path */
	reviewerPayloadPath: string;
	/** @field merge가 저장할 result path */
	resultPath: string;
}

/** @summary reviewer artifact quote evidence */
export interface SemanticAuditQuoteEvidence {
	/** @field quote evidence discriminator */
	kind: "quote";
	/** @field reviewer request artifact path */
	path: string;
	/** @field quote를 확인할 before 또는 after artifact state */
	state: "before" | "after";
	/** @field artifact에 실제 존재해야 하는 non-empty substring */
	quote: string;
	/** @field artifact 안 quote의 정확한 non-overlapping occurrence count */
	occurrence: number;
}

/** @summary reviewer artifact absence evidence */
export interface SemanticAuditAbsenceEvidence {
	/** @field absence evidence discriminator */
	kind: "absence";
	/** @field reviewer request artifact path */
	path: string;
	/** @field absence를 확인할 before 또는 after artifact state */
	state: "before" | "after";
	/** @field artifact에 존재하지 않아야 하는 non-empty substring */
	needle: string;
}

/** @summary 검증 가능한 reviewer artifact evidence */
export type SemanticAuditEvidence = SemanticAuditQuoteEvidence | SemanticAuditAbsenceEvidence;

/** @summary reviewer의 criterion-level 독립 판정 */
export interface SemanticAuditCriterionReview {
	/** @field committed criterion ID */
	criterionId: string;
	/** @field independent PASS, FAIL, UNKNOWN verdict */
	verdict: "PASS" | "FAIL" | "UNKNOWN";
	/** @field verdict의 non-empty reviewer reason */
	reason: string;
	/** @field request artifact에 대해 기계 검증할 quote/absence evidence */
	evidence: SemanticAuditEvidence[];
}

/** @summary 한 blind sample의 reviewer 판정 */
export interface SemanticAuditSampleReview {
	/** @field opaque request sample ID */
	sampleId: string;
	/** @field request criteria와 exact once로 대응하는 reviews */
	criteria: SemanticAuditCriterionReview[];
}

/** @summary reviewer가 단독 작성하는 strict payload */
export interface SemanticAuditReviewerPayload {
	/** @field reviewer payload schema version */
	schemaVersion: 1;
	/** @field opaque request batch ID */
	batchId: string;
	/** @field request samples와 exact once로 대응하는 reviews */
	reviews: SemanticAuditSampleReview[];
	/** @field 독립 판정의 공개 limitations */
	limitations: string[];
}

/** @summary derived overall이 포함된 merged sample result */
export interface SemanticAuditMergedSampleReview extends SemanticAuditSampleReview {
	/** @field candidate 또는 negative control */
	kind: "candidate" | "negative-control";
	/** @field criterion verdict에서 강제로 파생한 overall */
	overall: "PASS" | "FAIL" | "UNKNOWN";
}

/** @summary one batch의 independently merged semantic result */
export interface BehavioralSemanticAuditBatchResult {
	/** @field result schema version */
	schemaVersion: 1;
	/** @field semantic audit protocol ID */
	protocolId: "behavioral-semantic-audit-v1";
	/** @field opaque batch ID */
	batchId: string;
	/** @field source matrix raw SHA-256 */
	matrixSha256: string;
	/** @field exact reviewer request SHA-256 */
	requestSha256: string;
	/** @field exact coordinator envelope SHA-256 */
	envelopeSha256: string;
	/** @field exact dispatch prompt SHA-256 */
	promptSha256: string;
	/** @field exact reviewer payload SHA-256 */
	reviewerPayloadSha256: string;
	/** @field aggregate가 원본을 재검증할 coordinator envelope 절대 경로 */
	envelopePath: string;
	/** @field aggregate가 원본을 재검증할 reviewer payload 절대 경로 */
	reviewerPayloadPath: string;
	/** @field reviewer verdict에서 파생한 exact sample results */
	samples: SemanticAuditMergedSampleReview[];
	/** @field candidate sample만으로 파생한 batch overall */
	batchOverall: "PASS" | "FAIL" | "UNKNOWN";
	/** @field designated criterion과 overall이 모두 FAIL인 calibration 결과 */
	negativeControlCaught: true;
	/** @field reviewer payload limitations */
	limitations: string[];
}

/** @summary reviewer payload merge 입력 */
export interface MergeBehavioralSemanticAuditReviewerPayloadArgs {
	/** @field prepared coordinator envelope 경로 */
	envelopePath: string;
	/** @field assigned reviewer payload 경로 */
	reviewerPayloadPath: string;
	/** @field merged result directory */
	outputDir: string;
	/** @field current rules를 immutable recheck할 skill root */
	skillRootDir: string;
	/** @field envelope와 exact match해야 하는 public protocol path */
	publicProtocolPath: string;
}

/** @summary reviewer payload merge 결과 */
export interface MergedBehavioralSemanticAuditReviewerPayload {
	/** @field no-overwrite로 저장한 batch result path */
	resultPath: string;
	/** @field independently derived batch result */
	result: BehavioralSemanticAuditBatchResult;
}

/** @summary 34/8/8 independent semantic aggregate */
export interface BehavioralSemanticAuditAggregate {
	/** @field aggregate schema version */
	schemaVersion: 1;
	/** @field semantic audit protocol ID */
	protocolId: "behavioral-semantic-audit-v1";
	/** @field source matrix raw SHA-256 */
	matrixSha256: string;
	/** @field exact candidate sample count */
	candidateCount: 34;
	/** @field exact scenario-isolated batch count */
	batchCount: 8;
	/** @field exact negative control count */
	negativeControlCount: 8;
	/** @field independent PASS candidate count */
	candidatePassCount: number;
	/** @field independent FAIL candidate count */
	candidateFailCount: number;
	/** @field independent UNKNOWN candidate count */
	candidateUnknownCount: number;
	/** @field designated FAIL과 overall FAIL을 만족한 controls */
	negativeControlsCaught: number;
	/** @field 34/8/8, FAIL 0, UNKNOWN 0, controls 8 gate */
	gatePassed: boolean;
}

/** @summary semantic result aggregate 입력 */
export interface AggregateBehavioralSemanticAuditResultsArgs {
	/** @field committed semantic matrix path */
	matrixPath: string;
	/** @field 8개 merged batch result directory */
	resultsDir: string;
	/** @field current rules와 candidate source를 immutable recheck할 skill root */
	skillRootDir: string;
	/** @field matrix와 exact match해야 하는 public protocol path */
	publicProtocolPath: string;
}

/** @summary JSON read result with raw bytes */
interface JsonReadResult {
	/** @field parsed plain JSON object */
	value: JsonObject;
	/** @field exact UTF-8 file content */
	raw: string;
}

/** @summary current rule source binding */
interface CurrentRuleBinding extends SemanticAuditRuleReference {
	/** @field rule file absolute path */
	path: string;
}

/** @summary validated criteria with current rule bodies */
interface ValidatedCriteria {
	/** @field strict parsed criteria reveal */
	reveal: SemanticAuditCriteriaReveal;
	/** @field current qualified rule reference map */
	rulesByRef: Map<string, CurrentRuleBinding>;
	/** @field protocol에서 normalize하고 criteria hashes와 대조한 public fixtures */
	publicFixtureSet: SemanticAuditPublicFixtureSet;
	/** @field source public protocol raw bytes */
	publicProtocolRaw: string;
	/** @field protocol repository.sourceHead */
	protocolSourceHead: string;
	/** @field protocol generatedIndexes exact digests */
	protocolGeneratedIndexDigests: Record<string, string>;
	/** @field protocol에 사전 봉인된 criteria raw SHA-256 */
	sealedCriteriaSha256: string;
	/** @field protocol mixed matrix의 exact 34 candidate run IDs */
	expectedCandidateRunIds: string[];
	/** @field public base prompt와 optional scope drift로 합성한 final reviewer tasks */
	reviewTasksByScenario: Map<string, string>;
	/** @field public protocol의 coordinator candidate base prompts */
	candidatePromptsByScenario: Map<string, string>;
	/** @field protocol scenario objects의 canonical SHA-256 */
	scenarioSha256ByScenario: Map<string, string>;
	/** @field protocol arm objects의 canonical SHA-256 */
	armSha256ByArm: Map<string, string>;
}

/** @summary public protocol에서 독립적으로 파싱한 semantic audit bindings */
interface PublicSemanticAuditBindings {
	/** @field normalized public fixture set */
	fixtureSet: SemanticAuditPublicFixtureSet;
	/** @field exact protocol raw UTF-8 bytes */
	protocolRaw: string;
	/** @field protocol repository.sourceHead */
	sourceHead: string;
	/** @field protocol generatedIndexes exact digests */
	generatedIndexDigests: Record<string, string>;
	/** @field protocol semanticAudit.criteriaCommitmentSha256 */
	sealedCriteriaSha256: string;
	/** @field mixed matrix에서 파생한 exact candidate run IDs */
	expectedCandidateRunIds: string[];
	/** @field scenario별 final semantic reviewer task */
	reviewTasksByScenario: Map<string, string>;
	/** @field scenario별 coordinator candidate base prompt */
	candidatePromptsByScenario: Map<string, string>;
	/** @field protocol scenario objects의 canonical SHA-256 */
	scenarioSha256ByScenario: Map<string, string>;
	/** @field protocol arm objects의 canonical SHA-256 */
	armSha256ByArm: Map<string, string>;
}

/** @summary canonical repository와 clean source binding */
interface SemanticAuditSourceBinding {
	/** @field Git top-level canonical real path */
	repositoryDir: string;
	/** @field repositoryDir/skill canonical real path */
	skillRootDir: string;
	/** @field clean source의 current committed HEAD */
	repositoryHead: string;
}

/** @summary eligible candidate run source */
interface CandidateRunSource {
	/** @field strict behavioral validator와 scorer 입력이 되는 parsed run */
	source: JsonObject;
	/** @field immutable run ID */
	runId: string;
	/** @field internal experiment arm */
	arm: "full-handbook" | "progressive";
	/** @field source scenario ID */
	scenarioId: string;
	/** @field source trial number */
	trial: number;
	/** @field candidate run committed repository HEAD */
	repositoryHead: string;
	/** @field reviewer task */
	task: string;
	/** @field current public virtual patch */
	virtualPatch: SemanticAuditVirtualPatch;
	/** @field run file absolute path */
	path: string;
	/** @field run exact raw UTF-8 bytes */
	raw: string;
	/** @field run raw bytes SHA-256 */
	sha256: string;
	/** @field top-level virtualPatch exact raw JSON */
	virtualPatchRaw: string;
	/** @field top-level virtualPatch exact raw SHA-256 */
	virtualPatchRawSha256: string;
}

/** @summary generated reviewer artifact paths */
interface SemanticAuditBatchPaths {
	/** @field reviewer request path */
	requestPath: string;
	/** @field coordinator envelope path */
	envelopePath: string;
	/** @field assigned reviewer payload path */
	reviewerPayloadPath: string;
	/** @field merged result path */
	resultPath: string;
}

/** @summary deterministic batch artifacts before persistence */
interface SemanticAuditBatchArtifacts extends SemanticAuditBatchPaths {
	/** @field parsed blind request */
	request: SemanticAuditReviewerRequest;
	/** @field deterministic request raw JSON */
	requestRaw: string;
	/** @field parsed coordinator envelope */
	envelope: SemanticAuditReviewerEnvelope;
	/** @field deterministic envelope raw JSON */
	envelopeRaw: string;
	/** @field exact reviewer dispatch prompt */
	exactPrompt: string;
}

/** @summary deterministic batch artifacts 생성 입력 */
interface CreateSemanticAuditBatchArtifactsArgs {
	/** @field matrix file path */
	matrixPath: string;
	/** @field strict current matrix */
	matrix: BehavioralSemanticAuditMatrix;
	/** @field matrix exact raw content */
	matrixRaw: string;
	/** @field opaque batch ID */
	batchId: string;
	/** @field artifact output directory */
	outputDir: string;
	/** @field current skill root */
	skillRootDir: string;
	/** @field public before fixtures의 bound protocol */
	publicProtocolPath: string;
}

/** @summary exact object key validation 입력 */
interface AssertExactKeysArgs {
	/** @field plain JSON object */
	value: JsonObject;
	/** @field 허용하는 exact keys */
	expectedKeys: string[];
	/** @field 오류 메시지 label */
	label: string;
}

/** @summary public before binding 검증 입력 */
interface AssertPatchBeforeBindingArgs {
	/** @field candidate 또는 negative-control virtual patch */
	virtualPatch: SemanticAuditVirtualPatch;
	/** @field protocol에서 normalize한 public before fixture */
	publicFixture: SemanticAuditPublicFixtureScenario;
	/** @field 오류 메시지 source label */
	label: string;
}

/** @summary rich criteria 검증 입력 */
interface ValidateCriteriaArgs {
	/** @field parsed criteria reveal */
	value: unknown;
	/** @field current full rule source root */
	skillRootDir: string;
	/** @field public virtual fixtures를 제공하는 protocol path */
	publicProtocolPath: string;
}

/** @summary persisted matrix current recheck 입력 */
interface ReadCurrentMatrixArgs {
	/** @field persisted matrix path */
	matrixPath: string;
	/** @field current full rule source root */
	skillRootDir: string;
	/** @field current public protocol path */
	publicProtocolPath: string;
}

/** @summary exact reviewer dispatch 생성 입력 */
interface CreateReviewerDispatchArgs {
	/** @field saved blind request path */
	requestPath: string;
	/** @field saved blind request raw SHA-256 */
	requestSha256: string;
	/** @field reviewer에게 단독 할당한 payload path */
	reviewerPayloadPath: string;
}

/** @summary strict reviewer payload parser 입력 */
interface ParseReviewerPayloadArgs {
	/** @field parsed reviewer-owned payload */
	value: unknown;
	/** @field exact blind reviewer request */
	request: SemanticAuditReviewerRequest;
	/** @field coordinator-only sample bindings */
	envelope: SemanticAuditReviewerEnvelope;
}

/** @summary envelope artifacts immutable 재생성 입력 */
interface RecreateEnvelopeArtifactsArgs {
	/** @field persisted reviewer envelope path */
	envelopePath: string;
	/** @field current full rule source root */
	skillRootDir: string;
	/** @field current public protocol path */
	publicProtocolPath: string;
}

/** @summary candidate merged run 독립 재검증 입력 */
interface ValidateCandidateRunArgs {
	/** @field parsed immutable candidate source */
	candidate: CandidateRunSource;
	/** @field public protocol/current source와 검증한 criteria context */
	validatedCriteria: ValidatedCriteria;
	/** @field current canonical skill root */
	skillRootDir: string;
	/** @field canonical bound public protocol path */
	publicProtocolPath: string;
}

/** @summary replay envelope의 canonical source/protocol/dispatch binding 입력 */
interface AssertCandidateEnvelopeBindingArgs {
	/** @field regular 또는 staged initial envelope path */
	envelopePath: string;
	/** @field envelope와 exact match해야 하는 candidate */
	candidate: CandidateRunSource;
	/** @field canonical public protocol path */
	publicProtocolPath: string;
	/** @field canonical current skill root */
	skillRootDir: string;
}

/** @summary deterministic candidate artifact directory 검증 입력 */
interface ReadCandidateArtifactSetFingerprintArgs {
	/** @field exact 34 parsed candidates */
	candidates: CandidateRunSource[];
	/** @field coordinator/staging artifact root */
	candidateRunsDir: string;
}

/** @summary 검증된 원본 artifact에서 batch result를 재계산하는 입력 */
interface DeriveBehavioralSemanticAuditBatchResultArgs {
	/** @field exact recreated batch artifacts */
	artifacts: SemanticAuditBatchArtifacts;
	/** @field exact envelope raw bytes */
	envelopeRaw: string;
	/** @field exact matrix raw bytes */
	matrixRaw: string;
	/** @field strict parsed reviewer payload */
	payload: SemanticAuditReviewerPayload;
	/** @field exact reviewer payload raw bytes */
	payloadRaw: string;
}

type JsonObject = Record<string, unknown>;

const protocolId = "behavioral-semantic-audit-v1" as const;
const sha256Pattern = /^sha256:[a-f0-9]{64}$/;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const qualifiedRuleRefPattern = /^([a-z0-9-]+)\/([a-z0-9][a-z0-9-]*)$/;
const forbiddenReviewerKeys = new Set(["arm", "runId", "trial", "receipts", "scoring", "semanticVerdicts", "completion"]);
const execFileAsync = promisify(execFile);
const replayedCandidateArtifactSets = new Map<string, string>();

/** @helper raw bytes SHA-256 */
const createSha256 = (value: string | Buffer): string => `sha256:${createHash("sha256").update(value).digest("hex")}`;

/** @helper JSON object key를 재귀적으로 정렬 */
const canonicalize = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}

	if (typeof value !== "object" || value === null) {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value as JsonObject)
			.sort(([left], [right]) => left.localeCompare(right, "en"))
			.map(([key, child]) => [key, canonicalize(child)]),
	);
};

/** @helper deterministic pretty JSON bytes */
const serializeJson = (value: unknown): string => `${JSON.stringify(canonicalize(value), null, 2)}\n`;

/** @helper recursively key-sorted compact JSON canonical SHA-256 */
const createCanonicalSha256 = (value: unknown): string => createSha256(JSON.stringify(canonicalize(value)));

/** @helper unknown value를 plain object로 제한 */
const asObject = (value: unknown, label: string): JsonObject => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`${label} must be an object.`);
	}

	return value as JsonObject;
};

/** @helper non-empty string validation */
const asString = (value: unknown, label: string): string => {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`${label} must be a non-empty string.`);
	}

	return value;
};

/** @helper positive integer validation */
const asPositiveInteger = (value: unknown, label: string): number => {
	if (!Number.isInteger(value) || Number(value) < 1) {
		throw new Error(`${label} must be a positive integer.`);
	}

	return Number(value);
};

/** @helper string array validation */
const asStringArray = (value: unknown, label: string): string[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${label} must be an array.`);
	}

	return value.map((item, index) => asString(item, `${label}[${index}]`));
};

/** @helper exact object schema validation */
const assertExactKeys = (args: AssertExactKeysArgs): void => {
	const actual = Object.keys(args.value).sort();
	const expected = [...args.expectedKeys].sort();

	if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
		throw new Error(`${args.label} must contain exactly keys: ${expected.join(", ")}.`);
	}
};

/** @helper duplicate string을 차단 */
const assertUniqueStrings = (values: string[], label: string): void => {
	const duplicate = values.find((value, index) => values.indexOf(value) !== index);

	if (duplicate) {
		throw new Error(`${label} must not contain duplicate "${duplicate}".`);
	}
};

/** @helper JSON object와 exact raw content 읽기 */
const readJsonObject = async (filePath: string, label: string): Promise<JsonReadResult> => {
	const raw = await readFile(filePath, "utf8");
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		throw new Error(`${label} must be valid JSON: ${(error as Error).message}`);
	}

	return {value: asObject(parsed, label), raw};
};

/** @helper no-overwrite artifact 저장 */
const writeNoOverwrite = async (filePath: string, raw: string): Promise<void> => {
	await mkdir(path.dirname(filePath), {recursive: true});

	try {
		await writeFile(filePath, raw, {encoding: "utf8", flag: "wx"});
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") {
			throw new Error(`Refusing to overwrite existing semantic audit artifact: ${filePath}`);
		}

		throw error;
	}
};

/** @helper public protocol virtual file strict validation */
const parsePublicVirtualFile = (value: unknown, label: string): SemanticAuditPublicVirtualFile => {
	const file = asObject(value, label);
	assertExactKeys({value: file, expectedKeys: ["path", "state", "content", "sha256"], label});
	const filePath = asString(file.path, `${label}.path`);
	const state = asString(file.state, `${label}.state`);

	if (path.isAbsolute(filePath) || filePath.split("/").includes("..")) {
		throw new Error(`${label}.path must be a safe repository-relative path.`);
	}

	if (state !== "present" && state !== "absent") throw new Error(`${label}.state must be present or absent.`);

	if (state === "present") {
		if (typeof file.content !== "string") throw new Error(`${label}.content must be a string when present.`);
		if (typeof file.sha256 !== "string" || file.sha256 !== createSha256(file.content)) {
			throw new Error(`${label}.sha256 must match exact public before content.`);
		}
	} else if (file.content !== null || file.sha256 !== null) {
		throw new Error(`${label}.content and sha256 must be null when absent.`);
	}

	return {path: filePath, state, content: file.content as string | null, sha256: file.sha256 as string | null};
};

/** @helper protocol mixed scenarios를 normalized fixtures와 immutable audit bindings로 변환 */
const readPublicFixtureSet = async (publicProtocolPath: string): Promise<PublicSemanticAuditBindings> => {
	const protocolResult = await readJsonObject(path.resolve(publicProtocolPath), "public behavioral protocol");
	const protocol = protocolResult.value;

	if (protocol.schemaVersion !== 3 || protocol.protocolId !== "progressive-loading-behavioral-v3") {
		throw new Error("public behavioral protocol must be progressive-loading-behavioral-v3 schemaVersion 3.");
	}
	const repository = asObject(protocol.repository, "public behavioral protocol.repository");
	const sourceHead = asString(repository.sourceHead, "public behavioral protocol.repository.sourceHead");
	if (!/^[a-f0-9]{40,64}$/.test(sourceHead)) {
		throw new Error("public behavioral protocol.repository.sourceHead must be a bound Git SHA.");
	}
	const generatedIndexes = asObject(protocol.generatedIndexes, "public behavioral protocol.generatedIndexes");
	const generatedSkillNames = Object.keys(generatedIndexes).sort();
	if (JSON.stringify(generatedSkillNames) !== JSON.stringify(["css", "react", "typescript"])) {
		throw new Error("public behavioral protocol.generatedIndexes must contain exactly css, react, and typescript.");
	}
	const generatedIndexDigests: Record<string, string> = {};
	for (const skillName of generatedSkillNames) {
		const generatedIndex = asObject(generatedIndexes[skillName], `public behavioral protocol.generatedIndexes.${skillName}`);
		const indexPath = asString(generatedIndex.path, `public behavioral protocol.generatedIndexes.${skillName}.path`);
		if (indexPath !== `skill/${skillName}/RULES_INDEX.md`) {
			throw new Error(`public behavioral protocol.generatedIndexes.${skillName}.path must identify the current generated index.`);
		}
		const digest = asString(generatedIndex.digest, `public behavioral protocol.generatedIndexes.${skillName}.digest`);
		if (!sha256Pattern.test(digest)) {
			throw new Error(`public behavioral protocol.generatedIndexes.${skillName}.digest must be a bound SHA-256 digest.`);
		}
		generatedIndexDigests[skillName] = digest;
	}
	const semanticAudit = asObject(protocol.semanticAudit, "public behavioral protocol.semanticAudit");
	const sealedCriteriaSha256 = asString(
		semanticAudit.criteriaCommitmentSha256,
		"public behavioral protocol.semanticAudit.criteriaCommitmentSha256",
	);
	if (!sha256Pattern.test(sealedCriteriaSha256)) {
		throw new Error("public behavioral protocol.semanticAudit.criteriaCommitmentSha256 must be SHA-256.");
	}
	const scenariosObject = asObject(protocol.scenarios, "public behavioral protocol.scenarios");
	const scenarios: SemanticAuditPublicFixtureScenario[] = [];
	const reviewTasksByScenario = new Map<string, string>();
	const candidatePromptsByScenario = new Map<string, string>();
	const scenarioSha256ByScenario = new Map<string, string>();

	for (const [scenarioId, scenarioValue] of Object.entries(scenariosObject)) {
		const scenario = asObject(scenarioValue, `public behavioral protocol.scenarios.${scenarioId}`);

		if (!Array.isArray(scenario.virtualFiles)) continue;
		if (scenario.virtualFiles.length === 0) throw new Error(`Public fixture scenario ${scenarioId} must contain virtualFiles.`);
		const virtualFiles = scenario.virtualFiles.map((file, index) =>
			parsePublicVirtualFile(file, `public behavioral protocol.scenarios.${scenarioId}.virtualFiles[${index}]`),
		);
		assertUniqueStrings(
			virtualFiles.map(({path: filePath}) => filePath),
			`public behavioral protocol.scenarios.${scenarioId}.virtualFiles paths`,
		);
		scenarios.push({scenarioId, virtualFiles});
		const basePrompt = asString(scenario.basePrompt, `public behavioral protocol.scenarios.${scenarioId}.basePrompt`);
		const scopeDriftPrompt =
			scenario.scopeDriftPrompt === undefined
				? null
				: asString(scenario.scopeDriftPrompt, `public behavioral protocol.scenarios.${scenarioId}.scopeDriftPrompt`);
		reviewTasksByScenario.set(scenarioId, scopeDriftPrompt === null ? basePrompt : `${basePrompt}\n\nScope drift:\n${scopeDriftPrompt}`);
		candidatePromptsByScenario.set(scenarioId, basePrompt);
		scenarioSha256ByScenario.set(scenarioId, createCanonicalSha256(scenario));
	}
	scenarios.sort((left, right) => left.scenarioId.localeCompare(right.scenarioId, "en"));

	if (scenarios.length !== 8) {
		throw new Error(`Public behavioral protocol must expose exactly 8 mixed virtual fixture scenarios; found ${scenarios.length}.`);
	}
	const runMatrix = asObject(protocol.runMatrix, "public behavioral protocol.runMatrix");
	const mixed = asObject(runMatrix.mixed, "public behavioral protocol.runMatrix.mixed");
	const mixedScenarioIds = asStringArray(mixed.scenarios, "public behavioral protocol.runMatrix.mixed.scenarios");
	assertUniqueStrings(mixedScenarioIds, "public behavioral protocol.runMatrix.mixed.scenarios");
	const fixtureScenarioIds = scenarios.map(({scenarioId}) => scenarioId).sort();
	if (JSON.stringify([...mixedScenarioIds].sort()) !== JSON.stringify(fixtureScenarioIds)) {
		throw new Error("public behavioral protocol mixed run matrix must exact-cover the 8 public fixture scenarios.");
	}
	const mixedArms = asStringArray(mixed.arms, "public behavioral protocol.runMatrix.mixed.arms");
	if (JSON.stringify(mixedArms) !== JSON.stringify(["no-skill", "full-handbook", "progressive"])) {
		throw new Error("public behavioral protocol mixed arms must be no-skill, full-handbook, progressive in order.");
	}
	const trialsPerNonCriticalScenarioArm = asPositiveInteger(
		mixed.trialsPerNonCriticalScenarioArm,
		"public behavioral protocol.runMatrix.mixed.trialsPerNonCriticalScenarioArm",
	);
	const trialsPerCriticalScenarioArm = asPositiveInteger(
		mixed.trialsPerCriticalScenarioArm,
		"public behavioral protocol.runMatrix.mixed.trialsPerCriticalScenarioArm",
	);
	if (trialsPerNonCriticalScenarioArm !== 2 || trialsPerCriticalScenarioArm !== 3 || mixed.runCount !== 51) {
		throw new Error("public behavioral protocol mixed matrix must retain 2 non-critical trials, 3 critical trials, and 51 total runs.");
	}
	const criticalScenario = asString(mixed.criticalScenario, "public behavioral protocol.runMatrix.mixed.criticalScenario");
	if (!mixedScenarioIds.includes(criticalScenario)) {
		throw new Error("public behavioral protocol mixed criticalScenario must identify one mixed scenario.");
	}
	const expectedCandidateRunIds = mixedScenarioIds.flatMap((scenarioId) => {
		const trialCount = scenarioId === criticalScenario ? trialsPerCriticalScenarioArm : trialsPerNonCriticalScenarioArm;
		return (["full-handbook", "progressive"] as const).flatMap((arm) =>
			Array.from({length: trialCount}, (_, index) => `${arm}--${scenarioId}--t${index + 1}`),
		);
	});
	if (expectedCandidateRunIds.length !== 34) {
		throw new Error(
			`public behavioral protocol mixed matrix must derive exactly 34 semantic candidate coordinates; found ${expectedCandidateRunIds.length}.`,
		);
	}
	assertUniqueStrings(expectedCandidateRunIds, "public behavioral protocol semantic candidate run IDs");
	const arms = asObject(protocol.arms, "public behavioral protocol.arms");
	const armSha256ByArm = new Map<string, string>();
	for (const arm of ["full-handbook", "progressive"] as const) {
		armSha256ByArm.set(arm, createCanonicalSha256(asObject(arms[arm], `public behavioral protocol.arms.${arm}`)));
	}

	return {
		fixtureSet: {schemaVersion: 1, fixtureSetId: "progressive-loading-public-virtual-fixtures-v1", scenarios},
		protocolRaw: protocolResult.raw,
		sourceHead,
		generatedIndexDigests,
		sealedCriteriaSha256,
		expectedCandidateRunIds,
		reviewTasksByScenario,
		candidatePromptsByScenario,
		scenarioSha256ByScenario,
		armSha256ByArm,
	};
};

/** @helper public present/absent virtual patch strict validation */
const parseVirtualPatch = (value: unknown, label: string): SemanticAuditVirtualPatch => {
	const patch = asObject(value, label);
	assertExactKeys({value: patch, expectedKeys: ["files", "summary"], label});

	if (!Array.isArray(patch.files) || patch.files.length === 0) {
		throw new Error(`${label}.files must be a non-empty array.`);
	}

	const files = patch.files.map((item, index) => {
		const itemLabel = `${label}.files[${index}]`;
		const file = asObject(item, itemLabel);
		assertExactKeys({
			value: file,
			expectedKeys: ["path", "beforeState", "beforeSha256", "afterState", "after", "afterSha256"],
			label: itemLabel,
		});
		const filePath = asString(file.path, `${itemLabel}.path`);
		const beforeState = asString(file.beforeState, `${itemLabel}.beforeState`);
		const afterState = asString(file.afterState, `${itemLabel}.afterState`);

		if (path.isAbsolute(filePath) || filePath.split("/").includes("..")) {
			throw new Error(`${itemLabel}.path must be a safe repository-relative path.`);
		}

		if (beforeState !== "present" && beforeState !== "absent") {
			throw new Error(`${itemLabel}.beforeState must be present or absent.`);
		}

		if (beforeState === "present") {
			if (typeof file.beforeSha256 !== "string" || !sha256Pattern.test(file.beforeSha256)) {
				throw new Error(`${itemLabel}.beforeSha256 must be a SHA-256 digest when present.`);
			}
		} else if (file.beforeSha256 !== null) {
			throw new Error(`${itemLabel}.beforeSha256 must be null when absent.`);
		}

		if (afterState !== "present" && afterState !== "absent") {
			throw new Error(`${itemLabel}.afterState must be present or absent.`);
		}

		if (afterState === "present") {
			if (typeof file.after !== "string") {
				throw new Error(`${itemLabel}.after must be a string when present.`);
			}

			if (typeof file.afterSha256 !== "string" || file.afterSha256 !== createSha256(file.after)) {
				throw new Error(`${itemLabel}.afterSha256 must match exact after UTF-8 bytes.`);
			}
		} else if (file.after !== null || file.afterSha256 !== null) {
			throw new Error(`${itemLabel}.after and afterSha256 must be null when absent.`);
		}

		return {
			path: filePath,
			beforeState,
			beforeSha256: file.beforeSha256 as string | null,
			afterState,
			after: file.after as string | null,
			afterSha256: file.afterSha256 as string | null,
		} as SemanticAuditVirtualPatchFile;
	});
	assertUniqueStrings(
		files.map(({path: filePath}) => filePath),
		`${label}.files paths`,
	);
	return {files, summary: asString(patch.summary, `${label}.summary`)};
};

/** @helper top-level JSON property의 exact raw value bytes 추출 */
const extractTopLevelJsonValueRaw = (raw: string, targetKey: string): string => {
	let index = 0;
	const skipWhitespace = (): void => {
		while (/\s/.test(raw[index] ?? "")) index += 1;
	};
	const scanString = (): number => {
		if (raw[index] !== '"') throw new Error("Expected JSON string.");
		index += 1;

		while (index < raw.length) {
			if (raw[index] === "\\") {
				index += 2;
				continue;
			}

			if (raw[index] === '"') {
				index += 1;
				return index;
			}

			index += 1;
		}

		throw new Error("Unterminated JSON string.");
	};
	const scanValue = (): number => {
		skipWhitespace();
		const start = index;

		if (raw[index] === '"') {
			scanString();
			return index;
		}

		if (raw[index] === "{" || raw[index] === "[") {
			const openings: string[] = [];

			while (index < raw.length) {
				const character = raw[index];

				if (character === '"') {
					scanString();
					continue;
				}

				if (character === "{" || character === "[") openings.push(character);
				if (character === "}" || character === "]") {
					const expected = character === "}" ? "{" : "[";

					if (openings.pop() !== expected) throw new Error("Unbalanced JSON value.");
				}

				index += 1;

				if (openings.length === 0) return index;
			}

			throw new Error("Unterminated JSON container.");
		}

		while (index < raw.length && raw[index] !== "," && raw[index] !== "}") index += 1;
		if (index === start) throw new Error("Missing JSON value.");
		return index;
	};

	skipWhitespace();
	if (raw[index] !== "{") throw new Error("Candidate run must be a top-level JSON object.");
	index += 1;

	while (index < raw.length) {
		skipWhitespace();
		if (raw[index] === "}") break;
		const keyStart = index;
		scanString();
		const key = JSON.parse(raw.slice(keyStart, index)) as string;
		skipWhitespace();
		if (raw[index] !== ":") throw new Error("Malformed top-level JSON property.");
		index += 1;
		skipWhitespace();
		const valueStart = index;
		const valueEnd = scanValue();

		if (key === targetKey) return raw.slice(valueStart, valueEnd);

		skipWhitespace();
		if (raw[index] === ",") {
			index += 1;
			continue;
		}

		if (raw[index] === "}") break;
		throw new Error("Malformed top-level JSON delimiter.");
	}

	throw new Error(`Candidate run is missing top-level ${targetKey}.`);
};

/** @helper skill root의 routing oracle scenario 검색 */
const findRoutingScenario = async (skillRootDir: string, scenarioId: string): Promise<JsonObject> => {
	const matches: JsonObject[] = [];
	const entries = await readdir(skillRootDir, {withFileTypes: true});

	for (const entry of entries.filter((item) => item.isDirectory()).sort((left, right) => left.name.localeCompare(right.name, "en"))) {
		const manifestPath = path.join(skillRootDir, entry.name, "routing-evals.json");
		let manifest: JsonObject;

		try {
			manifest = (await readJsonObject(manifestPath, `${entry.name} routing manifest`)).value;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT" || /ENOENT/.test((error as Error).message)) continue;
			throw error;
		}

		if (!Array.isArray(manifest.scenarios)) throw new Error(`${entry.name} routing manifest scenarios must be an array.`);

		for (const scenarioValue of manifest.scenarios) {
			const scenario = asObject(scenarioValue, `${entry.name} routing scenario`);
			if (scenario.id === scenarioId) matches.push(scenario);
		}
	}

	if (matches.length !== 1) {
		throw new Error(`Expected exactly one current routing scenario for "${scenarioId}", found ${matches.length}.`);
	}

	return matches[0]!;
};

/** @helper virtualPatch before state/hash를 public fixture와 exact 대조 */
const assertPatchBeforeBinding = (args: AssertPatchBeforeBindingArgs): void => {
	if (args.virtualPatch.files.length !== args.publicFixture.virtualFiles.length) {
		throw new Error(`${args.label} must exactly cover public before virtual files.`);
	}

	for (const [index, publicFile] of args.publicFixture.virtualFiles.entries()) {
		const patchFile = args.virtualPatch.files[index];

		if (patchFile?.path !== publicFile.path || patchFile.beforeState !== publicFile.state || patchFile.beforeSha256 !== publicFile.sha256) {
			throw new Error(`${args.label}.files[${index}] beforeState/hash must exactly match the public before fixture.`);
		}
	}
};

/** @helper criteria ruleRef의 current full source를 resolve */
const readCurrentRuleBinding = async (ruleRef: string, skillRootDir: string): Promise<CurrentRuleBinding> => {
	const match = qualifiedRuleRefPattern.exec(ruleRef);
	if (!match) throw new Error(`Invalid current ruleRef "${ruleRef}".`);
	const rulePath = path.join(skillRootDir, match[1]!, "rules", `${match[2]}.md`);

	try {
		const content = await readFile(rulePath, "utf8");
		return {ref: ruleRef, path: rulePath, content, sha256: createSha256(content)};
	} catch (error) {
		throw new Error(`criteria current ruleRef "${ruleRef}" does not resolve to ${rulePath}: ${(error as Error).message}`);
	}
};

/** @helper canonical repo/skill realpath와 clean skill/package source를 검증 */
const assertSemanticAuditSourceBinding = async (skillRootDir: string): Promise<SemanticAuditSourceBinding> => {
	try {
		const resolvedSkillRootDir = path.resolve(skillRootDir);
		const {stdout: topLevelStdout} = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {cwd: resolvedSkillRootDir});
		const repositoryDir = await realpath(String(topLevelStdout).trim());
		const [canonicalSkillRootDir, suppliedSkillRootDir] = await Promise.all([
			realpath(path.join(repositoryDir, "skill")),
			realpath(resolvedSkillRootDir),
		]);
		if (suppliedSkillRootDir !== canonicalSkillRootDir) {
			throw new Error("skillRootDir must resolve exactly to the owning Git repository's canonical skill/ directory");
		}
		const {stdout: statusStdout} = await execFileAsync(
			"git",
			["status", "--porcelain=v1", "--untracked-files=all", "--", "skill", "package"],
			{cwd: repositoryDir},
		);
		if (String(statusStdout).length > 0) {
			throw new Error("semantic audit requires clean tracked and untracked source under skill/ and package/");
		}
		const {stdout} = await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: repositoryDir});
		const repositoryHead = String(stdout).trim();
		if (!/^[a-f0-9]{40,64}$/.test(repositoryHead)) throw new Error("git rev-parse returned an invalid commit SHA");
		return {repositoryDir, skillRootDir: canonicalSkillRootDir, repositoryHead};
	} catch (error) {
		throw new Error(`Unable to bind canonical clean semantic audit source: ${(error as Error).message}`);
	}
};

/** @helper committed rich criteria를 public fixtures/current rules/expected Selected에 대조 */
const validateCriteria = async (args: ValidateCriteriaArgs): Promise<ValidatedCriteria> => {
	const root = asObject(args.value, "criteria reveal");
	assertExactKeys({
		value: root,
		expectedKeys: [
			"schemaVersion",
			"criteriaSetId",
			"repositoryHead",
			"generatedIndexDigests",
			"publicFixtureSetSha256",
			"rubric",
			"scenarios",
			"authoringProvenance",
		],
		label: "criteria reveal",
	});

	if (root.schemaVersion !== 1) throw new Error("criteria reveal.schemaVersion must be 1.");
	const criteriaSetId = asString(root.criteriaSetId, "criteria reveal.criteriaSetId");
	if (!idPattern.test(criteriaSetId)) throw new Error("criteria reveal.criteriaSetId must be a stable ID.");
	const repositoryHead = asString(root.repositoryHead, "criteria reveal.repositoryHead");
	if (!/^[a-f0-9]{40,64}$/.test(repositoryHead)) throw new Error("criteria reveal.repositoryHead must be a committed Git SHA.");
	const sourceBinding = await assertSemanticAuditSourceBinding(args.skillRootDir);
	const canonicalPublicProtocolPath = path.join(
		sourceBinding.repositoryDir,
		"docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json",
	);
	if ((await realpath(path.resolve(args.publicProtocolPath))) !== (await realpath(canonicalPublicProtocolPath))) {
		throw new Error("publicProtocolPath must be the owning repository's canonical progressive-loading behavioral protocol path.");
	}
	const publicResult = await readPublicFixtureSet(args.publicProtocolPath);
	if (repositoryHead !== publicResult.sourceHead) {
		throw new Error("criteria reveal.repositoryHead must exactly match public protocol repository.sourceHead.");
	}
	const currentRepositoryHead = sourceBinding.repositoryHead;
	if (repositoryHead !== currentRepositoryHead) {
		throw new Error("criteria reveal.repositoryHead and public protocol sourceHead must exactly match the Git HEAD owning skillRootDir.");
	}
	const publicFixtureSetSha256 = asString(root.publicFixtureSetSha256, "criteria reveal.publicFixtureSetSha256");

	if (publicFixtureSetSha256 !== createCanonicalSha256(publicResult.fixtureSet)) {
		throw new Error("criteria reveal publicFixtureSetSha256 does not match normalized public protocol fixtures.");
	}

	const generatedIndexDigestsValue = asObject(root.generatedIndexDigests, "criteria reveal.generatedIndexDigests");
	const generatedIndexDigests: Record<string, string> = {};
	const generatedSkillNames = Object.keys(generatedIndexDigestsValue).sort();

	if (JSON.stringify(generatedSkillNames) !== JSON.stringify(["css", "react", "typescript"])) {
		throw new Error("criteria reveal.generatedIndexDigests must contain exactly css, react, and typescript.");
	}

	for (const skillName of generatedSkillNames) {
		const digest = asString(generatedIndexDigestsValue[skillName], `criteria reveal.generatedIndexDigests.${skillName}`);
		if (!sha256Pattern.test(digest)) throw new Error(`criteria reveal.generatedIndexDigests.${skillName} must be SHA-256.`);
		const indexRaw = await readFile(path.join(args.skillRootDir, skillName, "RULES_INDEX.md"), "utf8");
		const currentDigest = indexRaw.match(/Routing digest: `([^`]+)`/)?.[1];

		if (currentDigest !== digest) {
			throw new Error(`criteria reveal.generatedIndexDigests.${skillName} does not match current RULES_INDEX.md.`);
		}
		if (publicResult.generatedIndexDigests[skillName] !== digest) {
			throw new Error(`criteria reveal.generatedIndexDigests.${skillName} does not match public protocol generatedIndexes.`);
		}
		generatedIndexDigests[skillName] = digest;
	}

	const rubricValue = asObject(root.rubric, "criteria reveal.rubric");
	assertExactKeys({
		value: rubricValue,
		expectedKeys: ["verdicts", "evidencePolicy", "processOnlyPolicy", "negativeControlPolicy"],
		label: "criteria reveal.rubric",
	});
	const verdicts = asStringArray(rubricValue.verdicts, "criteria reveal.rubric.verdicts");
	if (JSON.stringify(verdicts) !== JSON.stringify(["PASS", "FAIL", "UNKNOWN"])) {
		throw new Error("criteria reveal.rubric.verdicts must be PASS, FAIL, UNKNOWN in order.");
	}
	const rubric: SemanticAuditRubric = {
		verdicts: ["PASS", "FAIL", "UNKNOWN"],
		evidencePolicy: asString(rubricValue.evidencePolicy, "criteria reveal.rubric.evidencePolicy"),
		processOnlyPolicy: asString(rubricValue.processOnlyPolicy, "criteria reveal.rubric.processOnlyPolicy"),
		negativeControlPolicy: asString(rubricValue.negativeControlPolicy, "criteria reveal.rubric.negativeControlPolicy"),
	};
	const provenanceValue = asObject(root.authoringProvenance, "criteria reveal.authoringProvenance");
	assertExactKeys({
		value: provenanceValue,
		expectedKeys: ["authoredAtUtc", "publicProtocolPath", "sealPolicy"],
		label: "criteria reveal.authoringProvenance",
	});
	const authoringProvenance: SemanticAuditAuthoringProvenance = {
		authoredAtUtc: asString(provenanceValue.authoredAtUtc, "criteria reveal.authoringProvenance.authoredAtUtc"),
		publicProtocolPath: asString(provenanceValue.publicProtocolPath, "criteria reveal.authoringProvenance.publicProtocolPath"),
		sealPolicy: asString(provenanceValue.sealPolicy, "criteria reveal.authoringProvenance.sealPolicy"),
	};

	if (!path.resolve(args.publicProtocolPath).endsWith(authoringProvenance.publicProtocolPath)) {
		throw new Error("criteria reveal authoringProvenance.publicProtocolPath does not identify the bound public protocol.");
	}

	if (!Array.isArray(root.scenarios) || root.scenarios.length !== 8) {
		throw new Error("criteria reveal.scenarios must contain exactly 8 eligible scenarios.");
	}
	const rulesByRef = new Map<string, CurrentRuleBinding>();
	const scenarios: SemanticAuditScenarioCriteria[] = [];

	for (const [scenarioIndex, scenarioValue] of root.scenarios.entries()) {
		const label = `criteria reveal.scenarios[${scenarioIndex}]`;
		const scenario = asObject(scenarioValue, label);
		assertExactKeys({
			value: scenario,
			expectedKeys: ["scenarioId", "publicFixtureScenarioSha256", "criteria", "processOnlyRuleRefs", "negativeControl"],
			label,
		});
		const scenarioId = asString(scenario.scenarioId, `${label}.scenarioId`);
		const publicFixture = publicResult.fixtureSet.scenarios.find((item) => item.scenarioId === scenarioId);
		if (!publicFixture) throw new Error(`${label}.scenarioId is not present in the public fixture set.`);
		const publicFixtureScenarioSha256 = asString(scenario.publicFixtureScenarioSha256, `${label}.publicFixtureScenarioSha256`);

		if (publicFixtureScenarioSha256 !== createCanonicalSha256(publicFixture)) {
			throw new Error(`${label}.publicFixtureScenarioSha256 does not match normalized public before fixtures.`);
		}
		if (!Array.isArray(scenario.criteria) || scenario.criteria.length === 0)
			throw new Error(`${label}.criteria must be a non-empty array.`);
		if (!Array.isArray(scenario.processOnlyRuleRefs)) throw new Error(`${label}.processOnlyRuleRefs must be an array.`);
		const routingScenario = await findRoutingScenario(args.skillRootDir, scenarioId);
		const scopeDrift =
			routingScenario.scopeDrift === undefined ? null : asObject(routingScenario.scopeDrift, `routing scenario ${scenarioId}.scopeDrift`);
		const expectedSelectedValue = scopeDrift?.expectedSelected ?? routingScenario.expectedSelected;
		const expectedSelectedObject = asObject(expectedSelectedValue, `routing scenario ${scenarioId}.expectedSelected`);
		const expectedSelected = new Set(
			Object.entries(expectedSelectedObject).flatMap(([skillName, ruleIds]) =>
				asStringArray(ruleIds, `routing scenario ${scenarioId}.expectedSelected.${skillName}`).map((ruleId) => `${skillName}/${ruleId}`),
			),
		);
		const coveredSelected = new Set<string>();
		const criteria: SemanticAuditCriterion[] = [];

		for (const [criterionIndex, criterionValue] of scenario.criteria.entries()) {
			const criterionLabel = `${label}.criteria[${criterionIndex}]`;
			const criterion = asObject(criterionValue, criterionLabel);
			assertExactKeys({
				value: criterion,
				expectedKeys: [
					"id",
					"stage",
					"ruleRefs",
					"requirement",
					"evidencePaths",
					"requiredObservations",
					"forbiddenObservations",
					"evidencePolicy",
				],
				label: criterionLabel,
			});
			const ruleRefs = asStringArray(criterion.ruleRefs, `${criterionLabel}.ruleRefs`);
			const evidencePaths = asStringArray(criterion.evidencePaths, `${criterionLabel}.evidencePaths`);
			const requiredObservations = asStringArray(criterion.requiredObservations, `${criterionLabel}.requiredObservations`);
			const forbiddenObservations = asStringArray(criterion.forbiddenObservations, `${criterionLabel}.forbiddenObservations`);
			assertUniqueStrings(ruleRefs, `${criterionLabel}.ruleRefs`);
			assertUniqueStrings(evidencePaths, `${criterionLabel}.evidencePaths`);

			if (evidencePaths.length === 0 || evidencePaths.some((filePath) => !publicFixture.virtualFiles.some(({path}) => path === filePath))) {
				throw new Error(`${criterionLabel}.evidencePaths must reference public fixture paths.`);
			}
			if (requiredObservations.length === 0 && forbiddenObservations.length === 0) {
				throw new Error(`${criterionLabel} needs at least one required or forbidden observation.`);
			}

			for (const ruleRef of ruleRefs) {
				if (!expectedSelected.has(ruleRef)) {
					throw new Error(`${criterionLabel} current ruleRef "${ruleRef}" is not covered by scenario expected Selected.`);
				}
				coveredSelected.add(ruleRef);
				if (!rulesByRef.has(ruleRef)) rulesByRef.set(ruleRef, await readCurrentRuleBinding(ruleRef, args.skillRootDir));
			}

			criteria.push({
				id: asString(criterion.id, `${criterionLabel}.id`),
				stage: asString(criterion.stage, `${criterionLabel}.stage`),
				ruleRefs,
				requirement: asString(criterion.requirement, `${criterionLabel}.requirement`),
				evidencePaths,
				requiredObservations,
				forbiddenObservations,
				evidencePolicy: asString(criterion.evidencePolicy, `${criterionLabel}.evidencePolicy`),
			});
		}
		assertUniqueStrings(
			criteria.map(({id}) => id),
			`${label}.criteria IDs`,
		);
		const processOnlyRuleRefs = scenario.processOnlyRuleRefs.map((entryValue, entryIndex) => {
			const entryLabel = `${label}.processOnlyRuleRefs[${entryIndex}]`;
			const entry = asObject(entryValue, entryLabel);
			assertExactKeys({value: entry, expectedKeys: ["ruleRef", "reason"], label: entryLabel});
			const ruleRef = asString(entry.ruleRef, `${entryLabel}.ruleRef`);

			if (!expectedSelected.has(ruleRef)) {
				throw new Error(`${entryLabel}.ruleRef must belong to current scenario expected Selected.`);
			}
			coveredSelected.add(ruleRef);
			return {ruleRef, reason: asString(entry.reason, `${entryLabel}.reason`)};
		});
		assertUniqueStrings(
			processOnlyRuleRefs.map(({ruleRef}) => ruleRef),
			`${label}.processOnlyRuleRefs`,
		);
		for (const {ruleRef} of processOnlyRuleRefs) {
			if (!rulesByRef.has(ruleRef)) rulesByRef.set(ruleRef, await readCurrentRuleBinding(ruleRef, args.skillRootDir));
		}
		const missingExpectedSelected = [...expectedSelected].filter((ruleRef) => !coveredSelected.has(ruleRef));
		const unexpectedCovered = [...coveredSelected].filter((ruleRef) => !expectedSelected.has(ruleRef));

		if (missingExpectedSelected.length > 0 || unexpectedCovered.length > 0) {
			throw new Error(
				`${label} criteria ruleRefs plus processOnlyRuleRefs must exact-cover expected Selected; missing ${missingExpectedSelected.join(", ") || "none"}.`,
			);
		}
		const negativeControlValue = asObject(scenario.negativeControl, `${label}.negativeControl`);
		assertExactKeys({value: negativeControlValue, expectedKeys: ["targetCriterionId", "virtualPatch"], label: `${label}.negativeControl`});
		const targetCriterionId = asString(negativeControlValue.targetCriterionId, `${label}.negativeControl.targetCriterionId`);
		if (!criteria.some(({id}) => id === targetCriterionId)) {
			throw new Error(`${label}.negativeControl.targetCriterionId must reference one current criterion.`);
		}
		const negativePatch = parseVirtualPatch(negativeControlValue.virtualPatch, `${label}.negativeControl.virtualPatch`);
		assertPatchBeforeBinding({virtualPatch: negativePatch, publicFixture, label: `${label}.negativeControl.virtualPatch`});
		scenarios.push({
			scenarioId,
			publicFixtureScenarioSha256,
			criteria,
			processOnlyRuleRefs,
			negativeControl: {targetCriterionId, virtualPatch: negativePatch},
		});
	}
	assertUniqueStrings(
		scenarios.map(({scenarioId}) => scenarioId),
		"criteria reveal scenario IDs",
	);
	const publicScenarioIds = publicResult.fixtureSet.scenarios.map(({scenarioId}) => scenarioId).sort();
	const criteriaScenarioIds = scenarios.map(({scenarioId}) => scenarioId).sort();
	if (JSON.stringify(publicScenarioIds) !== JSON.stringify(criteriaScenarioIds)) {
		throw new Error("criteria reveal scenarios must exact-cover normalized public fixture scenarios.");
	}
	return {
		reveal: {
			schemaVersion: 1,
			criteriaSetId,
			repositoryHead,
			generatedIndexDigests,
			publicFixtureSetSha256,
			rubric,
			scenarios,
			authoringProvenance,
		},
		rulesByRef,
		publicFixtureSet: publicResult.fixtureSet,
		publicProtocolRaw: publicResult.protocolRaw,
		protocolSourceHead: publicResult.sourceHead,
		protocolGeneratedIndexDigests: publicResult.generatedIndexDigests,
		sealedCriteriaSha256: publicResult.sealedCriteriaSha256,
		expectedCandidateRunIds: publicResult.expectedCandidateRunIds,
		reviewTasksByScenario: publicResult.reviewTasksByScenario,
		candidatePromptsByScenario: publicResult.candidatePromptsByScenario,
		scenarioSha256ByScenario: publicResult.scenarioSha256ByScenario,
		armSha256ByArm: publicResult.armSha256ByArm,
	};
};

/** @helper criteria commitment strict parser */
const parseCriteriaCommitment = (value: unknown): SemanticAuditCriteriaCommitment => {
	const commitment = asObject(value, "criteria commitment");
	assertExactKeys({
		value: commitment,
		expectedKeys: ["schemaVersion", "protocolId", "criteriaSetId", "criteriaSha256", "criteriaByteLength"],
		label: "criteria commitment",
	});

	if (commitment.schemaVersion !== 1 || commitment.protocolId !== protocolId) {
		throw new Error("criteria commitment schemaVersion/protocolId is invalid.");
	}
	const criteriaSha256 = asString(commitment.criteriaSha256, "criteria commitment.criteriaSha256");
	if (!sha256Pattern.test(criteriaSha256)) throw new Error("criteria commitment.criteriaSha256 must be SHA-256.");
	return {
		schemaVersion: 1,
		protocolId,
		criteriaSetId: asString(commitment.criteriaSetId, "criteria commitment.criteriaSetId"),
		criteriaSha256,
		criteriaByteLength: asPositiveInteger(commitment.criteriaByteLength, "criteria commitment.criteriaByteLength"),
	};
};

/** @helper commitment에 묶인 reveal/current rules 재검증 */
const readCommittedCriteria = async (
	args: CommitBehavioralSemanticAuditCriteriaArgs,
): Promise<{commitment: SemanticAuditCriteriaCommitment; commitmentRaw: string; criteriaRaw: string; validated: ValidatedCriteria}> => {
	const commitmentResult = await readJsonObject(path.resolve(args.commitmentPath), "criteria commitment");
	const commitment = parseCriteriaCommitment(commitmentResult.value);
	const criteriaResult = await readJsonObject(path.resolve(args.criteriaPath), "criteria reveal");

	if (
		createSha256(criteriaResult.raw) !== commitment.criteriaSha256 ||
		Buffer.byteLength(criteriaResult.raw, "utf8") !== commitment.criteriaByteLength
	) {
		throw new Error("criteria reveal raw bytes do not match the pre-recorded criteria commitment.");
	}

	const validated = await validateCriteria({
		value: criteriaResult.value,
		skillRootDir: path.resolve(args.skillRootDir),
		publicProtocolPath: path.resolve(args.publicProtocolPath),
	});
	if (commitment.criteriaSha256 !== validated.sealedCriteriaSha256) {
		throw new Error("criteria commitment must exactly match the public protocol sealed criteria commitment SHA-256.");
	}
	if (validated.reveal.criteriaSetId !== commitment.criteriaSetId) {
		throw new Error("criteria reveal criteriaSetId does not match the pre-recorded criteria commitment.");
	}

	return {commitment, commitmentRaw: commitmentResult.raw, criteriaRaw: criteriaResult.raw, validated};
};

/** @api criteria raw bytes를 reveal 전에 commit하고 current ruleRefs를 검증 */
export const commitBehavioralSemanticAuditCriteria = async (
	args: CommitBehavioralSemanticAuditCriteriaArgs,
): Promise<CommittedBehavioralSemanticAuditCriteria> => {
	const criteriaPath = path.resolve(args.criteriaPath);
	const criteriaResult = await readJsonObject(criteriaPath, "criteria reveal");
	const validated = await validateCriteria({
		value: criteriaResult.value,
		skillRootDir: path.resolve(args.skillRootDir),
		publicProtocolPath: path.resolve(args.publicProtocolPath),
	});
	const criteriaSha256 = createSha256(criteriaResult.raw);
	if (criteriaSha256 !== validated.sealedCriteriaSha256) {
		throw new Error("criteria raw bytes do not match the public protocol sealed criteria commitment SHA-256.");
	}
	const commitment: SemanticAuditCriteriaCommitment = {
		schemaVersion: 1,
		protocolId,
		criteriaSetId: validated.reveal.criteriaSetId,
		criteriaSha256,
		criteriaByteLength: Buffer.byteLength(criteriaResult.raw, "utf8"),
	};
	const commitmentPath = path.resolve(args.commitmentPath);
	await writeNoOverwrite(commitmentPath, serializeJson(commitment));
	return {commitmentPath, commitment};
};

/** @helper candidate run strict source extraction */
const readCandidateRun = async (filePath: string): Promise<CandidateRunSource | null> => {
	const result = await readJsonObject(filePath, `candidate run ${filePath}`);
	const scoring = asObject(result.value.scoring, `candidate run ${filePath}.scoring`);

	if (scoring.kind !== "candidate" || scoring.eligible !== true) return null;
	const arm = asString(result.value.arm, `candidate run ${filePath}.arm`);
	if (arm !== "full-handbook" && arm !== "progressive") {
		throw new Error(`Eligible candidate run ${filePath} arm must be full-handbook or progressive.`);
	}
	const virtualPatchRaw = extractTopLevelJsonValueRaw(result.raw, "virtualPatch");
	return {
		source: result.value,
		runId: asString(result.value.runId, `candidate run ${filePath}.runId`),
		arm,
		scenarioId: asString(result.value.scenarioId, `candidate run ${filePath}.scenarioId`),
		trial: asPositiveInteger(result.value.trial, `candidate run ${filePath}.trial`),
		repositoryHead: asString(result.value.repositoryHead, `candidate run ${filePath}.repositoryHead`),
		task: asString(result.value.scenarioPrompt, `candidate run ${filePath}.scenarioPrompt`),
		virtualPatch: parseVirtualPatch(result.value.virtualPatch, `candidate run ${filePath}.virtualPatch`),
		path: path.resolve(filePath),
		raw: result.raw,
		sha256: createSha256(result.raw),
		virtualPatchRaw,
		virtualPatchRawSha256: createSha256(virtualPatchRaw),
	};
};

/** @helper eligible candidate runs를 exact 34로 읽기 */
const readCandidateRuns = async (candidateRunsDir: string): Promise<CandidateRunSource[]> => {
	const entries = await readdir(candidateRunsDir, {withFileTypes: true});
	const candidates: CandidateRunSource[] = [];

	for (const entry of entries
		.filter((item) => item.isFile() && item.name.endsWith(".run.json"))
		.sort((left, right) => left.name.localeCompare(right.name, "en"))) {
		const candidate = await readCandidateRun(path.join(candidateRunsDir, entry.name));
		if (candidate) {
			if (entry.name !== `${candidate.runId}.run.json`) {
				throw new Error(`Eligible candidate file name must exactly match runId "${candidate.runId}.run.json".`);
			}
			candidates.push(candidate);
		}
	}

	if (candidates.length !== 34) {
		throw new Error(`Independent semantic audit requires exactly 34 eligible candidate runs; found ${candidates.length}.`);
	}
	assertUniqueStrings(
		candidates.map(({runId}) => runId),
		"eligible candidate run IDs",
	);
	assertUniqueStrings(
		candidates.map(({path: runPath}) => runPath),
		"eligible candidate run paths",
	);
	return candidates;
};

/** @helper candidate directory의 exact deterministic artifact set raw fingerprint */
const readCandidateArtifactSetFingerprint = async (args: ReadCandidateArtifactSetFingerprintArgs): Promise<string> => {
	const expectedFileNames = args.candidates
		.flatMap((candidate) => {
			const suffixes =
				candidate.scenarioId === "RTE02-owner-placement-css-drift"
					? [
							"initial-child-request.json",
							"initial-dispatch-envelope.json",
							"initial-child-payload.json",
							"initial-seal.json",
							"followup-child-request.json",
							"followup-dispatch-envelope.json",
							"drift-child-payload.json",
							"combined-child-payload.json",
							"staged-merge.json",
							"run.json",
						]
					: ["child-request.json", "dispatch-envelope.json", "child-payload.json", "run.json"];
			return suffixes.map((suffix) => `${candidate.runId}.${suffix}`);
		})
		.sort((left, right) => left.localeCompare(right, "en"));
	const entries = await readdir(args.candidateRunsDir, {withFileTypes: true});
	if (entries.some((entry) => !entry.isFile())) {
		throw new Error("candidateRunsDir must contain only the deterministic coordinator/staging artifact files.");
	}
	const actualFileNames = entries.map(({name}) => name).sort((left, right) => left.localeCompare(right, "en"));
	if (JSON.stringify(actualFileNames) !== JSON.stringify(expectedFileNames)) {
		throw new Error("candidateRunsDir must exactly contain the deterministic artifacts for all 34 candidate coordinates.");
	}
	const fileBindings = await Promise.all(
		expectedFileNames.map(async (fileName) => ({
			fileName,
			sha256: createSha256(await readFile(path.join(args.candidateRunsDir, fileName))),
		})),
	);
	return createCanonicalSha256(fileBindings);
};

/** @helper external coordinator envelope를 canonical audit inputs와 exact 대조 */
const assertCandidateEnvelopeBinding = async (args: AssertCandidateEnvelopeBindingArgs): Promise<void> => {
	const envelope = (await readJsonObject(args.envelopePath, `candidate replay envelope ${args.candidate.runId}`)).value;
	const protocol = asObject(envelope.protocol, `candidate replay envelope ${args.candidate.runId}.protocol`);
	if (
		(await realpath(path.resolve(asString(protocol.path, `candidate replay envelope ${args.candidate.runId}.protocol.path`)))) !==
		(await realpath(path.resolve(args.publicProtocolPath)))
	) {
		throw new Error(`Candidate ${args.candidate.runId} replay envelope must bind the canonical public protocol path.`);
	}
	if (
		(await realpath(path.resolve(asString(envelope.skillRootDir, `candidate replay envelope ${args.candidate.runId}.skillRootDir`)))) !==
		(await realpath(path.resolve(args.skillRootDir)))
	) {
		throw new Error(`Candidate ${args.candidate.runId} replay envelope must bind the canonical skill root.`);
	}
	if (
		(await realpath(path.resolve(asString(envelope.repositoryDir, `candidate replay envelope ${args.candidate.runId}.repositoryDir`)))) !==
		(await realpath(path.dirname(path.resolve(args.skillRootDir))))
	) {
		throw new Error(`Candidate ${args.candidate.runId} replay envelope must bind the owning repository root.`);
	}
	const dispatch = asObject(envelope.dispatchEnvelope, `candidate replay envelope ${args.candidate.runId}.dispatchEnvelope`);
	const exactCoordinate = {
		runId: args.candidate.runId,
		repositoryHead: args.candidate.repositoryHead,
		arm: args.candidate.arm,
		scenarioId: args.candidate.scenarioId,
		trial: args.candidate.trial,
	};
	for (const [fieldName, expectedValue] of Object.entries(exactCoordinate)) {
		if (dispatch[fieldName] !== expectedValue) {
			throw new Error(`Candidate ${args.candidate.runId} replay envelope dispatch ${fieldName} does not match the candidate coordinate.`);
		}
	}
};

/** @helper deterministic coordinator/staging artifacts를 replay하고 final run raw를 exact 비교 */
const replayCandidateRun = async (args: ValidateCandidateRunArgs): Promise<void> => {
	const candidateRunsDir = path.dirname(args.candidate.path);
	const replayOutputDir = await mkdtemp(path.join(os.tmpdir(), "semantic-candidate-replay-"));

	try {
		let replayedRunPath: string;

		if (args.candidate.scenarioId === "RTE02-owner-placement-css-drift") {
			const initialEnvelopePath = path.join(candidateRunsDir, `${args.candidate.runId}.initial-dispatch-envelope.json`);
			await assertCandidateEnvelopeBinding({
				envelopePath: initialEnvelopePath,
				candidate: args.candidate,
				publicProtocolPath: args.publicProtocolPath,
				skillRootDir: args.skillRootDir,
			});
			const finalized = await finalizeStagedBehavioralRun({
				initialEnvelopePath,
				initialSealPath: path.join(candidateRunsDir, `${args.candidate.runId}.initial-seal.json`),
				followupEnvelopePath: path.join(candidateRunsDir, `${args.candidate.runId}.followup-dispatch-envelope.json`),
				combinedChildPayloadPath: path.join(candidateRunsDir, `${args.candidate.runId}.combined-child-payload.json`),
				mergeProvenancePath: path.join(candidateRunsDir, `${args.candidate.runId}.staged-merge.json`),
				outputDir: replayOutputDir,
				skillRootDir: args.skillRootDir,
			});
			replayedRunPath = finalized.runPath;
		} else {
			const envelopePath = path.join(candidateRunsDir, `${args.candidate.runId}.dispatch-envelope.json`);
			await assertCandidateEnvelopeBinding({
				envelopePath,
				candidate: args.candidate,
				publicProtocolPath: args.publicProtocolPath,
				skillRootDir: args.skillRootDir,
			});
			const merged = await mergeBehavioralEvalChildPayload({
				envelopePath,
				childPayloadPath: path.join(candidateRunsDir, `${args.candidate.runId}.child-payload.json`),
				outputDir: replayOutputDir,
				skillRootDir: args.skillRootDir,
			});
			replayedRunPath = merged.runPath;
		}

		if ((await readFile(replayedRunPath, "utf8")) !== args.candidate.raw) {
			throw new Error(`Candidate ${args.candidate.runId} raw bytes do not exactly match the coordinator replay output.`);
		}
	} finally {
		await rm(replayOutputDir, {recursive: true, force: true});
	}
};

/** @helper candidate public protocol/source/scoring binding과 coordinator replay 검증 */
const validateCandidateRun = async (args: ValidateCandidateRunArgs): Promise<void> => {
	const run = args.candidate.source;
	if (run.schemaVersion !== 3 || run.protocolId !== "progressive-loading-behavioral-v3") {
		throw new Error(`Candidate ${args.candidate.runId} must be a strict progressive-loading-behavioral-v3 run.`);
	}
	if (run.protocolSha256 !== createSha256(args.validatedCriteria.publicProtocolRaw)) {
		throw new Error(`Candidate ${args.candidate.runId} protocolSha256 must exactly match the canonical public protocol raw bytes.`);
	}
	if (run.armSha256 !== args.validatedCriteria.armSha256ByArm.get(args.candidate.arm)) {
		throw new Error(`Candidate ${args.candidate.runId} armSha256 must match the public protocol arm.`);
	}
	if (run.scenarioSha256 !== args.validatedCriteria.scenarioSha256ByScenario.get(args.candidate.scenarioId)) {
		throw new Error(`Candidate ${args.candidate.runId} scenarioSha256 must match the public protocol scenario.`);
	}
	if (args.candidate.task !== args.validatedCriteria.candidatePromptsByScenario.get(args.candidate.scenarioId)) {
		throw new Error(`Candidate ${args.candidate.runId} scenarioPrompt must match the public protocol basePrompt.`);
	}
	const generatedIndexDigests = asObject(run.generatedIndexDigests, `candidate ${args.candidate.runId}.generatedIndexDigests`);
	const actualDigestEntries = Object.entries(generatedIndexDigests);
	const expectedDigestEntries = Object.entries(args.validatedCriteria.protocolGeneratedIndexDigests);
	if (
		actualDigestEntries.length !== expectedDigestEntries.length ||
		expectedDigestEntries.some(([skillName, digest]) => generatedIndexDigests[skillName] !== digest)
	) {
		throw new Error(`Candidate ${args.candidate.runId} generatedIndexDigests must exactly match the public protocol current digests.`);
	}
	const completion = asObject(run.completion, `candidate ${args.candidate.runId}.completion`);
	if (
		completion.status !== "COMPLETE" ||
		completion.blocked !== false ||
		completion.coverageFailCount !== 0 ||
		completion.semanticFailCount !== 0 ||
		completion.unknownCount !== 0
	) {
		throw new Error(`Candidate ${args.candidate.runId} completion must be unblocked COMPLETE with all failure counts zero.`);
	}
	const scoring = asObject(run.scoring, `candidate ${args.candidate.runId}.scoring`);
	if (scoring.kind !== "candidate" || scoring.eligible !== true || scoring.exactMatch !== true) {
		throw new Error(`Candidate ${args.candidate.runId} scoring must be eligible candidate exactMatch true.`);
	}
};

/** @api committed criteria와 immutable candidate raw bytes에서 34/8/8 blind matrix 생성 */
export const createBehavioralSemanticAuditMatrix = async (
	args: CreateBehavioralSemanticAuditMatrixArgs,
): Promise<BehavioralSemanticAuditMatrix> => {
	const skillRootDir = path.resolve(args.skillRootDir);
	const criteriaPath = path.resolve(args.criteriaPath);
	const commitmentPath = path.resolve(args.commitmentPath);
	const candidateRunsDir = path.resolve(args.candidateRunsDir);
	const publicProtocolPath = path.resolve(args.publicProtocolPath);
	const committed = await readCommittedCriteria({criteriaPath, commitmentPath, skillRootDir, publicProtocolPath});
	const candidates = await readCandidateRuns(candidateRunsDir);

	if (candidates.some(({repositoryHead}) => repositoryHead !== committed.validated.reveal.repositoryHead)) {
		throw new Error("Every eligible candidate run repositoryHead must match the committed criteria repositoryHead.");
	}
	for (const candidate of candidates) {
		const coordinateRunId = `${candidate.arm}--${candidate.scenarioId}--t${candidate.trial}`;
		if (candidate.runId !== coordinateRunId) {
			throw new Error(`Eligible candidate runId "${candidate.runId}" must exactly encode its arm, scenario, and trial coordinate.`);
		}
	}
	const actualCandidateRunIds = candidates.map(({runId}) => runId).sort();
	const expectedCandidateRunIds = [...committed.validated.expectedCandidateRunIds].sort();
	if (JSON.stringify(actualCandidateRunIds) !== JSON.stringify(expectedCandidateRunIds)) {
		throw new Error("Eligible candidate runs must exact-cover the public protocol 34-run semantic coordinates.");
	}
	for (const candidate of candidates) {
		await validateCandidateRun({candidate, validatedCriteria: committed.validated, skillRootDir, publicProtocolPath});
	}
	const artifactFingerprint = await readCandidateArtifactSetFingerprint({candidates, candidateRunsDir});
	const replayCacheKey = [
		candidateRunsDir,
		committed.validated.reveal.repositoryHead,
		createSha256(committed.validated.publicProtocolRaw),
	].join("\u0000");
	if (replayedCandidateArtifactSets.get(replayCacheKey) !== artifactFingerprint) {
		for (const candidate of candidates) {
			await replayCandidateRun({candidate, validatedCriteria: committed.validated, skillRootDir, publicProtocolPath});
		}
		const artifactFingerprintAfterReplay = await readCandidateArtifactSetFingerprint({candidates, candidateRunsDir});
		if (artifactFingerprintAfterReplay !== artifactFingerprint) {
			throw new Error("Candidate coordinator/staging artifacts changed during independent replay validation.");
		}
		replayedCandidateArtifactSets.set(replayCacheKey, artifactFingerprint);
	}
	const candidateScenarioIds = [...new Set(candidates.map(({scenarioId}) => scenarioId))].sort();
	const criteriaScenarioIds = committed.validated.reveal.scenarios.map(({scenarioId}) => scenarioId).sort();

	if (candidateScenarioIds.length !== 8 || JSON.stringify(candidateScenarioIds) !== JSON.stringify(criteriaScenarioIds)) {
		throw new Error("Eligible candidate runs must map exactly to the 8 committed criteria scenarios.");
	}

	const batches: SemanticAuditMatrixBatch[] = [];

	for (const scenarioCriteria of committed.validated.reveal.scenarios) {
		const scenarioCandidates = candidates.filter(({scenarioId}) => scenarioId === scenarioCriteria.scenarioId);
		const publicFixture = committed.validated.publicFixtureSet.scenarios.find(
			({scenarioId}) => scenarioId === scenarioCriteria.scenarioId,
		)!;

		for (const candidate of scenarioCandidates) {
			assertPatchBeforeBinding({
				virtualPatch: candidate.virtualPatch,
				publicFixture,
				label: `candidate run ${candidate.runId}.virtualPatch`,
			});
		}
		const fullCount = scenarioCandidates.filter(({arm}) => arm === "full-handbook").length;
		const progressiveCount = scenarioCandidates.filter(({arm}) => arm === "progressive").length;

		if ((scenarioCandidates.length !== 4 && scenarioCandidates.length !== 6) || fullCount !== progressiveCount) {
			throw new Error(`Scenario ${scenarioCriteria.scenarioId} must contain balanced candidate arms with 4 or 6 runs.`);
		}
		const reviewTask = committed.validated.reviewTasksByScenario.get(scenarioCriteria.scenarioId);
		if (!reviewTask) throw new Error(`Scenario ${scenarioCriteria.scenarioId} has no public final reviewer task.`);
		const batchId = `batch-${createHash("sha256")
			.update(
				`${committed.commitment.criteriaSha256}\u0000${scenarioCriteria.scenarioId}\u0000${scenarioCandidates
					.map(({sha256}) => sha256)
					.sort()
					.join("\u0000")}`,
			)
			.digest("hex")
			.slice(0, 16)}`;
		const candidateSamples: SemanticAuditMatrixSample[] = scenarioCandidates.map((candidate) => ({
			sampleId: `sample-${createHash("sha256")
				.update(`${committed.commitment.criteriaSha256}\u0000candidate\u0000${candidate.sha256}\u0000${candidate.virtualPatchRawSha256}`)
				.digest("hex")
				.slice(0, 20)}`,
			kind: "candidate",
			scenarioId: candidate.scenarioId,
			task: reviewTask,
			virtualPatch: candidate.virtualPatch,
			candidateRunPath: candidate.path,
			candidateRunSha256: candidate.sha256,
			virtualPatchRawSha256: candidate.virtualPatchRawSha256,
			targetCriterionId: null,
		}));
		const negativePatchRaw = serializeJson(scenarioCriteria.negativeControl.virtualPatch);
		const negativeSample: SemanticAuditMatrixSample = {
			sampleId: `sample-${createHash("sha256")
				.update(`${committed.commitment.criteriaSha256}\u0000negative-control\u0000${scenarioCriteria.scenarioId}\u0000${negativePatchRaw}`)
				.digest("hex")
				.slice(0, 20)}`,
			kind: "negative-control",
			scenarioId: scenarioCriteria.scenarioId,
			task: reviewTask,
			virtualPatch: scenarioCriteria.negativeControl.virtualPatch,
			candidateRunPath: null,
			candidateRunSha256: null,
			virtualPatchRawSha256: createSha256(negativePatchRaw),
			targetCriterionId: scenarioCriteria.negativeControl.targetCriterionId,
		};
		const samples = [...candidateSamples, negativeSample].sort((left, right) => {
			const leftKey = createSha256(`${committed.commitment.criteriaSha256}\u0000${batchId}\u0000${left.sampleId}`);
			const rightKey = createSha256(`${committed.commitment.criteriaSha256}\u0000${batchId}\u0000${right.sampleId}`);
			return leftKey.localeCompare(rightKey, "en");
		});
		batches.push({batchId, scenarioId: scenarioCriteria.scenarioId, samples});
	}
	assertUniqueStrings(
		batches.map(({batchId}) => batchId),
		"semantic audit batch IDs",
	);
	assertUniqueStrings(
		batches.flatMap(({samples}) => samples.map(({sampleId}) => sampleId)),
		"semantic audit sample IDs",
	);
	const criticalSizedBatches = batches.filter(({samples}) => samples.length === 7).length;
	if (criticalSizedBatches !== 1 || batches.filter(({samples}) => samples.length === 5).length !== 7) {
		throw new Error("Semantic audit matrix must contain seven 4-candidate batches and one 6-candidate batch.");
	}

	return {
		schemaVersion: 1,
		protocolId,
		criteria: {
			commitmentPath,
			commitmentSha256: createSha256(committed.commitmentRaw),
			criteriaPath,
			criteriaSha256: committed.commitment.criteriaSha256,
			criteriaByteLength: committed.commitment.criteriaByteLength,
		},
		publicFixtures: {
			path: publicProtocolPath,
			sha256: createSha256(committed.validated.publicProtocolRaw),
			byteLength: Buffer.byteLength(committed.validated.publicProtocolRaw, "utf8"),
			fixtureSetSha256: committed.validated.reveal.publicFixtureSetSha256,
		},
		skillRootDir,
		candidateRunsDir,
		candidateCount: 34,
		batchCount: 8,
		negativeControlCount: 8,
		batches,
	};
};

/** @api deterministic semantic matrix를 no-overwrite 저장 */
export const writeBehavioralSemanticAuditMatrix = async (
	args: WriteBehavioralSemanticAuditMatrixArgs,
): Promise<WrittenBehavioralSemanticAuditMatrix> => {
	const matrix = await createBehavioralSemanticAuditMatrix(args);
	const raw = serializeJson(matrix);
	const matrixPath = path.resolve(args.matrixPath);
	await writeNoOverwrite(matrixPath, raw);
	return {matrixPath, matrixSha256: createSha256(raw), matrix};
};

/** @helper generated matrix의 current raw/source consistency 재검증 */
const readCurrentMatrix = async (args: ReadCurrentMatrixArgs): Promise<{matrix: BehavioralSemanticAuditMatrix; raw: string}> => {
	const resolvedMatrixPath = path.resolve(args.matrixPath);
	const result = await readJsonObject(resolvedMatrixPath, "semantic audit matrix");
	const matrix = result.value as unknown as BehavioralSemanticAuditMatrix;

	if (matrix.schemaVersion !== 1 || matrix.protocolId !== protocolId) throw new Error("semantic audit matrix schema/protocol is invalid.");
	if (path.resolve(args.skillRootDir) !== path.resolve(matrix.skillRootDir))
		throw new Error("semantic audit matrix skillRootDir no longer matches current rules.");
	if (path.resolve(args.publicProtocolPath) !== path.resolve(matrix.publicFixtures.path)) {
		throw new Error("semantic audit matrix public protocol path no longer matches the bound before fixtures.");
	}
	const regenerated = await createBehavioralSemanticAuditMatrix({
		criteriaPath: matrix.criteria.criteriaPath,
		commitmentPath: matrix.criteria.commitmentPath,
		candidateRunsDir: matrix.candidateRunsDir,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});

	if (serializeJson(regenerated) !== result.raw) {
		throw new Error("Immutable candidate run, virtualPatch raw hash, criteria, or matrix content changed after matrix creation.");
	}

	return {matrix: regenerated, raw: result.raw};
};

/** @helper reviewer request forbidden provenance key 재귀 검사 */
const assertBlindReviewerValue = (value: unknown, label: string): void => {
	if (Array.isArray(value)) {
		for (const [index, item] of value.entries()) assertBlindReviewerValue(item, `${label}[${index}]`);
		return;
	}

	if (typeof value !== "object" || value === null) return;

	for (const [key, child] of Object.entries(value as JsonObject)) {
		if (forbiddenReviewerKeys.has(key)) throw new Error(`${label} leaks forbidden reviewer field "${key}".`);
		assertBlindReviewerValue(child, `${label}.${key}`);
	}
};

/** @helper batch output path resolution */
const resolveBatchPaths = (outputDir: string, batchId: string): SemanticAuditBatchPaths => {
	const root = path.resolve(outputDir);
	return {
		requestPath: path.join(root, `${batchId}.review-request.json`),
		envelopePath: path.join(root, `${batchId}.review-envelope.json`),
		reviewerPayloadPath: path.join(root, `${batchId}.reviewer-payload.json`),
		resultPath: path.join(root, `${batchId}.semantic-result.json`),
	};
};

/** @helper exact reviewer dispatch 생성 */
const createReviewerDispatch = (args: CreateReviewerDispatchArgs): string =>
	[
		`Read and independently review ${args.requestPath} (${args.requestSha256}).`,
		`Write exactly one strict reviewer payload to ${args.reviewerPayloadPath}; create or modify no other file.`,
		"Use only the blinded task, committed criteria, current rule text, and before/after artifacts in the request; return concise status after writing.",
	].join("\n");

/** @helper strict parser와 동일한 reviewer-owned payload 계약 */
const createReviewerPayloadContract = (): Record<string, unknown> => ({
	exactObjectKeysOnly: true,
	topLevel: "{schemaVersion:1,batchId:<request batchId>,reviews:Review[],limitations:string[]}; exact keys only",
	review: "{sampleId:string,criteria:CriterionReview[]}; exact keys only",
	criterion: "{criterionId:string,verdict:'PASS'|'FAIL'|'UNKNOWN',reason:non-empty-string,evidence:Evidence[]}; exact keys only",
	quoteEvidence:
		"{kind:'quote',path:<criterion evidencePath>,state:'before'|'after',quote:non-empty exact substring,occurrence:positive exact non-overlapping occurrence count}; exact keys only",
	absenceEvidence:
		"{kind:'absence',path:<criterion evidencePath>,state:'before'|'after',needle:non-empty substring absent from that artifact state}; exact keys only",
	coverage:
		"Review every sample exactly once and every committed criterion exactly once. PASS/FAIL require at least one verified evidence item; UNKNOWN may use an empty evidence array.",
});

/** @helper persisted matrix에서 deterministic request/envelope 재생성 */
const createSemanticAuditBatchArtifacts = async (args: CreateSemanticAuditBatchArtifactsArgs): Promise<SemanticAuditBatchArtifacts> => {
	const batch = args.matrix.batches.find(({batchId}) => batchId === args.batchId);
	if (!batch) throw new Error(`Unknown semantic audit batch "${args.batchId}".`);
	const committed = await readCommittedCriteria({
		criteriaPath: args.matrix.criteria.criteriaPath,
		commitmentPath: args.matrix.criteria.commitmentPath,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	const scenarioCriteria = committed.validated.reveal.scenarios.find(({scenarioId}) => scenarioId === batch.scenarioId);
	if (!scenarioCriteria) throw new Error(`Committed criteria no longer contains batch scenario ${batch.scenarioId}.`);
	const paths = resolveBatchPaths(args.outputDir, batch.batchId);
	const publicFixture = committed.validated.publicFixtureSet.scenarios.find(({scenarioId}) => scenarioId === batch.scenarioId)!;
	const samples: SemanticAuditReviewerSample[] = batch.samples.map((sample) => {
		const ruleRefs = [...new Set(scenarioCriteria.criteria.flatMap((criterion) => criterion.ruleRefs))];
		const ruleReferences = ruleRefs.map((ruleRef) => {
			const current = committed.validated.rulesByRef.get(ruleRef);
			if (!current) throw new Error(`Current ruleRef ${ruleRef} disappeared during reviewer request preparation.`);
			return {ref: current.ref, content: current.content, sha256: current.sha256};
		});
		const artifacts = sample.virtualPatch.files.map((file, index) => {
			const publicFile = publicFixture.virtualFiles[index]!;
			return {
				path: file.path,
				before: {state: publicFile.state, content: publicFile.content, sha256: publicFile.sha256},
				after: {state: file.afterState, content: file.after, sha256: file.afterSha256},
			};
		});
		return {sampleId: sample.sampleId, task: sample.task, criteria: scenarioCriteria.criteria, ruleReferences, artifacts};
	});
	const request: SemanticAuditReviewerRequest = {
		schemaVersion: 1,
		protocolId,
		batchId: batch.batchId,
		criteriaCommitment: {criteriaSha256: committed.commitment.criteriaSha256, criteriaByteLength: committed.commitment.criteriaByteLength},
		samples,
		evidenceContract:
			"Review every sample and criterion exactly once. PASS/FAIL require verified evidence. quote evidence must name before or after and be an actual substring with its exact non-overlapping occurrence count; absence evidence must name before or after and a substring absent from that artifact. Do not infer source provenance or trust unverified source claims.",
		reviewerPayloadContract: createReviewerPayloadContract(),
		assignedReviewerPayloadPath: paths.reviewerPayloadPath,
	};
	assertBlindReviewerValue(request, "reviewer request");
	const requestRaw = serializeJson(request);
	const requestSha256 = createSha256(requestRaw);
	const exactPrompt = createReviewerDispatch({
		requestPath: paths.requestPath,
		requestSha256,
		reviewerPayloadPath: paths.reviewerPayloadPath,
	});
	const envelope: SemanticAuditReviewerEnvelope = {
		schemaVersion: 1,
		protocolId,
		batchId: batch.batchId,
		matrix: {
			path: path.resolve(args.matrixPath),
			sha256: createSha256(args.matrixRaw),
			byteLength: Buffer.byteLength(args.matrixRaw, "utf8"),
		},
		criteria: args.matrix.criteria,
		publicFixtures: args.matrix.publicFixtures,
		skillRootDir: path.resolve(args.skillRootDir),
		request: {path: paths.requestPath, sha256: requestSha256, byteLength: Buffer.byteLength(requestRaw, "utf8")},
		exactPrompt,
		promptSha256: createSha256(exactPrompt),
		promptByteLength: Buffer.byteLength(exactPrompt, "utf8"),
		promptRendererVersion: "semantic-reviewer-dispatch-v1",
		reviewerPayloadPath: paths.reviewerPayloadPath,
		resultPath: paths.resultPath,
		sampleBindings: batch.samples.map((sample) => ({
			sampleId: sample.sampleId,
			kind: sample.kind,
			scenarioId: sample.scenarioId,
			candidateRunPath: sample.candidateRunPath,
			candidateRunSha256: sample.candidateRunSha256,
			virtualPatchRawSha256: sample.virtualPatchRawSha256,
			targetCriterionId: sample.targetCriterionId,
		})),
	};
	return {...paths, request, requestRaw, envelope, envelopeRaw: serializeJson(envelope), exactPrompt};
};

/** @api one scenario batch의 blind request/envelope/prompt를 exact hash와 함께 저장 */
export const prepareBehavioralSemanticAuditBatch = async (
	args: PrepareBehavioralSemanticAuditBatchArgs,
): Promise<PreparedBehavioralSemanticAuditBatch> => {
	const current = await readCurrentMatrix({
		matrixPath: args.matrixPath,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	const artifacts = await createSemanticAuditBatchArtifacts({
		matrixPath: args.matrixPath,
		matrix: current.matrix,
		matrixRaw: current.raw,
		batchId: args.batchId,
		outputDir: args.outputDir,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	await writeNoOverwrite(artifacts.requestPath, artifacts.requestRaw);

	try {
		await writeNoOverwrite(artifacts.envelopePath, artifacts.envelopeRaw);
	} catch (error) {
		await unlink(artifacts.requestPath).catch(() => undefined);
		throw error;
	}

	return {
		exactPrompt: artifacts.exactPrompt,
		promptSha256: artifacts.envelope.promptSha256,
		requestSha256: artifacts.envelope.request.sha256,
		envelopeSha256: createSha256(artifacts.envelopeRaw),
		requestPath: artifacts.requestPath,
		envelopePath: artifacts.envelopePath,
		reviewerPayloadPath: artifacts.reviewerPayloadPath,
		resultPath: artifacts.resultPath,
	};
};

/** @helper reviewer payload strict parser + exact once + artifact evidence validation */
const parseReviewerPayload = (args: ParseReviewerPayloadArgs): SemanticAuditReviewerPayload => {
	const payload = asObject(args.value, "reviewer payload");
	assertExactKeys({value: payload, expectedKeys: ["schemaVersion", "batchId", "reviews", "limitations"], label: "reviewer payload"});
	if (payload.schemaVersion !== 1 || payload.batchId !== args.request.batchId)
		throw new Error("reviewer payload schemaVersion/batchId is invalid.");
	if (!Array.isArray(payload.reviews)) throw new Error("reviewer payload.reviews must be an array.");
	const limitations = asStringArray(payload.limitations, "reviewer payload.limitations");
	const sampleById = new Map(args.request.samples.map((sample) => [sample.sampleId, sample]));
	const bindingById = new Map(args.envelope.sampleBindings.map((binding) => [binding.sampleId, binding]));
	const reviews: SemanticAuditSampleReview[] = payload.reviews.map((reviewValue, reviewIndex) => {
		const reviewLabel = `reviewer payload.reviews[${reviewIndex}]`;
		const review = asObject(reviewValue, reviewLabel);
		assertExactKeys({value: review, expectedKeys: ["sampleId", "criteria"], label: reviewLabel});
		const sampleId = asString(review.sampleId, `${reviewLabel}.sampleId`);
		const sample = sampleById.get(sampleId);
		if (!sample) throw new Error(`${reviewLabel}.sampleId does not exist in the blind reviewer request.`);
		if (!bindingById.has(sampleId)) throw new Error(`${reviewLabel}.sampleId has no coordinator binding.`);
		if (!Array.isArray(review.criteria)) throw new Error(`${reviewLabel}.criteria must be an array.`);
		const criterionById = new Map(sample.criteria.map((criterion) => [criterion.id, criterion]));
		const artifactByPath = new Map(sample.artifacts.map((artifact) => [artifact.path, artifact]));
		const criteria = review.criteria.map((criterionValue, criterionIndex) => {
			const criterionLabel = `${reviewLabel}.criteria[${criterionIndex}]`;
			const criterion = asObject(criterionValue, criterionLabel);
			assertExactKeys({value: criterion, expectedKeys: ["criterionId", "verdict", "reason", "evidence"], label: criterionLabel});
			const criterionId = asString(criterion.criterionId, `${criterionLabel}.criterionId`);
			const committedCriterion = criterionById.get(criterionId);
			if (!committedCriterion) throw new Error(`${criterionLabel}.criterionId is not a committed criterion.`);
			const verdict = asString(criterion.verdict, `${criterionLabel}.verdict`);
			if (verdict !== "PASS" && verdict !== "FAIL" && verdict !== "UNKNOWN") {
				throw new Error(`${criterionLabel}.verdict must be PASS, FAIL, or UNKNOWN.`);
			}
			const reason = asString(criterion.reason, `${criterionLabel}.reason`);
			if (!Array.isArray(criterion.evidence)) throw new Error(`${criterionLabel}.evidence must be an array.`);
			if (verdict !== "UNKNOWN" && criterion.evidence.length === 0) {
				throw new Error(`${criterionLabel}.evidence must prove PASS or FAIL.`);
			}
			const evidence = criterion.evidence.map((evidenceValue, evidenceIndex) => {
				const evidenceLabel = `${criterionLabel}.evidence[${evidenceIndex}]`;
				const evidenceObject = asObject(evidenceValue, evidenceLabel);
				const kind = asString(evidenceObject.kind, `${evidenceLabel}.kind`);
				const artifactPath = asString(evidenceObject.path, `${evidenceLabel}.path`);
				const artifact = artifactByPath.get(artifactPath);
				if (!artifact) throw new Error(`${evidenceLabel}.path does not identify a request artifact.`);
				if (!committedCriterion.evidencePaths.includes(artifactPath)) {
					throw new Error(`${evidenceLabel}.path is outside the committed criterion evidencePaths.`);
				}
				const state = asString(evidenceObject.state, `${evidenceLabel}.state`);
				if (state !== "before" && state !== "after") throw new Error(`${evidenceLabel}.state must be before or after.`);
				const artifactState = artifact[state];

				if (kind === "quote") {
					assertExactKeys({value: evidenceObject, expectedKeys: ["kind", "path", "state", "quote", "occurrence"], label: evidenceLabel});
					const quote = asString(evidenceObject.quote, `${evidenceLabel}.quote`);
					const occurrence = asPositiveInteger(evidenceObject.occurrence, `${evidenceLabel}.occurrence`);
					if (artifactState.state !== "present" || artifactState.content === null || !artifactState.content.includes(quote)) {
						throw new Error(`${evidenceLabel}.quote must be an actual substring of the selected present artifact state.`);
					}
					let actualOccurrence = 0;
					let cursor = 0;
					while (true) {
						const found = artifactState.content.indexOf(quote, cursor);
						if (found === -1) break;
						actualOccurrence += 1;
						cursor = found + quote.length;
					}
					if (actualOccurrence !== occurrence) {
						throw new Error(`${evidenceLabel}.occurrence must equal actual artifact occurrence count ${actualOccurrence}.`);
					}
					return {kind: "quote", path: artifactPath, state, quote, occurrence} as SemanticAuditQuoteEvidence;
				}

				if (kind === "absence") {
					assertExactKeys({value: evidenceObject, expectedKeys: ["kind", "path", "state", "needle"], label: evidenceLabel});
					const needle = asString(evidenceObject.needle, `${evidenceLabel}.needle`);
					if (artifactState.content?.includes(needle)) {
						throw new Error(`${evidenceLabel}.absence needle is present in the selected artifact state.`);
					}
					return {kind: "absence", path: artifactPath, state, needle} as SemanticAuditAbsenceEvidence;
				}

				throw new Error(`${evidenceLabel}.kind must be quote or absence.`);
			});
			return {criterionId, verdict, reason, evidence} as SemanticAuditCriterionReview;
		});
		assertUniqueStrings(
			criteria.map(({criterionId}) => criterionId),
			`${reviewLabel}.criteria IDs`,
		);
		const expectedCriterionIds = sample.criteria.map(({id}) => id).sort();
		const actualCriterionIds = criteria.map(({criterionId}) => criterionId).sort();
		if (JSON.stringify(actualCriterionIds) !== JSON.stringify(expectedCriterionIds)) {
			throw new Error(`${reviewLabel}.criteria must review every committed criterion exactly once.`);
		}
		return {sampleId, criteria};
	});
	assertUniqueStrings(
		reviews.map(({sampleId}) => sampleId),
		"reviewer payload sample IDs",
	);
	const expectedSampleIds = args.request.samples.map(({sampleId}) => sampleId).sort();
	const actualSampleIds = reviews.map(({sampleId}) => sampleId).sort();
	if (JSON.stringify(actualSampleIds) !== JSON.stringify(expectedSampleIds)) {
		throw new Error("reviewer payload must review every blind sample exactly once.");
	}
	return {schemaVersion: 1, batchId: args.request.batchId, reviews, limitations};
};

/** @helper criterion verdict에서 overall 강제 파생 */
const deriveOverall = (criteria: SemanticAuditCriterionReview[]): "PASS" | "FAIL" | "UNKNOWN" => {
	if (criteria.some(({verdict}) => verdict === "FAIL")) return "FAIL";
	if (criteria.some(({verdict}) => verdict === "UNKNOWN")) return "UNKNOWN";
	return "PASS";
};

/** @helper strict payload와 immutable envelope에서 batch result를 강제로 파생 */
const deriveBehavioralSemanticAuditBatchResult = (
	args: DeriveBehavioralSemanticAuditBatchResultArgs,
): BehavioralSemanticAuditBatchResult => {
	const bindingById = new Map(args.artifacts.envelope.sampleBindings.map((binding) => [binding.sampleId, binding]));
	const samples = args.payload.reviews.map((review) => {
		const binding = bindingById.get(review.sampleId);
		if (!binding) throw new Error(`Reviewer sample ${review.sampleId} has no immutable envelope binding.`);
		return {...review, kind: binding.kind, overall: deriveOverall(review.criteria)} as SemanticAuditMergedSampleReview;
	});
	const negativeSamples = samples.filter(({kind}) => kind === "negative-control");

	if (negativeSamples.length !== 1) throw new Error("Each semantic batch must contain exactly one negative control.");
	const negative = negativeSamples[0]!;
	const negativeBinding = bindingById.get(negative.sampleId)!;
	const designated = negative.criteria.find(({criterionId}) => criterionId === negativeBinding.targetCriterionId);

	if (designated?.verdict !== "FAIL" || negative.overall !== "FAIL") {
		throw new Error("Negative control designated criterion and derived overall must both be FAIL.");
	}
	const candidateSamples = samples.filter(({kind}) => kind === "candidate");
	const batchOverall = deriveOverall(candidateSamples.flatMap(({criteria}) => criteria));
	return {
		schemaVersion: 1,
		protocolId,
		batchId: args.artifacts.envelope.batchId,
		matrixSha256: createSha256(args.matrixRaw),
		requestSha256: args.artifacts.envelope.request.sha256,
		envelopeSha256: createSha256(args.envelopeRaw),
		promptSha256: args.artifacts.envelope.promptSha256,
		reviewerPayloadSha256: createSha256(args.payloadRaw),
		envelopePath: args.artifacts.envelopePath,
		reviewerPayloadPath: args.artifacts.reviewerPayloadPath,
		samples,
		batchOverall,
		negativeControlCaught: true,
		limitations: args.payload.limitations,
	};
};

/** @helper envelope/request/matrix/source의 exact current 재생성 */
const recreateEnvelopeArtifacts = async (
	args: RecreateEnvelopeArtifactsArgs,
): Promise<{artifacts: SemanticAuditBatchArtifacts; envelopeRaw: string; matrixRaw: string}> => {
	const envelopeResult = await readJsonObject(path.resolve(args.envelopePath), "semantic reviewer envelope");
	const envelope = envelopeResult.value as unknown as SemanticAuditReviewerEnvelope;
	if (envelope.schemaVersion !== 1 || envelope.protocolId !== protocolId)
		throw new Error("semantic reviewer envelope schema/protocol is invalid.");
	if (path.resolve(envelope.skillRootDir) !== path.resolve(args.skillRootDir))
		throw new Error("semantic reviewer envelope skillRootDir changed.");
	if (path.resolve(envelope.publicFixtures.path) !== path.resolve(args.publicProtocolPath)) {
		throw new Error("semantic reviewer envelope public protocol path changed.");
	}
	const current = await readCurrentMatrix({
		matrixPath: envelope.matrix.path,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	if (createSha256(current.raw) !== envelope.matrix.sha256 || Buffer.byteLength(current.raw, "utf8") !== envelope.matrix.byteLength) {
		throw new Error("semantic reviewer envelope matrix raw hash binding changed.");
	}
	const artifacts = await createSemanticAuditBatchArtifacts({
		matrixPath: envelope.matrix.path,
		matrix: current.matrix,
		matrixRaw: current.raw,
		batchId: envelope.batchId,
		outputDir: path.dirname(envelope.request.path),
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	if (artifacts.envelopeRaw !== envelopeResult.raw) {
		throw new Error("semantic reviewer envelope no longer matches exact request, prompt, criteria, or immutable candidate bindings.");
	}
	const requestRaw = await readFile(envelope.request.path, "utf8");
	if (requestRaw !== artifacts.requestRaw) throw new Error("semantic reviewer request raw bytes changed after preparation.");
	return {artifacts, envelopeRaw: envelopeResult.raw, matrixRaw: current.raw};
};

/** @api strict reviewer payload를 evidence-checked independent verdict로 merge */
export const mergeBehavioralSemanticAuditReviewerPayload = async (
	args: MergeBehavioralSemanticAuditReviewerPayloadArgs,
): Promise<MergedBehavioralSemanticAuditReviewerPayload> => {
	const recreated = await recreateEnvelopeArtifacts({
		envelopePath: args.envelopePath,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	const {artifacts} = recreated;
	if (path.resolve(args.reviewerPayloadPath) !== artifacts.reviewerPayloadPath) {
		throw new Error("reviewer payload path must exactly match the assigned envelope path.");
	}
	if (path.resolve(args.outputDir) !== path.dirname(artifacts.resultPath)) {
		throw new Error("semantic result outputDir must exactly match the prepared envelope result directory.");
	}
	const payloadResult = await readJsonObject(artifacts.reviewerPayloadPath, "reviewer payload");
	const payload = parseReviewerPayload({value: payloadResult.value, request: artifacts.request, envelope: artifacts.envelope});
	const result = deriveBehavioralSemanticAuditBatchResult({
		artifacts,
		envelopeRaw: recreated.envelopeRaw,
		matrixRaw: recreated.matrixRaw,
		payload,
		payloadRaw: payloadResult.raw,
	});
	const payloadRawAfterValidation = await readFile(artifacts.reviewerPayloadPath, "utf8");
	if (payloadRawAfterValidation !== payloadResult.raw) throw new Error("Reviewer payload changed during semantic merge.");
	await recreateEnvelopeArtifacts({
		envelopePath: args.envelopePath,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	await writeNoOverwrite(artifacts.resultPath, serializeJson(result));
	return {resultPath: artifacts.resultPath, result};
};

/** @helper merged batch result minimal strict validation */
const parseBatchResult = (value: unknown, label: string): BehavioralSemanticAuditBatchResult => {
	const result = asObject(value, label);
	assertExactKeys({
		value: result,
		expectedKeys: [
			"schemaVersion",
			"protocolId",
			"batchId",
			"matrixSha256",
			"requestSha256",
			"envelopeSha256",
			"promptSha256",
			"reviewerPayloadSha256",
			"envelopePath",
			"reviewerPayloadPath",
			"samples",
			"batchOverall",
			"negativeControlCaught",
			"limitations",
		],
		label,
	});
	if (result.schemaVersion !== 1 || result.protocolId !== protocolId || result.negativeControlCaught !== true) {
		throw new Error(`${label} schema/protocol/negative control result is invalid.`);
	}
	if (!Array.isArray(result.samples)) throw new Error(`${label}.samples must be an array.`);
	const samples = result.samples.map((sampleValue, sampleIndex) => {
		const sampleLabel = `${label}.samples[${sampleIndex}]`;
		const sample = asObject(sampleValue, sampleLabel);
		assertExactKeys({value: sample, expectedKeys: ["sampleId", "criteria", "kind", "overall"], label: sampleLabel});
		const kind = asString(sample.kind, `${sampleLabel}.kind`);
		const overall = asString(sample.overall, `${sampleLabel}.overall`);
		if (kind !== "candidate" && kind !== "negative-control") throw new Error(`${sampleLabel}.kind is invalid.`);
		if (overall !== "PASS" && overall !== "FAIL" && overall !== "UNKNOWN") throw new Error(`${sampleLabel}.overall is invalid.`);
		if (!Array.isArray(sample.criteria)) throw new Error(`${sampleLabel}.criteria must be an array.`);
		const criteria = sample.criteria.map((criterionValue, criterionIndex) => {
			const criterionLabel = `${sampleLabel}.criteria[${criterionIndex}]`;
			const criterion = asObject(criterionValue, criterionLabel);
			assertExactKeys({value: criterion, expectedKeys: ["criterionId", "verdict", "reason", "evidence"], label: criterionLabel});
			const verdict = asString(criterion.verdict, `${criterionLabel}.verdict`);
			if (verdict !== "PASS" && verdict !== "FAIL" && verdict !== "UNKNOWN") throw new Error(`${criterionLabel}.verdict is invalid.`);
			if (!Array.isArray(criterion.evidence)) throw new Error(`${criterionLabel}.evidence must be an array.`);
			return {
				criterionId: asString(criterion.criterionId, `${criterionLabel}.criterionId`),
				verdict,
				reason: asString(criterion.reason, `${criterionLabel}.reason`),
				evidence: criterion.evidence as SemanticAuditEvidence[],
			} as SemanticAuditCriterionReview;
		});
		if (deriveOverall(criteria) !== overall) throw new Error(`${sampleLabel}.overall must be derived from reviewer criteria.`);
		return {sampleId: asString(sample.sampleId, `${sampleLabel}.sampleId`), criteria, kind, overall} as SemanticAuditMergedSampleReview;
	});
	return {
		schemaVersion: 1,
		protocolId,
		batchId: asString(result.batchId, `${label}.batchId`),
		matrixSha256: asString(result.matrixSha256, `${label}.matrixSha256`),
		requestSha256: asString(result.requestSha256, `${label}.requestSha256`),
		envelopeSha256: asString(result.envelopeSha256, `${label}.envelopeSha256`),
		promptSha256: asString(result.promptSha256, `${label}.promptSha256`),
		reviewerPayloadSha256: asString(result.reviewerPayloadSha256, `${label}.reviewerPayloadSha256`),
		envelopePath: asString(result.envelopePath, `${label}.envelopePath`),
		reviewerPayloadPath: asString(result.reviewerPayloadPath, `${label}.reviewerPayloadPath`),
		samples,
		batchOverall: result.batchOverall as "PASS" | "FAIL" | "UNKNOWN",
		negativeControlCaught: true,
		limitations: asStringArray(result.limitations, `${label}.limitations`),
	};
};

/** @api exact 34 candidates, 8 batches, 8 caught controls와 FAIL/UNKNOWN zero gate 집계 */
export const aggregateBehavioralSemanticAuditResults = async (
	args: AggregateBehavioralSemanticAuditResultsArgs,
): Promise<BehavioralSemanticAuditAggregate> => {
	const current = await readCurrentMatrix({
		matrixPath: args.matrixPath,
		skillRootDir: args.skillRootDir,
		publicProtocolPath: args.publicProtocolPath,
	});
	const matrixSha256 = createSha256(current.raw);
	const results: BehavioralSemanticAuditBatchResult[] = [];

	for (const batch of current.matrix.batches) {
		const resultPath = path.join(path.resolve(args.resultsDir), `${batch.batchId}.semantic-result.json`);
		const resultRead = await readJsonObject(resultPath, `semantic result ${batch.batchId}`);
		const persistedResult = parseBatchResult(resultRead.value, `semantic result ${batch.batchId}`);
		if (persistedResult.batchId !== batch.batchId || persistedResult.matrixSha256 !== matrixSha256) {
			throw new Error(`Semantic result ${batch.batchId} does not match current matrix binding.`);
		}
		const recreated = await recreateEnvelopeArtifacts({
			envelopePath: persistedResult.envelopePath,
			skillRootDir: args.skillRootDir,
			publicProtocolPath: args.publicProtocolPath,
		});
		if (
			path.resolve(recreated.artifacts.envelope.matrix.path) !== path.resolve(args.matrixPath) ||
			recreated.matrixRaw !== current.raw ||
			recreated.artifacts.resultPath !== path.resolve(resultPath) ||
			path.resolve(persistedResult.reviewerPayloadPath) !== recreated.artifacts.reviewerPayloadPath
		) {
			throw new Error(`Semantic result ${batch.batchId} artifact paths or matrix binding do not match the aggregate inputs.`);
		}
		const payloadRead = await readJsonObject(recreated.artifacts.reviewerPayloadPath, `reviewer payload ${batch.batchId}`);
		const payload = parseReviewerPayload({
			value: payloadRead.value,
			request: recreated.artifacts.request,
			envelope: recreated.artifacts.envelope,
		});
		const result = deriveBehavioralSemanticAuditBatchResult({
			artifacts: recreated.artifacts,
			envelopeRaw: recreated.envelopeRaw,
			matrixRaw: recreated.matrixRaw,
			payload,
			payloadRaw: payloadRead.raw,
		});
		if (serializeJson(result) !== resultRead.raw) {
			throw new Error(
				`Semantic result ${batch.batchId} artifact binding or derived reviewer verdict content does not exactly match the persisted result.`,
			);
		}
		const expectedSamples = batch.samples.map(({sampleId, kind}) => `${sampleId}:${kind}`).sort();
		const actualSamples = result.samples.map(({sampleId, kind}) => `${sampleId}:${kind}`).sort();
		if (JSON.stringify(actualSamples) !== JSON.stringify(expectedSamples)) {
			throw new Error(`Semantic result ${batch.batchId} must contain every matrix sample exactly once.`);
		}
		const [resultRawAfterValidation, payloadRawAfterValidation] = await Promise.all([
			readFile(resultPath, "utf8"),
			readFile(recreated.artifacts.reviewerPayloadPath, "utf8"),
		]);
		if (resultRawAfterValidation !== resultRead.raw || payloadRawAfterValidation !== payloadRead.raw) {
			throw new Error(`Semantic result ${batch.batchId} or reviewer payload changed during aggregate validation.`);
		}
		results.push(result);
	}
	const allSamples = results.flatMap(({samples}) => samples);
	assertUniqueStrings(
		allSamples.map(({sampleId}) => sampleId),
		"aggregate semantic sample IDs",
	);
	const candidates = allSamples.filter(({kind}) => kind === "candidate");
	const controls = allSamples.filter(({kind}) => kind === "negative-control");
	if (candidates.length !== 34 || results.length !== 8 || controls.length !== 8) {
		throw new Error("Independent semantic aggregate requires exact 34 candidates, 8 batches, and 8 negative controls.");
	}
	const candidatePassCount = candidates.filter(({overall}) => overall === "PASS").length;
	const candidateFailCount = candidates.filter(({overall}) => overall === "FAIL").length;
	const candidateUnknownCount = candidates.filter(({overall}) => overall === "UNKNOWN").length;
	const negativeControlsCaught = results.filter(({negativeControlCaught}) => negativeControlCaught).length;
	return {
		schemaVersion: 1,
		protocolId,
		matrixSha256,
		candidateCount: 34,
		batchCount: 8,
		negativeControlCount: 8,
		candidatePassCount,
		candidateFailCount,
		candidateUnknownCount,
		negativeControlsCaught,
		gatePassed: candidatePassCount === 34 && candidateFailCount === 0 && candidateUnknownCount === 0 && negativeControlsCaught === 8,
	};
};
