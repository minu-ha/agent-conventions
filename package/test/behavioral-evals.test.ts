import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {cp, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";

import {behavioralEvalCliMain} from "../src/behavioral-evals-cli.js";
import {
	createBehavioralEvalDispatchEnvelope,
	validateBehavioralEvalRun,
	validateBehavioralEvalStageEvidence,
} from "../src/behavioral-evals.js";
import {getSkillPaths, packagePaths} from "../src/config.js";
import {readSkillDocument} from "../src/parser.js";
import {generateRulesIndexMarkdown, getCanonicalRoutingRuleIds} from "../src/routing.js";

/**
 * @summary behavioral v3 validator용 실제 TypeScript routing fixture
 */
interface BehavioralFixture {
	/**
	 * @field dispatch 전에 저장한 exact prompt provenance
	 */
	dispatch: Awaited<ReturnType<typeof createBehavioralEvalDispatchEnvelope>>;
	/**
	 * @field validator 입력으로 사용할 완전한 run JSON
	 */
	run: Record<string, unknown>;
}

/**
 * @helper JSON fixture를 독립적으로 mutate하기 위한 deep clone
 */
const cloneJson = <T>(value: T): T => structuredClone(value);

const fixtureCoordinatorBindings = {
	protocolSha256: `sha256:${"1".repeat(64)}`,
	armSha256: `sha256:${"2".repeat(64)}`,
	scenarioSha256: `sha256:${"3".repeat(64)}`,
	requestContentDigest: `sha256:${"4".repeat(64)}`,
	childRequestSha256: `sha256:${"5".repeat(64)}`,
	childPayloadSha256: `sha256:${"6".repeat(64)}`,
	stagedProvenanceSha256: null,
};

/**
 * @helper protocol runtimeDisclosure와 동일한 declared/unavailable provenance 생성
 */
const createDeclaredRuntime = (): Record<string, unknown> => {
	return {
		evidenceClass: "declared-telemetry-only",
		declared: {
			runtime: "Codex collaboration child agent",
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
	};
};

/**
 * @helper 현재 TypeScript source와 digest에 맞는 완료 run fixture 생성
 */
const createValidFixture = async (skillRootDir: string = packagePaths.skillRootDir): Promise<BehavioralFixture> => {
	const promptRendererVersion = "behavioral-child-wrapper-v3";
	const scenarioPrompt = "named query declaration의 header JSDoc을 규칙에 맞게 정리한다.";
	const exactPrompt = `${scenarioPrompt}\n\nReturn a digest-bound exact routing receipt.`;
	const document = await readSkillDocument(getSkillPaths("typescript", skillRootDir));
	const ruleIds = getCanonicalRoutingRuleIds(document);
	const selectedIds = [
		"naming-centralize-shared-config-namespaces",
		"types-document-custom-types-and-shapes",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-standardize-annotation-tags-by-declaration-role",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	];
	const selectedSet = new Set(selectedIds);
	const notApplicableIds = ruleIds.filter((ruleId) => !selectedSet.has(ruleId));
	const ordinalById = new Map(ruleIds.map((ruleId, index) => [ruleId, `T${String(index + 1).padStart(2, "0")}`]));
	const toRuleReferences = (ids: string[]) => ids.map((id) => ({ordinal: ordinalById.get(id), id}));
	const indexMarkdown = generateRulesIndexMarkdown(document, []);
	const indexDigest = indexMarkdown.match(/Routing digest: `([^`]+)`/)?.[1];

	assert.ok(indexDigest);
	const dispatch = await createBehavioralEvalDispatchEnvelope({
		runId: "progressive--fixture-typescript--t1",
		repositoryHead: "fixture-head",
		arm: "progressive",
		scenarioId: "fixture-typescript",
		trial: 1,
		scenarioPrompt,
		exactPrompt,
		promptRendererVersion,
		routingSkillNames: ["typescript"],
		skillRootDir,
	});

	const createStablePartition = () => ({
		activatedSkills: ["typescript"],
		scopeEvidence: ["src/query.ts의 named query declaration과 header JSDoc 변경"],
		generatedIndexDigests: {typescript: indexDigest},
		selected: {typescript: [...selectedIds]},
		notApplicable: {typescript: [...notApplicableIds]},
		unknown: {typescript: [] as string[]},
	});
	const createRequiresSelectedEvaluations = () => [
		{
			source: "typescript/docs-require-header-jsdoc-on-key-declarations",
			target: "typescript/docs-standardize-annotation-tags-by-declaration-role",
			sourceStatus: "Selected",
			outcome: "selected",
		},
		{
			source: "typescript/docs-require-header-jsdoc-on-key-declarations",
			target: "typescript/docs-write-concise-korean-comments-about-purpose-and-constraints",
			sourceStatus: "Selected",
			outcome: "selected",
		},
	];
	const createCompletionGateEvaluations = () => [
		{rule: "typescript/guardrails-review-banned-typescript-shortcuts-before-finishing", outcome: "selected"},
	];
	const run = {
		schemaVersion: 3,
		runId: dispatch.runId,
		protocolId: "progressive-loading-behavioral-v3",
		repositoryHead: "fixture-head",
		arm: "progressive",
		scenarioId: "fixture-typescript",
		trial: 1,
		scenarioPrompt: dispatch.scenarioPrompt,
		exactPrompt: dispatch.exactPrompt,
		promptSha256: dispatch.promptSha256,
		promptByteLength: dispatch.promptByteLength,
		promptRendererVersion: dispatch.promptRendererVersion,
		generatedIndexDigests: dispatch.generatedIndexDigests,
		runtime: createDeclaredRuntime(),
		virtualPatch: null,
		declaredLoadedFiles: {
			kind: "declared",
			paths: [
				"skill/typescript/SKILL.md",
				"skill/typescript/RULES_INDEX.md",
				"skill/typescript/contracts/naming-centralize-shared-config-namespaces.md",
				"skill/typescript/contracts/types-document-custom-types-and-shapes.md",
				"skill/typescript/rules/types-document-custom-types-and-shapes.md",
				"skill/typescript/contracts/docs-require-header-jsdoc-on-key-declarations.md",
				"skill/typescript/contracts/docs-standardize-annotation-tags-by-declaration-role.md",
				"skill/typescript/contracts/docs-write-concise-korean-comments-about-purpose-and-constraints.md",
				"skill/typescript/contracts/guardrails-review-banned-typescript-shortcuts-before-finishing.md",
			],
		},
		activatedSkills: ["typescript"],
		receipts: [
			{
				skill: "typescript",
				indexDigest,
				selected: toRuleReferences(selectedIds),
				notApplicable: toRuleReferences(notApplicableIds),
				unknown: [],
				excludedGroups: [
					{
						ordinals: notApplicableIds.map((ruleId) => ordinalById.get(ruleId)),
						reason: "fixture evidence에 naming, type shape, helper, fallback 또는 inline comment 변경이 없다.",
					},
				],
				expanded: [
					{
						ordinal: "T05",
						id: "types-document-custom-types-and-shapes",
						contractPath: "skill/typescript/contracts/types-document-custom-types-and-shapes.md",
						fullRulePath: "skill/typescript/rules/types-document-custom-types-and-shapes.md",
						reason: "CRITICAL rule은 contract 직후 full source를 필수 확장한다.",
						mandatoryCritical: true,
					},
				],
			},
		],
		routingTrace: {
			passes: [
				{
					pass: 1,
					...createStablePartition(),
					requiresSelectedEvaluated: createRequiresSelectedEvaluations(),
					requiresSelectedAdded: [
						{
							source: "typescript/docs-require-header-jsdoc-on-key-declarations",
							target: "typescript/docs-standardize-annotation-tags-by-declaration-role",
						},
						{
							source: "typescript/docs-require-header-jsdoc-on-key-declarations",
							target: "typescript/docs-write-concise-korean-comments-about-purpose-and-constraints",
						},
					],
					reviewWithReevaluated: [
						{
							source: "typescript/naming-centralize-shared-config-namespaces",
							target: "typescript/naming-preserve-config-origin-with-chained-access",
							outcome: "N/A",
							evidence: "fixture는 shared config origin 접근을 변경하지 않는다.",
						},
						{
							source: "typescript/naming-centralize-shared-config-namespaces",
							target: "typescript/naming-use-direct-imports-and-public-entry-points",
							outcome: "N/A",
							evidence: "fixture는 import/export 경계를 변경하지 않는다.",
						},
					],
					completionGatesEvaluated: createCompletionGateEvaluations(),
					completionGateAdded: ["typescript/guardrails-review-banned-typescript-shortcuts-before-finishing"],
				},
				{
					pass: 2,
					...createStablePartition(),
					requiresSelectedEvaluated: createRequiresSelectedEvaluations(),
					requiresSelectedAdded: [],
					reviewWithReevaluated: [
						{
							source: "typescript/naming-centralize-shared-config-namespaces",
							target: "typescript/naming-preserve-config-origin-with-chained-access",
							outcome: "N/A",
							evidence: "fixture는 shared config origin 접근을 변경하지 않는다.",
						},
						{
							source: "typescript/naming-centralize-shared-config-namespaces",
							target: "typescript/naming-use-direct-imports-and-public-entry-points",
							outcome: "N/A",
							evidence: "fixture는 import/export 경계를 변경하지 않는다.",
						},
					],
					completionGatesEvaluated: createCompletionGateEvaluations(),
					completionGateAdded: [],
				},
				{
					pass: 3,
					...createStablePartition(),
					requiresSelectedEvaluated: createRequiresSelectedEvaluations(),
					requiresSelectedAdded: [],
					reviewWithReevaluated: [
						{
							source: "typescript/naming-centralize-shared-config-namespaces",
							target: "typescript/naming-preserve-config-origin-with-chained-access",
							outcome: "N/A",
							evidence: "fixture는 shared config origin 접근을 변경하지 않는다.",
						},
						{
							source: "typescript/naming-centralize-shared-config-namespaces",
							target: "typescript/naming-use-direct-imports-and-public-entry-points",
							outcome: "N/A",
							evidence: "fixture는 import/export 경계를 변경하지 않는다.",
						},
					],
					completionGatesEvaluated: createCompletionGateEvaluations(),
					completionGateAdded: [],
				},
			],
			stablePair: [2, 3],
			stable: true,
		},
		driftReceipt: null,
		semanticVerdicts: [],
		completion: {status: "COMPLETE", blocked: false, coverageFailCount: 0, semanticFailCount: 0, unknownCount: 0, reason: "stable receipt"},
		limitations: [],
		response: "fixture",
		...fixtureCoordinatorBindings,
		scoring: null,
	};

	return {dispatch, run};
};

/**
 * @helper RTE08 supplied N/A mutation을 independent coverage FAIL로 막는 arm fixture 생성
 */
const createMutationFixture = async (): Promise<BehavioralFixture> => {
	const scenarioPrompt = "Audit the supplied RTE08 receipt that incorrectly moves R26 to N/A.";
	const exactPrompt = `${scenarioPrompt}\n\nReturn an independent audit receipt and block completion on coverage mismatch.`;
	const dispatch = await createBehavioralEvalDispatchEnvelope({
		runId: "mutation--RTE08-mutation-selected-to-na--t1",
		repositoryHead: "fixture-head",
		arm: "mutation",
		scenarioId: "RTE08-mutation-selected-to-na",
		trial: 1,
		scenarioPrompt,
		exactPrompt,
		promptRendererVersion: "behavioral-child-wrapper-v3",
		routingSkillNames: ["react", "typescript"],
		skillRootDir: packagePaths.skillRootDir,
	});
	const selectedBySkill = {
		react: ["events-run-user-actions-in-handlers-not-effects"],
		typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"],
	};
	const receipts = [];

	for (const skillName of ["react", "typescript"] as const) {
		const document = await readSkillDocument(getSkillPaths(skillName));
		const ruleIds = getCanonicalRoutingRuleIds(document);
		const selectedSet = new Set(selectedBySkill[skillName]);
		const ordinalPrefix = skillName === "react" ? "R" : "T";
		const references = ruleIds.map((id, index) => ({ordinal: `${ordinalPrefix}${String(index + 1).padStart(2, "0")}`, id}));
		const selected = references.filter(({id}) => selectedSet.has(id));
		const notApplicable = references.filter(({id}) => !selectedSet.has(id));

		receipts.push({
			skill: skillName,
			indexDigest: dispatch.generatedIndexDigests[skillName],
			selected,
			notApplicable,
			unknown: [],
			excludedGroups: [
				{
					ordinals: notApplicable.map(({ordinal}) => ordinal),
					reason: "independent audit evidence는 selected disputed rule과 completion gate 외 surface를 포함하지 않는다.",
				},
			],
			expanded: [],
		});
	}

	return {
		dispatch,
		run: {
			schemaVersion: 3,
			runId: dispatch.runId,
			protocolId: dispatch.protocolId,
			repositoryHead: dispatch.repositoryHead,
			arm: dispatch.arm,
			scenarioId: dispatch.scenarioId,
			trial: dispatch.trial,
			scenarioPrompt: dispatch.scenarioPrompt,
			exactPrompt: dispatch.exactPrompt,
			promptSha256: dispatch.promptSha256,
			promptByteLength: dispatch.promptByteLength,
			promptRendererVersion: dispatch.promptRendererVersion,
			generatedIndexDigests: dispatch.generatedIndexDigests,
			runtime: createDeclaredRuntime(),
			virtualPatch: null,
			declaredLoadedFiles: {
				kind: "declared",
				paths: [
					"skill/convention-audit/SKILL.md",
					"skill/convention-audit/AGENTS.md",
					"skill/react/SKILL.md",
					"skill/react/RULES_INDEX.md",
					"skill/typescript/SKILL.md",
					"skill/typescript/RULES_INDEX.md",
					"skill/react/contracts/events-run-user-actions-in-handlers-not-effects.md",
					"skill/typescript/contracts/guardrails-review-banned-typescript-shortcuts-before-finishing.md",
				],
			},
			activatedSkills: ["react", "typescript"],
			receipts,
			routingTrace: null,
			driftReceipt: null,
			semanticVerdicts: [
				{
					criterion: "R26 supplied N/A mutation을 독립적으로 거부",
					verdict: "PASS",
					reason: "R26 is Selected in the auditor receipt and the supplied coverage mismatch blocks completion.",
				},
			],
			completion: {
				status: "BLOCKED",
				blocked: true,
				coverageFailCount: 1,
				semanticFailCount: 0,
				unknownCount: 0,
				reason: "supplied mutation has an unsupported R26 N/A exclusion",
			},
			limitations: [],
			response: "BLOCKED: supplied R26 N/A evidence is unsupported.",
			...fixtureCoordinatorBindings,
			scoring: null,
		},
	};
};

test("dispatch envelope hashes the exact UTF-8 prompt before execution", async () => {
	const exactPrompt = "한글 prompt\nemoji: 🧪";
	const envelope = await createBehavioralEvalDispatchEnvelope({
		runId: "progressive--fixture--t1",
		repositoryHead: "fixture-head",
		arm: "progressive",
		scenarioId: "fixture",
		trial: 1,
		scenarioPrompt: "한글 prompt",
		exactPrompt,
		promptRendererVersion: "renderer-v3",
		routingSkillNames: ["typescript"],
		skillRootDir: packagePaths.skillRootDir,
	});

	assert.equal(envelope.schemaVersion, 3);
	assert.equal(envelope.promptByteLength, Buffer.byteLength(exactPrompt, "utf8"));
	assert.equal(envelope.promptSha256, `sha256:${createHash("sha256").update(exactPrompt).digest("hex")}`);
});

test("validator accepts a dispatch-bound stable fixed-point receipt", async () => {
	const fixture = await createValidFixture();

	await validateBehavioralEvalRun({run: fixture.run, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir});
});

test("validator uses the canonical generated target order instead of raw frontmatter order", async () => {
	const fixtureDir = await mkdtemp(path.join(os.tmpdir(), "behavioral-canonical-target-order-"));
	const skillRootDir = path.join(fixtureDir, "skill");

	try {
		await cp(packagePaths.skillRootDir, skillRootDir, {recursive: true});
		const rulePath = path.join(skillRootDir, "typescript", "rules", "docs-require-header-jsdoc-on-key-declarations.md");
		const source = await readFile(rulePath, "utf8");
		const reordered = source.replace(
			"requiresSelected: docs-standardize-annotation-tags-by-declaration-role, docs-write-concise-korean-comments-about-purpose-and-constraints",
			"requiresSelected: docs-write-concise-korean-comments-about-purpose-and-constraints, docs-standardize-annotation-tags-by-declaration-role",
		);

		assert.notEqual(reordered, source);
		await writeFile(rulePath, reordered, "utf8");
		const fixture = await createValidFixture(skillRootDir);

		await validateBehavioralEvalRun({run: fixture.run, dispatchEnvelope: fixture.dispatch, skillRootDir});
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("stage evidence validator rejects an initial Selected contract omitted from declared loads", async () => {
	const fixture = await createValidFixture();
	await validateBehavioralEvalStageEvidence({
		payload: fixture.run,
		dispatchEnvelope: fixture.dispatch,
		skillRootDir: packagePaths.skillRootDir,
	});
	const invalidInitial = cloneJson(fixture.run);
	const loadedFiles = invalidInitial.declaredLoadedFiles as {paths: string[]};
	loadedFiles.paths = loadedFiles.paths.filter(
		(filePath) => filePath !== "skill/typescript/contracts/docs-require-header-jsdoc-on-key-declarations.md",
	);

	await assert.rejects(
		validateBehavioralEvalStageEvidence({
			payload: invalidInitial,
			dispatchEnvelope: fixture.dispatch,
			skillRootDir: packagePaths.skillRootDir,
		}),
		/declared loads.*Selected-or-Unknown contract|Selected.*contract.*load/i,
	);
});

test("validator requires an initial routing pass before the two-pass stable pair", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const trace = mutatedRun.routingTrace as {passes: Array<{pass: number}>; stablePair: number[]};
	trace.passes = trace.passes.slice(-2).map((pass, index) => ({...pass, pass: index + 1}));
	trace.stablePair = [1, 2];

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/at least three passes/i,
	);
});

test("validator rejects missing or unknown top-level and receipt fields", async () => {
	const fixture = await createValidFixture();
	const missingRuntime = cloneJson(fixture.run);
	delete missingRuntime.runtime;

	await assert.rejects(
		validateBehavioralEvalRun({run: missingRuntime, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/missing required field "runtime"/i,
	);

	const unknownTopLevel = cloneJson(fixture.run);
	unknownTopLevel.unsealedOracle = true;

	await assert.rejects(
		validateBehavioralEvalRun({run: unknownTopLevel, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/unknown field "unsealedOracle"/i,
	);

	const unknownReceiptField = cloneJson(fixture.run);
	const [receipt] = unknownReceiptField.receipts as Record<string, unknown>[];
	assert.ok(receipt);
	receipt.unverified = true;

	await assert.rejects(
		validateBehavioralEvalRun({run: unknownReceiptField, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/run\.receipts\[0\] has unknown field "unverified"/i,
	);
});

test("validator enforces the protocol-declared runtime provenance shape", async () => {
	const fixture = await createValidFixture();
	const unknownRuntimeFieldRun = cloneJson(fixture.run);
	const unknownRuntime = unknownRuntimeFieldRun.runtime as Record<string, unknown>;
	unknownRuntime.observedRuntime = "not allowed";

	await assert.rejects(
		validateBehavioralEvalRun({run: unknownRuntimeFieldRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/run\.runtime has unknown field "observedRuntime"/i,
	);

	const mislabeledUnavailableRun = cloneJson(fixture.run);
	const mislabeledUnavailable = (mislabeledUnavailableRun.runtime as {unavailable: Record<string, unknown>}).unavailable;
	mislabeledUnavailable.observedFileReads = ["skill/typescript/SKILL.md"];

	await assert.rejects(
		validateBehavioralEvalRun({run: mislabeledUnavailableRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/run\.runtime\.unavailable\.observedFileReads must be null/i,
	);

	const wrongDeclaredModelRun = cloneJson(fixture.run);
	const wrongDeclared = (wrongDeclaredModelRun.runtime as {declared: Record<string, unknown>}).declared;
	wrongDeclared.requestedModel = "unbound-model";

	await assert.rejects(
		validateBehavioralEvalRun({run: wrongDeclaredModelRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/run\.runtime\.declared\.requestedModel must be "gpt-5\.6-sol"/i,
	);
});

test("validator binds optional virtual patch artifacts to exact UTF-8 hashes", async () => {
	const fixture = await createValidFixture();
	const after = 'export const 메시지 = "안녕 🧪";\n';
	const beforeSha256 = `sha256:${"7".repeat(64)}`;
	const afterSha256 = `sha256:${createHash("sha256").update(after).digest("hex")}`;
	const virtualPatchRun = cloneJson(fixture.run);
	virtualPatchRun.virtualPatch = {
		files: [
			{path: "src/query.ts", beforeState: "present", beforeSha256, afterState: "present", after, afterSha256},
			{
				path: "src/new-query.ts",
				beforeState: "absent",
				beforeSha256: null,
				afterState: "present",
				after: "",
				afterSha256: `sha256:${createHash("sha256").update("").digest("hex")}`,
			},
			{
				path: "src/obsolete-query.ts",
				beforeState: "present",
				beforeSha256: `sha256:${"9".repeat(64)}`,
				afterState: "absent",
				after: null,
				afterSha256: null,
			},
		],
		summary: "named query declaration의 문서 계약 변경",
	};

	await validateBehavioralEvalRun({run: virtualPatchRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir});

	const staleAfterHashRun = cloneJson(virtualPatchRun);
	const [staleFile] = (staleAfterHashRun.virtualPatch as {files: Array<{afterSha256: string}>}).files;
	assert.ok(staleFile);
	staleFile.afterSha256 = `sha256:${"8".repeat(64)}`;

	await assert.rejects(
		validateBehavioralEvalRun({run: staleAfterHashRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/virtualPatch\.files\[0\]\.afterSha256 does not match after UTF-8 bytes/i,
	);

	const absentBeforeHashRun = cloneJson(virtualPatchRun);
	const absentBeforeFile = (absentBeforeHashRun.virtualPatch as {files: Array<{path: string; beforeSha256: string | null}>}).files.find(
		({path: filePath}) => filePath === "src/new-query.ts",
	);
	assert.ok(absentBeforeFile);
	absentBeforeFile.beforeSha256 = beforeSha256;

	await assert.rejects(
		validateBehavioralEvalRun({run: absentBeforeHashRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/virtualPatch\.files\[1\]\.beforeSha256 must be null when beforeState is absent/i,
	);

	const presentBeforeMissingHashRun = cloneJson(virtualPatchRun);
	const [presentBeforeFile] = (presentBeforeMissingHashRun.virtualPatch as {files: Array<{beforeSha256: string | null}>}).files;
	assert.ok(presentBeforeFile);
	presentBeforeFile.beforeSha256 = null;

	await assert.rejects(
		validateBehavioralEvalRun({
			run: presentBeforeMissingHashRun,
			dispatchEnvelope: fixture.dispatch,
			skillRootDir: packagePaths.skillRootDir,
		}),
		/virtualPatch\.files\[0\]\.beforeSha256 must be a sha256 digest when beforeState is present/i,
	);

	const absentAfterContentRun = cloneJson(virtualPatchRun);
	const absentAfterFile = (absentAfterContentRun.virtualPatch as {files: Array<{path: string; after: string | null}>}).files.find(
		({path: filePath}) => filePath === "src/obsolete-query.ts",
	);
	assert.ok(absentAfterFile);
	absentAfterFile.after = "";

	await assert.rejects(
		validateBehavioralEvalRun({run: absentAfterContentRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/virtualPatch\.files\[2\]\.after and afterSha256 must be null when afterState is absent/i,
	);

	const presentAfterMissingContentRun = cloneJson(virtualPatchRun);
	const presentAfterFile = (presentAfterMissingContentRun.virtualPatch as {files: Array<{path: string; after: string | null}>}).files.find(
		({path: filePath}) => filePath === "src/new-query.ts",
	);
	assert.ok(presentAfterFile);
	presentAfterFile.after = null;

	await assert.rejects(
		validateBehavioralEvalRun({
			run: presentAfterMissingContentRun,
			dispatchEnvelope: fixture.dispatch,
			skillRootDir: packagePaths.skillRootDir,
		}),
		/virtualPatch\.files\[1\]\.after must be a string when afterState is present/i,
	);

	const duplicatePathRun = cloneJson(virtualPatchRun);
	const duplicateFiles = (duplicatePathRun.virtualPatch as {files: Record<string, unknown>[]}).files;
	duplicateFiles.push(cloneJson(duplicateFiles[0]!));

	await assert.rejects(
		validateBehavioralEvalRun({run: duplicatePathRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/virtualPatch\.files must not contain duplicate path "src\/query\.ts"/i,
	);

	const unknownPatchFieldRun = cloneJson(virtualPatchRun);
	(unknownPatchFieldRun.virtualPatch as Record<string, unknown>).observed = true;

	await assert.rejects(
		validateBehavioralEvalRun({run: unknownPatchFieldRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/run\.virtualPatch has unknown field "observed"/i,
	);
});

test("validator requires a complete replacement fixed point for the scope-drift scenario", async () => {
	const fixture = await createValidFixture();
	const driftDispatch = cloneJson(fixture.dispatch);
	driftDispatch.scenarioId = "RTE02-owner-placement-css-drift";
	const driftRun = cloneJson(fixture.run);
	driftRun.scenarioId = driftDispatch.scenarioId;
	driftRun.stagedProvenanceSha256 = `sha256:${"7".repeat(64)}`;
	driftRun.driftReceipt = {
		routingTrace: cloneJson(driftRun.routingTrace),
		activatedSkills: cloneJson(driftRun.activatedSkills),
		receipts: cloneJson(driftRun.receipts),
	};

	await validateBehavioralEvalRun({run: driftRun, dispatchEnvelope: driftDispatch, skillRootDir: packagePaths.skillRootDir});

	const missingStagedProvenance = cloneJson(driftRun);
	missingStagedProvenance.stagedProvenanceSha256 = null;
	await assert.rejects(
		validateBehavioralEvalRun({run: missingStagedProvenance, dispatchEnvelope: driftDispatch, skillRootDir: packagePaths.skillRootDir}),
		/stagedProvenanceSha256.*(?:sha256|non-empty)|RTE02.*staged provenance/i,
	);

	const incompleteDriftRun = cloneJson(driftRun);
	delete (incompleteDriftRun.driftReceipt as Record<string, unknown>).routingTrace;

	await assert.rejects(
		validateBehavioralEvalRun({run: incompleteDriftRun, dispatchEnvelope: driftDispatch, skillRootDir: packagePaths.skillRootDir}),
		/run\.driftReceipt is missing required field "routingTrace"/i,
	);

	const unexpectedDrift = cloneJson(fixture.run);
	unexpectedDrift.stagedProvenanceSha256 = `sha256:${"7".repeat(64)}`;
	unexpectedDrift.driftReceipt = {
		routingTrace: cloneJson(unexpectedDrift.routingTrace),
		activatedSkills: cloneJson(unexpectedDrift.activatedSkills),
		receipts: cloneJson(unexpectedDrift.receipts),
	};

	await assert.rejects(
		validateBehavioralEvalRun({run: unexpectedDrift, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/stagedProvenanceSha256 must be null/i,
	);
	unexpectedDrift.stagedProvenanceSha256 = null;
	await assert.rejects(
		validateBehavioralEvalRun({run: unexpectedDrift, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/driftReceipt must be null/i,
	);
});

test("validator rejects prompt provenance that differs from the saved dispatch", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const changedPrompt = `${String(mutatedRun.exactPrompt)} changed`;
	mutatedRun.exactPrompt = changedPrompt;
	mutatedRun.promptSha256 = `sha256:${createHash("sha256").update(changedPrompt).digest("hex")}`;
	mutatedRun.promptByteLength = Buffer.byteLength(changedPrompt, "utf8");

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/exactPrompt must exactly match the saved dispatch envelope/i,
	);
});

test("validator requires two consecutive identical final routing passes", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const trace = mutatedRun.routingTrace as {passes: Record<string, unknown>[]; stablePair: number[]};
	const selected = trace.passes[2]?.selected as Record<string, string[]>;
	const notApplicable = trace.passes[2]?.notApplicable as Record<string, string[]>;
	const addedRuleId = "docs-use-helper-for-reusable-pure-helper-functions";
	const removedIndex = notApplicable.typescript.indexOf(addedRuleId);

	if (removedIndex !== -1) {
		notApplicable.typescript.splice(removedIndex, 1);
		selected.typescript.splice(selected.typescript.length - 2, 0, addedRuleId);
	}

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/final two routing passes must have identical canonical state/i,
	);
});

test("stable-pair equality includes review evidence, mandatory outcomes, completion outcomes, and pass digests", async () => {
	const fixture = await createValidFixture();
	const changedReviewEvidenceRun = cloneJson(fixture.run);
	const changedReviewTrace = changedReviewEvidenceRun.routingTrace as {passes: Array<{reviewWithReevaluated: Array<{evidence: string}>}>};
	changedReviewTrace.passes[2]!.reviewWithReevaluated[0]!.evidence = "같은 verdict이지만 다른 근거";

	await assert.rejects(
		validateBehavioralEvalRun({run: changedReviewEvidenceRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/final two routing passes must have identical canonical state/i,
	);

	const changedMandatoryOutcomeRun = cloneJson(fixture.run);
	const changedMandatoryTrace = changedMandatoryOutcomeRun.routingTrace as {
		passes: Array<{requiresSelectedEvaluated: Array<{outcome: string}>}>;
	};
	changedMandatoryTrace.passes[2]!.requiresSelectedEvaluated[0]!.outcome = "not-propagated-unknown";

	await assert.rejects(
		validateBehavioralEvalRun({
			run: changedMandatoryOutcomeRun,
			dispatchEnvelope: fixture.dispatch,
			skillRootDir: packagePaths.skillRootDir,
		}),
		/final two routing passes must have identical canonical state/i,
	);

	const missingCompletionOutcomeRun = cloneJson(fixture.run);
	const missingCompletionTrace = missingCompletionOutcomeRun.routingTrace as {passes: Array<{completionGatesEvaluated: unknown[]}>};
	missingCompletionTrace.passes[2]!.completionGatesEvaluated = [];

	await assert.rejects(
		validateBehavioralEvalRun({
			run: missingCompletionOutcomeRun,
			dispatchEnvelope: fixture.dispatch,
			skillRootDir: packagePaths.skillRootDir,
		}),
		/final two routing passes must have identical canonical state/i,
	);

	const stalePassDigestRun = cloneJson(fixture.run);
	const stalePassDigestTrace = stalePassDigestRun.routingTrace as {passes: Array<{generatedIndexDigests: Record<string, string>}>};
	stalePassDigestTrace.passes[0]!.generatedIndexDigests.typescript = `sha256:${"0".repeat(64)}`;

	await assert.rejects(
		validateBehavioralEvalRun({run: stalePassDigestRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/routingTrace pass 1 generatedIndexDigests\.typescript must match the current routing digest/i,
	);
});

test("validator requires both stable-pair passes to have empty selection-changing deltas", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const trace = mutatedRun.routingTrace as {passes: Array<{requiresSelectedAdded: Array<{source: string; target: string}>}>};
	trace.passes[1]?.requiresSelectedAdded.push({
		source: "typescript/docs-require-header-jsdoc-on-key-declarations",
		target: "typescript/docs-standardize-annotation-tags-by-declaration-role",
	});

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/stable-pair passes must have empty selection-changing deltas/i,
	);
});

test("validator binds HEAD, scenario coordinates, and generated digests to the dispatch envelope", async () => {
	const fixture = await createValidFixture();
	const wrongHeadRun = cloneJson(fixture.run);
	wrongHeadRun.repositoryHead = "other-head";

	await assert.rejects(
		validateBehavioralEvalRun({run: wrongHeadRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/repositoryHead must exactly match the saved dispatch envelope/i,
	);

	const wrongDigestRun = cloneJson(fixture.run);
	(wrongDigestRun.generatedIndexDigests as Record<string, string>).typescript = `sha256:${"0".repeat(64)}`;

	await assert.rejects(
		validateBehavioralEvalRun({run: wrongDigestRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/generatedIndexDigests must exactly match the saved dispatch envelope/i,
	);

	const staleDispatch = cloneJson(fixture.dispatch);
	staleDispatch.generatedIndexDigests.typescript = `sha256:${"f".repeat(64)}`;
	const staleRun = cloneJson(fixture.run);
	(staleRun.generatedIndexDigests as Record<string, string>).typescript = staleDispatch.generatedIndexDigests.typescript;

	await assert.rejects(
		validateBehavioralEvalRun({run: staleRun, dispatchEnvelope: staleDispatch, skillRootDir: packagePaths.skillRootDir}),
		/dispatch digest .* must match the current routing digest/i,
	);
});

test("validator requires exact reviewWith outcome coverage without auto-selecting N/A targets", async () => {
	const fixture = await createValidFixture();
	const missingReviewRun = cloneJson(fixture.run);
	const missingReviewTrace = missingReviewRun.routingTrace as {passes: Array<{reviewWithReevaluated: Record<string, unknown>[]}>};
	missingReviewTrace.passes[1]?.reviewWithReevaluated.pop();
	missingReviewTrace.passes[2]?.reviewWithReevaluated.pop();

	await assert.rejects(
		validateBehavioralEvalRun({run: missingReviewRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/reviewWithReevaluated must exactly cover final Selected source edges/i,
	);

	const autoSelectedReviewRun = cloneJson(fixture.run);
	const autoSelectedTrace = autoSelectedReviewRun.routingTrace as {passes: Array<{reviewWithReevaluated: Array<{outcome: string}>}>};
	autoSelectedTrace.passes[1]!.reviewWithReevaluated[0]!.outcome = "Selected";
	autoSelectedTrace.passes[2]!.reviewWithReevaluated[0]!.outcome = "Selected";

	await assert.rejects(
		validateBehavioralEvalRun({run: autoSelectedReviewRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/reviewWith outcome .* must match target partition verdict "N\/A"/i,
	);
});

test("progressive load validation rejects missing CRITICAL expansion and unrecorded full-rule loads", async () => {
	const fixture = await createValidFixture();
	const missingCriticalRun = cloneJson(fixture.run);
	const missingCriticalLoads = missingCriticalRun.declaredLoadedFiles as {paths: string[]};
	missingCriticalLoads.paths = missingCriticalLoads.paths.filter(
		(filePath) => filePath !== "skill/typescript/rules/types-document-custom-types-and-shapes.md",
	);

	await assert.rejects(
		validateBehavioralEvalRun({run: missingCriticalRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/CRITICAL selected\/unknown contract must be followed immediately by its full rule/i,
	);

	const unrecordedRuleRun = cloneJson(fixture.run);
	const unrecordedLoads = unrecordedRuleRun.declaredLoadedFiles as {paths: string[]};
	const contractIndex = unrecordedLoads.paths.indexOf("skill/typescript/contracts/naming-centralize-shared-config-namespaces.md");
	unrecordedLoads.paths.splice(contractIndex + 1, 0, "skill/typescript/rules/naming-centralize-shared-config-namespaces.md");

	await assert.rejects(
		validateBehavioralEvalRun({run: unrecordedRuleRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/non-CRITICAL full-rule load must have exactly one matching Expanded record/i,
	);
});

test("full-handbook arm loads only activated SKILL and AGENTS documents", async () => {
	const fixture = await createValidFixture();
	const fullHandbookRun = cloneJson(fixture.run);
	const fullHandbookDispatch = cloneJson(fixture.dispatch);
	fullHandbookRun.arm = "full-handbook";
	fullHandbookDispatch.arm = "full-handbook";
	fullHandbookRun.declaredLoadedFiles = {kind: "declared", paths: ["skill/typescript/SKILL.md", "skill/typescript/AGENTS.md"]};
	const receipts = fullHandbookRun.receipts as Array<{indexDigest: string | null; expanded: unknown[]}>;
	receipts[0]!.indexDigest = null;
	receipts[0]!.expanded = [];

	await validateBehavioralEvalRun({run: fullHandbookRun, dispatchEnvelope: fullHandbookDispatch, skillRootDir: packagePaths.skillRootDir});

	(fullHandbookRun.declaredLoadedFiles as {paths: string[]}).paths.push("skill/typescript/RULES_INDEX.md");

	await assert.rejects(
		validateBehavioralEvalRun({run: fullHandbookRun, dispatchEnvelope: fullHandbookDispatch, skillRootDir: packagePaths.skillRootDir}),
		/full-handbook declared loads must contain only each activated SKILL.md and AGENTS.md/i,
	);
});

test("no-skill arm allows a null routing trace only with empty convention context", async () => {
	const fixture = await createValidFixture();
	const noSkillRun = cloneJson(fixture.run);
	const noSkillDispatch = cloneJson(fixture.dispatch);
	noSkillRun.arm = "no-skill";
	noSkillDispatch.arm = "no-skill";
	noSkillRun.routingTrace = null;
	noSkillRun.activatedSkills = [];
	noSkillRun.receipts = [];
	noSkillRun.declaredLoadedFiles = {kind: "declared", paths: []};

	await validateBehavioralEvalRun({run: noSkillRun, dispatchEnvelope: noSkillDispatch, skillRootDir: packagePaths.skillRootDir});

	noSkillRun.routingTrace = fixture.run.routingTrace as Record<string, unknown>;

	await assert.rejects(
		validateBehavioralEvalRun({run: noSkillRun, dispatchEnvelope: noSkillDispatch, skillRootDir: packagePaths.skillRootDir}),
		/no-skill arm requires routingTrace to be null/i,
	);
});

test("mutation arm independently selects disputed R26 and must remain BLOCKED", async () => {
	const fixture = await createMutationFixture();

	await validateBehavioralEvalRun({run: fixture.run, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir});

	const mutatedRun = cloneJson(fixture.run);
	const reactReceipt = (
		mutatedRun.receipts as Array<{
			skill: string;
			selected: Array<{ordinal: string; id: string}>;
			notApplicable: Array<{ordinal: string; id: string}>;
			excludedGroups: Array<{ordinals: string[]}>;
		}>
	).find(({skill}) => skill === "react")!;
	const disputedReference = reactReceipt.selected.find(({id}) => id === "events-run-user-actions-in-handlers-not-effects")!;
	reactReceipt.selected = reactReceipt.selected.filter(({id}) => id !== disputedReference.id);
	reactReceipt.notApplicable.push(disputedReference);
	reactReceipt.notApplicable.sort((left, right) => left.ordinal.localeCompare(right.ordinal));
	reactReceipt.excludedGroups[0]?.ordinals.push(disputedReference.ordinal);
	reactReceipt.excludedGroups[0]?.ordinals.sort();

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/mutation audit must not leave disputed React R26 in N\/A/i,
	);
});

test("COMPLETE status rejects nonzero coverage, semantic FAIL, or semantic UNKNOWN counts", async () => {
	const fixture = await createValidFixture();
	const coverageFailRun = cloneJson(fixture.run);
	(coverageFailRun.completion as {coverageFailCount: number}).coverageFailCount = 1;

	await assert.rejects(
		validateBehavioralEvalRun({run: coverageFailRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/COMPLETE requires coverageFailCount, semanticFailCount, and total Unknown count to be zero/i,
	);

	const semanticFailRun = cloneJson(fixture.run);
	semanticFailRun.semanticVerdicts = [{criterion: "fixture", verdict: "FAIL", reason: "semantic mismatch"}];
	(semanticFailRun.completion as {semanticFailCount: number}).semanticFailCount = 1;

	await assert.rejects(
		validateBehavioralEvalRun({run: semanticFailRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/COMPLETE requires coverageFailCount, semanticFailCount, and total Unknown count to be zero/i,
	);

	const semanticUnknownRun = cloneJson(fixture.run);
	semanticUnknownRun.semanticVerdicts = [{criterion: "fixture", verdict: "UNKNOWN", reason: "evidence unavailable"}];
	(semanticUnknownRun.completion as {unknownCount: number}).unknownCount = 1;

	await assert.rejects(
		validateBehavioralEvalRun({run: semanticUnknownRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/COMPLETE requires coverageFailCount, semanticFailCount, and total Unknown count to be zero/i,
	);
});

test("validator omits hidden N/A mandatory edges that the progressive index does not disclose", async () => {
	const fixture = await createValidFixture();
	const run = cloneJson(fixture.run);
	const trace = run.routingTrace as {passes: Array<{requiresSelectedEvaluated: Array<{sourceStatus: string}>}>};

	for (const pass of trace.passes) {
		pass.requiresSelectedEvaluated = pass.requiresSelectedEvaluated.filter(({sourceStatus}) => sourceStatus !== "N/A");
	}

	await validateBehavioralEvalRun({run, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir});
});

test("validator records Unknown mandatory outcomes and omits N/A source edges without propagation", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const sourceRuleId = "docs-require-header-jsdoc-on-key-declarations";
	const trace = mutatedRun.routingTrace as {
		passes: Array<{
			selected: Record<string, string[]>;
			notApplicable: Record<string, string[]>;
			unknown: Record<string, string[]>;
			requiresSelectedAdded: Array<{source: string; target: string}>;
			requiresSelectedEvaluated: Array<{source: string; sourceStatus: string; outcome: string}>;
		}>;
	};
	const receipts = mutatedRun.receipts as Array<{
		selected: Array<{ordinal: string; id: string}>;
		notApplicable: Array<{ordinal: string; id: string}>;
		excludedGroups: Array<{ordinals: string[]}>;
	}>;
	const allRuleIds = [...(receipts[0]?.selected ?? []), ...(receipts[0]?.notApplicable ?? [])]
		.sort((left, right) => left.ordinal.localeCompare(right.ordinal))
		.map(({id}) => id);
	const sortRuleIds = (ruleIds: string[]) => ruleIds.sort((left, right) => allRuleIds.indexOf(left) - allRuleIds.indexOf(right));

	trace.passes[0]!.selected.typescript = trace.passes[0]!.selected.typescript.filter((ruleId) => ruleId !== sourceRuleId);
	trace.passes[0]!.unknown.typescript = [sourceRuleId];
	trace.passes[0]!.requiresSelectedAdded = trace.passes[0]!.requiresSelectedAdded.filter(
		({source}) => source !== `typescript/${sourceRuleId}`,
	);

	for (const evaluation of trace.passes[0]!.requiresSelectedEvaluated.filter(({source}) => source === `typescript/${sourceRuleId}`)) {
		evaluation.sourceStatus = "Unknown";
		evaluation.outcome = "not-propagated-unknown";
	}

	for (const pass of trace.passes.slice(1)) {
		pass.selected.typescript = pass.selected.typescript.filter((ruleId) => ruleId !== sourceRuleId);
		pass.notApplicable.typescript.push(sourceRuleId);
		sortRuleIds(pass.notApplicable.typescript);
		pass.requiresSelectedEvaluated = pass.requiresSelectedEvaluated.filter(({source}) => source !== `typescript/${sourceRuleId}`);
	}

	const movedReference = receipts[0]?.selected.find(({id}) => id === sourceRuleId);

	if (movedReference) {
		receipts[0]?.selected.splice(receipts[0].selected.indexOf(movedReference), 1);
		receipts[0]?.notApplicable.push(movedReference);
		receipts[0]?.notApplicable.sort((left, right) => left.ordinal.localeCompare(right.ordinal));
		receipts[0]?.excludedGroups[0]?.ordinals.push(movedReference.ordinal);
		receipts[0]?.excludedGroups[0]?.ordinals.sort();
	}

	await validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir});

	const falsePropagationRun = cloneJson(mutatedRun);
	const falsePropagationTrace = falsePropagationRun.routingTrace as {
		passes: Array<{requiresSelectedEvaluated: Array<{source: string; outcome: string}>}>;
	};
	const unknownSourceEvaluation = falsePropagationTrace.passes[0]!.requiresSelectedEvaluated.find(
		({source}) => source === `typescript/${sourceRuleId}`,
	);
	assert.ok(unknownSourceEvaluation);
	unknownSourceEvaluation.outcome = "selected";

	await assert.rejects(
		validateBehavioralEvalRun({run: falsePropagationRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/requiresSelected outcome .* must be "not-propagated-unknown"/i,
	);
});

test("candidate routing requires final Unknown to be empty even when completion is BLOCKED", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const unknownRuleId = "absence-expose-optional-values-instead-of-silent-fallbacks";
	const trace = mutatedRun.routingTrace as {passes: Array<{notApplicable: Record<string, string[]>; unknown: Record<string, string[]>}>};

	for (const pass of trace.passes.slice(-2)) {
		pass.notApplicable.typescript = pass.notApplicable.typescript.filter((ruleId) => ruleId !== unknownRuleId);
		pass.unknown.typescript = [unknownRuleId];
	}

	const [receipt] = mutatedRun.receipts as Array<{
		notApplicable: Array<{ordinal: string; id: string}>;
		unknown: Array<{ordinal: string; id: string}>;
		excludedGroups: Array<{ordinals: string[]}>;
	}>;
	const unknownReference = receipt?.notApplicable.find(({id}) => id === unknownRuleId);
	assert.ok(unknownReference);
	receipt.notApplicable = receipt.notApplicable.filter(({id}) => id !== unknownRuleId);
	receipt.unknown = [unknownReference];
	receipt.excludedGroups[0]!.ordinals = receipt.excludedGroups[0]!.ordinals.filter((ordinal) => ordinal !== unknownReference.ordinal);
	mutatedRun.completion = {
		status: "BLOCKED",
		blocked: true,
		coverageFailCount: 0,
		semanticFailCount: 0,
		unknownCount: 1,
		reason: "unresolved routing verdict",
	};

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/candidate routing final Unknown count must be zero/i,
	);
});

test("validator requires the final receipt to match the stable trace partition", async () => {
	const fixture = await createValidFixture();
	const mutatedRun = cloneJson(fixture.run);
	const receipts = mutatedRun.receipts as Array<{selected: Array<{ordinal: string; id: string}>}>;
	receipts[0]?.selected.pop();

	await assert.rejects(
		validateBehavioralEvalRun({run: mutatedRun, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/final receipt must exactly match the last routing trace partition/i,
	);
});

test("validator rejects missing requiresSelected closure and completion gates", async () => {
	const fixture = await createValidFixture();
	const missingRequiredTarget = cloneJson(fixture.run);
	const requiredTrace = missingRequiredTarget.routingTrace as {
		passes: Array<{selected: Record<string, string[]>; notApplicable: Record<string, string[]>}>;
	};
	const requiredReceipts = missingRequiredTarget.receipts as Array<{
		selected: Array<{ordinal: string; id: string}>;
		notApplicable: Array<{ordinal: string; id: string}>;
	}>;

	for (const pass of requiredTrace.passes) {
		pass.selected.typescript = pass.selected.typescript.filter(
			(ruleId) => ruleId !== "docs-standardize-annotation-tags-by-declaration-role",
		);
		const insertionIndex = pass.notApplicable.typescript.indexOf("docs-use-helper-for-reusable-pure-helper-functions");
		pass.notApplicable.typescript.splice(insertionIndex, 0, "docs-standardize-annotation-tags-by-declaration-role");
	}
	const movedRequiredReference = requiredReceipts[0]?.selected.find(
		(reference) => reference.id === "docs-standardize-annotation-tags-by-declaration-role",
	);
	if (movedRequiredReference) {
		requiredReceipts[0]?.selected.splice(requiredReceipts[0].selected.indexOf(movedRequiredReference), 1);
		const insertionIndex = requiredReceipts[0]?.notApplicable.findIndex(
			(reference) => reference.id === "docs-use-helper-for-reusable-pure-helper-functions",
		);
		requiredReceipts[0]?.notApplicable.splice(insertionIndex ?? 0, 0, movedRequiredReference);
		const excludedGroups = (missingRequiredTarget.receipts as Array<{excludedGroups: Array<{ordinals: string[]}>}>)[0]?.excludedGroups;
		excludedGroups?.[0]?.ordinals.push(movedRequiredReference.ordinal);
		excludedGroups?.[0]?.ordinals.sort();
	}

	await assert.rejects(
		validateBehavioralEvalRun({run: missingRequiredTarget, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/requiresSelected target .* must be Selected/i,
	);

	const missingCompletionGate = cloneJson(fixture.run);
	const gateTrace = missingCompletionGate.routingTrace as {
		passes: Array<{selected: Record<string, string[]>; notApplicable: Record<string, string[]>}>;
	};
	const gateReceipts = missingCompletionGate.receipts as Array<{
		selected: Array<{ordinal: string; id: string}>;
		notApplicable: Array<{ordinal: string; id: string}>;
	}>;

	for (const pass of gateTrace.passes) {
		pass.selected.typescript = pass.selected.typescript.filter(
			(ruleId) => ruleId !== "guardrails-review-banned-typescript-shortcuts-before-finishing",
		);
		pass.notApplicable.typescript.push("guardrails-review-banned-typescript-shortcuts-before-finishing");
	}
	const movedGateReference = gateReceipts[0]?.selected.find(
		(reference) => reference.id === "guardrails-review-banned-typescript-shortcuts-before-finishing",
	);
	if (movedGateReference) {
		gateReceipts[0]?.selected.splice(gateReceipts[0].selected.indexOf(movedGateReference), 1);
		gateReceipts[0]?.notApplicable.push(movedGateReference);
		const excludedGroups = (missingCompletionGate.receipts as Array<{excludedGroups: Array<{ordinals: string[]}>}>)[0]?.excludedGroups;
		excludedGroups?.[0]?.ordinals.push(movedGateReference.ordinal);
		excludedGroups?.[0]?.ordinals.sort();
	}

	await assert.rejects(
		validateBehavioralEvalRun({run: missingCompletionGate, dispatchEnvelope: fixture.dispatch, skillRootDir: packagePaths.skillRootDir}),
		/completionGate .* must be Selected/i,
	);
});

test("behavioral eval CLI persists dispatch provenance before validating a run", async () => {
	const fixture = await createValidFixture();
	const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "behavioral-evals-cli-"));
	const prepareInputPath = path.join(temporaryDirectory, "prepare.json");
	const dispatchPath = path.join(temporaryDirectory, "dispatch.json");
	const runPath = path.join(temporaryDirectory, "run.json");

	try {
		await writeFile(
			prepareInputPath,
			`${JSON.stringify(
				{
					runId: fixture.dispatch.runId,
					repositoryHead: fixture.dispatch.repositoryHead,
					arm: fixture.dispatch.arm,
					scenarioId: fixture.dispatch.scenarioId,
					trial: fixture.dispatch.trial,
					scenarioPrompt: fixture.dispatch.scenarioPrompt,
					exactPrompt: fixture.dispatch.exactPrompt,
					promptRendererVersion: fixture.dispatch.promptRendererVersion,
					routingSkillNames: ["typescript"],
				},
				null,
				2,
			)}\n`,
			"utf8",
		);
		await behavioralEvalCliMain(["prepare", prepareInputPath, dispatchPath, `--skill-root=${packagePaths.skillRootDir}`]);
		const persistedDispatch = JSON.parse(await readFile(dispatchPath, "utf8")) as Record<string, unknown>;
		assert.equal(persistedDispatch.promptSha256, fixture.dispatch.promptSha256);
		assert.equal(persistedDispatch.promptByteLength, fixture.dispatch.promptByteLength);

		await writeFile(runPath, `${JSON.stringify(fixture.run, null, 2)}\n`, "utf8");
		await behavioralEvalCliMain(["validate", dispatchPath, runPath, `--skill-root=${packagePaths.skillRootDir}`]);
	} finally {
		await rm(temporaryDirectory, {recursive: true, force: true});
	}
});
