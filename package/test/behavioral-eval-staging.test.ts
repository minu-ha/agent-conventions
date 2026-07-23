import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {cp, mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {promisify} from "node:util";
import test from "node:test";

import {
	composeStagedVirtualPatches,
	createStagedInitialArtifacts,
	finalizeStagedBehavioralRun,
	mergeStagedBehavioralPayloads,
	prepareStagedFollowupDispatch,
	prepareStagedInitialDispatch,
	sealStagedInitialPayload,
} from "../src/behavioral-eval-staging.js";
import {createBehavioralEvalDispatchEnvelope} from "../src/behavioral-evals.js";
import {packagePaths} from "../src/config.js";

const execFileAsync = promisify(execFile);
const sourceProtocolPath = path.join(packagePaths.repoDir, "docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json");
const scenarioId = "RTE02-owner-placement-css-drift";
const runId = `no-skill--${scenarioId}--t1`;

interface StagingFixture {
	head: string;
	protocolPath: string;
	repositoryDir: string;
	skillRootDir: string;
	outputDir: string;
	initialPayload: Record<string, unknown>;
	driftPayload: Record<string, unknown>;
}

const createSha256 = (value: string): string => `sha256:${createHash("sha256").update(value).digest("hex")}`;

const createRuntime = (): Record<string, unknown> => ({
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

const createCompletion = (): Record<string, unknown> => ({
	status: "COMPLETE",
	blocked: false,
	coverageFailCount: 0,
	semanticFailCount: 0,
	unknownCount: 0,
	reason: "stage complete",
});

test("virtual patch composition preserves public before bindings for create, update, delete, and unchanged paths", () => {
	const oldUpdate = "old update\n";
	const middleUpdate = "middle update\n";
	const finalUpdate = "final update\n";
	const deleted = "delete me\n";
	const created = "created\n";
	const unchanged = "same\n";
	const intermediateUnchanged = "temporary\n";
	const publicVirtualFiles = [
		{path: "create.ts", state: "absent" as const, content: null, sha256: null},
		{path: "update.ts", state: "present" as const, content: oldUpdate, sha256: createSha256(oldUpdate)},
		{path: "delete.ts", state: "present" as const, content: deleted, sha256: createSha256(deleted)},
		{path: "unchanged.ts", state: "present" as const, content: unchanged, sha256: createSha256(unchanged)},
	];
	const composed = composeStagedVirtualPatches({
		publicVirtualFiles,
		initialPatch: {
			files: [
				{
					path: "update.ts",
					beforeState: "present",
					beforeSha256: createSha256(oldUpdate),
					afterState: "present",
					after: middleUpdate,
					afterSha256: createSha256(middleUpdate),
				},
				{
					path: "unchanged.ts",
					beforeState: "present",
					beforeSha256: createSha256(unchanged),
					afterState: "present",
					after: intermediateUnchanged,
					afterSha256: createSha256(intermediateUnchanged),
				},
			],
			summary: "initial",
		},
		driftPatch: {
			files: [
				{
					path: "create.ts",
					beforeState: "absent",
					beforeSha256: null,
					afterState: "present",
					after: created,
					afterSha256: createSha256(created),
				},
				{
					path: "update.ts",
					beforeState: "present",
					beforeSha256: createSha256(middleUpdate),
					afterState: "present",
					after: finalUpdate,
					afterSha256: createSha256(finalUpdate),
				},
				{
					path: "delete.ts",
					beforeState: "present",
					beforeSha256: createSha256(deleted),
					afterState: "absent",
					after: null,
					afterSha256: null,
				},
				{
					path: "unchanged.ts",
					beforeState: "present",
					beforeSha256: createSha256(intermediateUnchanged),
					afterState: "present",
					after: unchanged,
					afterSha256: createSha256(unchanged),
				},
			],
			summary: "drift",
		},
	});

	assert.deepEqual(
		composed.files.map(({path: filePath, beforeState, beforeSha256, afterState, afterSha256}) => ({
			path: filePath,
			beforeState,
			beforeSha256,
			afterState,
			afterSha256,
		})),
		[
			{path: "create.ts", beforeState: "absent", beforeSha256: null, afterState: "present", afterSha256: createSha256(created)},
			{
				path: "update.ts",
				beforeState: "present",
				beforeSha256: createSha256(oldUpdate),
				afterState: "present",
				afterSha256: createSha256(finalUpdate),
			},
			{path: "delete.ts", beforeState: "present", beforeSha256: createSha256(deleted), afterState: "absent", afterSha256: null},
			{
				path: "unchanged.ts",
				beforeState: "present",
				beforeSha256: createSha256(unchanged),
				afterState: "present",
				afterSha256: createSha256(unchanged),
			},
		],
	);
});

const createFixture = async (fixtureDir: string): Promise<StagingFixture> => {
	const repositoryDir = path.join(fixtureDir, "repository");
	const skillRootDir = path.join(repositoryDir, "skill");
	const outputDir = path.join(fixtureDir, "runs");
	await mkdir(skillRootDir, {recursive: true});

	for (const skillName of ["react", "typescript", "css"]) {
		await cp(path.join(packagePaths.skillRootDir, skillName), path.join(skillRootDir, skillName), {recursive: true});
	}

	await execFileAsync("git", ["init", "--quiet"], {cwd: repositoryDir});
	await execFileAsync("git", ["config", "user.email", "staging-fixture@example.invalid"], {cwd: repositoryDir});
	await execFileAsync("git", ["config", "user.name", "Staging Fixture"], {cwd: repositoryDir});
	await execFileAsync("git", ["add", "skill"], {cwd: repositoryDir});
	await execFileAsync("git", ["commit", "--quiet", "-m", "fixture"], {cwd: repositoryDir});
	const {stdout} = await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: repositoryDir});
	const head = stdout.trim();
	const seedDispatch = await createBehavioralEvalDispatchEnvelope({
		runId: "fixture",
		repositoryHead: head,
		arm: "no-skill",
		scenarioId,
		trial: 1,
		scenarioPrompt: "fixture",
		exactPrompt: "fixture",
		promptRendererVersion: "fixture",
		routingSkillNames: ["react", "typescript", "css"],
		skillRootDir,
	});
	const protocol = JSON.parse(await readFile(sourceProtocolPath, "utf8")) as Record<string, unknown>;
	const repository = protocol.repository as Record<string, unknown>;
	repository.sourceHead = head;
	repository.bindingStatus = "bound";
	const generatedIndexes = protocol.generatedIndexes as Record<string, Record<string, unknown>>;

	for (const [skillName, digest] of Object.entries(seedDispatch.generatedIndexDigests)) {
		generatedIndexes[skillName]!.digest = digest;
	}

	const scenarios = protocol.scenarios as Record<string, Record<string, unknown>>;
	const mutationReceipt = scenarios["RTE08-mutation-selected-to-na"]!.suppliedReceipt as Record<string, Record<string, unknown>>;

	for (const [skillName, receipt] of Object.entries(mutationReceipt)) {
		receipt.indexDigest = seedDispatch.generatedIndexDigests[skillName];
	}

	const sharedBefore = "export const EntryTree = () => <div />;\n";
	const localAfter = 'export const EntryTree = () => <div className="wg_entryTree__root" />;\n';
	const localFinal = 'import "./entry-tree.css";\nexport const EntryTree = () => <div className="wg_entryTree__root" />;\n';
	const cssFinal = ".wg_entryTree__root { display: block; }\n";
	const rte02 = scenarios[scenarioId]!;
	rte02.virtualFiles = [
		{path: "src/components/ui/entry-tree.tsx", state: "present", content: sharedBefore, sha256: createSha256(sharedBefore)},
		{path: "src/routes/entries/-local/entry-tree.tsx", state: "absent", content: null, sha256: null},
		{path: "src/routes/entries/-local/entry-tree.css", state: "absent", content: null, sha256: null},
	];
	const protocolPath = path.join(fixtureDir, "protocol.json");
	await writeFile(protocolPath, `${JSON.stringify(protocol, null, 2)}\n`, "utf8");

	const initialPayload = {
		runtime: createRuntime(),
		declaredLoadedFiles: {kind: "declared", paths: []},
		virtualPatch: {
			files: [
				{
					path: "src/components/ui/entry-tree.tsx",
					beforeState: "present",
					beforeSha256: createSha256(sharedBefore),
					afterState: "absent",
					after: null,
					afterSha256: null,
				},
				{
					path: "src/routes/entries/-local/entry-tree.tsx",
					beforeState: "absent",
					beforeSha256: null,
					afterState: "present",
					after: localAfter,
					afterSha256: createSha256(localAfter),
				},
			],
			summary: "move the route-only renderer",
		},
		activatedSkills: [],
		receipts: [],
		routingTrace: null,
		driftReceipt: null,
		semanticVerdicts: [],
		completion: createCompletion(),
		limitations: ["declared telemetry only"],
		response: "initial route-local move",
	};
	const driftPayload = {
		runtime: createRuntime(),
		declaredLoadedFiles: {kind: "declared", paths: []},
		virtualPatch: {
			files: [
				{
					path: "src/components/ui/entry-tree.tsx",
					beforeState: "absent",
					beforeSha256: null,
					afterState: "absent",
					after: null,
					afterSha256: null,
				},
				{
					path: "src/routes/entries/-local/entry-tree.tsx",
					beforeState: "present",
					beforeSha256: createSha256(localAfter),
					afterState: "present",
					after: localFinal,
					afterSha256: createSha256(localFinal),
				},
				{
					path: "src/routes/entries/-local/entry-tree.css",
					beforeState: "absent",
					beforeSha256: null,
					afterState: "present",
					after: cssFinal,
					afterSha256: createSha256(cssFinal),
				},
			],
			summary: "add the scope-drift stylesheet",
		},
		activatedSkills: [],
		receipts: [],
		routingTrace: null,
		semanticVerdicts: [],
		completion: createCompletion(),
		limitations: ["declared telemetry only"],
		response: "replacement-final CSS drift response",
	};

	return {head, protocolPath, repositoryDir, skillRootDir, outputDir, initialPayload, driftPayload};
};

test("initial artifacts preserve the existing run coordinate and completely seal future drift", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-staging-initial-"));

	try {
		const fixture = await createFixture(fixtureDir);
		const args = {
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId,
			arm: "no-skill",
			trial: 1,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		};
		const first = await createStagedInitialArtifacts(args);
		const second = await createStagedInitialArtifacts(args);

		assert.deepEqual(first, second);
		assert.equal(first.request.runId, runId);
		assert.equal(first.request.agentTarget, "/root/rte02-no-skill-t1");
		assert.equal(first.envelope.agentTarget, first.request.agentTarget);
		assert.equal(first.request.scenarioId, scenarioId);
		assert.deepEqual(first.request.files, ["src/components/ui/entry-tree.tsx", "src/routes/entries/-local/entry-tree.tsx"]);
		assert.deepEqual(
			first.request.virtualFiles.map(({path: filePath}) => filePath),
			first.request.files,
		);
		assert.doesNotMatch(
			first.requestRaw,
			/scopeDriftPrompt|filesFinal|entry-tree\.css|CSS Modules|final skills|trialPrompt|expectedSkills|expectedSelected|expectedNotApplicable/,
		);
		assert.match(first.exactDispatch, new RegExp(first.requestPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
		assert.match(first.exactDispatch, /already running in the bound isolated Codex CLI child session:/);
		assert.match(first.exactDispatch, /treat that identifier as this current session/i);
		assert.match(first.exactDispatch, /do not spawn, hand off, or redispatch to another agent/);
		assert.doesNotMatch(first.exactDispatch, /external orchestrator must dispatch/i);
		assert.doesNotMatch(first.exactDispatch, /collaboration child|collaboration target/i);
		assert.equal(first.request.assignedChildPayloadPath, first.childPayloadPath);
		assert.equal(first.request.childPayloadContract.exactObjectKeysOnly, true);
		assert.match(String(first.request.childPayloadContract.routingTrace), /generatedIndexDigests:Record<string,sha256>/);
		assert.match(String(first.request.childPayloadContract.routingTrace), /selected:Record<string,string\[\]>/);
		assert.match(
			String(first.request.childPayloadContract.semanticVerdicts),
			/criterion:string,verdict:'PASS'\|'FAIL'\|'UNKNOWN',reason:string/,
		);
		const fullHandbook = await createStagedInitialArtifacts({
			...args,
			runId: `full-handbook--${scenarioId}--t1`,
			arm: "full-handbook",
			agentTarget: "/root/rte02-full-handbook-t1",
		});
		assert.deepEqual(
			fullHandbook.request.armPolicy.currentGeneratedIndexDigests,
			fullHandbook.envelope.dispatchEnvelope.generatedIndexDigests,
		);
		assert.match(String(fullHandbook.request.armPolicy.generatedIndexDigestContract), /all three.*activatedSkills.*every routing pass/i);
		assert.match(
			fullHandbook.request.activationPolicy,
			/changed TSX.*activates react and typescript.*styling contract.*activates css.*byte-equivalent.*does not activate css.*pure CSS.*pure TypeScript/is,
		);
		assert.match(fullHandbook.request.activationPolicy, /requested semantic delta.*do not introduce optional patterns/i);
		assert.doesNotMatch(String(fullHandbook.request.armPolicy.promptSuffix), /also return driftReceipt/i);
		assert.match(String(fullHandbook.request.armPolicy.promptSuffix), /initial-stage.*top-level.*driftReceipt.*null/i);

		const untrackedSkillSource = path.join(fixture.skillRootDir, "react", "untracked-staged-source.md");
		await writeFile(untrackedSkillSource, "untracked\n", "utf8");
		await assert.rejects(createStagedInitialArtifacts(args), /skill source.*clean|staged source.*clean|dirty.*skill/i);
		await rm(untrackedSkillSource);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("initial payload seal binds the immutable bytes, virtual before states, and one agent target", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-staging-seal-"));

	try {
		const fixture = await createFixture(fixtureDir);
		const prepared = await prepareStagedInitialDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId,
			arm: "no-skill",
			trial: 1,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		const initialRaw = `${JSON.stringify(fixture.initialPayload, null, 2)}\n`;
		const invalidStagePayload = structuredClone(fixture.initialPayload);
		invalidStagePayload.declaredLoadedFiles = {kind: "declared", paths: ["skill/react/SKILL.md"]};
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(invalidStagePayload, null, 2)}\n`, "utf8");
		await assert.rejects(
			sealStagedInitialPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				agentTarget: "/root/rte02-no-skill-t1",
				outputDir: fixture.outputDir,
			}),
			/no-skill stage.*empty loaded-file context/i,
		);
		await writeFile(prepared.childPayloadPath, initialRaw, "utf8");
		const initialRequestRaw = await readFile(prepared.requestPath, "utf8");
		const mutatedRequest = JSON.parse(initialRequestRaw) as Record<string, unknown>;
		mutatedRequest.agentTarget = "/root/rte02-different-target";
		await writeFile(prepared.requestPath, `${JSON.stringify(mutatedRequest, null, 2)}\n`, "utf8");
		await assert.rejects(
			sealStagedInitialPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				agentTarget: "/root/rte02-no-skill-t1",
				outputDir: fixture.outputDir,
			}),
			/initial child request raw bytes changed/i,
		);
		await writeFile(prepared.requestPath, initialRequestRaw, "utf8");
		const initialEnvelopeRaw = await readFile(prepared.envelopePath, "utf8");
		const mutatedEnvelope = JSON.parse(initialEnvelopeRaw) as Record<string, unknown>;
		mutatedEnvelope.agentTarget = "/root/rte02-different-target";
		await writeFile(prepared.envelopePath, `${JSON.stringify(mutatedEnvelope, null, 2)}\n`, "utf8");
		await assert.rejects(
			sealStagedInitialPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				agentTarget: "/root/rte02-no-skill-t1",
				outputDir: fixture.outputDir,
			}),
			/pre-bound agent target|initial child request identity/i,
		);
		await writeFile(prepared.envelopePath, initialEnvelopeRaw, "utf8");
		await assert.rejects(
			sealStagedInitialPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				agentTarget: "/root/rte02-different-target",
				outputDir: fixture.outputDir,
			}),
			/pre-bound agent target|agentTarget.*initial/i,
		);
		const sealed = await sealStagedInitialPayload({
			envelopePath: prepared.envelopePath,
			childPayloadPath: prepared.childPayloadPath,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
		});

		assert.equal(sealed.seal.agentTarget, "/root/rte02-no-skill-t1");
		assert.equal(sealed.seal.initialPayload.sha256, createSha256(initialRaw));
		assert.equal(sealed.seal.initialPayload.utf8ByteLength, Buffer.byteLength(initialRaw, "utf8"));
		assert.match(sealed.seal.initialPayload.virtualPatchSha256, /^sha256:[a-f0-9]{64}$/);
		await assert.rejects(
			sealStagedInitialPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				agentTarget: "/root/rte02-no-skill-t1",
				outputDir: fixture.outputDir,
			}),
			/already exists|overwrite/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("follow-up preparation reveals drift only after the sealed initial payload and rejects later mutation", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-staging-followup-"));

	try {
		const fixture = await createFixture(fixtureDir);
		const prepared = await prepareStagedInitialDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId,
			arm: "no-skill",
			trial: 1,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(fixture.initialPayload, null, 2)}\n`, "utf8");
		const sealed = await sealStagedInitialPayload({
			envelopePath: prepared.envelopePath,
			childPayloadPath: prepared.childPayloadPath,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
		});
		const followup = await prepareStagedFollowupDispatch({
			initialEnvelopePath: prepared.envelopePath,
			initialSealPath: sealed.sealPath,
			outputDir: fixture.outputDir,
		});

		assert.equal(followup.request.stage, "drift");
		assert.equal(followup.request.agentTarget, "/root/rte02-no-skill-t1");
		assert.match(followup.request.task, /CSS Modules/);
		assert.deepEqual(followup.request.files, [
			"src/components/ui/entry-tree.tsx",
			"src/routes/entries/-local/entry-tree.tsx",
			"src/routes/entries/-local/entry-tree.css",
		]);
		assert.deepEqual(
			followup.request.virtualFiles.map(({state}) => state),
			["absent", "present", "absent"],
		);
		assert.equal(followup.envelope.initialSeal.sha256, sealed.sealSha256);
		assert.equal(followup.envelope.initialPayload.sha256, sealed.seal.initialPayload.sha256);
		assert.match(followup.exactDispatch, /already running in the bound isolated Codex CLI child session:/);
		assert.match(followup.exactDispatch, /do not spawn, hand off, or redispatch to another agent/);
		assert.doesNotMatch(followup.requestRaw, /expectedSkills|expectedSelected|expectedNotApplicable|routing-evals/);
		assert.doesNotMatch(String(followup.request.armPolicy.promptSuffix), /also return driftReceipt/i);
		assert.match(
			String(followup.request.armPolicy.promptSuffix),
			/replacement-final.*top-level.*routingTrace.*activatedSkills.*receipts.*declaredLoadedFiles.*complete cumulative.*coordinator.*driftReceipt/i,
		);

		await writeFile(prepared.childPayloadPath, `${JSON.stringify({...fixture.initialPayload, response: "mutated"}, null, 2)}\n`, "utf8");
		await assert.rejects(
			prepareStagedFollowupDispatch({
				initialEnvelopePath: prepared.envelopePath,
				initialSealPath: sealed.sealPath,
				outputDir: path.join(fixtureDir, "mutated-runs"),
			}),
			/initial payload.*changed|does not match.*seal/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("staged merge enforces the same target and writes a deterministic immutable combined payload", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-staging-merge-"));

	try {
		const fixture = await createFixture(fixtureDir);
		const mergeRunId = `no-skill--${scenarioId}--t1`;
		const initial = await prepareStagedInitialDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId: mergeRunId,
			arm: "no-skill",
			trial: 1,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		await writeFile(initial.childPayloadPath, `${JSON.stringify(fixture.initialPayload, null, 2)}\n`, "utf8");
		const sealed = await sealStagedInitialPayload({
			envelopePath: initial.envelopePath,
			childPayloadPath: initial.childPayloadPath,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
		});
		const followup = await prepareStagedFollowupDispatch({
			initialEnvelopePath: initial.envelopePath,
			initialSealPath: sealed.sealPath,
			outputDir: fixture.outputDir,
		});
		await writeFile(followup.childPayloadPath, `${JSON.stringify(fixture.driftPayload, null, 2)}\n`, "utf8");

		await assert.rejects(
			mergeStagedBehavioralPayloads({
				initialEnvelopePath: initial.envelopePath,
				initialSealPath: sealed.sealPath,
				followupEnvelopePath: followup.envelopePath,
				initialChildPayloadPath: initial.childPayloadPath,
				driftChildPayloadPath: followup.childPayloadPath,
				agentTarget: "/root/different-agent",
				outputDir: fixture.outputDir,
			}),
			/same agent target|agentTarget.*match/i,
		);

		const merged = await mergeStagedBehavioralPayloads({
			initialEnvelopePath: initial.envelopePath,
			initialSealPath: sealed.sealPath,
			followupEnvelopePath: followup.envelopePath,
			initialChildPayloadPath: initial.childPayloadPath,
			driftChildPayloadPath: followup.childPayloadPath,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
		});
		const combined = JSON.parse(await readFile(merged.combinedChildPayloadPath, "utf8")) as Record<string, unknown>;
		const initialPatch = fixture.initialPayload.virtualPatch as {files: Record<string, unknown>[]};
		const driftPatch = fixture.driftPayload.virtualPatch as {files: Record<string, unknown>[]};
		const publicBeforeByPath = new Map(initialPatch.files.map((file) => [file.path, file]));
		const expectedEndToEndPatch = {
			files: driftPatch.files.map((file) => {
				const publicBefore = publicBeforeByPath.get(file.path);
				return {
					...file,
					beforeState: publicBefore ? publicBefore.beforeState : file.beforeState,
					beforeSha256: publicBefore ? publicBefore.beforeSha256 : file.beforeSha256,
				} as Record<string, unknown>;
			}),
			summary: "Composed initial and replacement-final virtual patches.",
		};

		assert.deepEqual(combined, {
			...fixture.driftPayload,
			virtualPatch: expectedEndToEndPatch,
			activatedSkills: fixture.initialPayload.activatedSkills,
			receipts: fixture.initialPayload.receipts,
			routingTrace: fixture.initialPayload.routingTrace,
			driftReceipt: null,
		});
		assert.deepEqual(
			(combined.virtualPatch as {files: Record<string, unknown>[]}).files.map((file) => [file.path, file.beforeState, file.beforeSha256]),
			expectedEndToEndPatch.files.map((file) => [file.path, file.beforeState, file.beforeSha256]),
		);
		assert.equal(merged.provenance.agentTarget, "/root/rte02-no-skill-t1");
		assert.equal(merged.provenance.initial.payloadSha256, sealed.seal.initialPayload.sha256);
		assert.equal(merged.provenance.followup.payloadSha256, createSha256(`${JSON.stringify(fixture.driftPayload, null, 2)}\n`));
		assert.equal(merged.provenance.combined.payloadSha256, createSha256(await readFile(merged.combinedChildPayloadPath, "utf8")));
		await assert.rejects(
			mergeStagedBehavioralPayloads({
				initialEnvelopePath: initial.envelopePath,
				initialSealPath: sealed.sealPath,
				followupEnvelopePath: followup.envelopePath,
				initialChildPayloadPath: initial.childPayloadPath,
				driftChildPayloadPath: followup.childPayloadPath,
				agentTarget: "/root/rte02-no-skill-t1",
				outputDir: fixture.outputDir,
			}),
			/already exists|overwrite/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("no-skill staged merge keeps driftReceipt null while preserving replacement-final evidence", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-staging-no-skill-merge-"));

	try {
		const fixture = await createFixture(fixtureDir);
		const initial = await prepareStagedInitialDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId,
			arm: "no-skill",
			trial: 1,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		await writeFile(initial.childPayloadPath, `${JSON.stringify(fixture.initialPayload, null, 2)}\n`, "utf8");
		const sealed = await sealStagedInitialPayload({
			envelopePath: initial.envelopePath,
			childPayloadPath: initial.childPayloadPath,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
		});
		const followup = await prepareStagedFollowupDispatch({
			initialEnvelopePath: initial.envelopePath,
			initialSealPath: sealed.sealPath,
			outputDir: fixture.outputDir,
		});
		await writeFile(followup.childPayloadPath, `${JSON.stringify(fixture.driftPayload, null, 2)}\n`, "utf8");
		const merged = await mergeStagedBehavioralPayloads({
			initialEnvelopePath: initial.envelopePath,
			initialSealPath: sealed.sealPath,
			followupEnvelopePath: followup.envelopePath,
			initialChildPayloadPath: initial.childPayloadPath,
			driftChildPayloadPath: followup.childPayloadPath,
			agentTarget: "/root/rte02-no-skill-t1",
			outputDir: fixture.outputDir,
		});
		const combined = JSON.parse(await readFile(merged.combinedChildPayloadPath, "utf8")) as Record<string, unknown>;

		assert.equal(combined.driftReceipt, null);
		assert.deepEqual(
			(combined.virtualPatch as {files: Record<string, unknown>[]}).files.map((file) => [file.path, file.beforeState, file.beforeSha256]),
			[
				["src/components/ui/entry-tree.tsx", "present", createSha256("export const EntryTree = () => <div />;\n")],
				["src/routes/entries/-local/entry-tree.tsx", "absent", null],
				["src/routes/entries/-local/entry-tree.css", "absent", null],
			],
		);
		assert.equal(combined.response, fixture.driftPayload.response);
		const finalized = await finalizeStagedBehavioralRun({
			initialEnvelopePath: initial.envelopePath,
			initialSealPath: sealed.sealPath,
			followupEnvelopePath: followup.envelopePath,
			combinedChildPayloadPath: merged.combinedChildPayloadPath,
			mergeProvenancePath: merged.mergeProvenancePath,
			outputDir: fixture.outputDir,
			skillRootDir: fixture.skillRootDir,
		});
		const finalRun = JSON.parse(await readFile(finalized.runPath, "utf8")) as Record<string, unknown>;
		const provenanceRaw = await readFile(merged.mergeProvenancePath, "utf8");

		assert.equal(finalRun.stagedProvenanceSha256, createSha256(provenanceRaw));
		assert.equal(finalized.stagedProvenanceSha256, finalRun.stagedProvenanceSha256);
		assert.equal(finalRun.childPayloadSha256, createSha256(await readFile(merged.combinedChildPayloadPath, "utf8")));
		assert.deepEqual(finalRun.scoring, {kind: "observational", eligible: false, reason: "no-skill arm"});

		await writeFile(merged.mergeProvenancePath, `${provenanceRaw}\n`, "utf8");
		await assert.rejects(
			finalizeStagedBehavioralRun({
				initialEnvelopePath: initial.envelopePath,
				initialSealPath: sealed.sealPath,
				followupEnvelopePath: followup.envelopePath,
				combinedChildPayloadPath: merged.combinedChildPayloadPath,
				mergeProvenancePath: merged.mergeProvenancePath,
				outputDir: path.join(fixtureDir, "tampered-final"),
				skillRootDir: fixture.skillRootDir,
			}),
			/provenance.*raw bytes|provenance.*binding/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});
