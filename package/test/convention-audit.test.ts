import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

import {getSkillPaths} from "../src/config.js";
import {readSkillRules} from "../src/parser.js";
import type {RoutingEvalManifest, SkillMetadata} from "../src/types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const skillDir = path.join(repoDir, "skill/convention-audit");

const companionContract = [
	{
		skill: "react",
		mode: "conditional",
		appliesWhen: "React component, TSX render, screen/route-local 경계, hook, handler, state/query 또는 rendered behavior를 변경했다.",
	},
	{
		skill: "typescript",
		mode: "conditional",
		appliesWhen: "TypeScript/TSX type, schema, config, API, helper, import/export, fallback 또는 JSDoc 경계를 변경했다.",
	},
	{
		skill: "css",
		mode: "conditional",
		appliesWhen: "stylesheet, selector, token/CSS variable, className contract 또는 visual styling surface를 변경했다.",
	},
] as const;

/**
 * @summary current compact index의 canonical ordinal과 stable ID 결합
 */
interface RuleReference {
	/**
	 * @field current index에 표시된 canonical ordinal
	 */
	ordinal: string;
	/**
	 * @field ordinal과 결합된 stable rule ID
	 */
	ruleId: string;
}

/**
 * @summary test-local audit receipt의 N/A exclusion 묶음
 */
interface ReceiptExclusionGroup {
	/**
	 * @field 이 근거로 제외한 canonical ordinal과 rule ID 목록
	 */
	rules: RuleReference[];
	/**
	 * @field 변경 scope가 appliesWhen과 맞지 않는 구체적 근거
	 */
	reason: string;
}

/**
 * @summary mutation pressure에서 사용하는 digest-bound exact partition
 */
interface AuditReceipt {
	/**
	 * @field receipt가 대상으로 삼는 current routing digest
	 */
	digest: string;
	/**
	 * @field 적용 대상으로 선택한 canonical ordinal과 rule ID 목록
	 */
	selected: RuleReference[];
	/**
	 * @field evidence로 비적용 판정한 canonical ordinal과 rule ID 목록
	 */
	notApplicable: RuleReference[];
	/**
	 * @field body 확인 전 applicability가 남은 canonical ordinal과 rule ID 목록
	 */
	unknown: RuleReference[];
	/**
	 * @field notApplicable 집합을 정확히 덮는 evidence 묶음
	 */
	exclusionGroups: ReceiptExclusionGroup[];
}

/**
 * @summary test-local receipt 구조 검증 입력
 */
interface ReceiptValidationArgs {
	/**
	 * @field 구조를 검증할 receipt
	 */
	receipt: AuditReceipt;
	/**
	 * @field RULES_INDEX에서 읽은 current routing digest
	 */
	currentDigest: string;
	/**
	 * @field current index 순서의 canonical ordinal과 rule ID 전체
	 */
	canonicalRules: RuleReference[];
}

/**
 * @helper convention-audit 기준 상대 경로 파일 로드
 */
const readSkillFile = async (relativePath: string): Promise<string> => {
	return await readFile(path.join(skillDir, relativePath), "utf8");
};

/**
 * @helper 정규식 입력용 literal 문자열 escape
 */
const escapePattern = (value: string): string => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * @helper 필수 Workflow 아래의 최상위 numbered step 본문 추출
 */
const readNumberedWorkflowSteps = (source: string): string[] => {
	const workflowStart = source.indexOf("## 필수 Workflow");
	assert.notEqual(workflowStart, -1);
	const workflowBodyStart = source.indexOf("\n", workflowStart) + 1;
	const nextSection = source.indexOf("\n## ", workflowBodyStart);
	const workflowBody = source.slice(workflowBodyStart, nextSection === -1 ? undefined : nextSection);
	const steps: string[] = [];

	for (const line of workflowBody.split("\n")) {
		const stepMatch = line.match(/^(\d+)\. (.+)$/);

		if (stepMatch) {
			assert.equal(Number(stepMatch[1]), steps.length + 1);
			const stepBody = stepMatch[2];

			if (!stepBody) {
				throw new Error(`Workflow step ${steps.length + 1} is missing its body.`);
			}

			steps.push(stepBody);
			continue;
		}

		if (steps.length > 0) {
			const previousStep = steps[steps.length - 1];

			if (!previousStep) {
				throw new Error(`Workflow step ${steps.length} is missing while appending its body.`);
			}

			steps[steps.length - 1] = `${previousStep}\n${line}`;
		}
	}

	return steps;
};

