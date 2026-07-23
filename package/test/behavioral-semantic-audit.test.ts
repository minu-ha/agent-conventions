import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {createHash} from "node:crypto";
import {mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {promisify} from "node:util";

import {buildSkill} from "../src/build.js";
import {mergeBehavioralEvalChildPayload, prepareBehavioralEvalDispatch} from "../src/behavioral-eval-coordinator.js";
import {
	finalizeStagedBehavioralRun,
	mergeStagedBehavioralPayloads,
	prepareStagedFollowupDispatch,
	prepareStagedInitialDispatch,
	sealStagedInitialPayload,
} from "../src/behavioral-eval-staging.js";
import {
	aggregateBehavioralSemanticAuditResults,
	commitBehavioralSemanticAuditCriteria,
	createBehavioralSemanticAuditMatrix,
	mergeBehavioralSemanticAuditReviewerPayload,
	prepareBehavioralSemanticAuditBatch,
	writeBehavioralSemanticAuditMatrix,
} from "../src/behavioral-semantic-audit.js";
import {getSkillPaths} from "../src/config.js";

const sha256 = (value: string): string => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const execFileAsync = promisify(execFile);
const stagedScenarioId = "RTE02-owner-placement-css-drift";
const scenarioIds = [
	"derive-existing-contract-with-docs",
	"css-repeated-values-and-optional-token",
	"css-domain-state-class-contract",
	"RTE12-query-shaping",
	stagedScenarioId,
	"RTE03-route-support-extraction",
	"css-one-off-structural-modifier",
	"RTE10-derived-selection-state",
] as const;

type PublicVirtualFileFixture = {path: string; state: "present" | "absent"; content: string | null; sha256: string | null};

/** @summary semantic audit temporary fixture */
interface SemanticAuditFixture {
	/** @field fixture root */
	rootDir: string;
	/** @field committed criteria reveal path */
	criteriaPath: string;
	/** @field criteria commitment path */
	commitmentPath: string;
	/** @field candidate run directory */
	runsDir: string;
	/** @field current rule source root */
	skillRootDir: string;
	/** @field public before virtual fixtures가 포함된 protocol */
	publicProtocolPath: string;
	/** @field deterministic matrix output path */
	matrixPath: string;
}

/** @helper present/absent state를 포함한 public virtual patch 생성 */
const createVirtualPatch = (
	content: string,
	virtualFiles: PublicVirtualFileFixture[] = [{path: "src/example.ts", state: "absent", content: null, sha256: null}],
): Record<string, unknown> => ({
	files: virtualFiles.map((file) => ({
		path: file.path,
		beforeState: file.state,
		beforeSha256: file.sha256,
		afterState: "present",
		after: content,
		afterSha256: sha256(content),
	})),
	summary: "virtual semantic change",
});

/** @helper strict behavioral validator용 declared runtime */
const createDeclaredRuntime = (): Record<string, unknown> => ({
	evidenceClass: "declared-telemetry-only",
	declared: {
		runtime: "Codex CLI isolated child session",
		requestedModel: "gpt-5.6-sol",
		requestedReasoning: "high",
		forkTurns: "none",
		oneChildPerTrial: true,
	},
	unavailable: {
		runtimeVersion: null,
		exactModelBuild: null,
		actualReasoningTelemetry: null,
		observedFileReads: null,
		childTokenUsage: null,
	},
});

/** @helper temp repository에 최소 progressive structured skill 생성 */
const writeFixtureSkill = async (skillRootDir: string, skillName: "react" | "typescript" | "css"): Promise<void> => {
	const skillDir = path.join(skillRootDir, skillName);
	const rulesDir = path.join(skillDir, "rules");
	await mkdir(rulesDir, {recursive: true});
	await writeFile(
		path.join(skillDir, "metadata.json"),
		`${JSON.stringify(
			{
				title: `${skillName} Fixture Convention`,
				version: "1.0.0",
				organization: "Fixture Team",
				abstract: "Semantic replay fixture skill.",
				progressiveDisclosure: true,
			},
			null,
			2,
		)}\n`,
		"utf8",
	);
	await writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${skillName}\ndescription: Semantic fixture.\n---\n`, "utf8");
	await writeFile(
		path.join(rulesDir, "_sections.md"),
		"## 1. Fixture Rules (rule)\n\n**Impact:** HIGH\n\n**Description:** Semantic fixture rules.\n",
		"utf8",
	);
	await writeFile(
		path.join(rulesDir, "rule-a.md"),
		"---\ntitle: Rule A\nimpact: HIGH\nimpactDescription: Semantic fixture rule.\nappliesWhen: the fixture artifact is edited\ntags: fixture\n---\n## Rule A\n\n**Impact: HIGH (Semantic fixture rule.)**\n\nThe output must contain `good`.\n\n**Incorrect**\n\n```ts\nconst bad = true;\n```\n\n**Correct**\n\n```ts\nconst good = true;\n```\n",
		"utf8",
	);
	await buildSkill(getSkillPaths(skillName, skillRootDir));
};

type CreateCandidatePayloadArgs = {
	arm: "full-handbook" | "progressive";
	generatedIndexDigests: Record<string, string>;
	virtualFiles: PublicVirtualFileFixture[];
	includeDriftReceipt: boolean;
};

/** @helper coordinator replay를 통과하는 최소 fixed-point candidate payload */
const createCandidatePayload = (args: CreateCandidatePayloadArgs): Record<string, unknown> => {
	const createPass = (pass: number) => ({
		pass,
		activatedSkills: ["react"],
		scopeEvidence: ["src/example.ts fixture change"],
		generatedIndexDigests: {react: args.generatedIndexDigests.react},
		selected: {react: ["rule-a"]},
		notApplicable: {react: []},
		unknown: {react: []},
		requiresSelectedEvaluated: [],
		requiresSelectedAdded: [],
		reviewWithReevaluated: [],
		completionGatesEvaluated: [],
		completionGateAdded: [],
	});
	const payload: Record<string, unknown> = {
		runtime: createDeclaredRuntime(),
		virtualPatch: createVirtualPatch("const good = true;\n", args.virtualFiles),
		declaredLoadedFiles: {
			kind: "declared",
			paths:
				args.arm === "full-handbook"
					? ["skill/react/SKILL.md", "skill/react/AGENTS.md"]
					: ["skill/react/SKILL.md", "skill/react/RULES_INDEX.md", "skill/react/contracts/rule-a.md"],
		},
		activatedSkills: ["react"],
		receipts: [
			{
				skill: "react",
				indexDigest: args.arm === "full-handbook" ? null : args.generatedIndexDigests.react,
				selected: [{ordinal: "R01", id: "rule-a"}],
				notApplicable: [],
				unknown: [],
				excludedGroups: [],
				expanded: [],
			},
		],
		routingTrace: {passes: [createPass(1), createPass(2), createPass(3)], stablePair: [2, 3], stable: true},
		semanticVerdicts: [{criterion: "child-self", verdict: "PASS", reason: "self verdict remains non-authoritative"}],
		completion: {
			status: "COMPLETE",
			blocked: false,
			coverageFailCount: 0,
			semanticFailCount: 0,
			unknownCount: 0,
			reason: "stable complete fixture",
		},
		limitations: [],
		response: "fixture implementation",
	};
	if (args.includeDriftReceipt) payload.driftReceipt = null;
	return payload;
};

/** @helper fixture canonical SHA 계산 */
const canonicalize = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(canonicalize);
	if (typeof value !== "object" || value === null) return value;
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>)
			.sort(([left], [right]) => left.localeCompare(right, "en"))
			.map(([key, child]) => [key, canonicalize(child)]),
	);
};

/** @helper recursively key-sorted compact JSON SHA */
const canonicalSha256 = (value: unknown): string => sha256(JSON.stringify(canonicalize(value)));

/** @helper 8개 scenario와 34개 eligible candidate를 가진 fixture 생성 */
const createFixture = async (): Promise<SemanticAuditFixture> => {
	const rootDir = await mkdtemp(path.join(os.tmpdir(), "behavioral-semantic-audit-"));
	const skillRootDir = path.join(rootDir, "skill");
	const runsDir = path.join(rootDir, "runs");
	const criteriaPath = path.join(rootDir, "criteria.json");
	const commitmentPath = path.join(rootDir, "criteria-commitment.json");
	const matrixPath = path.join(rootDir, "matrix.json");
	const publicProtocolPath = path.join(rootDir, "docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json");
	await Promise.all((["react", "typescript", "css"] as const).map(async (skillName) => await writeFixtureSkill(skillRootDir, skillName)));
	const generatedIndexDigests = Object.fromEntries(
		await Promise.all(
			(["react", "typescript", "css"] as const).map(async (skillName) => {
				const indexRaw = await readFile(path.join(skillRootDir, skillName, "RULES_INDEX.md"), "utf8");
				return [skillName, indexRaw.match(/Routing digest: `([^`]+)`/)?.[1]] as const;
			}),
		),
	) as Record<"react" | "typescript" | "css", string>;
	await writeFile(
		path.join(skillRootDir, "react", "routing-evals.json"),
		`${JSON.stringify(
			{
				version: 1,
				skill: "react",
				scenarios: scenarioIds.map((scenarioId) => ({
					id: scenarioId,
					expectedSkills: ["react"],
					expectedSelected: {react: ["rule-a"]},
					expectedNotApplicable: {react: []},
					...(scenarioId === stagedScenarioId
						? {scopeDrift: {expectedSkills: ["react"], expectedSelected: {react: ["rule-a"]}, expectedNotApplicable: {react: []}}}
						: {}),
				})),
			},
			null,
			2,
		)}\n`,
		"utf8",
	);
	const sourceProtocolPath = path.resolve(
		import.meta.dirname,
		"../../docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json",
	);
	const protocol = JSON.parse(await readFile(sourceProtocolPath, "utf8")) as Record<string, unknown>;
	const protocolScenarios = protocol.scenarios as Record<string, Record<string, unknown>>;
	for (const scenarioId of scenarioIds) {
		const scenario = protocolScenarios[scenarioId]!;
		if (scenarioId === stagedScenarioId) {
			scenario.filesInitial = ["src/example.ts"];
			scenario.filesFinal = ["src/example.ts", "src/example.css"];
			scenario.virtualFiles = [
				{path: "src/example.ts", state: "absent", content: null, sha256: null},
				{path: "src/example.css", state: "absent", content: null, sha256: null},
			];
		} else {
			scenario.files = ["src/example.ts"];
			scenario.virtualFiles = [{path: "src/example.ts", state: "absent", content: null, sha256: null}];
		}
	}
	const publicFixtureScenarios = scenarioIds.map((scenarioId) => ({
		scenarioId,
		virtualFiles: protocolScenarios[scenarioId]!.virtualFiles as PublicVirtualFileFixture[],
	}));
	const publicFixtureSet = {
		schemaVersion: 1,
		fixtureSetId: "progressive-loading-public-virtual-fixtures-v1",
		scenarios: [...publicFixtureScenarios].sort((left, right) => left.scenarioId.localeCompare(right.scenarioId, "en")),
	};
	await execFileAsync("git", ["init", "--quiet"], {cwd: rootDir});
	await execFileAsync("git", ["config", "user.email", "semantic-fixture@example.invalid"], {cwd: rootDir});
	await execFileAsync("git", ["config", "user.name", "Semantic Fixture"], {cwd: rootDir});
	await execFileAsync("git", ["add", "skill"], {cwd: rootDir});
	await execFileAsync("git", ["commit", "--quiet", "-m", "fixture source"], {cwd: rootDir});
	const repositoryHead = (await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: rootDir})).stdout.trim();

	const criteria = {
		schemaVersion: 1,
		criteriaSetId: "fixture-semantic-criteria",
		repositoryHead,
		generatedIndexDigests,
		publicFixtureSetSha256: canonicalSha256(publicFixtureSet),
		rubric: {
			verdicts: ["PASS", "FAIL", "UNKNOWN"],
			evidencePolicy: "Verify exact quote and absence evidence.",
			processOnlyPolicy: "Process-only rules require a reason.",
			negativeControlPolicy: "The target criterion and overall must fail.",
		},
		scenarios: scenarioIds.map((scenarioId, index) => ({
			scenarioId,
			publicFixtureScenarioSha256: canonicalSha256(publicFixtureScenarios[index]),
			criteria: [
				{
					id: `criterion-${index + 1}`,
					stage: "single",
					ruleRefs: ["react/rule-a"],
					requirement: "The resulting artifact contains the required good implementation.",
					evidencePaths: ["src/example.ts"],
					requiredObservations: ["good is present"],
					forbiddenObservations: ["bad is present"],
					evidencePolicy: "Quote good or bad from the after artifact.",
				},
			],
			processOnlyRuleRefs: [],
			negativeControl: {
				targetCriterionId: `criterion-${index + 1}`,
				virtualPatch: createVirtualPatch("const bad = true;\n", publicFixtureScenarios[index]!.virtualFiles),
			},
		})),
		authoringProvenance: {
			authoredAtUtc: "2026-07-22T00:00:00Z",
			publicProtocolPath: "docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json",
			sealPolicy: "criteria raw bytes committed before candidate review",
		},
	};
	const criteriaRaw = `${JSON.stringify(criteria, null, 2)}\n`;
	(protocol.repository as Record<string, unknown>).sourceHead = repositoryHead;
	(protocol.repository as Record<string, unknown>).bindingStatus = "bound";
	const identityDictionaries = protocol.fullHandbookIdentityDictionaries as Record<string, unknown>;
	identityDictionaries.react = ["R01|Rule A|rule-a"];
	identityDictionaries.typescript = ["T01|Rule A|rule-a"];
	identityDictionaries.css = ["C01|Rule A|rule-a"];
	for (const [skillName, digest] of Object.entries(generatedIndexDigests)) {
		((protocol.generatedIndexes as Record<string, Record<string, unknown>>)[skillName] ?? {}).digest = digest;
	}
	(protocol.semanticAudit as Record<string, unknown>).criteriaCommitmentSha256 = sha256(criteriaRaw);
	await mkdir(path.dirname(publicProtocolPath), {recursive: true});
	await writeFile(publicProtocolPath, `${JSON.stringify(protocol, null, 2)}\n`, "utf8");
	await writeFile(criteriaPath, criteriaRaw, "utf8");
	await mkdir(runsDir, {recursive: true});

	for (const [scenarioIndex, scenarioId] of scenarioIds.entries()) {
		const trialsPerArm = scenarioIndex === scenarioIds.length - 1 ? 3 : 2;

		for (const arm of ["full-handbook", "progressive"] as const) {
			for (let trial = 1; trial <= trialsPerArm; trial += 1) {
				const runId = `${arm}--${scenarioId}--t${trial}`;
				if (scenarioId === stagedScenarioId) {
					const agentTarget = `/root/semantic_fixture_${arm.replace("-", "_")}_${trial}`;
					const initial = await prepareStagedInitialDispatch({
						protocolPath: publicProtocolPath,
						repositoryHead,
						runId,
						arm,
						trial,
						agentTarget,
						outputDir: runsDir,
						repositoryDir: rootDir,
						skillRootDir,
					});
					const initialRequest = JSON.parse(await readFile(initial.requestPath, "utf8")) as Record<string, unknown>;
					await writeFile(
						initial.childPayloadPath,
						`${JSON.stringify(
							createCandidatePayload({
								arm,
								generatedIndexDigests,
								virtualFiles: initialRequest.virtualFiles as PublicVirtualFileFixture[],
								includeDriftReceipt: true,
							}),
							null,
							2,
						)}\n`,
						"utf8",
					);
					const sealed = await sealStagedInitialPayload({
						envelopePath: initial.envelopePath,
						childPayloadPath: initial.childPayloadPath,
						agentTarget,
						outputDir: runsDir,
					});
					const followup = await prepareStagedFollowupDispatch({
						initialEnvelopePath: initial.envelopePath,
						initialSealPath: sealed.sealPath,
						outputDir: runsDir,
					});
					await writeFile(
						followup.childPayloadPath,
						`${JSON.stringify(
							createCandidatePayload({
								arm,
								generatedIndexDigests,
								virtualFiles: followup.request.virtualFiles as PublicVirtualFileFixture[],
								includeDriftReceipt: false,
							}),
							null,
							2,
						)}\n`,
						"utf8",
					);
					const combined = await mergeStagedBehavioralPayloads({
						initialEnvelopePath: initial.envelopePath,
						initialSealPath: sealed.sealPath,
						followupEnvelopePath: followup.envelopePath,
						initialChildPayloadPath: initial.childPayloadPath,
						driftChildPayloadPath: followup.childPayloadPath,
						agentTarget,
						outputDir: runsDir,
					});
					await finalizeStagedBehavioralRun({
						initialEnvelopePath: initial.envelopePath,
						initialSealPath: sealed.sealPath,
						followupEnvelopePath: followup.envelopePath,
						combinedChildPayloadPath: combined.combinedChildPayloadPath,
						mergeProvenancePath: combined.mergeProvenancePath,
						outputDir: runsDir,
						skillRootDir,
					});
				} else {
					const prepared = await prepareBehavioralEvalDispatch({
						protocolPath: publicProtocolPath,
						repositoryHead,
						runId,
						arm,
						scenarioId,
						trial,
						outputDir: runsDir,
						repositoryDir: rootDir,
						skillRootDir,
					});
					const request = JSON.parse(await readFile(prepared.requestPath, "utf8")) as Record<string, unknown>;
					await writeFile(
						prepared.childPayloadPath,
						`${JSON.stringify(
							createCandidatePayload({
								arm,
								generatedIndexDigests,
								virtualFiles: request.virtualFiles as PublicVirtualFileFixture[],
								includeDriftReceipt: true,
							}),
							null,
							2,
						)}\n`,
						"utf8",
					);
					await mergeBehavioralEvalChildPayload({
						envelopePath: prepared.envelopePath,
						childPayloadPath: prepared.childPayloadPath,
						outputDir: runsDir,
						skillRootDir,
					});
				}
			}
		}
	}

	return {rootDir, criteriaPath, commitmentPath, runsDir, skillRootDir, matrixPath, publicProtocolPath};
};

