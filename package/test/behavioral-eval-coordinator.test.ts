import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {promisify} from "node:util";
import test from "node:test";

import {
	createBehavioralCoordinatorArtifacts,
	enumerateBehavioralEvalRunMatrix,
	mergeBehavioralEvalChildPayload,
	prepareBehavioralEvalDispatch,
	scoreBehavioralEvalRun,
} from "../src/behavioral-eval-coordinator.js";
import {createBehavioralEvalDispatchEnvelope} from "../src/behavioral-evals.js";
import {packagePaths} from "../src/config.js";

const execFileAsync = promisify(execFile);
const protocolPath = path.join(packagePaths.repoDir, "docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json");

/** @summary clean Git repository 기반 behavioral fixture */
interface CleanRepositoryFixture {
	/** @field fixture repository의 committed HEAD */
	head: string;
	/** @field HEAD에 bind된 protocol 경로 */
	protocolPath: string;
	/** @field clean fixture repository root */
	repositoryDir: string;
	/** @field repositoryDir/skill의 canonical skill root */
	skillRootDir: string;
}

/**
 * @helper 현재 worktree 상태와 무관한 clean temporary Git repository fixture 생성
 */
const createCleanRepositoryFixture = async (fixtureDir: string): Promise<CleanRepositoryFixture> => {
	const repositoryDir = path.join(fixtureDir, "repository");
	const skillRootDir = path.join(repositoryDir, "skill");
	await mkdir(skillRootDir, {recursive: true});
	await mkdir(path.join(repositoryDir, "package"), {recursive: true});
	await writeFile(path.join(repositoryDir, "package", "evaluator.ts"), "export const evaluatorFixture = true;\n", "utf8");

	for (const skillName of ["react", "typescript", "css"]) {
		await cp(path.join(packagePaths.skillRootDir, skillName), path.join(skillRootDir, skillName), {recursive: true});
	}

	await execFileAsync("git", ["init", "--quiet"], {cwd: repositoryDir});
	await execFileAsync("git", ["config", "user.email", "behavioral-fixture@example.invalid"], {cwd: repositoryDir});
	await execFileAsync("git", ["config", "user.name", "Behavioral Fixture"], {cwd: repositoryDir});
	await execFileAsync("git", ["add", "skill", "package"], {cwd: repositoryDir});
	await execFileAsync("git", ["commit", "--quiet", "-m", "fixture"], {cwd: repositoryDir});
	const {stdout} = await execFileAsync("git", ["rev-parse", "HEAD"], {cwd: repositoryDir});
	const head = stdout.trim();
	const protocol = JSON.parse(await readFile(protocolPath, "utf8")) as Record<string, unknown>;
	const seedDispatch = await createBehavioralEvalDispatchEnvelope({
		runId: "fixture",
		repositoryHead: head,
		arm: "no-skill",
		scenarioId: "fixture",
		trial: 1,
		scenarioPrompt: "fixture",
		exactPrompt: "fixture",
		promptRendererVersion: "fixture",
		routingSkillNames: ["react", "typescript", "css"],
		skillRootDir,
	});
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

	scenarios["BASELINE-T"]!.expectedSelected = ["ORACLE_MUST_STAY_SEALED"];
	scenarios["BASELINE-T"]!.expectedSkills = ["EXPECTED_SKILL_ORACLE"];
	const targetProtocolPath = path.join(fixtureDir, "protocol.json");
	await writeFile(targetProtocolPath, `${JSON.stringify(protocol, null, 2)}\n`, "utf8");
	return {head, protocolPath: targetProtocolPath, repositoryDir: await realpath(repositoryDir), skillRootDir: await realpath(skillRootDir)};
};

/**
 * @helper no-skill arm validator를 통과하는 child-owned payload 생성
 */
const createNoSkillChildPayload = (): Record<string, unknown> => {
	return {
		runtime: {
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
		},
		declaredLoadedFiles: {kind: "declared", paths: []},
		activatedSkills: [],
		receipts: [],
		routingTrace: null,
		driftReceipt: null,
		semanticVerdicts: [],
		completion: {
			status: "COMPLETE",
			blocked: false,
			coverageFailCount: 0,
			semanticFailCount: 0,
			unknownCount: 0,
			reason: "observational baseline",
		},
		limitations: ["declared telemetry only"],
		response: "observational response",
		virtualPatch: null,
	};
};