/**
 * @helper canonical ordinal과 stable ID를 exact pair key로 변환
 */
const getRuleReferenceKey = (reference: RuleReference): string => {
	return `${reference.ordinal}:${reference.ruleId}`;
};

/**
 * @helper rule reference 배열을 중복 없는 canonical 비교 순서로 정규화
 */
const normalizeRuleReferenceSet = (references: RuleReference[]): string[] => {
	return Array.from(new Set(references.map(getRuleReferenceKey))).sort((left, right) => left.localeCompare(right, "en-US"));
};

/**
 * @helper 두 ordinal과 stable ID collection의 exact pair equality 검증
 */
const areExactRuleReferenceSets = (leftReferences: RuleReference[], rightReferences: RuleReference[]): boolean => {
	const left = normalizeRuleReferenceSet(leftReferences);
	const right = normalizeRuleReferenceSet(rightReferences);

	return left.length === right.length && left.every((value, index) => value === right[index]);
};

/**
 * @helper stable ID 목록을 current canonical ordinal과 결합
 */
const resolveRuleReferences = (ruleIds: string[], ruleById: Map<string, RuleReference>): RuleReference[] => {
	return ruleIds.map((ruleId) => {
		const reference = ruleById.get(ruleId);

		if (!reference) {
			throw new Error(`Missing canonical rule reference for ${ruleId}.`);
		}

		return reference;
	});
};

/**
 * @helper digest, exact partition, N/A exclusion 구조의 기계적 유효성 검증
 */
const isStructurallyValidReceipt = (args: ReceiptValidationArgs): boolean => {
	const {canonicalRules, currentDigest, receipt} = args;
	const partitionRules = [...receipt.selected, ...receipt.notApplicable, ...receipt.unknown];
	const partitionKeys = partitionRules.map(getRuleReferenceKey);
	const exclusionRules = receipt.exclusionGroups.flatMap(({rules}) => rules);
	const exclusionKeys = exclusionRules.map(getRuleReferenceKey);

	return (
		receipt.digest === currentDigest &&
		partitionKeys.length === new Set(partitionKeys).size &&
		areExactRuleReferenceSets(partitionRules, canonicalRules) &&
		exclusionKeys.length === new Set(exclusionKeys).size &&
		areExactRuleReferenceSets(exclusionRules, receipt.notApplicable) &&
		receipt.exclusionGroups.every(({reason}) => reason.trim().length > 0)
	);
};

/**
 * @helper same-digest receipt의 세 partition set exact match 여부 판정
 */
const compareReceiptPartitions = (implementerReceipt: AuditReceipt, auditorReceipt: AuditReceipt): "PASS" | "SELECTION_COVERAGE_FAIL" => {
	const sameDigest = implementerReceipt.digest === auditorReceipt.digest;
	const sameSelected = areExactRuleReferenceSets(implementerReceipt.selected, auditorReceipt.selected);
	const sameNotApplicable = areExactRuleReferenceSets(implementerReceipt.notApplicable, auditorReceipt.notApplicable);
	const sameUnknown = areExactRuleReferenceSets(implementerReceipt.unknown, auditorReceipt.unknown);

	return sameDigest && sameSelected && sameNotApplicable && sameUnknown ? "PASS" : "SELECTION_COVERAGE_FAIL";
};