/** @helper prepared blind request에서 reviewer payload 생성 */
const createReviewerPayload = (request: Record<string, unknown>, envelope: Record<string, unknown>): Record<string, unknown> => {
	const samples = request.samples as Record<string, unknown>[];
	const bindings = envelope.sampleBindings as Record<string, unknown>[];
	const negativeIds = new Set(bindings.filter((binding) => binding.kind === "negative-control").map((binding) => binding.sampleId));

	return {
		schemaVersion: 1,
		batchId: request.batchId,
		reviews: samples.map((sample) => {
			const sampleId = String(sample.sampleId);
			const criterion = (sample.criteria as Record<string, unknown>[])[0]!;
			const isNegative = negativeIds.has(sampleId);
			return {
				sampleId,
				criteria: [
					{
						criterionId: criterion.id,
						verdict: isNegative ? "FAIL" : "PASS",
						reason: isNegative ? "The designated negative control contains bad." : "The artifact contains good.",
						evidence: [{kind: "quote", path: "src/example.ts", quote: isNegative ? "bad" : "good", state: "after", occurrence: 1}],
					},
				],
			};
		}),
		limitations: [],
	};
};

test("criteria commitment, 34/8/8 blind matrix, merge, and aggregate form an independently bound gate", async () => {
	const fixture = await createFixture();

	try {
		const committed = await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const criteriaRaw = await readFile(fixture.criteriaPath, "utf8");
		assert.equal(committed.commitment.criteriaSha256, sha256(criteriaRaw));
		assert.equal(committed.commitment.criteriaByteLength, Buffer.byteLength(criteriaRaw, "utf8"));

		const first = await createBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const second = await createBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		assert.deepEqual(first, second);
		assert.equal(first.candidateCount, 34);
		assert.equal(first.batchCount, 8);
		assert.equal(first.negativeControlCount, 8);
		assert.equal(first.batches.flatMap(({samples}) => samples).length, 42);
		assert.equal(new Set(first.batches.flatMap(({samples}) => samples.map(({sampleId}) => sampleId))).size, 42);
		assert.ok(first.batches.every(({batchId}) => /^batch-[a-f0-9]{16}$/.test(batchId)));
		assert.ok(first.batches.flatMap(({samples}) => samples).every(({sampleId}) => /^sample-[a-f0-9]{20}$/.test(sampleId)));

		const written = await writeBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
			matrixPath: fixture.matrixPath,
		});
		assert.equal(written.matrixPath, fixture.matrixPath);

		const resultsDir = path.join(fixture.rootDir, "audit-results");
		const resultPaths: string[] = [];

		for (const batch of first.batches) {
			const prepared = await prepareBehavioralSemanticAuditBatch({
				matrixPath: fixture.matrixPath,
				batchId: batch.batchId,
				outputDir: resultsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			});
			const requestRaw = await readFile(prepared.requestPath, "utf8");
			assert.equal(sha256(requestRaw), prepared.requestSha256);
			assert.equal(sha256(prepared.exactPrompt), prepared.promptSha256);
			assert.doesNotMatch(
				requestRaw,
				/"(?:arm|runId|trial|receipts|scoring|semanticVerdicts|completion)"\s*:|full-handbook|progressive|child self verdict/i,
			);
			const request = JSON.parse(requestRaw) as Record<string, unknown>;
			const reviewerPayloadContract = request.reviewerPayloadContract as Record<string, unknown>;
			assert.equal(reviewerPayloadContract.exactObjectKeysOnly, true);
			assert.match(String(reviewerPayloadContract.topLevel), /schemaVersion:1.*batchId.*reviews.*limitations/i);
			assert.match(String(reviewerPayloadContract.review), /sampleId.*criteria.*exact keys/i);
			assert.match(
				String(reviewerPayloadContract.criterion),
				/criterionId.*verdict:'PASS'\|'FAIL'\|'UNKNOWN'.*reason.*evidence.*exact keys/i,
			);
			assert.match(String(reviewerPayloadContract.quoteEvidence), /kind:'quote'.*path.*state.*quote.*occurrence.*exact keys/i);
			assert.match(String(reviewerPayloadContract.absenceEvidence), /kind:'absence'.*path.*state.*needle.*exact keys/i);
			assert.match(
				String(reviewerPayloadContract.coverage),
				/every sample.*exactly once.*every committed criterion.*exactly once.*PASS\/FAIL.*at least one.*UNKNOWN.*empty/i,
			);
			const firstArtifact = (((request.samples as Record<string, unknown>[])[0]!.artifacts as Record<string, unknown>[])[0] ??
				{}) as Record<string, unknown>;
			assert.deepEqual(firstArtifact.before, {state: "absent", content: null, sha256: null});
			const envelope = JSON.parse(await readFile(prepared.envelopePath, "utf8")) as Record<string, unknown>;
			const payload = createReviewerPayload(request, envelope);
			await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
			const merged = await mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: resultsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			});
			assert.equal(merged.result.batchOverall, "PASS");
			assert.equal(merged.result.negativeControlCaught, true);
			resultPaths.push(merged.resultPath);
		}

		const aggregate = await aggregateBehavioralSemanticAuditResults({
			matrixPath: fixture.matrixPath,
			resultsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		assert.deepEqual(
			{
				candidateCount: aggregate.candidateCount,
				batchCount: aggregate.batchCount,
				negativeControlCount: aggregate.negativeControlCount,
				candidatePassCount: aggregate.candidatePassCount,
				candidateFailCount: aggregate.candidateFailCount,
				candidateUnknownCount: aggregate.candidateUnknownCount,
				negativeControlsCaught: aggregate.negativeControlsCaught,
				gatePassed: aggregate.gatePassed,
			},
			{
				candidateCount: 34,
				batchCount: 8,
				negativeControlCount: 8,
				candidatePassCount: 34,
				candidateFailCount: 0,
				candidateUnknownCount: 0,
				negativeControlsCaught: 8,
				gatePassed: true,
			},
		);

		const forgedResult = JSON.parse(await readFile(resultPaths[0]!, "utf8")) as Record<string, unknown>;
		forgedResult.requestSha256 = sha256("forged reviewer request binding");
		await writeFile(resultPaths[0]!, `${JSON.stringify(forgedResult, null, 2)}\n`, "utf8");
		await assert.rejects(
			aggregateBehavioralSemanticAuditResults({
				matrixPath: fixture.matrixPath,
				resultsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/request.*hash|artifact.*binding|envelope/i,
		);
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("criteria seal, repository HEAD, and generated indexes are cross-bound to the public protocol", async () => {
	const fixture = await createFixture();

	try {
		const protocolRaw = await readFile(fixture.publicProtocolPath, "utf8");
		const protocol = JSON.parse(protocolRaw) as Record<string, unknown>;
		(protocol.semanticAudit as Record<string, unknown>).criteriaCommitmentSha256 = sha256("different criteria");
		await writeFile(fixture.publicProtocolPath, `${JSON.stringify(protocol, null, 2)}\n`, "utf8");
		await assert.rejects(
			commitBehavioralSemanticAuditCriteria({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/criteria.*commitment|sealed criteria/i,
		);

		const headMismatch = JSON.parse(protocolRaw) as Record<string, unknown>;
		(headMismatch.repository as Record<string, unknown>).sourceHead = "f".repeat(40);
		await writeFile(fixture.publicProtocolPath, `${JSON.stringify(headMismatch, null, 2)}\n`, "utf8");
		await assert.rejects(
			commitBehavioralSemanticAuditCriteria({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/repositoryHead.*protocol|sourceHead.*criteria|git HEAD/i,
		);

		const digestMismatch = JSON.parse(protocolRaw) as Record<string, unknown>;
		((digestMismatch.generatedIndexes as Record<string, Record<string, unknown>>).react ?? {}).digest = `sha256:${"d".repeat(64)}`;
		await writeFile(fixture.publicProtocolPath, `${JSON.stringify(digestMismatch, null, 2)}\n`, "utf8");
		await assert.rejects(
			commitBehavioralSemanticAuditCriteria({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/generatedIndexDigests.*protocol|generatedIndexes.*criteria/i,
		);
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("candidate coordinates exact-cover the protocol 34-run semantic subset", async () => {
	const fixture = await createFixture();

	try {
		await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const runPath = path.join(fixture.runsDir, `full-handbook--${scenarioIds[0]}--t1.run.json`);
		const run = JSON.parse(await readFile(runPath, "utf8")) as Record<string, unknown>;
		run.runId = `full-handbook--${scenarioIds[0]}--t99`;
		run.trial = 99;
		await writeFile(runPath, `${JSON.stringify(run, null, 2)}\n`, "utf8");

		await assert.rejects(
			createBehavioralSemanticAuditMatrix({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				candidateRunsDir: fixture.runsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/exact.*34.*coordinate|runId.*coordinate|file name.*exactly match runId/i,
		);
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("matrix replay rejects protocol, scoring, completion, and final run tampering", async () => {
	const fixture = await createFixture();

	try {
		await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		await createBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const runPath = path.join(fixture.runsDir, `full-handbook--${scenarioIds[0]}--t1.run.json`);
		const originalRaw = await readFile(runPath, "utf8");
		const expectTamperRejected = async (mutate: (run: Record<string, unknown>) => void, pattern: RegExp): Promise<void> => {
			const run = JSON.parse(originalRaw) as Record<string, unknown>;
			mutate(run);
			await writeFile(runPath, `${JSON.stringify(run, null, 2)}\n`, "utf8");
			await assert.rejects(
				createBehavioralSemanticAuditMatrix({
					criteriaPath: fixture.criteriaPath,
					commitmentPath: fixture.commitmentPath,
					candidateRunsDir: fixture.runsDir,
					skillRootDir: fixture.skillRootDir,
					publicProtocolPath: fixture.publicProtocolPath,
				}),
				pattern,
			);
			await writeFile(runPath, originalRaw, "utf8");
		};

		await expectTamperRejected((run) => {
			run.protocolSha256 = sha256("forged protocol");
		}, /protocolSha256.*public protocol/i);
		await expectTamperRejected((run) => {
			(run.scoring as Record<string, unknown>).exactMatch = false;
		}, /scoring.*exactMatch true/i);
		await expectTamperRejected((run) => {
			run.scoring = {kind: "candidate", eligible: true, exactMatch: true};
		}, /raw bytes.*replay|scoring.*unknown|scoring.*missing/i);
		await expectTamperRejected((run) => {
			run.completion = {
				status: "BLOCKED",
				blocked: true,
				coverageFailCount: 1,
				semanticFailCount: 0,
				unknownCount: 0,
				reason: "forged blocker",
			};
		}, /completion.*unblocked COMPLETE/i);
		await expectTamperRejected((run) => {
			((run.routingTrace as Record<string, unknown>).passes as Record<string, unknown>[])[2]!.scopeEvidence = ["tampered trace"];
		}, /raw bytes.*replay|coordinator replay/i);

		const childPayloadPath = path.join(fixture.runsDir, `full-handbook--${scenarioIds[0]}--t1.child-payload.json`);
		const childPayloadRaw = await readFile(childPayloadPath, "utf8");
		await writeFile(childPayloadPath, `${childPayloadRaw}\n`, "utf8");
		await assert.rejects(
			createBehavioralSemanticAuditMatrix({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				candidateRunsDir: fixture.runsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/child payload|raw bytes.*replay|coordinator replay/i,
		);
		await writeFile(childPayloadPath, childPayloadRaw, "utf8");

		const stagedProvenancePath = path.join(fixture.runsDir, `full-handbook--${stagedScenarioId}--t1.staged-merge.json`);
		const stagedProvenanceRaw = await readFile(stagedProvenancePath, "utf8");
		await writeFile(stagedProvenancePath, `${stagedProvenanceRaw}\n`, "utf8");
		await assert.rejects(
			createBehavioralSemanticAuditMatrix({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				candidateRunsDir: fixture.runsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/staged merge provenance|staged inputs|coordinator.*replay/i,
		);
		await writeFile(stagedProvenancePath, stagedProvenanceRaw, "utf8");
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("semantic audit rejects dirty tracked or untracked skill and package source", async () => {
	const fixture = await createFixture();

	try {
		const rulePath = path.join(fixture.skillRootDir, "react/rules/rule-a.md");
		await writeFile(rulePath, `${await readFile(rulePath, "utf8")}\nDirty rule body.\n`, "utf8");
		await assert.rejects(
			commitBehavioralSemanticAuditCriteria({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/clean.*skill.*package|dirty|clean semantic audit source/i,
		);
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("staged scenario reviewer task is the final base plus scope-drift task without trial metadata", async () => {
	const fixture = await createFixture();

	try {
		await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const matrix = await writeBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
			matrixPath: fixture.matrixPath,
		});
		const stagedBatch = matrix.matrix.batches.find(({scenarioId}) => scenarioId === stagedScenarioId)!;
		const prepared = await prepareBehavioralSemanticAuditBatch({
			matrixPath: fixture.matrixPath,
			batchId: stagedBatch.batchId,
			outputDir: path.join(fixture.rootDir, "staged-review"),
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const request = JSON.parse(await readFile(prepared.requestPath, "utf8")) as Record<string, unknown>;
		const protocol = JSON.parse(await readFile(fixture.publicProtocolPath, "utf8")) as Record<string, unknown>;
		const stagedScenario = (protocol.scenarios as Record<string, Record<string, unknown>>)[stagedScenarioId]!;
		const expectedTask = `${stagedScenario.basePrompt}\n\nScope drift:\n${stagedScenario.scopeDriftPrompt}`;

		for (const sample of request.samples as Record<string, unknown>[]) {
			assert.equal(sample.task, expectedTask);
			assert.doesNotMatch(String(sample.task), /Use staged execution|full-handbook|progressive/i);
		}
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("criteria reveal must match its raw commitment and current expected Selected rules", async () => {
	const fixture = await createFixture();

	try {
		await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const criteria = JSON.parse(await readFile(fixture.criteriaPath, "utf8")) as Record<string, unknown>;
		(criteria.scenarios as Record<string, unknown>[])[0]!.criteria = [
			{
				id: "invalid",
				stage: "single",
				ruleRefs: ["react/not-current"],
				requirement: "invalid",
				evidencePaths: ["src/example.ts"],
				requiredObservations: ["invalid"],
				forbiddenObservations: [],
				evidencePolicy: "invalid",
			},
		];
		await writeFile(fixture.criteriaPath, `${JSON.stringify(criteria, null, 2)}\n`, "utf8");

		await assert.rejects(
			createBehavioralSemanticAuditMatrix({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				candidateRunsDir: fixture.runsDir,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/criteria.*raw.*commitment|commitment.*criteria/i,
		);

		await rm(fixture.commitmentPath);
		await assert.rejects(
			commitBehavioralSemanticAuditCriteria({
				criteriaPath: fixture.criteriaPath,
				commitmentPath: fixture.commitmentPath,
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/current ruleRef|expected Selected/i,
		);
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("strict reviewer evidence rejects false quotes, wrong occurrence counts, and missed negative controls", async () => {
	const fixture = await createFixture();

	try {
		await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const matrix = await writeBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
			matrixPath: fixture.matrixPath,
		});
		const prepared = await prepareBehavioralSemanticAuditBatch({
			matrixPath: fixture.matrixPath,
			batchId: matrix.matrix.batches[0]!.batchId,
			outputDir: path.join(fixture.rootDir, "review"),
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const request = JSON.parse(await readFile(prepared.requestPath, "utf8")) as Record<string, unknown>;
		const envelope = JSON.parse(await readFile(prepared.envelopePath, "utf8")) as Record<string, unknown>;
		const falseQuotePayload = createReviewerPayload(request, envelope);
		const firstReview = (falseQuotePayload.reviews as Record<string, unknown>[])[0]!;
		const firstCriterion = (firstReview.criteria as Record<string, unknown>[])[0]!;
		(firstCriterion.evidence as Record<string, unknown>[])[0]!.quote = "not in artifact";
		await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(falseQuotePayload, null, 2)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.dirname(prepared.resultPath),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/quote.*substring|artifact.*quote/i,
		);

		const occurrencePayload = createReviewerPayload(request, envelope);
		const occurrenceReview = (occurrencePayload.reviews as Record<string, unknown>[])[0]!;
		const occurrenceCriterion = (occurrenceReview.criteria as Record<string, unknown>[])[0]!;
		(occurrenceCriterion.evidence as Record<string, unknown>[])[0]!.occurrence = 2;
		await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(occurrencePayload, null, 2)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.dirname(prepared.resultPath),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/occurrence/i,
		);

		const falseAbsencePayload = createReviewerPayload(request, envelope);
		const absenceCandidateBinding = (envelope.sampleBindings as Record<string, unknown>[]).find((binding) => binding.kind === "candidate")!;
		const absenceReview = (falseAbsencePayload.reviews as Record<string, unknown>[]).find(
			(review) => review.sampleId === absenceCandidateBinding.sampleId,
		)!;
		const absenceCriterion = (absenceReview.criteria as Record<string, unknown>[])[0]!;
		absenceCriterion.evidence = [{kind: "absence", path: "src/example.ts", state: "after", needle: "good"}];
		await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(falseAbsencePayload, null, 2)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.dirname(prepared.resultPath),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/absence needle.*present/i,
		);

		const missingSamplePayload = createReviewerPayload(request, envelope);
		(missingSamplePayload.reviews as Record<string, unknown>[]).pop();
		await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(missingSamplePayload, null, 2)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.dirname(prepared.resultPath),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/every blind sample exactly once/i,
		);

		const missedNegativePayload = createReviewerPayload(request, envelope);
		const negativeBinding = (envelope.sampleBindings as Record<string, unknown>[]).find((binding) => binding.kind === "negative-control")!;
		const negativeReview = (missedNegativePayload.reviews as Record<string, unknown>[]).find(
			(review) => review.sampleId === negativeBinding.sampleId,
		)!;
		const negativeCriterion = (negativeReview.criteria as Record<string, unknown>[])[0]!;
		negativeCriterion.verdict = "PASS";
		negativeCriterion.reason = "incorrectly accepted negative control";
		await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(missedNegativePayload, null, 2)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.dirname(prepared.resultPath),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/negative control.*designated criterion.*FAIL|negative control.*overall FAIL/i,
		);
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("candidate immutability is rechecked and reviewer FAIL is not replaced by child self PASS", async () => {
	const fixture = await createFixture();

	try {
		await commitBehavioralSemanticAuditCriteria({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const matrix = await writeBehavioralSemanticAuditMatrix({
			criteriaPath: fixture.criteriaPath,
			commitmentPath: fixture.commitmentPath,
			candidateRunsDir: fixture.runsDir,
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
			matrixPath: fixture.matrixPath,
		});
		const firstBatch = matrix.matrix.batches[0]!;
		const candidate = firstBatch.samples.find(({kind}) => kind === "candidate")!;
		const originalRaw = await readFile(candidate.candidateRunPath!, "utf8");
		await writeFile(candidate.candidateRunPath!, `${originalRaw}\n`, "utf8");
		await assert.rejects(
			prepareBehavioralSemanticAuditBatch({
				matrixPath: fixture.matrixPath,
				batchId: firstBatch.batchId,
				outputDir: path.join(fixture.rootDir, "review"),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/candidate.*raw bytes.*replay|candidate run.*changed|immutable.*candidate/i,
		);
		await writeFile(candidate.candidateRunPath!, originalRaw, "utf8");
		const publicProtocolRaw = await readFile(fixture.publicProtocolPath, "utf8");
		const mutatedProtocol = JSON.parse(publicProtocolRaw) as Record<string, unknown>;
		const publicScenarios = mutatedProtocol.scenarios as Record<string, Record<string, unknown>>;
		const publicFiles = publicScenarios[firstBatch.scenarioId]!.virtualFiles as Record<string, unknown>[];
		publicFiles[0] = {
			path: "src/example.ts",
			state: "present",
			content: "const before = true;\n",
			sha256: sha256("const before = true;\n"),
		};
		await writeFile(fixture.publicProtocolPath, `${JSON.stringify(mutatedProtocol, null, 2)}\n`, "utf8");
		await assert.rejects(
			prepareBehavioralSemanticAuditBatch({
				matrixPath: fixture.matrixPath,
				batchId: firstBatch.batchId,
				outputDir: path.join(fixture.rootDir, "review"),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/public.*fixture|before.*fixture|protocol.*changed/i,
		);
		await writeFile(fixture.publicProtocolPath, publicProtocolRaw, "utf8");

		const prepared = await prepareBehavioralSemanticAuditBatch({
			matrixPath: fixture.matrixPath,
			batchId: firstBatch.batchId,
			outputDir: path.join(fixture.rootDir, "review"),
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const request = JSON.parse(await readFile(prepared.requestPath, "utf8")) as Record<string, unknown>;
		const envelope = JSON.parse(await readFile(prepared.envelopePath, "utf8")) as Record<string, unknown>;
		const payload = createReviewerPayload(request, envelope);
		const candidateBinding = (envelope.sampleBindings as Record<string, unknown>[]).find((binding) => binding.kind === "candidate")!;
		const candidateReview = (payload.reviews as Record<string, unknown>[]).find((review) => review.sampleId === candidateBinding.sampleId)!;
		const candidateCriterion = (candidateReview.criteria as Record<string, unknown>[])[0]!;
		candidateCriterion.verdict = "FAIL";
		candidateCriterion.reason = "Independent reviewer found a semantic failure despite child PASS.";
		await writeFile(prepared.reviewerPayloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
		const mergeCandidateRaw = await readFile(candidateBinding.candidateRunPath as string, "utf8");
		await writeFile(candidateBinding.candidateRunPath as string, `${mergeCandidateRaw}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.dirname(prepared.resultPath),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/candidate.*raw bytes.*replay|candidate run.*changed|immutable.*candidate/i,
		);
		await writeFile(candidateBinding.candidateRunPath as string, mergeCandidateRaw, "utf8");
		await assert.rejects(
			mergeBehavioralSemanticAuditReviewerPayload({
				envelopePath: prepared.envelopePath,
				reviewerPayloadPath: prepared.reviewerPayloadPath,
				outputDir: path.join(fixture.rootDir, "different-results"),
				skillRootDir: fixture.skillRootDir,
				publicProtocolPath: fixture.publicProtocolPath,
			}),
			/result outputDir.*prepared envelope|result directory/i,
		);
		const merged = await mergeBehavioralSemanticAuditReviewerPayload({
			envelopePath: prepared.envelopePath,
			reviewerPayloadPath: prepared.reviewerPayloadPath,
			outputDir: path.dirname(prepared.resultPath),
			skillRootDir: fixture.skillRootDir,
			publicProtocolPath: fixture.publicProtocolPath,
		});
		const independentReview = merged.result.samples.find(({sampleId}) => sampleId === candidateBinding.sampleId)!;
		assert.equal(independentReview.overall, "FAIL");
		assert.equal(independentReview.criteria[0]!.verdict, "FAIL");
	} finally {
		await rm(fixture.rootDir, {recursive: true, force: true});
	}
});

test("CLI exposes the five independent semantic audit commands", async () => {
	const packageDir = path.resolve(import.meta.dirname, "..");
	const {stdout} = await execFileAsync(
		path.join(packageDir, "node_modules", ".bin", "tsx"),
		["src/behavioral-semantic-audit-cli.ts", "--help"],
		{cwd: packageDir},
	);

	for (const command of ["commit-criteria", "matrix", "prepare", "merge", "aggregate"]) {
		assert.match(stdout, new RegExp(`\\b${command}\\b`));
	}
});