test("run matrix is deterministic and contains exactly the bound 66 trials", async () => {
	const protocol = JSON.parse(await readFile(protocolPath, "utf8")) as unknown;
	const first = enumerateBehavioralEvalRunMatrix(protocol);
	const second = enumerateBehavioralEvalRunMatrix(protocol);

	assert.deepEqual(first, second);
	assert.equal(first.length, 66);
	assert.equal(first.filter(({group}) => group === "baseline").length, 12);
	assert.equal(first.filter(({group, arm}) => group === "mixed" && (arm === "no-skill" || arm === "full-handbook")).length, 34);
	assert.equal(first.filter(({group, arm}) => group === "mixed" && arm === "progressive").length, 17);
	assert.equal(first.filter(({group}) => group === "mutation").length, 3);
	assert.equal(new Set(first.map(({runId}) => runId)).size, 66);
});

test("regular coordinator explicitly rejects RTE02 one-shot prepare and merge", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-rte02-one-shot-reject-"));

	try {
		const fixture = await createCleanRepositoryFixture(fixtureDir);
		const outputDir = path.join(fixtureDir, "runs");
		await assert.rejects(
			prepareBehavioralEvalDispatch({
				protocolPath: fixture.protocolPath,
				repositoryHead: fixture.head,
				runId: "no-skill--RTE02-owner-placement-css-drift--t1",
				arm: "no-skill",
				scenarioId: "RTE02-owner-placement-css-drift",
				trial: 1,
				outputDir,
				repositoryDir: fixture.repositoryDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/RTE02.*staged|staged.*RTE02/i,
		);

		const regular = await prepareBehavioralEvalDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId: "no-skill--BASELINE-T--t1",
			arm: "no-skill",
			scenarioId: "BASELINE-T",
			trial: 1,
			outputDir: path.join(fixtureDir, "regular"),
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		const forgedEnvelope = JSON.parse(await readFile(regular.envelopePath, "utf8")) as Record<string, unknown>;
		(forgedEnvelope.dispatchEnvelope as Record<string, unknown>).scenarioId = "RTE02-owner-placement-css-drift";
		const forgedEnvelopePath = path.join(fixtureDir, "forged-rte02-envelope.json");
		await writeFile(forgedEnvelopePath, `${JSON.stringify(forgedEnvelope)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: forgedEnvelopePath,
				childPayloadPath: regular.childPayloadPath,
				outputDir: path.join(fixtureDir, "forged-run"),
				skillRootDir: fixture.skillRootDir,
			}),
			/RTE02.*staged|staged.*RTE02/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("coordinator persists a deterministic short dispatch and sealed child request before execution", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-coordinator-"));

	try {
		const protocol = await createCleanRepositoryFixture(fixtureDir);
		const outputDir = path.join(fixtureDir, "runs");
		const args = {
			protocolPath: protocol.protocolPath,
			repositoryHead: protocol.head,
			runId: "no-skill--BASELINE-T--t1",
			arm: "no-skill",
			scenarioId: "BASELINE-T",
			trial: 1,
			outputDir,
			repositoryDir: protocol.repositoryDir,
			skillRootDir: protocol.skillRootDir,
		};
		const first = await createBehavioralCoordinatorArtifacts(args);
		const second = await createBehavioralCoordinatorArtifacts(args);

		assert.deepEqual(first, second);
		assert.ok(Buffer.byteLength(first.exactDispatch, "utf8") < 700);
		assert.match(first.exactDispatch, /Assigned payload path:/);
		assert.match(first.exactDispatch, /Write exactly this one file with apply_patch/);
		assert.match(first.exactDispatch, /create or modify no other file/);
		assert.match(first.exactDispatch, /do not echo/i);
		assert.doesNotMatch(first.exactDispatch, /ORACLE_MUST_STAY_SEALED|EXPECTED_SKILL_ORACLE|expectedSelected|expectedSkills/);
		assert.doesNotMatch(
			first.requestRaw,
			/ORACLE_MUST_STAY_SEALED|EXPECTED_SKILL_ORACLE|expectedSelected|expectedNotApplicable|expectedSkills|"domains"\s*:|"domainsFinal"\s*:/,
		);
		assert.doesNotMatch(
			first.envelopeRaw,
			/ORACLE_MUST_STAY_SEALED|EXPECTED_SKILL_ORACLE|expectedSelected|expectedNotApplicable|expectedSkills|"domains"\s*:|"domainsFinal"\s*:/,
		);
		assert.equal(first.request.assignedChildPayloadPath, first.childPayloadPath);
		assert.deepEqual(first.request.virtualFiles, []);
		const payloadContract = first.request.childPayloadContract as Record<string, unknown>;
		assert.equal(payloadContract.assignedChildPayloadPath, first.childPayloadPath);
		assert.deepEqual(payloadContract.runtime, createNoSkillChildPayload().runtime);
		assert.match(String(payloadContract.routingTrace), /generatedIndexDigests/);
		assert.match(String(payloadContract.routingTrace), /requiresSelectedEvaluated/);
		assert.match(String(payloadContract.routingTrace), /completionGatesEvaluated/);
		assert.equal(first.envelope.skillRootDir, protocol.skillRootDir);
		assert.deepEqual(Object.keys(first.envelope.routingEvalRawSha256).sort(), [
			"skill/css/routing-evals.json",
			"skill/react/routing-evals.json",
			"skill/typescript/routing-evals.json",
		]);

		for (const [relativePath, digest] of Object.entries(first.envelope.routingEvalRawSha256)) {
			const raw = await readFile(path.join(protocol.repositoryDir, relativePath));
			assert.equal(digest, `sha256:${createHash("sha256").update(raw).digest("hex")}`);
		}

		assert.equal(first.envelope.childRequest.sha256, `sha256:${createHash("sha256").update(first.requestRaw).digest("hex")}`);
		assert.equal(first.envelope.childRequest.utf8ByteLength, Buffer.byteLength(first.requestRaw, "utf8"));
		const fullHandbook = await createBehavioralCoordinatorArtifacts({
			...args,
			runId: "full-handbook--BASELINE-T--t1",
			arm: "full-handbook",
		});
		assert.deepEqual(Object.keys(fullHandbook.request.identityDictionary).sort(), ["css", "react", "typescript"]);
		assert.equal(Object.values(fullHandbook.request.identityDictionary).flat().length, 85);
		assert.deepEqual(fullHandbook.request.candidateSkillEntrypoints, [
			"skill/react/SKILL.md",
			"skill/typescript/SKILL.md",
			"skill/css/SKILL.md",
		]);
		assert.notEqual(fullHandbook.childPayloadPath, first.childPayloadPath);
		assert.notEqual(fullHandbook.envelope.requestContentDigest, first.envelope.requestContentDigest);

		const prepared = await prepareBehavioralEvalDispatch(args);
		assert.equal(await readFile(prepared.requestPath, "utf8"), first.requestRaw);
		assert.deepEqual(JSON.parse(await readFile(prepared.envelopePath, "utf8")), first.envelope);
		await assert.rejects(prepareBehavioralEvalDispatch(args), /already exists|overwrite/i);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("prepare and merge require the canonical clean repository skill source", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-source-binding-"));

	try {
		const fixture = await createCleanRepositoryFixture(fixtureDir);
		const outputDir = path.join(fixtureDir, "runs");
		const args = {
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId: "no-skill--BASELINE-T--t1",
			arm: "no-skill",
			scenarioId: "BASELINE-T",
			trial: 1,
			outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		};
		const foreignSkillRoot = path.join(fixtureDir, "foreign-skill");
		await cp(fixture.skillRootDir, foreignSkillRoot, {recursive: true});
		await assert.rejects(prepareBehavioralEvalDispatch({...args, skillRootDir: foreignSkillRoot}), /skillRootDir.*repositoryDir.*skill/i);

		const untrackedPath = path.join(fixture.skillRootDir, "react", "untracked-source.md");
		await writeFile(untrackedPath, "untracked\n", "utf8");
		await assert.rejects(prepareBehavioralEvalDispatch(args), /skill source.*clean|dirty.*skill/i);
		await rm(untrackedPath);

		const routingManifestPath = path.join(fixture.skillRootDir, "react", "routing-evals.json");
		const routingManifestRaw = await readFile(routingManifestPath, "utf8");
		await writeFile(routingManifestPath, `${routingManifestRaw}\n`, "utf8");
		await assert.rejects(prepareBehavioralEvalDispatch(args), /skill source.*clean|dirty.*skill/i);
		await writeFile(routingManifestPath, routingManifestRaw, "utf8");

		const untrackedEvaluatorPath = path.join(fixture.repositoryDir, "package", "untracked-evaluator.ts");
		await writeFile(untrackedEvaluatorPath, "untracked\n", "utf8");
		await assert.rejects(prepareBehavioralEvalDispatch(args), /evaluator.*clean|dirty.*package/i);
		await rm(untrackedEvaluatorPath);

		const evaluatorPath = path.join(fixture.repositoryDir, "package", "evaluator.ts");
		const evaluatorRaw = await readFile(evaluatorPath, "utf8");
		await writeFile(evaluatorPath, `${evaluatorRaw}\n`, "utf8");
		await assert.rejects(prepareBehavioralEvalDispatch(args), /evaluator.*clean|dirty.*package/i);
		await writeFile(evaluatorPath, evaluatorRaw, "utf8");

		const prepared = await prepareBehavioralEvalDispatch(args);
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(createNoSkillChildPayload())}\n`, "utf8");
		await execFileAsync("git", ["update-index", "--assume-unchanged", "skill/react/routing-evals.json"], {cwd: fixture.repositoryDir});
		await writeFile(routingManifestPath, `${routingManifestRaw}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/routing-evals.*raw bytes changed/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("merge strictly cross-checks the saved child request against its envelope and exact dispatch", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-request-binding-"));

	try {
		const fixture = await createCleanRepositoryFixture(fixtureDir);
		const outputDir = path.join(fixtureDir, "runs");
		const prepared = await prepareBehavioralEvalDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId: "no-skill--BASELINE-T--t1",
			arm: "no-skill",
			scenarioId: "BASELINE-T",
			trial: 1,
			outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(createNoSkillChildPayload())}\n`, "utf8");
		const originalEnvelope = JSON.parse(await readFile(prepared.envelopePath, "utf8")) as Record<string, unknown>;
		const originalRequestPath = (originalEnvelope.childRequest as Record<string, unknown>).path as string;
		const originalRequest = JSON.parse(await readFile(originalRequestPath, "utf8")) as Record<string, unknown>;

		const cases = [
			{name: "run-coordinate", patch: {runId: "forged-run"}, pattern: /child request.*runId.*dispatch/i},
			{name: "repository-root", patch: {repositoryRoot: fixtureDir}, pattern: /child request.*repositoryRoot.*repositoryDir/i},
			{
				name: "assigned-path",
				patch: {assignedChildPayloadPath: path.join(fixtureDir, "forged.json")},
				pattern: /assignedChildPayloadPath/i,
			},
		];

		for (const requestCase of cases) {
			const requestPath = path.join(outputDir, `${requestCase.name}.child-request.json`);
			const requestRaw = `${JSON.stringify({...originalRequest, ...requestCase.patch}, null, 2)}\n`;
			await writeFile(requestPath, requestRaw, "utf8");
			const envelope = structuredClone(originalEnvelope);
			const childRequest = envelope.childRequest as Record<string, unknown>;
			childRequest.path = requestPath;
			childRequest.sha256 = `sha256:${createHash("sha256").update(requestRaw).digest("hex")}`;
			childRequest.utf8ByteLength = Buffer.byteLength(requestRaw, "utf8");
			const envelopePath = path.join(outputDir, `${requestCase.name}.dispatch-envelope.json`);
			await writeFile(envelopePath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
			await assert.rejects(
				mergeBehavioralEvalChildPayload({
					envelopePath,
					childPayloadPath: prepared.childPayloadPath,
					outputDir,
					skillRootDir: fixture.skillRootDir,
				}),
				requestCase.pattern,
			);
		}

		const forgedDispatchEnvelope = structuredClone(originalEnvelope);
		(forgedDispatchEnvelope.dispatchEnvelope as Record<string, unknown>).exactPrompt = "forged exact dispatch";
		const forgedDispatchEnvelopePath = path.join(outputDir, "forged-exact-dispatch-envelope.json");
		await writeFile(forgedDispatchEnvelopePath, `${JSON.stringify(forgedDispatchEnvelope, null, 2)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: forgedDispatchEnvelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/exact dispatch.*saved child request/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("mixed runs expose only digest-bound virtual inputs and reject missing or stale virtual patches", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-virtual-patch-"));

	try {
		const fixture = await createCleanRepositoryFixture(fixtureDir);
		const protocol = JSON.parse(await readFile(fixture.protocolPath, "utf8")) as Record<string, unknown>;
		const scenarios = protocol.scenarios as Record<string, Record<string, unknown>>;
		const content = "export const sourceValue = 1;\n";
		const sha256 = `sha256:${createHash("sha256").update(content).digest("hex")}`;
		const removedContent = "export const removedValue = true;\n";
		const removedSha256 = `sha256:${createHash("sha256").update(removedContent).digest("hex")}`;
		scenarios["derive-existing-contract-with-docs"]!.virtualFiles = [
			{path: "src/query.ts", state: "present", content, sha256},
			{path: "src/new.ts", state: "absent", content: null, sha256: null},
			{path: "src/removed.ts", state: "present", content: removedContent, sha256: removedSha256},
		];
		scenarios["derive-existing-contract-with-docs"]!.expectedAfter = "MUST_REMAIN_SEALED";
		await writeFile(fixture.protocolPath, `${JSON.stringify(protocol, null, 2)}\n`, "utf8");
		const outputDir = path.join(fixtureDir, "runs");
		const artifacts = await createBehavioralCoordinatorArtifacts({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId: "no-skill--derive-existing-contract-with-docs--t1",
			arm: "no-skill",
			scenarioId: "derive-existing-contract-with-docs",
			trial: 1,
			outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});

		assert.deepEqual(artifacts.request.virtualFiles, [
			{path: "src/query.ts", state: "present", content, sha256},
			{path: "src/new.ts", state: "absent", content: null, sha256: null},
			{path: "src/removed.ts", state: "present", content: removedContent, sha256: removedSha256},
		]);
		assert.doesNotMatch(artifacts.requestRaw, /MUST_REMAIN_SEALED|expectedAfter|semanticCriteria/);
		const prepared = await prepareBehavioralEvalDispatch({
			protocolPath: fixture.protocolPath,
			repositoryHead: fixture.head,
			runId: "no-skill--derive-existing-contract-with-docs--t1",
			arm: "no-skill",
			scenarioId: "derive-existing-contract-with-docs",
			trial: 1,
			outputDir,
			repositoryDir: fixture.repositoryDir,
			skillRootDir: fixture.skillRootDir,
		});
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(createNoSkillChildPayload())}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/mixed.*non-null.*virtualPatch|mixed.*virtualPatch.*non-null/i,
		);

		const after = "export const sourceValue = 2;\n";
		const afterSha256 = `sha256:${createHash("sha256").update(after).digest("hex")}`;
		const newContent = "export const newValue = true;\n";
		const newSha256 = `sha256:${createHash("sha256").update(newContent).digest("hex")}`;
		const wrongPathPayload = {
			...createNoSkillChildPayload(),
			virtualPatch: {
				files: [
					{path: "src/other.ts", beforeState: "present", beforeSha256: sha256, afterState: "present", after, afterSha256},
					{path: "src/new.ts", beforeState: "absent", beforeSha256: null, afterState: "present", after: newContent, afterSha256: newSha256},
					{
						path: "src/removed.ts",
						beforeState: "present",
						beforeSha256: removedSha256,
						afterState: "absent",
						after: null,
						afterSha256: null,
					},
				],
				summary: "virtual implementation",
			},
		};
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(wrongPathPayload)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/virtualPatch paths.*exactly match.*virtualFiles paths/i,
		);

		const stalePatchPayload = structuredClone(wrongPathPayload);
		const [stalePatchFile] = (stalePatchPayload.virtualPatch as {files: Record<string, unknown>[]}).files;
		assert.ok(stalePatchFile);
		stalePatchFile.path = "src/query.ts";
		stalePatchFile.beforeState = "absent";
		stalePatchFile.beforeSha256 = null;
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(stalePatchPayload)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/virtualPatch.*beforeState.*virtualFiles/i,
		);

		stalePatchFile.beforeState = "present";
		stalePatchFile.beforeSha256 = `sha256:${"9".repeat(64)}`;
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(stalePatchPayload)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: fixture.skillRootDir,
			}),
			/virtualPatch.*beforeSha256.*virtualFiles/i,
		);

		stalePatchFile.beforeSha256 = sha256;
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(stalePatchPayload)}\n`, "utf8");
		const merged = await mergeBehavioralEvalChildPayload({
			envelopePath: prepared.envelopePath,
			childPayloadPath: prepared.childPayloadPath,
			outputDir,
			skillRootDir: fixture.skillRootDir,
		});
		const run = JSON.parse(await readFile(merged.runPath, "utf8")) as Record<string, unknown>;
		assert.deepEqual(run.virtualPatch, stalePatchPayload.virtualPatch);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("merge rejects child-owned coordinator fields, validates the merged run, and refuses overwrite", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-merge-"));

	try {
		const protocol = await createCleanRepositoryFixture(fixtureDir);
		const outputDir = path.join(fixtureDir, "runs");
		const prepared = await prepareBehavioralEvalDispatch({
			protocolPath: protocol.protocolPath,
			repositoryHead: protocol.head,
			runId: "no-skill--BASELINE-T--t1",
			arm: "no-skill",
			scenarioId: "BASELINE-T",
			trial: 1,
			outputDir,
			repositoryDir: protocol.repositoryDir,
			skillRootDir: protocol.skillRootDir,
		});
		const poisonedPayload = {...createNoSkillChildPayload(), exactPrompt: "child-forged"};
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(poisonedPayload)}\n`, "utf8");

		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: protocol.skillRootDir,
			}),
			/child payload.*exactPrompt.*forbidden/i,
		);
		const stagedProvenancePoison = {...createNoSkillChildPayload(), stagedProvenanceSha256: `sha256:${"7".repeat(64)}`};
		await writeFile(prepared.childPayloadPath, `${JSON.stringify(stagedProvenancePoison)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: protocol.skillRootDir,
			}),
			/child payload.*stagedProvenanceSha256.*forbidden/i,
		);

		await writeFile(prepared.childPayloadPath, `${JSON.stringify(createNoSkillChildPayload())}\n`, "utf8");
		const merged = await mergeBehavioralEvalChildPayload({
			envelopePath: prepared.envelopePath,
			childPayloadPath: prepared.childPayloadPath,
			outputDir,
			skillRootDir: protocol.skillRootDir,
		});
		const run = JSON.parse(await readFile(merged.runPath, "utf8")) as Record<string, unknown>;

		assert.equal(run.runId, "no-skill--BASELINE-T--t1");
		assert.deepEqual(run.scoring, {kind: "observational", eligible: false, reason: "no-skill arm"});
		assert.equal(run.childPayloadSha256, merged.childPayloadSha256);
		assert.equal(run.stagedProvenanceSha256, null);
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: prepared.envelopePath,
				childPayloadPath: prepared.childPayloadPath,
				outputDir,
				skillRootDir: protocol.skillRootDir,
			}),
			/already exists|overwrite/i,
		);

		const driftPrepared = await prepareBehavioralEvalDispatch({
			protocolPath: protocol.protocolPath,
			repositoryHead: protocol.head,
			runId: "no-skill--BASELINE-T--t2",
			arm: "no-skill",
			scenarioId: "BASELINE-T",
			trial: 2,
			outputDir,
			repositoryDir: protocol.repositoryDir,
			skillRootDir: protocol.skillRootDir,
		});
		await writeFile(driftPrepared.childPayloadPath, `${JSON.stringify(createNoSkillChildPayload())}\n`, "utf8");
		const boundProtocolRaw = await readFile(protocol.protocolPath, "utf8");
		await writeFile(protocol.protocolPath, `${boundProtocolRaw}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: driftPrepared.envelopePath,
				childPayloadPath: driftPrepared.childPayloadPath,
				outputDir,
				skillRootDir: protocol.skillRootDir,
			}),
			/protocol raw bytes changed/i,
		);
		await writeFile(protocol.protocolPath, boundProtocolRaw, "utf8");
		const forgedEnvelope = JSON.parse(await readFile(driftPrepared.envelopePath, "utf8")) as Record<string, unknown>;
		const forgedDispatch = forgedEnvelope.dispatchEnvelope as Record<string, unknown>;
		forgedDispatch.repositoryHead = "0".repeat(40);
		const forgedEnvelopePath = path.join(outputDir, "forged-head-envelope.json");
		await writeFile(forgedEnvelopePath, `${JSON.stringify(forgedEnvelope)}\n`, "utf8");
		await assert.rejects(
			mergeBehavioralEvalChildPayload({
				envelopePath: forgedEnvelopePath,
				childPayloadPath: driftPrepared.childPayloadPath,
				outputDir,
				skillRootDir: protocol.skillRootDir,
			}),
			/HEAD drifted/i,
		);
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});

test("post-hoc scorer measures exact candidate partitions, drift-final state, and mutation blocking", async () => {
	const fixtureDir = await mkdtemp(path.join(tmpdir(), "behavioral-score-"));

	try {
		const skillRootDir = path.join(fixtureDir, "skill");
		const manifestDir = path.join(skillRootDir, "react");
		await import("node:fs/promises").then(({mkdir}) => mkdir(manifestDir, {recursive: true}));
		await writeFile(
			path.join(manifestDir, "routing-evals.json"),
			`${JSON.stringify({
				version: 1,
				skill: "react",
				scenarios: [
					{
						id: "candidate",
						expectedSkills: ["react"],
						expectedSelected: {react: ["r1"]},
						expectedNotApplicable: {react: ["r2"]},
						scopeDrift: {
							expectedSkills: ["react", "css"],
							expectedSelected: {react: ["r1"], css: ["c1"]},
							expectedNotApplicable: {react: ["r2"], css: ["c2"]},
						},
					},
				],
			})}\n`,
			"utf8",
		);
		const candidateRun = {
			activatedSkills: ["react"],
			receipts: [{skill: "react", selected: [{id: "r1"}], notApplicable: [{id: "r2"}]}],
			completion: {status: "COMPLETE", blocked: false, coverageFailCount: 0, semanticFailCount: 0, unknownCount: 0},
			driftReceipt: {
				activatedSkills: ["react", "css"],
				receipts: [
					{skill: "react", selected: [{id: "r1"}], notApplicable: [{id: "r2"}]},
					{skill: "css", selected: [{id: "c1"}], notApplicable: [{id: "c2"}]},
				],
			},
		};
		const score = await scoreBehavioralEvalRun({run: candidateRun, arm: "progressive", scenarioId: "candidate", skillRootDir});

		assert.equal(score.kind, "candidate");
		assert.equal(score.exactMatch, true);
		assert.deepEqual(score.metrics, {domainActivationRecall: 1, applicableRuleRecall: 1, exactSelectionPrecision: 1});
		assert.equal(score.driftFinalExactMatch, true);
		const blockedCandidateScore = await scoreBehavioralEvalRun({
			run: {...candidateRun, completion: {status: "BLOCKED", blocked: true, coverageFailCount: 0, semanticFailCount: 1, unknownCount: 0}},
			arm: "progressive",
			scenarioId: "candidate",
			skillRootDir,
		});

		assert.equal(blockedCandidateScore.kind, "candidate");
		assert.equal(blockedCandidateScore.initialExactMatch, true);
		assert.equal(blockedCandidateScore.driftFinalExactMatch, true);
		assert.equal(blockedCandidateScore.exactMatch, false);

		const mutationScore = await scoreBehavioralEvalRun({
			run: {completion: {status: "BLOCKED", coverageFailCount: 1, unknownCount: 0}},
			arm: "mutation",
			scenarioId: "mutation",
			skillRootDir,
		});
		assert.deepEqual(mutationScore, {kind: "mutation", eligible: true, blockedGatePassed: true});
	} finally {
		await rm(fixtureDir, {recursive: true, force: true});
	}
});