test("test-local receipt oracle rejects structural mutations and compares all exact pair sets", () => {
	const currentDigest = `sha256:${"a".repeat(64)}`;
	const alpha = {ordinal: "R01", ruleId: "alpha"};
	const beta = {ordinal: "R02", ruleId: "beta"};
	const gamma = {ordinal: "R03", ruleId: "gamma"};
	const delta = {ordinal: "R04", ruleId: "delta"};
	const canonicalRules = [alpha, beta, gamma, delta];
	const validReceipt: AuditReceipt = {
		digest: currentDigest,
		selected: [alpha, beta],
		notApplicable: [gamma],
		unknown: [delta],
		exclusionGroups: [{rules: [gamma], reason: "gamma surface가 fixture에 없다."}],
	};
	const reorderedReceipt: AuditReceipt = {...validReceipt, selected: [beta, alpha]};

	assert.equal(isStructurallyValidReceipt({receipt: validReceipt, currentDigest, canonicalRules}), true);
	assert.equal(compareReceiptPartitions(reorderedReceipt, validReceipt), "PASS");

	const invalidReceipts: AuditReceipt[] = [
		{...validReceipt, digest: `sha256:${"b".repeat(64)}`},
		{...validReceipt, unknown: []},
		{...validReceipt, selected: [alpha, beta, alpha]},
		{...validReceipt, unknown: [{ordinal: "R99", ruleId: "ghost"}]},
		{...validReceipt, exclusionGroups: []},
		{
			...validReceipt,
			exclusionGroups: [
				{rules: [gamma], reason: "첫 번째 근거"},
				{rules: [gamma], reason: "중복 근거"},
			],
		},
		{...validReceipt, exclusionGroups: [{rules: [gamma, alpha], reason: "selected ordinal까지 잘못 제외"}]},
		{...validReceipt, exclusionGroups: [{rules: [gamma], reason: "   "}]},
	];

	for (const receipt of invalidReceipts) {
		assert.equal(isStructurallyValidReceipt({receipt, currentDigest, canonicalRules}), false);
	}

	const digestMismatch = {...validReceipt, digest: `sha256:${"b".repeat(64)}`};
	const sameCountDifferentMember: AuditReceipt = {...validReceipt, selected: [alpha, delta], unknown: [beta]};
	const classificationSwap: AuditReceipt = {
		...validReceipt,
		notApplicable: [delta],
		unknown: [gamma],
		exclusionGroups: [{rules: [delta], reason: "delta surface가 fixture에 없다."}],
	};

	assert.equal(compareReceiptPartitions(digestMismatch, validReceipt), "SELECTION_COVERAGE_FAIL");
	assert.equal(compareReceiptPartitions(sameCountDifferentMember, validReceipt), "SELECTION_COVERAGE_FAIL");
	assert.equal(compareReceiptPartitions(classificationSwap, validReceipt), "SELECTION_COVERAGE_FAIL");
});

test("convention audit skill uses trigger-only frontmatter", async () => {
	const source = await readSkillFile("SKILL.md");
	const description = source.match(/^description: .+$/m)?.[0];
	const wordCount = source.trim().split(/\s+/).length;

	assert.match(source, /^name: convention-audit$/m);
	assert.match(source, /^description: Use when /m);
	assert.doesNotMatch(description ?? "", /workflow|matrix|packet|reviewer/i);
	assert.ok(wordCount < 500, `SKILL.md must stay below 500 words; received ${wordCount}.`);
	assert.ok(Buffer.byteLength(source, "utf8") < 6_000, "SKILL.md must stay below 6000 UTF-8 bytes.");
});

test("convention audit declares three exact surface-conditional companions and stays locally non-progressive", async () => {
	const metadata = JSON.parse(await readSkillFile("metadata.json")) as SkillMetadata;

	assert.equal(metadata.extends, undefined);
	assert.equal(metadata.progressiveDisclosure, undefined);
	assert.deepEqual(metadata.companions, companionContract);
	assert.match(metadata.abstract, /조건부 활성화/);
	assert.match(metadata.abstract, /각 activated RULES_INDEX\.md 전체를 독립적으로 scan/);
	assert.match(metadata.abstract, /FAIL과 UNKNOWN이 모두 0일 때만 완료/);
});

test("convention audit router orders independent index selection before semantic verdicts", async () => {
	const source = await readSkillFile("SKILL.md");
	const steps = readNumberedWorkflowSteps(source);
	assert.equal(steps.length, 12);
	const expectedMarkersByStep = [
		"audit packet",
		"실제 변경 surface",
		"activated `RULES_INDEX.md` 전체",
		"같은 routing digest",
		"`N/A` exclusion group",
		"`reviewWith`",
		"auditor가 `Selected` 또는 `Unknown`으로 분류한 stable ID와 같은 이름의 contract만",
		"sealed comparison artifact",
		"구현자와 auditor의 `Selected/N/A/Unknown` set",
		"selection coverage `FAIL`",
		"semantic verdict",
		"`FAIL = 0`, `UNKNOWN = 0`",
	] as const;

	for (const [stepIndex, expectedMarker] of expectedMarkersByStep.entries()) {
		assert.match(steps[stepIndex] ?? "", new RegExp(escapePattern(expectedMarker)), `Workflow step ${stepIndex + 1}`);
	}

	assert.match(source, /auditor는 구현자 receipt의 verdict와 selection을 입력으로 사용하지 않고[^\n]+독립적으로/);
	assert.match(steps[6] ?? "", /구현자 receipt를 보기 전에[^\n]+독립 selection receipt/);
	assert.match(steps[3] ?? "", /exact ordinal partition/);
	assert.match(steps[8] ?? "", /같은 count라도 member나 분류[^\n]+`FAIL`/);
	assert.match(source, /N\/A set과 exclusion group ordinal의 합집합이 정확히 같고[^\n]+중복[^\n]+없어야/);
	assert.match(source, /exclusion reason[^\n]+비어 있으면[^\n]+`FAIL`/);
	assert.match(steps[8] ?? "", /구현자와 auditor 각 receipt[^\n]+서로 독립적으로/);
	assert.match(source, /`reviewWith`[^\n]+자동 선택[^\n]+아니며[^\n]+독립적으로 재평가/);
	assert.match(steps[6] ?? "", /Unknown[^\n]+Selected\/N\/A[^\n]+먼저 해소[^\n]+N\/A[^\n]+requiresSelected[^\n]+적용하지/i);
	assert.match(steps[6] ?? "", /Selected로 확정한 contract[^\n]+requiresSelected[^\n]+즉시 `Selected`[^\n]+N\/A/i);
	assert.match(steps[6] ?? "", /Selected contract[^\n]+필수 변경[^\n]+scope evidence/i);
	assert.match(steps[6] ?? "", /예시[^\n]+선택적 대안[^\n]+해소되지 않은 Unknown[^\n]+가상 변경[^\n]+제외/);
	assert.match(steps[6] ?? "", /reviewWith[^\n]+고정점[^\n]+반복 판정/i);
	assert.match(source, /activated[^\n]+target[^\n]+`Selected`, `N\/A`, `Unknown`/);
	assert.match(source, /inactive cross-skill target[^\n]+non-empty inactive evidence/);
	assert.match(source, /cross-skill condition[^\n]+맞으면[^\n]+companion[^\n]+활성화[^\n]+exact partition/);
	assert.doesNotMatch(source, /구현자(?:의)? receipt를 그대로 신뢰한다/);
});

test("convention audit distinguishes coverage failures, semantic evidence, and completion gates", async () => {
	const source = await readSkillFile("SKILL.md");

	assert.match(source, /빠진 applicable rule[^\n]+selection coverage `FAIL`/);
	assert.match(source, /completionGate[^\n]+requiresSelected[^\n]+누락·N\/A[^\n]+selection coverage `FAIL`/);
	assert.match(source, /근거가 지지하지 않는 `N\/A`[^\n]+selection coverage `FAIL`/);
	assert.match(source, /lint, typecheck, build, test, browser[^\n]+semantic `PASS`를 대신하지 않는다/);
	assert.match(source, /`PASS`, `FAIL`, `UNKNOWN`/);
	assert.match(source, /`FAIL = 0`, `UNKNOWN = 0`[^\n]+완료/);
	assert.match(source, /reviewer mode/);
	assert.match(source, /파일 읽기 telemetry[^\n]+없으면[^\n]+declared/);
	assert.match(source, /actual read\/non-read[^\n]+observed로 주장하지 않(?:는다|습니다)/);
});

test("auditor selection packet excludes the sealed implementer comparison artifact", async () => {
	const source = await readSkillFile("SKILL.md");
	const evidenceRule = await readSkillFile("rules/evidence-build-audit-packet-before-review.md");

	for (const document of [source, evidenceRule]) {
		assert.match(document, /auditor selection packet/);
		assert.match(document, /sealed comparison artifact/);
		assert.match(document, /implementer receipt[^\n]+selection[^\n]+verdict[^\n]+포함하지/);
		assert.match(document, /auditor receipt[^\n]+완성[^\n]+sealed comparison artifact[^\n]+공개/);
	}

	assert.doesNotMatch(evidenceRule, /구현자 receipt는 packet에 첨부/);
});

test("convention audit defaults to compact companion routers and selected contracts", async () => {
	const source = await readSkillFile("SKILL.md");
	const readme = await readSkillFile("README.md");
	const compiledGuide = await readSkillFile("AGENTS.md");

	for (const document of [source, readme, compiledGuide]) {
		assert.doesNotMatch(document, /\.\.\/(?:react|typescript|css)\/AGENTS\.md/);
	}

	const companionSection = compiledGuide.match(/## Companion Skill 활성화\n\n([\s\S]*?)\n\n---/)?.[1];
	assert.ok(companionSection);
	const companionBullets = companionSection.split("\n").filter((line) => line.startsWith("- `convention-"));
	assert.equal(companionBullets.length, 3);

	for (const companion of companionContract) {
		const bullet = companionBullets.find((line) => line.startsWith(`- \`convention-${companion.skill}\``));
		assert.ok(bullet);
		assert.match(bullet, /mode: `conditional`/);
		assert.match(bullet, new RegExp(escapePattern(`appliesWhen: ${companion.appliesWhen}`)));
		assert.match(bullet, new RegExp(escapePattern(`[SKILL.md](../${companion.skill}/SKILL.md)`)));
		assert.match(bullet, new RegExp(escapePattern(`[RULES_INDEX.md](../${companion.skill}/RULES_INDEX.md)`)));
	}

	assert.match(compiledGuide, /`metadata\.json\.companions`/);
	assert.doesNotMatch(compiledGuide, /metadata\.json\.extends/);

	assert.match(source, /companion full `AGENTS\.md`(?:는|를) 기본 로드하지 않는다/);
	assert.match(source, /local \[AGENTS\.md\]\(\.\/AGENTS\.md\)[^\n]+8개 audit gate rule[^\n]+전체/);
	assert.match(readme, /companion full `AGENTS\.md`(?:는|를) 기본 로드하지 않습니다/);
	assert.match(source, /stable ID와 같은 이름의 contract/);
	assert.match(source, /`CRITICAL` contract는 full rule을 반드시 읽고/);
});

test("compiled audit guide contains each local gate once without companion rule bodies", async () => {
	const source = await readSkillFile("AGENTS.md");
	const localRules = await readSkillRules(getSkillPaths("convention-audit", path.join(repoDir, "skill")));
	const localRuleTitles = [
		"Run Convention Audit for React, CSS, and TypeScript Diffs",
		"Build an Audit Packet Before Semantic Review",
		"Map Changed Files to Specific Rule IDs",
		"Activate Companion Skills from Actual Surfaces",
		"Dispatch an Independent Semantic Reviewer When Available",
		"Ground Every Verdict in Rule Text and Evidence",
		"Loop Until FAIL and UNKNOWN Are Zero",
		"Report the Final Verdict Matrix",
	] as const;

	for (const title of localRuleTitles) {
		const headingMatches = source.match(new RegExp(`^### \\d+\\.\\d+ ${escapePattern(title)}$`, "gm"));
		assert.equal(headingMatches?.length, 1, title);
	}

	assert.equal((source.match(/^### \d+\.\d+ /gm) ?? []).length, 8);
	assert.equal(localRules.length, 8);

	for (const rule of localRules) {
		const bodyWithoutHeading = rule.body.trim().replace(/^## [^\n]+\n+/, "");
		assert.ok(bodyWithoutHeading.length > 0, `${rule.fileName} body must not be empty.`);
		assert.equal(source.split(bodyWithoutHeading).length - 1, 1, `${rule.fileName} body must appear verbatim exactly once.`);
	}

	for (const companionRuleTitle of [
		"Use useEffectEvent for Non-reactive Effect Callbacks",
		"Replace enum with as const Objects",
		"Always Provide CSS Variable Fallbacks",
	]) {
		assert.doesNotMatch(source, new RegExp(escapePattern(companionRuleTitle)));
	}
});

test("RTE02 cross-skill reviewWith keeps CSS inactive until styling drift activates a full partition", async () => {
	const manifestSource = await readFile(path.join(repoDir, "skill/react/routing-evals.json"), "utf8");
	const manifest = JSON.parse(manifestSource) as RoutingEvalManifest;
	const scenario = manifest.scenarios.find(({id}) => id === "RTE02-owner-placement-css-drift");
	assert.ok(scenario);
	const ownerRuleSource = await readFile(path.join(repoDir, "skill/react/rules/ownership-layer-component-boundaries.md"), "utf8");
	assert.match(ownerRuleSource, /reviewWith:[^\n]+css\/naming-separate-local-and-route-style-scopes/);
	assert.equal(scenario.expectedSkills.includes("css"), false);
	assert.equal(scenario.expectedSelected.css, undefined);
	assert.equal(scenario.expectedNotApplicable.css, undefined);
	assert.ok(scenario.scopeDrift);
	assert.ok(scenario.scopeDrift.expectedSkills.includes("css"));
	const driftCssSelected = scenario.scopeDrift.expectedSelected.css;
	const driftCssNotApplicable = scenario.scopeDrift.expectedNotApplicable.css;
	assert.ok(driftCssSelected);
	assert.ok(driftCssNotApplicable);
	assert.equal(driftCssSelected.length, 11);
	assert.equal(driftCssNotApplicable.length, 10);
	assert.ok(driftCssSelected.includes("naming-separate-local-and-route-style-scopes"));
	assert.ok(driftCssSelected.includes("naming-preserve-route-slug-traceability"));
	assert.ok(driftCssSelected.includes("composition-do-not-build-structural-variants-with-modifiers"));
	assert.ok(driftCssSelected.includes("values-separate-domain-state-modifiers-from-dom-interaction-states"));

	const pressureSource = await readSkillFile("pressure-tests.md");
	assert.match(pressureSource, /RTE02-owner-placement-css-drift/);
	assert.match(pressureSource, /initial[^\n]+CSS[^\n]+inactive evidence/);
	assert.match(pressureSource, /drift[^\n]+CSS[^\n]+활성화[^\n]+exact partition/);
});

test("activated reviewWith target may remain evidence-backed N/A instead of being auto-selected", async () => {
	const manifestSource = await readFile(path.join(repoDir, "skill/react/routing-evals.json"), "utf8");
	const manifest = JSON.parse(manifestSource) as RoutingEvalManifest;
	const scenario = manifest.scenarios.find(({id}) => id === "RTE09-route-runtime-section");
	assert.ok(scenario);
	const sourceRule = "screen-avoid-premature-abstraction";
	const targetRule = "functions-extract-helpers-only-when-the-boundary-is-real";
	assert.ok(scenario.expectedSkills.includes("typescript"));
	assert.ok(scenario.expectedSelected.react?.includes(sourceRule));
	assert.ok(scenario.expectedNotApplicable.typescript?.includes(targetRule));
	assert.equal(scenario.expectedSelected.typescript?.includes(targetRule), false);
	const sourceRuleBody = await readFile(path.join(repoDir, `skill/react/rules/${sourceRule}.md`), "utf8");
	assert.match(sourceRuleBody, new RegExp(escapePattern(`typescript/${targetRule}`)));
});

test("compiled audit rules preserve exact receipt and independent reviewer gates", async () => {
	const source = await readSkillFile("AGENTS.md");

	for (const expectedText of [
		"actual changed surface",
		"activated `RULES_INDEX.md` 전체",
		"routing digest",
		"exact ordinal partition",
		"N/A exclusion group",
		"독립적으로 selection receipt",
		"구현자와 auditor의 `Selected/N/A/Unknown` set",
		"reviewWith",
		"selection coverage `FAIL`",
		"auditor-selected/unknown rule의 stable ID와 같은 이름인 contract",
		"Selected contract가 요구한 구체적 필수 변경",
		"고정점까지 반복 판정",
		"semantic PASS",
		"파일 읽기 telemetry",
	]) {
		assert.match(source, new RegExp(escapePattern(expectedText)), expectedText);
	}

	assert.doesNotMatch(source, /세 companion skill[^\n]+필수/);
});

test("compiled exact-partition example closes mandatory targets, companions, and completion gates", async () => {
	const sourceRule = await readSkillFile("rules/coverage-map-files-to-rule-ids.md");
	const correctExample = sourceRule.match(/\*\*Correct \(digest와 exact partition을 검증\):\*\*\n\n```md\n([\s\S]*?)\n```/)?.[1];
	assert.ok(correctExample);
	assert.match(correctExample, /React Selected: R15,R23,R24,R25,R26,R42/);
	assert.match(correctExample, /React N\/A 36/);
	assert.match(correctExample, /R01-R14 — [^\n]+/);
	assert.match(correctExample, /R16-R22 — [^\n]+/);
	assert.match(correctExample, /R27-R41 — [^\n]+/);
	assert.match(correctExample, /TypeScript Selected: T03,T18,T19,T21,T22/);
	assert.match(correctExample, /TypeScript N\/A 17/);
	assert.match(correctExample, /T01-T02 — [^\n]+/);
	assert.match(correctExample, /T04-T17 — [^\n]+/);
	assert.match(correctExample, /T20 — [^\n]+/);
	assert.match(correctExample, /Mandatory: R15->R25,R42; R25->T03; R42->T18; T18->T19,T21/);
	assert.match(correctExample, /Completion: T22/);
	assert.doesNotMatch(correctExample, /\.\.\./);
});

test("RTE08 missing-action mutation is a documented blocking coverage failure", async () => {
	const missingRule = "events-run-user-actions-in-handlers-not-effects";
	const manifestSource = await readFile(path.join(repoDir, "skill/react/routing-evals.json"), "utf8");
	const manifest = JSON.parse(manifestSource) as RoutingEvalManifest;
	const scenario = manifest.scenarios.find(({id}) => id === "RTE08-delete-handler-flow");
	assert.ok(scenario);
	const auditorSelected = scenario.expectedSelected.react;
	const auditorNotApplicable = scenario.expectedNotApplicable.react;
	assert.ok(auditorSelected);
	assert.ok(auditorNotApplicable);
	const rulesIndexSource = await readFile(path.join(repoDir, "skill/react/RULES_INDEX.md"), "utf8");
	const currentDigest = rulesIndexSource.match(/Routing digest: `(sha256:[a-f0-9]{64})`/)?.[1];
	assert.ok(currentDigest);
	const canonicalRules = Array.from(rulesIndexSource.matchAll(/^- `(R\d{2})` · `([^`]+)` ·/gm), (match) => {
		const ordinal = match[1];
		const ruleId = match[2];

		if (!ordinal || !ruleId) {
			throw new Error("React RULES_INDEX.md contains an incomplete ordinal and stable ID pair.");
		}

		return {ordinal, ruleId};
	});
	assert.equal(canonicalRules.length, 42);
	const ruleById = new Map(canonicalRules.map((reference) => [reference.ruleId, reference]));
	const auditorSelectedReferences = resolveRuleReferences(auditorSelected, ruleById);
	const auditorNotApplicableReferences = resolveRuleReferences(auditorNotApplicable, ruleById);
	const auditorNotApplicableSet = new Set(auditorNotApplicable);
	const missingReference = ruleById.get(missingRule);
	assert.ok(missingReference);
	assert.equal(missingReference.ordinal, "R26");
	const implementerSelected = auditorSelectedReferences.filter(({ruleId}) => ruleId !== missingRule);
	const implementerNotApplicable = canonicalRules.filter(({ruleId}) => auditorNotApplicableSet.has(ruleId) || ruleId === missingRule);
	const auditorReceipt: AuditReceipt = {
		digest: currentDigest,
		selected: auditorSelectedReferences,
		notApplicable: auditorNotApplicableReferences,
		unknown: [],
		exclusionGroups: [{rules: auditorNotApplicableReferences, reason: "나머지 appliesWhen surface는 fixture diff에 없다."}],
	};
	const wrongReason = "lint/build/browser passed";
	const implementerReceipt: AuditReceipt = {
		digest: currentDigest,
		selected: implementerSelected,
		notApplicable: implementerNotApplicable,
		unknown: [],
		exclusionGroups: [
			{rules: auditorNotApplicableReferences, reason: "나머지 appliesWhen surface는 fixture diff에 없다."},
			{rules: [missingReference], reason: wrongReason},
		],
	};

	assert.equal(isStructurallyValidReceipt({receipt: auditorReceipt, currentDigest, canonicalRules}), true);
	assert.equal(isStructurallyValidReceipt({receipt: implementerReceipt, currentDigest, canonicalRules}), true);
	assert.ok(wrongReason.trim().length > 0);
	assert.equal(compareReceiptPartitions(implementerReceipt, auditorReceipt), "SELECTION_COVERAGE_FAIL");

	const pressureSource = await readSkillFile("pressure-tests.md");
	assert.match(pressureSource, /RTE08-delete-handler-flow/);
	assert.match(pressureSource, /R26[^\n]+events-run-user-actions-in-handlers-not-effects/);
	assert.match(pressureSource, new RegExp(escapePattern(missingRule)));
	assert.match(pressureSource, /structurally valid/);
	assert.match(pressureSource, /`Selected`에서 `N\/A`로 옮기고/);
	assert.match(pressureSource, /non-empty지만 scope를 지지하지 않는 reason/);
	assert.match(pressureSource, /lint\/build[^\n]+통과[^\n]+selection coverage `FAIL`/);
});

test("convention audit pressure tests cover reviewer, N/A, telemetry, and repair loopholes", async () => {
	const source = await readSkillFile("pressure-tests.md");
	const readme = await readSkillFile("README.md");

	for (const expectedText of [
		"Baseline failure",
		"independent reviewer",
		"same-digest",
		"exact ordinal partition",
		"N/A exclusion group",
		"reviewWith",
		"UNKNOWN",
		"telemetry",
		"full AGENTS.md",
		"stale digest",
		"missing ordinal",
		"duplicate/overlap ordinal",
		"same count, different member",
		"reviewWith target auto-select overreach",
		"completionGate target N/A 또는 누락",
		"final Selected의 requiresSelected target N/A 또는 누락",
		"Unknown→N/A source의 requiresSelected target 강제 선택",
		"evidence-backed valid N/A",
	]) {
		assert.match(source, new RegExp(escapePattern(expectedText)), expectedText);
	}

	assert.match(readme, /정적 문서 테스트[^\n]+behavioral proof[^\n]+Task 9 evaluation/);
});

test("pressure oracle distinguishes representative conditional activation surfaces", async () => {
	const source = await readSkillFile("pressure-tests.md");
	const triggerRule = await readSkillFile("rules/trigger-run-for-react-css-typescript-diffs.md");

	for (const expectedRow of [
		"| pure `.ts` helper | `typescript` |",
		"| React `.tsx`, styling 없음 | `react`, `typescript` |",
		"| pure `.css` | `css` |",
		"| TSX class contract + stylesheet | `react`, `typescript`, `css` |",
		"| `.ts` React hook ownership | `react`, `typescript` |",
	]) {
		assert.match(source, new RegExp(escapePattern(expectedRow)), expectedRow);
	}

	assert.match(triggerRule, /TSX 변경은 `react`와 `typescript`를 함께 활성화/);
	assert.doesNotMatch(triggerRule, /TSX의 순수 타입 변경은 TypeScript만/);
});
