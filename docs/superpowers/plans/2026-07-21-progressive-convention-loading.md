# Progressive Convention Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React, TypeScript, CSS 작업이 applicable rule을 빠짐없이 선택·적용·감사하면서 full handbook 기본 로딩을 제거하도록 structured skill pack과 검증 도구를 개선한다.

**Architecture:** `rules/*.md`에 observable routing metadata를 두고 build package가 compact `RULES_INDEX.md`와 digest를 생성한다. 각 `SKILL.md`는 scope → full index scan → exact receipt → selected body → drift → audit router가 되며, package test는 schema/index/fixture 무결성을, behavioral evaluation은 실제 agent selection을 검증한다. Full `AGENTS.md`는 opt-in handbook으로 계속 생성한다.

**Tech Stack:** Node.js 22, TypeScript 5.9, `tsx --test`, Node `crypto`, Markdown/JSON structured skills, Biome 2.2, Python `tiktoken` 0.11.0 (`o200k_base`) for evaluation snapshots.

---

## File Structure

### Build package

- `package/src/types.ts`: progressive metadata, companion, rule routing, eval manifest 타입.
- `package/src/config.ts`: `RULES_INDEX.md`, `routing-evals.json` 경로와 기존 CLI target resolution.
- `package/src/parser.ts`: strict scalar rule frontmatter parser와 companion-aware document resolution.
- `package/src/routing.ts`: deterministic rule ordering, ordinal, canonical digest, compact index renderer.
- `package/src/routing-evals.ts`: manifest partition/coverage/companion closure 검증.
- `package/src/build.ts`: full `AGENTS.md`와 progressive `RULES_INDEX.md`를 함께 생성.
- `package/src/check-generated.ts`: source에서 다시 render해 tracked index stale 여부 확인.
- `package/src/validate.ts`: progressive metadata/rule/reviewWith/companion schema 검증.
- `package/test/progressive-loading.test.ts`: parser, schema, index, digest, clean build, stale output 회귀 테스트.
- `package/test/routing-evals.test.ts`: 실제 manifest의 exact partition과 100% positive rule coverage 테스트.
- `package/test/cli.test.ts`, `config.test.ts`, `documentation.test.ts`: CLI/경로/JSDoc 계약 보강.
- `package/package.json`: `check:generated` script와 per-skill aliases.

### Progressive skills

- `skill/{react,typescript,css}/metadata.json`: `progressiveDisclosure`, required/conditional `companions`.
- `skill/{react,typescript,css}/rules/_template.md`: `appliesWhen`, optional `reviewWith` template.
- `skill/{react,typescript,css}/rules/*.md`: Appendix A-C의 routing metadata.
- `skill/{react,typescript,css}/RULES_INDEX.md`: generated compact index.
- `skill/{react,typescript,css}/routing-evals.json`: exact behavioral oracle fixture.
- `skill/{react,typescript,css}/SKILL.md`: compact runtime router.
- `skill/{react,typescript,css}/pressure-tests.md`: baseline/oracle/candidate/mutation execution contract.
- `skill/{react,typescript,css}/README.md`: progressive loading 유지보수 설명.

### Audit and consumer documentation

- `skill/convention-audit/metadata.json`: React/TypeScript/CSS conditional companion 선언.
- `skill/convention-audit/SKILL.md`: independent index selection과 exact receipt comparison gate.
- `skill/convention-audit/pressure-tests.md`, `README.md`: mutation RED와 새 audit flow.
- `AGENTS.superpowers.conventions.md`: consuming project용 short activation policy.
- `README.md`, `package/README.md`, root `AGENTS.md`: source/generated/runtime 역할과 명령 갱신.
- `docs/evaluations/2026-07-21-progressive-loading-baseline.md`: skill 없는 RED observation.
- `docs/evaluations/2026-07-21-progressive-loading-results.md`: fixed-run behavioral/token 결과와 telemetry 한계.

---

### Task 1: Capture Skill RED and Add Strict Parser Tests

**Files:**
- Create: `docs/evaluations/2026-07-21-progressive-loading-baseline.md`
- Create: `package/test/progressive-loading.test.ts`
- Modify: `package/test/config.test.ts`

- [ ] **Step 1: Run three no-skill pressure scenarios**

Dispatch fresh agents that may inspect only the prompt fixture, not `skill/react`, `skill/typescript`, `skill/css`, or `skill/convention-audit`. Use these exact prompts:

```text
BASELINE-R: A TSX delete button has an inline async callback with a confirmation branch,
mutation, navigation, selectedIds-derived state, and a new className modifier. You have five
minutes, the current code already works, and the requester says lint success is enough without a
second review. Describe the exact code changes and coding rules you would check. Do not use any
convention skill or repository convention document.

BASELINE-T: A TypeScript submit flow silently defaults optional settings, builds a payload through
five tiny helpers in helpers.ts, repeats a callback signature, and has undocumented custom fields.
Most of the helper file was written yesterday, the deadline is five minutes, and the requester says
typecheck success is enough. Clean it up and list every rule you checked. Do not use convention skills.

BASELINE-C: An Ant Design tree is styled with a global .ant-* selector, deep descendants,
hard-coded repeated values, and a route modifier for one-off layout. The screenshot already looks
correct, most CSS is already written, and the requester wants it shipped in five minutes without a
review. Fix it and list every rule you checked. Do not use convention skills.
```

Expected RED: each response omits at least one applicable cross-section or companion rule, provides no exact full-index partition, or treats lint/visual correctness as sufficient.

- [ ] **Step 2: Record baseline evidence before any skill edit**

Create the evaluation file only after all three responses exist. Record source baseline `b600ce1` (the last commit containing convention runtime files before planning), the actual evaluation execution HEAD, runtime `Codex subagent`, skill access `forbidden`, and one discovery trial per scenario. For `BASELINE-R`, `BASELINE-T`, and `BASELINE-C`, include the exact prompt from Step 1, the unedited response in a fenced `text` block, and the missed applicable stable rule IDs established by Appendices A-D.

- [ ] **Step 3: Write failing strict parser and progressive path tests**

Add tests that describe the wished-for API before production code exists:

```ts
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {getSkillPaths} from "../src/config.js";
import {parseFrontmatter} from "../src/parser.js";

test("strict rule frontmatter rejects continuation, duplicate, and unknown keys", () => {
	assert.throws(() => parseFrontmatter("---\ntitle: A\n continued\n---\n## A"), /Invalid frontmatter line/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\ntitle: B\n---\n## A"), /Duplicate frontmatter key/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\nunknown: B\n---\n## A"), /Unknown frontmatter key/);
});

test("skill paths expose progressive generated and eval files", () => {
	const paths = getSkillPaths("react");
	assert.equal(path.basename(paths.rulesIndexPath), "RULES_INDEX.md");
	assert.equal(path.basename(paths.routingEvalsPath), "routing-evals.json");
});
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/config.test.ts
```

Expected: FAIL because `SkillPaths.rulesIndexPath`/`routingEvalsPath` and strict errors do not exist; confirm failure is not a syntax or fixture error.

- [ ] **Step 5: Commit the reproducible RED evidence**

Commit only the baseline transcript and wished-for tests while they are still failing for the documented missing behavior:

```bash
git add docs/evaluations/2026-07-21-progressive-loading-baseline.md package/test/progressive-loading.test.ts package/test/config.test.ts
git commit -m "test: define progressive loading behavior"
```

Record the focused command and its expected failure signature in the baseline document so the next GREEN slice can distinguish intended RED from a broken fixture.

---

### Task 2: Implement Progressive Schema and Companion Resolution

**Files:**
- Modify: `package/src/types.ts`
- Modify: `package/src/config.ts`
- Modify: `package/src/parser.ts`
- Modify: `package/src/validate.ts`
- Modify: `package/test/progressive-loading.test.ts`
- Modify: `package/test/documentation.test.ts`

- [ ] **Step 1: Extend the failing test with metadata cases**

Add temporary-skill fixture tests for:

```ts
test("progressive metadata requires boolean mode and valid companion contracts", async () => {
	await assert.rejects(() => validateFixture({progressiveDisclosure: "yes"}), /must be a boolean/);
	await assert.rejects(
		() => validateFixture({progressiveDisclosure: true, extends: ["typescript"], companions: [{skill: "typescript", mode: "required"}]}),
		/cannot declare both/,
	);
	await assert.rejects(
		() => validateFixture({progressiveDisclosure: true, companions: [{skill: "css", mode: "conditional"}]}),
		/conditional companion.*appliesWhen/,
	);
});
```

The fixture helper must create a real temporary `skill/` root with structured skill directories, `_sections.md`, rules, and metadata, then call exported validation code; do not mock parser behavior. `getSkillPaths`, buildability checks, document resolution, and recursive validation accept or derive that fixture root instead of reaching into the repository's real `skill/` tree.

- [ ] **Step 2: Verify the metadata tests fail for the missing contract**

Run the focused file. Expected: FAIL because the new fields are neither parsed nor validated.

- [ ] **Step 3: Add exact types**

Add these interfaces and fields with `@field` comments:

```ts
export type CompanionMode = "required" | "conditional";

export interface SkillCompanion {
	skill: string;
	mode: CompanionMode;
	appliesWhen?: string;
}

export interface SkillRule {
	fileName: string;
	prefix: string;
	title: string;
	impact: string;
	impactDescription?: string;
	tags: string[];
	body: string;
	appliesWhen?: string;
	reviewWith: string[];
}

export interface SkillMetadata {
	title: string;
	version: string;
	organization: string;
	date?: string;
	abstract: string;
	extends?: string[];
	references?: string[];
	progressiveDisclosure?: boolean;
	companions?: SkillCompanion[];
}
```

Extend `SkillPaths` with `rulesIndexPath` and `routingEvalsPath`.

Add a direct-execution guard around `validate.ts`'s `main()` call so tests can import `validateSkill` without executing the repository-wide CLI. The CLI path must still execute exactly once when invoked by `tsx src/validate.ts ...`.

- [ ] **Step 4: Make rule frontmatter strict**

`parseFrontmatter` must allow only `title`, `impact`, `impactDescription`, `appliesWhen`, `reviewWith`, `tags`; reject non-empty continuation lines, duplicate keys, unknown keys, and unmatched frontmatter. Continue splitting scalar lists by comma in `readSkillRules`:

```ts
appliesWhen: frontmatter.appliesWhen,
reviewWith: splitScalarList(frontmatter.reviewWith),
tags: splitScalarList(frontmatter.tags),
```

- [ ] **Step 5: Validate progressive and legacy metadata independently**

Implement helpers that:

- keep `extends` valid for non-progressive skills;
- reject `extends` and `companions` together;
- require a boolean `progressiveDisclosure` when present;
- require non-empty unique companion names and valid modes;
- require `appliesWhen` only for conditional companions;
- reject conditions over 160 characters or containing newline;
- require every local progressive rule to have a non-empty one-line `appliesWhen` of at most 160 characters;
- resolve every local and `<skill>/<rule-id>` `reviewWith` target, reject duplicate/unknown targets, and require cross-skill targets to be reachable through declared companions;
- recursively validate both legacy `extends` and new `companions` without flattening rule bodies.

Add an explicit non-progressive fixture proving that an existing four-key rule frontmatter and legacy `extends` still validate without `appliesWhen`.
Add fixture assertions for a missing companion, duplicate companion, `extends` cycle, `companions` cycle, and a diamond companion graph. The diamond must validate each skill once while preserving direct companion metadata for the root.

- [ ] **Step 6: Run focused and full package tests**

Run:

```bash
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/config.test.ts package/test/documentation.test.ts
npm --prefix package run typecheck
```

Expected: focused tests PASS and typecheck exits 0.

- [ ] **Step 7: Commit the schema slice**

```bash
git add package/src/types.ts package/src/config.ts package/src/parser.ts package/src/validate.ts package/test/progressive-loading.test.ts package/test/config.test.ts package/test/documentation.test.ts docs/evaluations/2026-07-21-progressive-loading-baseline.md
git commit -m "feat: add progressive convention schema"
```

---

### Task 3: Generate Deterministic Rule Indexes and Detect Stale Output

**Files:**
- Create: `package/src/routing.ts`
- Create: `package/src/check-generated.ts`
- Modify: `package/src/build.ts`
- Modify: `package/package.json`
- Modify: `package/test/progressive-loading.test.ts`
- Modify: `package/test/cli.test.ts`
- Modify: `package/test/documentation.test.ts`

- [ ] **Step 1: Write failing renderer tests**

Construct an in-memory `LoadedSkillDocument` with two sections and three local rules. Assert:

```ts
const first = generateRulesIndexMarkdown(document, companions);
const second = generateRulesIndexMarkdown(document, companions);

assert.equal(first, second);
assert.match(first, /Routing digest: `sha256:[a-f0-9]{64}`/);
assert.match(first, /Local rules: 3/);
assert.match(first, /Section counts:.*composition.*2.*state.*1/);
assert.match(first, /`R01`.*rules\/composition-first\.md/);
assert.match(first, /Applies when:/);
assert.match(first, /Review with:/);
assert.doesNotMatch(first, /Incorrect|Correct/);
assert.doesNotMatch(first, /typescript\/rules\//);
assert.equal((first.match(/composition-first/g) ?? []).length, 1);
```

Add a mutation assertion that changing `appliesWhen`, `reviewWith`, title, impact, tags, section order, or metadata version changes the digest.

- [ ] **Step 2: Verify renderer RED**

Run the focused test. Expected: module/function missing.

- [ ] **Step 3: Implement deterministic routing primitives**

`routing.ts` must export:

```ts
export const getRuleId = (rule: SkillRule): string => rule.fileName.replace(/\.md$/, "");
export const getRulesForSection = (section: SkillSection, rules: SkillRule[]): SkillRule[] => /* title-sorted local rules */;
export const generateRulesIndexMarkdown = (document: LoadedSkillDocument, companions: SkillCompanion[]): string => /* compact index */;
```

Derive the ordinal prefix from the first alphanumeric character of `skillName`, uppercased, and pad the one-based local ordinal to two digits (`react → R01`, `typescript → T01`, `css → C01`). Canonical digest input must be `JSON.stringify` over skill name/version, direct companion skill/mode/condition, ordered section order/title/prefix/impact, and ordered rule id/title/impact/appliesWhen/reviewWith/tags. Use `createHash("sha256")`; do not hash timestamps or absolute paths.

- [ ] **Step 4: Wire build output without changing full handbook bodies**

For `progressiveDisclosure: true`, `buildSkill` writes both files:

```ts
await writeFile(skillPaths.outputPath, localMarkdown, "utf8");
if (rootDocument.metadata.progressiveDisclosure) {
	await writeFile(skillPaths.rulesIndexPath, generateRulesIndexMarkdown(rootDocument, directCompanions), "utf8");
}
```

Companion entries include mode and direct `SKILL.md`/`RULES_INDEX.md` links. Local index must never contain companion rule entries. Legacy skills continue generating only `AGENTS.md`.

- [ ] **Step 5: Add generated-output check**

`check-generated.ts` uses the same renderer, reads tracked `RULES_INDEX.md`, and exits non-zero on missing/stale output. It must not affect `isBuildableSkill`, so a fixture with no index can build successfully.

Guard `build.ts` and `check-generated.ts` CLI entrypoints so tests can import `buildSkill`/checker helpers without triggering a real-repository build. Temporary build/check tests use the fixture `skill/` root all the way through companion resolution; they must not create or rewrite files under the repository's actual `skill/` directory.

Add scripts:

```json
"check:generated": "tsx src/check-generated.ts",
"check:generated:all": "tsx src/check-generated.ts --all",
"check:generated:react": "tsx src/check-generated.ts --skill=react",
"check:generated:css": "tsx src/check-generated.ts --skill=css",
"check:generated:typescript": "tsx src/check-generated.ts --skill=typescript"
```

- [ ] **Step 6: Verify clean build, stale failure, and deterministic rebuild**

Tests must copy a progressive fixture into a temp directory, prove first build works without index, mutate source, prove check fails, rebuild, prove check passes, rebuild again, and compare bytes.

Export `getRulesIndexByteBudget(ruleCount) = 2_000 + ruleCount * 400` from `routing.ts` and make the fixture test reject an index above that deterministic UTF-8 byte budget. Real-skill tests apply the same formula after each migration. Router tests separately require each `SKILL.md` to stay below both 500 words and 6,000 UTF-8 bytes. Token gates remain the authoritative end-to-end metric; these byte limits are the deterministic regression guardrail when the tokenizer is unavailable.

- [ ] **Step 7: Run package verification and commit**

```bash
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/cli.test.ts package/test/documentation.test.ts
npm --prefix package run typecheck
git add package
git commit -m "feat: generate compact convention indexes"
```

---

### Task 4: Migrate TypeScript as the Progressive Pilot

**Files:**
- Modify: `skill/typescript/metadata.json`
- Modify: `skill/typescript/rules/_template.md`
- Modify: all 22 `skill/typescript/rules/*.md`
- Create: `skill/typescript/routing-evals.json`
- Create: `skill/typescript/RULES_INDEX.md` through build
- Modify: `skill/typescript/SKILL.md`
- Modify: `skill/typescript/pressure-tests.md`
- Modify: `skill/typescript/README.md`
- Create: `package/test/routing-evals.test.ts`
- Create: `package/src/routing-evals.ts`
- Modify: `package/src/types.ts`

- [ ] **Step 1: Write failing real-skill validation and manifest tests**

Assert TypeScript is progressive, every rule has non-empty `appliesWhen` ≤160 characters, all `reviewWith` targets exist, the generated index contains exactly 22 local IDs, and routing fixtures partition the TypeScript index exactly.
Also assert the generated index and router satisfy the deterministic byte/word budgets defined in Task 3; keep these assertions data-driven so React and CSS join automatically when they become progressive.

- [ ] **Step 2: Verify RED**

Run the two focused tests. Expected: FAIL because TypeScript metadata, rule fields, manifest, and index do not exist.

- [ ] **Step 3: Add TypeScript routing metadata**

Set `"progressiveDisclosure": true`; TypeScript has no required companion. Apply Appendix A values exactly and update `_template.md` with `appliesWhen` plus optional `reviewWith`.

- [ ] **Step 4: Add exact routing oracle fixtures**

Create manifest version 1 using this exact JSON shape and the prompts, file lists, expected skills, selected IDs, not-applicable IDs, and scope-drift values in Appendix A:

```ts
// package/src/types.ts
export interface RoutingExpectedPartition {
	expectedSkills: string[];
	expectedSelected: Record<string, string[]>;
	expectedNotApplicable: Record<string, string[]>;
}

export interface RoutingScopeDrift extends RoutingExpectedPartition {
	evidence: string;
	files: string[];
}

export interface RoutingEvalScenario extends RoutingExpectedPartition {
	id: string;
	prompt: string;
	files: string[];
	scopeDrift?: RoutingScopeDrift;
}

export interface RoutingEvalManifest {
	version: 1;
	skill: string;
	scenarios: RoutingEvalScenario[];
}
```

Keep the manifest interfaces in `package/src/types.ts`; implement and document these pure APIs in `package/src/routing-evals.ts`:

```ts
export const readRoutingEvalManifest = async (skillPaths: SkillPaths): Promise<RoutingEvalManifest> => /* strict JSON read */;
export const validateRoutingEvalManifest = async (skillPaths: SkillPaths): Promise<void> => /* one owner manifest */;
export const validateRoutingEvalManifests = async (skillRootDir?: string): Promise<void> => /* every progressive manifest */;
```

They use the same fixture-aware skill-root resolution as build/validate. `validateSkill` requires and validates the owner manifest once `progressiveDisclosure` is true, while the all-manifest API additionally enforces cross-manifest positive coverage and duplicate scenario IDs. Do not execute a CLI on module import.

Every activated progressive skill must have both map entries, even when `expectedSelected[skill]` is empty. Non-progressive expected skills may be listed for activation evidence but have no partition. Every TypeScript rule must appear in at least one `expectedSelected`. The validator rejects invalid JSON/shape/version, owner mismatch, unknown skills/IDs, duplicate scenario IDs or array values, overlap, incomplete partitions, unexpected partition keys, missing required companion closure, a conditional companion partition that is absent after the fixture explicitly activates that companion, drift that removes an already activated skill or selected rule, and rules with zero positive fixture coverage. The normative scope-drift fixtures are monotonic additions.

- [ ] **Step 5: Replace the TypeScript entrypoint with a compact router**

Keep trigger-only frontmatter. The body must be under 500 words and require:

1. scope snapshot;
2. entire `RULES_INDEX.md` scan;
3. digest-bound exact selected/N/A/unknown receipt plus N/A exclusion groups whose ordinal union equals the exact N/A set and whose scope-evidence reasons are non-empty;
4. selected and unknown rule body reads;
5. `reviewWith` closure;
6. scope-drift rescan;
7. final `convention-audit` with FAIL/UNKNOWN zero;
8. full `AGENTS.md` only for explicit handbook/onboarding/fallback use.

- [ ] **Step 6: Update TypeScript pressure and human docs**

Pressure tests describe four arms, exact selection scoring, mutation RED, and token reporting. README stops saying `AGENTS.md` is the default agent entry and documents the new generated index.

- [ ] **Step 7: Build, check, run pilot tests, and commit**

```bash
npm --prefix package run validate:typescript
npm --prefix package run build:typescript
npm --prefix package run check:generated:typescript
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/routing-evals.test.ts
npm --prefix package run typecheck
git add skill/typescript package/src/types.ts package/src/routing-evals.ts package/test/routing-evals.test.ts
git commit -m "feat: add progressive TypeScript convention routing"
```

---

### Task 5: Migrate React with Required TypeScript and Conditional CSS

**Files:**
- Modify: `skill/react/metadata.json`
- Modify: `skill/react/rules/_template.md`
- Modify: all 42 `skill/react/rules/*.md`
- Create: `skill/react/routing-evals.json`
- Create: `skill/react/RULES_INDEX.md` through build
- Modify: `skill/react/SKILL.md`
- Modify: `skill/react/pressure-tests.md`
- Modify: `skill/react/README.md`
- Modify: `package/test/routing-evals.test.ts`

- [ ] **Step 1: Add React RED assertions**

Tests require 42 exact local IDs, all Appendix B routing metadata, required TypeScript companion, conditional CSS companion with a non-empty condition, valid cross-skill `reviewWith`, complete fixture partitions, and 100% positive coverage.

- [ ] **Step 2: Verify React RED**

Run focused tests. Expected: FAIL on missing progressive metadata/fields/manifest/index.

- [ ] **Step 3: Migrate metadata and all rules**

Replace legacy `extends` with:

```json
"progressiveDisclosure": true,
"companions": [
  {"skill": "typescript", "mode": "required"},
  {"skill": "css", "mode": "conditional", "appliesWhen": "class contract, stylesheet 또는 styling surface를 변경한다."}
]
```

Apply Appendix B `appliesWhen`/`reviewWith` values exactly.

- [ ] **Step 4: Add realistic React routing fixtures**

Use Appendix B scenario matrix. Every scenario activates TypeScript; styling/class-contract scenarios also activate CSS. Store exact qualified selected/N/A partitions for every currently progressive activated index and include an initial-selection → scope-drift selection pair. During Task 5, CSS is activation evidence only because it is not progressive yet; Task 6 must add its exact partition immediately after CSS becomes progressive.

- [ ] **Step 5: Replace React SKILL with compact router and update docs**

The router stays under 500 words, explicitly prevents stopping after the first match, requires TypeScript, conditionally activates CSS, and sends the exact partition plus N/A exclusion-group evidence to final audit. Update pressure tests and README accordingly.

- [ ] **Step 6: Build, verify, and commit React**

```bash
npm --prefix package run validate:react
npm --prefix package run build:react
npm --prefix package run check:generated:react
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/routing-evals.test.ts
npm --prefix package run typecheck
git add skill/react package/test/routing-evals.test.ts
git commit -m "feat: add progressive React convention routing"
```

---

### Task 6: Migrate CSS Progressive Routing

**Files:**
- Modify: `skill/css/metadata.json`
- Modify: `skill/css/rules/_template.md`
- Modify: all 21 `skill/css/rules/*.md`
- Create: `skill/css/routing-evals.json`
- Create: `skill/css/RULES_INDEX.md` through build
- Modify: `skill/css/SKILL.md`
- Modify: `skill/css/pressure-tests.md`
- Modify: `skill/css/README.md`
- Modify: `package/test/routing-evals.test.ts`
- Modify: `skill/react/routing-evals.json`

- [ ] **Step 1: Add and verify CSS RED assertions**

Require 21 exact IDs, Appendix C routing metadata, complete exact fixture partitions, and 100% positive rule coverage. Also require every React fixture that already activates CSS to gain an exact CSS selected/N/A partition once CSS becomes progressive. Run focused tests and confirm failure is missing feature data.

- [ ] **Step 2: Migrate CSS metadata, rules, and template**

Set `progressiveDisclosure: true`, keep no unconditional companion, and declare TypeScript as conditional only when TS/TSX class contracts, wrapper Props, or style imports also change. This makes `composition-prefer-ui-wrapper-prop-types` → `typescript/types-reuse-existing-contracts-before-new-types` reachable without activating TypeScript for pure CSS. Apply Appendix C values exactly.

- [ ] **Step 3: Add CSS routing fixtures and scope drift**

Use Appendix C scenario matrix. Include both route styling activation drift and the `css-ui-wrapper-third-party-dom` optional-variable drift so `values-always-provide-css-variable-fallbacks` is added only after the variable concern appears. Materialize the React `RTE02-owner-placement-css-drift` CSS partition from Appendix D in `skill/react/routing-evals.json`; before CSS is progressive the fixture lists CSS only as expected activation evidence, and after this step it must include both CSS partition maps.

- [ ] **Step 4: Replace CSS SKILL with compact router and update docs**

Require CSS for stylesheet, selector, token, class contract and visual styling changes; direct TSX component/state concerns back to React/TypeScript companions. Require exact N/A exclusion-group coverage and keep full handbook opt-in only.

- [ ] **Step 5: Build, verify, and commit CSS**

```bash
npm --prefix package run validate:css
npm --prefix package run build:css
npm --prefix package run check:generated:css
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/routing-evals.test.ts
npm --prefix package run typecheck
git add skill/css skill/react/routing-evals.json package/test/routing-evals.test.ts
git commit -m "feat: add progressive CSS convention routing"
```

---

### Task 7: Make Convention Audit Independently Re-select Rules

**Files:**
- Modify: `skill/convention-audit/metadata.json`
- Modify: `skill/convention-audit/SKILL.md`
- Modify: `skill/convention-audit/pressure-tests.md`
- Modify: `skill/convention-audit/README.md`
- Modify: `package/test/convention-audit.test.ts`
- Rebuild: `skill/convention-audit/AGENTS.md`

- [ ] **Step 1: Write audit RED tests**

Replace keyword-only assertions with contract assertions for:

- conditional React/TypeScript/CSS activation;
- auditor full scan of each activated index;
- same-digest exact ordinal partition;
- N/A exclusion groups whose ordinals exactly cover the N/A set and whose evidence reasons are non-empty;
- independent reviewer selection rather than trusting implementer receipt;
- `reviewWith` closure;
- missing applicable rule as coverage FAIL;
- semantic PASS/FAIL/UNKNOWN and zero gate;
- lint/build/browser evidence not substituting for semantic verdict;
- full companion `AGENTS.md` not being default-loaded.

- [ ] **Step 2: Verify audit RED**

Run `test/convention-audit.test.ts`; expected failure on old full-handbook workflow.

- [ ] **Step 3: Migrate audit companions**

Remove `extends` and declare all three as conditional companions with surface-specific one-line conditions. Audit remains non-progressive locally because its eight workflow rules are the gate itself; it routes companion convention bodies selectively.

- [ ] **Step 4: Rewrite the audit workflow**

The audit SKILL must:

1. create audit packet from changed files/diff/runtime evidence;
2. activate domains by actual surface;
3. independently scan complete companion indexes;
4. produce an exact digest-bound partition;
5. compare implementer/auditor selected sets;
6. verify each receipt's N/A exclusion groups exactly cover its N/A set and independently assess the exclusion evidence;
7. read only auditor-selected/ambiguous full rule bodies;
8. mark missing applicable selection or unsupported N/A evidence as FAIL;
9. repair until FAIL=0 and UNKNOWN=0;
10. report reviewer mode and telemetry limitations.

- [ ] **Step 5: Add mutation pressure scenario**

Feed an otherwise-valid React `RTE08-delete-handler-flow` receipt with `events-run-user-actions-in-handlers-not-effects` removed. Expected: audit blocks completion due selection mismatch even if lint/build pass and the code happens to comply.

- [ ] **Step 6: Build, test, and commit audit**

```bash
npm --prefix package run validate:convention-audit
npm --prefix package run build:convention-audit
./package/node_modules/.bin/tsx --test package/test/convention-audit.test.ts package/test/routing-evals.test.ts
git add skill/convention-audit package/test/convention-audit.test.ts
git commit -m "feat: audit progressive convention selections"
```

---

### Task 8: Update Consumer Policy and Repository Documentation

**Files:**
- Modify: `AGENTS.superpowers.conventions.md`
- Modify: `README.md`
- Modify: `package/README.md`
- Modify: root `AGENTS.md`
- Modify: `package/test/cli.test.ts`

- [ ] **Step 1: Add documentation RED assertions**

Tests require README and consumer template to state:

```md
- TSX: convention-react + convention-typescript
- className/CSS/styling surface: add convention-css
- scan every activated RULES_INDEX.md
- read only selected rules/*.md bodies
- do not default-load compiled AGENTS.md
- rescan on scope drift
- finish with convention-audit and FAIL/UNKNOWN zero
```

- [ ] **Step 2: Verify documentation RED**

Run `test/cli.test.ts`; expected failure because current docs call `AGENTS.md` the default/slim entry.

- [ ] **Step 3: Update all human and agent documentation**

Describe source files, generated compact index, opt-in handbook, companion modes, check-generated command, routing-evals purpose, and the exact consumer policy. Remove stale “slim AGENTS.md is read first” claims without deleting full handbook documentation.

- [ ] **Step 4: Rebuild all outputs and commit docs**

```bash
npm --prefix package run build:all
npm --prefix package run check:generated:all
npm --prefix package run test
git add AGENTS.md AGENTS.superpowers.conventions.md README.md package/README.md package/test/cli.test.ts skill/*/AGENTS.md skill/*/RULES_INDEX.md
git commit -m "docs: route projects through compact convention indexes"
```

Only generated files changed by the build are staged; unrelated skill output changes must be inspected before staging.

---

### Task 9: Run Behavioral GREEN, Mutation RED, and Token Evaluation

**Files:**
- Create: `docs/evaluations/2026-07-21-progressive-loading-results.md`
- Create: `docs/evaluations/2026-07-21-progressive-loading-contexts.json`
- Create: `package/scripts/measure-progressive-loading.py`
- Modify: `skill/{react,typescript,css}/pressure-tests.md` only if a candidate finds a new loophole
- Modify: affected `SKILL.md` only after a reproduced failure and re-test

- [ ] **Step 1: Fix the evaluation protocol**

Record repository HEAD, generated index digests, model/runtime/version, reasoning level, exact prompt, scorer/rubric version, trial count, arm, declared loaded files, exact receipt, semantic verdicts, and tokens. If file-read telemetry is unavailable, label the list “declared” and do not claim observed non-read.

- [ ] **Step 2: Run no-skill baseline and full-handbook oracle**

Repeat BASELINE-R/T/C at least twice per arm. In addition, run the design's eight mixed pressure categories—named handler/state update, pure TS helper/type/JSDoc, CSS owner/variable, TSX className+stylesheet, query shaping without CSS/API schema, scope drift, ambiguous HIGH applicability, and lint/build-passing semantic violation—at least twice in both no-skill baseline and full-handbook oracle arms. Oracle agents read all relevant full `AGENTS.md` files and produce the exact expected selection from full rule bodies. Critical omission scenarios run three times in each evaluated arm.

- [ ] **Step 3: Run progressive candidates**

Fresh agents read only the relevant `SKILL.md`, every activated `RULES_INDEX.md`, and selected/unknown rule bodies. Run each mixed scenario at least twice and critical scenarios three times. Score exact selected and N/A partitions against independently reviewed manifests, and reject any receipt whose N/A exclusion groups do not exactly cover the N/A ordinals or give evidence-grounded reasons.

- [ ] **Step 4: Run scope-drift and mutation RED**

For CSS, add an unstable variable after initial selection and require a revised receipt. For audit, remove `events-run-user-actions-in-handlers-not-effects` from the applicable `RTE08-delete-handler-flow` receipt and verify completion is blocked as FAIL or UNKNOWN.

- [ ] **Step 5: Measure implementation and end-to-end tokens**

Store the exact per-scenario, per-arm, per-phase file lists in `2026-07-21-progressive-loading-contexts.json`. Each phase is a separate agent context and lists files in load order; repeated files across implementation, drift, audit, and reviewer phases count again in the cumulative total. The full-handbook oracle must have the same activated domains and the same implementation/drift/audit/reviewer phase boundaries as the progressive arm, differing only in the convention documents loaded.

With `tiktoken==0.11.0` and `o200k_base`, implement the checked-in measurement script around this complete primitive:

```python
import json
from pathlib import Path
import tiktoken

encoding = tiktoken.get_encoding("o200k_base")

def measure(paths: list[str]) -> int:
    return sum(len(encoding.encode(Path(path).read_text())) for path in paths)

contexts = json.loads(Path("docs/evaluations/2026-07-21-progressive-loading-contexts.json").read_text())
# Validate every path, print each phase, then sum phases without cross-phase dedupe.
```

The script rejects missing paths, duplicate paths within one phase, unknown arm/phase keys, absent oracle counterparts, and scenarios whose activated-domain sets differ across arms. Commit its raw machine-readable stdout in a fenced block in the results document together with the exact command and Python/tiktoken versions.

Report:

- full baseline one-load context;
- router + indexes + selected bodies per implementation scenario;
- cumulative implementation + drift + audit + reviewer context;
- median/max reduction;
- fallback runs separately.

- [ ] **Step 6: Enforce quality gates**

Required results:

- implementation median ≤10,000 tokens;
- broad mixed implementation ≤12,000 tokens;
- one-load reduction ≥70%;
- end-to-end reduction ≥60%;
- domain activation recall 100%;
- applicable rule recall 100% across all impacts;
- exact selection precision 100%;
- semantic FAIL=0, UNKNOWN=0 for candidate;
- mutation arm blocked;
- default full handbook loads 0 by declared context, with telemetry limitation stated.

If any behavioral gate fails, update only the minimal `appliesWhen`, `reviewWith`, router wording, or fixture oracle justified by the failure; repeat the same arm before moving on.

- [ ] **Step 7: Commit evaluation evidence**

```bash
git add docs/evaluations package/scripts/measure-progressive-loading.py skill/react skill/typescript skill/css
git commit -m "test: verify progressive convention behavior"
```

---

### Task 10: Final Convention Audit, Review, and Verification

**Files:**
- Review all changes from `b600ce1..HEAD`
- Modify only files required by review findings

- [ ] **Step 1: Run independent spec compliance review**

Reviewer checks every design completion criterion, all 85 rules, generated indexes, three manifests, four-arm evaluation evidence, consumer policy, and no accidental changes outside scope.

- [ ] **Step 2: Run code quality review**

Reviewer checks strict parser edge cases, digest determinism, companion cycles/dedup, exact partition validation, error clarity, TypeScript/JSDoc conventions, and duplicated generator logic.

- [ ] **Step 3: Repair and re-review every finding**

Critical/Important findings require the same reviewer to confirm the fix. Add a failing regression test before implementation fixes.

- [ ] **Step 4: Run fresh complete verification**

```bash
npm --prefix package run build:all
npm --prefix package run check:generated:all
npm --prefix package run validate:all
npm --prefix package run typecheck
npm --prefix package run test
npm --prefix package run biome:check:all
git diff --check b600ce1..HEAD
git status --short
```

Expected: every command exits 0; package test reports zero failures; generated check reports no stale indexes; only intentional branch changes remain.

- [ ] **Step 5: Run final convention-audit on the implementation itself**

Audit package TypeScript changes with `convention-typescript`, skill/process changes with `writing-skills`, and CSS/React/TypeScript routing documents against their own manifests. FAIL and UNKNOWN must both be zero.

- [ ] **Step 6: Commit review fixes if any**

Stage only the concrete files named in reviewer findings after inspecting their diffs, then commit them with `git commit -m "fix: close progressive routing review gaps"`. Do not create an empty commit when no findings require changes.

---

## Appendix A: TypeScript Routing Metadata and Scenario Oracle

Every value below is normative implementation input. `—` means omit `reviewWith`. All `appliesWhen` values are one sentence and at most 160 characters.

| Rule ID | `appliesWhen` | `reviewWith` |
|---|---|---|
| `naming-centralize-shared-config-namespaces` | 여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의하거나 shared config 경계를 바꾼다. | `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points` |
| `naming-preserve-config-origin-with-chained-access` | `config` 또는 `util` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경한다. | — |
| `naming-use-consistent-file-and-symbol-naming` | TypeScript 파일, 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꾼다. | — |
| `naming-use-direct-imports-and-public-entry-points` | TypeScript import/export, barrel, type-only 의존, shared 공개 진입점 또는 feature support module 경계를 추가·변경한다. | — |
| `types-document-custom-types-and-shapes` | custom type·interface, schema root, 객체형 상수, 계약 field 또는 Pick·Omit·Indexed Access alias를 추가·변경한다. | — |
| `types-mark-unused-parameters-with-underscore` | 기존 callback이나 framework 계약을 구현·변경하며 계약 매개변수 일부를 생략하거나 사용하지 않는다. | — |
| `types-prefer-function-variable-types-over-parameter-annotations` | 기존 callable 계약이 있는 함수 구현을 추가·변경하거나 같은 시그니처를 여러 구현이 공유하도록 리팩터링한다. | — |
| `types-reuse-callback-signatures-from-existing-contracts` | interface, 객체 또는 framework가 이미 정의한 callback을 구현·전달하면서 시그니처를 새로 적거나 바꾼다. | `types-prefer-function-variable-types-over-parameter-annotations` |
| `types-reuse-existing-contracts-before-new-types` | 기존 type, interface 또는 schema와 같거나 일부만 다른 shape를 새로 선언·변경하려 한다. | `types-document-custom-types-and-shapes` |
| `functions-avoid-imperative-assembly-in-wide-scopes` | 파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push` 또는 조건부 누적으로 값을 조립하거나 이를 리팩터링한다. | — |
| `functions-extract-helpers-only-when-the-boundary-is-real` | support function을 추출·이동·export·공유하거나 generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꾼다. | `docs-use-helper-for-reusable-pure-helper-functions`, `docs-require-header-jsdoc-on-key-declarations` |
| `functions-prefer-immutable-array-sorting` | props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬하거나 기존 `.sort()` 호출을 추가·변경한다. | — |
| `functions-replace-enum-with-as-const-objects` | `enum` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경한다. | `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` |
| `functions-use-named-object-params-for-complex-signatures` | 매개변수 3개 이상 또는 같은 계열 인자를 받는 함수를 추가·변경하거나 객체 매개변수를 시그니처에서 구조분해한다. | — |
| `functions-use-set-and-map-for-repeated-lookups` | 같은 컬렉션에 `includes`, `find` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경한다. | — |
| `absence-expose-optional-values-instead-of-silent-fallbacks` | optional 값의 읽기·정규화·전달을 바꾸거나 `??`, `\|\|`, 기본값 또는 빈 값 대체 분기를 추가·변경한다. | `docs-keep-inline-comments-for-constraints-and-caveats` |
| `docs-keep-inline-comments-for-constraints-and-caveats` | 함수 본문의 `//` 주석을 추가·수정·유지하거나 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명한다. | — |
| `docs-require-header-jsdoc-on-key-declarations` | 원격 연동 함수, 이벤트 handler, reactive sync block, reusable helper, custom type·interface, store 또는 formatter 예외 함수를 추가·변경한다. | `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints` |
| `docs-standardize-annotation-tags-by-declaration-role` | TypeScript/TSX 선언의 JSDoc 태그를 추가·변경하거나 선언 역할에 맞는 annotation을 검토한다. | — |
| `docs-use-helper-for-reusable-pure-helper-functions` | 여러 caller가 쓰는 pure support function, owner-named exported helper 또는 `shared/util.ts` 함수를 추가·변경하거나 `@helper`를 붙이려 한다. | — |
| `docs-write-concise-korean-comments-about-purpose-and-constraints` | TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰한다. | — |
| `guardrails-review-banned-typescript-shortcuts-before-finishing` | TypeScript/TSX 변경을 완료 판정하거나 diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검한다. | — |

Define the canonical TypeScript universe `U_TS` as the 22 IDs in the table. Every final fixture explicitly materializes `expectedNotApplicable = U_TS - expectedSelected`; the test rejects a computed/missing field. Because these are final receipts, the guardrail rule is selected in all nine fixtures.

1. `shared-config-existing-source`
   - Prompt/evidence: `billing-request.ts` and `audit-request.ts` duplicate URL/page-size constants are replaced with the existing `shared/config.ts` values; use direct `config.*` access and do not change the declaration.
   - Files: `src/features/billing/billing-request.ts`, `src/features/audit/audit-request.ts`
   - Skills: `typescript`
   - Selected: `naming-centralize-shared-config-namespaces`, `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

2. `callback-contract-implementation`
   - Prompt/evidence: implement an existing documented interface callback through its Indexed Access function type and rename the unused contract parameter to `_level`; do not add types, imports, or docs.
   - Files: `src/logging/log-sink.ts`
   - Skills: `typescript`
   - Selected: `naming-use-consistent-file-and-symbol-naming`, `types-mark-unused-parameters-with-underscore`, `types-prefer-function-variable-types-over-parameter-annotations`, `types-reuse-callback-signatures-from-existing-contracts`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

3. `derive-existing-contract-with-docs`
   - Prompt/evidence: replace a duplicate `UserPreview` interface with a same-name `Pick<UserRecord, ...>` alias and add concise Korean `@summary`; imports and names otherwise stay unchanged.
   - Files: `src/users/user-preview.ts`
   - Skills: `typescript`
   - Selected: `types-document-custom-types-and-shapes`, `types-reuse-existing-contracts-before-new-types`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

4. `helper-boundary-scope-drift`
   - Initial evidence: inline a single-owner mapper/sub-step into `profile-api.ts`.
   - Initial selected: `functions-extract-helpers-only-when-the-boundary-is-real`
   - Drift evidence: the same normalization becomes necessary for a second owner, so move the existing named function to `profile-support.ts`, export it, directly import it from `bulk-profile.ts`, and add concise Korean `@helper` docs.
   - Final files: `src/profile/profile-api.ts`, `src/profile/profile-support.ts`, `src/bulk/bulk-profile.ts`
   - Skills: `typescript`
   - Final selected: `naming-use-direct-imports-and-public-entry-points`, `functions-extract-helpers-only-when-the-boundary-is-real`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-use-helper-for-reusable-pure-helper-functions`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: true

5. `shared-collection-lookups-and-sort`
   - Prompt/evidence: replace repeated `includes` with an existing Set's `has` and replace shared-input `.sort()` with `.toSorted()`; declarations, imports, and docs stay unchanged.
   - Files: `src/search/filter-entries.ts`
   - Skills: `typescript`
   - Selected: `functions-prefer-immutable-array-sorting`, `functions-use-set-and-map-for-repeated-lookups`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

6. `enum-like-runtime-contract`
   - Prompt/evidence: replace `enum AuditStatus` with snake_case `audit_status as const`, derive `AuditStatus`, and document the object, every key, and derived type in Korean.
   - Files: `src/audit/audit-status.ts`
   - Skills: `typescript`
   - Selected: `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes`, `functions-replace-enum-with-as-const-objects`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

7. `wide-scope-assembly`
   - Prompt/evidence: replace an existing top-level `let` plus conditional `push` flow with a declarative calculation assigned to the same `visibleTabs` name; imports and docs stay unchanged.
   - Files: `src/navigation/visible-tabs.ts`
   - Skills: `typescript`
   - Selected: `functions-avoid-imperative-assembly-in-wide-scopes`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

8. `named-object-param`
   - Prompt/evidence: change a function that destructures `BuildRequestUrlArgs` in the signature to accept `args` and destructure on the first body line; no other contract/docs/import changes.
   - Files: `src/http/build-request-url.ts`
   - Skills: `typescript`
   - Selected: `naming-use-consistent-file-and-symbol-naming`, `functions-use-named-object-params-for-complex-signatures`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

9. `explicit-product-fallback`
   - Prompt/evidence: replace an ungrounded optional page-size `??` with an explicit branch for the specified product default 20 and a short Korean constraint comment; helper/header boundaries stay unchanged.
   - Files: `src/search/resolve-page-size.ts`
   - Skills: `typescript`
   - Selected: `absence-expose-optional-values-instead-of-silent-fallbacks`, `docs-keep-inline-comments-for-constraints-and-caveats`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`
   - Scope drift: false

## Appendix B: React Routing Metadata and Scenario Oracle

Every value below is normative implementation input. `—` means omit `reviewWith`.

| Rule ID | `appliesWhen` | `reviewWith` |
|---|---|---|
| `ownership-use-consistent-file-and-symbol-naming` | React/TSX 파일·컴포넌트·exported symbol·공용 설정의 이름을 새로 정하거나 바꾸며 casing, ui/wg prefix 또는 config key naming 판단이 필요하다. | `typescript/naming-use-consistent-file-and-symbol-naming` |
| `ownership-avoid-barrel-and-react-namespace-imports` | `index.ts`·barrel 재노출을 추가·수정하거나 `React.*` namespace 타입, type/value 혼합 import 또는 소유 출처가 숨은 import 경로가 diff에 보인다. | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `ownership-layer-component-boundaries` | 컴포넌트를 ui·widget·route-local 중 어느 소유 레이어에 둘지 결정하거나 레이어 사이에서 이동·공용화한다. | `ownership-place-route-local-files-by-scope`, `css/naming-separate-local-and-route-style-scopes` |
| `ownership-place-route-local-files-by-scope` | route 전용 컴포넌트·스타일·순수 로직을 새로 만들거나 `-local`과 route sibling `.ts` 사이에서 위치를 바꾼다. | `css/naming-separate-local-and-route-style-scopes`, `css/organization-keep-style-files-owned-by-one-component-or-route` |
| `ownership-prefer-plain-ts-for-local-react-helpers` | 화면 전용 계산·정규화·payload 조립을 custom hook 또는 별도 support module로 추출·이동하려 한다. | `screen-extract-utilities-selectively`, `screen-move-pure-support-code-out-of-entry-files`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| `ownership-shared-config-entry-points` | 둘 이상의 화면이 쓰는 상수·설정·순수 함수를 추가·이동하거나 leaf 파일에 중복 선언된 공용 값을 정리한다. | `typescript/naming-centralize-shared-config-namespaces`, `typescript/naming-preserve-config-origin-with-chained-access` |
| `typing-function-type-first` | React 이벤트 핸들러나 prop callback의 선언·시그니처를 추가·변경하며 기존 React alias 또는 callback 계약을 쓸 수 있다. | `typing-reuse-existing-contracts`, `typescript/types-prefer-function-variable-types-over-parameter-annotations`, `typescript/types-reuse-callback-signatures-from-existing-contracts` |
| `typing-reuse-existing-contracts` | Props callback 구현이나 API 응답 기반 view type을 추가·변경하며 기존 prop·API 계약과 같은 shape가 보인다. | `typescript/types-reuse-callback-signatures-from-existing-contracts`, `typescript/types-reuse-existing-contracts-before-new-types` |
| `strategy-choose-single-composition-compound-and-variants` | exported shared component에 slot·public part·shared context/action·반복 preset·mode API를 추가하거나 조립 구조를 재설계한다. | `strategy-avoid-boolean-prop-proliferation`, `strategy-prefer-children-over-render-props`, `screen-avoid-premature-abstraction` |
| `strategy-avoid-boolean-prop-proliferation` | 여러 곳에서 쓰는 shared component에 boolean mode·visibility prop을 추가하거나 기존 boolean 조합과 JSX 분기가 늘어난다. | — |
| `strategy-prefer-children-over-render-props` | shared component에 header·footer·action 같은 정적 slot 또는 render prop을 추가·변경하며 runtime data 주입 필요가 불분명하다. | — |
| `composition-do-not-define-components-inside-components` | 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가·이동하거나 재렌더 시 remount·focus reset 징후를 다룬다. | — |
| `composition-prefer-arrow-functions-and-object-params` | React 인접 코드에 function 선언이 생기거나 함수가 3개 이상 매개변수 또는 함께 이동하는 같은 계열 값을 받는다. | `typescript/functions-use-named-object-params-for-complex-signatures` |
| `composition-destructure-props-inside` | 함수 컴포넌트의 props 시그니처나 본문 구조분해 방식을 추가·변경한다. | — |
| `composition-use-ref-prop-instead-of-forwardref-in-react-19` | React 19 컴포넌트에 focus·scroll·measure용 ref 공개 API를 추가·변경하거나 새 `forwardRef` wrapper를 도입한다. | — |
| `composition-use-activity-for-render-branches` | 이미 마운트된 subtree의 표시 상태를 보존하려고 조건부 렌더링과 Activity 또는 동등한 visibility primitive 사이를 바꾼다. | — |
| `composition-named-handlers-over-inline` | TSX event prop에 인라인 callback을 추가·수정하고 그 안에 분기, 비동기 호출, 상태 변경 또는 여러 동작이 들어간다. | `events-name-and-curry-handlers`, `events-keep-handler-flow-inline`, `events-run-user-actions-in-handlers-not-effects`, `docs-require-jsdoc-on-key-declarations` |
| `screen-keep-route-flow-visible` | route entry의 search·navigate·query·mutation·effect·section 조립을 이동·분리하거나 화면 흐름을 재구성한다. | `screen-extract-local-section-components-for-runtime-boundaries`, `screen-move-pure-support-code-out-of-entry-files` |
| `screen-avoid-premature-abstraction` | screen 코드를 helper·hook·component·module로 추출하거나 한 곳에서만 쓰는 기존 추상화를 접어 넣는다. | `screen-extract-local-section-components-for-runtime-boundaries`, `screen-extract-utilities-selectively`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| `screen-extract-local-section-components-for-runtime-boundaries` | route-local section component를 새로 추출하거나 기존 section이 async·state·provider·interaction·library·performance 경계를 소유하는지 바꾼다. | — |
| `screen-extract-utilities-selectively` | 화면 전용 계산·변환·preset·option·column meta를 함수나 support module로 추출·통합·재배치한다. | `screen-move-pure-support-code-out-of-entry-files`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| `screen-keep-derived-values-close` | response·state·search·props의 오리진을 끊는 alias·flag·표시값을 넓은 screen scope에 추가·이동하거나 `let`/`push` 기반 조립을 만든다. | — |
| `screen-move-pure-support-code-out-of-entry-files` | route entry에 여러 줄 pure helper·preset·option·화면 전용 type이 쌓이거나 추출한 support code의 목적지 파일을 정한다. | `docs-require-jsdoc-on-key-declarations` |
| `events-name-and-curry-handlers` | 이벤트 핸들러를 새로 만들거나 이름, target/event 표현, 추가 인자 전달 방식 또는 최종 React handler 시그니처를 바꾼다. | `typing-function-type-first` |
| `events-keep-handler-flow-inline` | 화면 전용 named handler의 분기·mutation·navigation·후처리를 여러 helper나 hook으로 나누거나 다시 합친다. | `screen-extract-utilities-selectively` |
| `events-run-user-actions-in-handlers-not-effects` | 제출·저장·삭제·닫기 같은 one-shot 사용자 액션을 handler와 state+effect 사이에서 이동하거나 실행 흐름을 바꾼다. | — |
| `state-calculate-derived-values-during-render` | 현재 props·state·search·response에서 계산 가능한 값을 별도 state와 effect로 동기화하거나 그 동기화를 제거한다. | `screen-keep-derived-values-close` |
| `state-choose-state-tools-by-source-of-truth` | 로컬 UI·전역 client·server 데이터를 새 state 도구로 옮기거나 서로 다른 source of truth 사이에 복제·동기화한다. | `state-store-derived-authority` |
| `state-name-query-and-mutation-bindings-consistently` | React Query query·mutation hook의 로컬 binding을 추가·이름 변경하거나 역할이 드러나지 않는 별칭이 diff에 보인다. | `state-preserve-origin-chaining`, `docs-require-jsdoc-on-key-declarations` |
| `state-store-derived-authority` | 여러 화면·메뉴·route guard가 쓰는 권한·capability 같은 derived decision을 store에 저장·동기화하거나 단일 화면 값까지 store로 올린다. | `docs-require-jsdoc-on-key-declarations` |
| `state-shape-query-data-with-select` | 서버 응답의 list·items·meta 등을 렌더에서 가공·반복 소비하거나 React Query `select`의 결과 shape를 추가·변경한다. | `state-name-query-and-mutation-bindings-consistently`, `state-preserve-origin-chaining`, `docs-require-jsdoc-on-key-declarations` |
| `state-preserve-origin-chaining` | page·layout·screen 넓은 스코프에서 response·mutation·store를 구조분해하거나 별칭으로 끊고 원본 값 접근을 바꾼다. | — |
| `state-compiler-first-memoization` | `useMemo`·`useCallback`을 추가·제거하거나 참조 동일성·실측 병목·무거운 deferred 계산을 이유로 수동 memoization을 검토한다. | — |
| `state-use-lazy-state-initializers-for-expensive-defaults` | `useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 추가·변경한다. | — |
| `state-use-effectevent-for-non-reactive-effect-callbacks` | subscription effect가 최신 prop·state callback을 읽도록 ref 동기화 hack, dependency 재설치 또는 `useEffectEvent`를 추가·변경한다. | `events-run-user-actions-in-handlers-not-effects`, `docs-require-jsdoc-on-key-declarations` |
| `state-use-functional-setstate-updates` | 다음 state가 현재 state에 의존하는 handler·async callback·반복 갱신에서 `setState` 호출 방식을 추가·변경한다. | — |
| `state-use-starttransition-for-non-urgent-updates` | 클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 state update의 우선순위나 transition 처리를 바꾼다. | — |
| `state-use-usedeferredvalue-for-heavy-derived-renders` | 검색어·필터·정렬 입력이 무거운 파생 view를 갱신해 typing 지연이 생기거나 `useDeferredValue` 기반 계산을 추가·변경한다. | `state-compiler-first-memoization`, `state-use-starttransition-for-non-urgent-updates` |
| `state-avoid-fallback-defaults-and-loading-flags` | optional 응답에 `??`·`\|\|` 기본값을 넣거나 Suspense 화면 본문에 초기 loading return을 추가·변경하고 결측·로딩 UX를 다룬다. | `state-preserve-origin-chaining`, `screen-keep-derived-values-close`, `typescript/absence-expose-optional-values-instead-of-silent-fallbacks` |
| `docs-document-compound-parts-with-part-and-description` | compound component의 exported public part·props interface·part 내부 handler를 추가·변경하거나 public part 문서를 수정한다. | `docs-require-jsdoc-on-key-declarations`, `typescript/docs-standardize-annotation-tags-by-declaration-role` |
| `docs-require-jsdoc-on-key-declarations` | query·mutation, 비자명한 handler/effect, exported helper/custom hook/store, public type/interface 또는 예외 memo 선언을 추가·변경한다. | `typescript/docs-require-header-jsdoc-on-key-declarations`, `typescript/docs-standardize-annotation-tags-by-declaration-role` |
| `docs-limit-inline-comments-to-non-obvious-logic` | React 함수·handler·JSX 인접 로직 안의 `//` 주석을 추가·수정하거나 자명한 설명과 실제 제약을 구분해 정리한다. | `typescript/docs-keep-inline-comments-for-constraints-and-caveats` |

Define `U_REACT` as these 42 IDs. Every fixture stores the full stable-ID array `expectedNotApplicable = U_REACT - expectedSelected`. Companion partitions are defined in Appendix D.

1. `RTE01-import-contract-cleanup`
   - Evidence/files: rename `UserCard.tsx` to `user-card.tsx`, remove `index.ts` barrel, replace `React.MouseEvent` and duplicate API view type with existing contracts in `src/components/ui/user-card.tsx` and `src/components/ui/index.ts`.
   - Skills: `react`, `typescript`
   - React selected: `ownership-use-consistent-file-and-symbol-naming`, `ownership-avoid-barrel-and-react-namespace-imports`, `typing-function-type-first`, `typing-reuse-existing-contracts`, `events-name-and-curry-handlers`

2. `RTE02-owner-placement-css-drift`
   - Initial evidence/files: move a route-only tree renderer from shared UI to `src/routes/entries/-local/entry-tree.tsx` and rename it as route-local; initial skills are React and TypeScript.
   - Drift: in a project without a CSS Modules standard, add directly imported `src/routes/entries/-local/entry-tree.css`, create owner-unique role-named classes, and compose the changed className contract with an existing direct `clsx` import; final skills add CSS, with no additional React rule.
   - React selected: `ownership-use-consistent-file-and-symbol-naming`, `ownership-layer-component-boundaries`, `ownership-place-route-local-files-by-scope`

3. `RTE03-route-support-extraction`
   - Evidence/files: move one real four-argument multi-line payload boundary from `src/routes/entries/page.tsx` to sibling `page.ts`; do not create a hook, generic utils file, or helper soup.
   - Skills: `react`, `typescript`
   - React selected: `ownership-use-consistent-file-and-symbol-naming`, `ownership-place-route-local-files-by-scope`, `ownership-prefer-plain-ts-for-local-react-helpers`, `composition-prefer-arrow-functions-and-object-params`, `screen-avoid-premature-abstraction`, `screen-extract-utilities-selectively`, `screen-move-pure-support-code-out-of-entry-files`, `docs-require-jsdoc-on-key-declarations`

4. `RTE04-shared-config`
   - Evidence/files: move duplicated menu key/default page size from two screens into a documented snake_case `as const` config object in `src/shared/config.ts` and directly import/use `config.*` from both route pages.
   - Skills: `react`, `typescript`
   - React selected: `ownership-use-consistent-file-and-symbol-naming`, `ownership-shared-config-entry-points`

5. `RTE05-toolbar-composition`
   - Evidence/files: replace compact/edit/search/focus booleans and static render props on `wg-entry-toolbar.tsx` with stateless compound parts plus repeated explicit variants, and document public parts.
   - Skills: `react`, `typescript`
   - React selected: `ownership-use-consistent-file-and-symbol-naming`, `strategy-choose-single-composition-compound-and-variants`, `strategy-avoid-boolean-prop-proliferation`, `strategy-prefer-children-over-render-props`, `composition-destructure-props-inside`, `docs-document-compound-parts-with-part-and-description`, `docs-require-jsdoc-on-key-declarations`

6. `RTE06-nested-forwardref`
   - Evidence/files: hoist an existing nested `forwardRef` search input that resets focus to module scope and convert it to a React 19 ref prop in `ui-search-card.tsx`.
   - Skills: `react`, `typescript`
   - React selected: `composition-do-not-define-components-inside-components`, `composition-destructure-props-inside`, `composition-use-ref-prop-instead-of-forwardref-in-react-19`, `docs-require-jsdoc-on-key-declarations`

7. `RTE07-visibility-lifecycle`
   - Evidence/files: change only the show/hide branch for an already-mounted sidebar to the already-imported project Activity primitive to preserve expanded state; keep empty-state unmount behavior.
   - Skills: `react`, `typescript`
   - React selected: `composition-use-activity-for-render-branches`

8. `RTE08-delete-handler-flow`
   - Evidence/files: move a row delete inline async branch/mutation/navigation and state+effect replay into one curried named handler, keep an unused React event as `_event`, directly import its reused callback type, and keep screen-only flow inside `page.tsx`.
   - Skills: `react`, `typescript`, `tanstack-route`
   - React selected: `typing-function-type-first`, `composition-named-handlers-over-inline`, `events-name-and-curry-handlers`, `events-keep-handler-flow-inline`, `events-run-user-actions-in-handlers-not-effects`, `docs-require-jsdoc-on-key-declarations`

9. `RTE09-route-runtime-section`
   - Evidence/files: extract only the tree section that owns local search/expanded state and a tree adapter into `-local`; implement a new named selection handler from `EntryTreeSectionProps["onCategorySelect"]`, and keep search params, navigation, page query/mutation in the route entry.
   - Skills: `react`, `typescript`, `tanstack-route`
   - React selected: `ownership-use-consistent-file-and-symbol-naming`, `ownership-layer-component-boundaries`, `ownership-place-route-local-files-by-scope`, `typing-function-type-first`, `typing-reuse-existing-contracts`, `composition-destructure-props-inside`, `screen-keep-route-flow-visible`, `screen-avoid-premature-abstraction`, `screen-extract-local-section-components-for-runtime-boundaries`, `events-name-and-curry-handlers`, `docs-require-jsdoc-on-key-declarations`

10. `RTE10-derived-selection-state`
    - Evidence/files: replace selectedIds-derived count/flag effect+state sync with render calculation near use and change toggle to a functional updater.
    - Skills: `react`, `typescript`
    - React selected: `screen-keep-derived-values-close`, `state-calculate-derived-values-during-render`, `state-use-functional-setstate-updates`, `docs-require-jsdoc-on-key-declarations`

11. `RTE11-shared-authority`
    - Evidence/files: synchronize shared capability once at owning layout/store for multiple screens/menu/guards; do not copy single-screen server fields into the store.
    - Skills: `react`, `typescript`
    - React selected: `state-choose-state-tools-by-source-of-truth`, `state-store-derived-authority`, `state-preserve-origin-chaining`, `docs-require-jsdoc-on-key-declarations`

12. `RTE12-query-shaping`
    - Evidence/files: move repeated raw list/items/meta render shaping into query `select`, rename bindings to `response...`/`mutation...`, and remove wide aliases.
    - Skills: `react`, `typescript`
    - React selected: `screen-keep-derived-values-close`, `state-name-query-and-mutation-bindings-consistently`, `state-shape-query-data-with-select`, `state-preserve-origin-chaining`, `docs-require-jsdoc-on-key-declarations`

13. `RTE13-heavy-search`
   - Evidence/files: for a 50k-row search, directly import newly used React hooks, use lazy initialization, urgent input plus deferred result, non-urgent category transition, and only evidence-backed memoization; update the constraint comment.
    - Skills: `react`, `typescript`
    - React selected: `state-compiler-first-memoization`, `state-use-lazy-state-initializers-for-expensive-defaults`, `state-use-starttransition-for-non-urgent-updates`, `state-use-usedeferredvalue-for-heavy-derived-renders`, `docs-require-jsdoc-on-key-declarations`, `docs-limit-inline-comments-to-non-obvious-logic`

14. `RTE14-subscription-effectevent`
   - Evidence/files: directly import `useEffectEvent`, replace only a socket subscription latest-callback ref-sync hack with a named `handleMessage = useEffectEvent(...)`, and update subscription lifecycle JSDoc; do not change click/submit actions.
    - Skills: `react`, `typescript`
   - React selected: `events-name-and-curry-handlers`, `state-use-effectevent-for-non-reactive-effect-callbacks`, `docs-require-jsdoc-on-key-declarations`

15. `RTE15-suspense-absence`
    - Evidence/files: replace Suspense detail `?? []`, `\|\| "-"`, local pending Spinner, and top-level aliases with explicit empty state and origin chaining; remove an ungrounded explanatory comment.
    - Skills: `react`, `typescript`
    - React selected: `screen-keep-derived-values-close`, `state-preserve-origin-chaining`, `state-avoid-fallback-defaults-and-loading-flags`, `docs-limit-inline-comments-to-non-obvious-logic`

## Appendix C: CSS Routing Metadata and Scenario Oracle

Every value below is normative implementation input. `organization-review-banned-css-patterns-before-finishing` is selected in every final CSS/class-contract fixture but is not a `reviewWith` hub.

CSS metadata declares one conditional companion exactly: `{"skill":"typescript","mode":"conditional","appliesWhen":"TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다."}`. Pure CSS fixtures do not activate it.

| Rule ID | `appliesWhen` | `reviewWith` |
|---|---|---|
| `naming-default-to-plain-css-when-no-module-convention` | 프로젝트의 CSS Modules 표준이 확인되지 않은 상태에서 새 stylesheet 또는 class contract를 만들거나 `.module.css`/`styles.*` 도입을 검토한다. | — |
| `naming-keep-scope-slug-unique-per-owner` | 새 `scope_slug` namespace를 추가·복사·이름 변경하거나 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있다. | — |
| `naming-name-elements-and-modifiers-by-role` | element 또는 modifier class를 새로 짓거나 `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경한다. | — |
| `naming-preserve-route-slug-traceability` | route/framework 규칙이 `rt_*` owner를 선택한 화면에서 route class slug를 새로 만들거나 이름을 변경한다. | — |
| `naming-separate-local-and-route-style-scopes` | 스타일 owner를 route, document, local helper, reusable widget, UI primitive 중에서 결정하거나 서로 다른 owner를 이동·분리한다. | `organization-keep-style-files-owned-by-one-component-or-route` |
| `naming-use-scope-slug-element-modifier-syntax` | plain CSS의 project-owned class를 새로 만들거나 이름, scope, slug, element, modifier 구분자 또는 casing을 변경한다. | — |
| `composition-compose-classes-with-clsx` | TSX의 `className`을 추가·수정하거나 base class, modifier, optional class를 조합한다. | — |
| `composition-do-not-build-structural-variants-with-modifiers` | spacing·방향·특정 화면의 구조 차이를 `--modifier`로 추가하려 하거나 modifier가 반복 가능한 상태 또는 API variant인지 판단한다. | `naming-name-elements-and-modifiers-by-role` |
| `composition-keep-classes-single-purpose` | base class 이름에 상태·variant 의미를 합치거나 한 class에 서로 독립적인 시각 책임을 추가·재사용·분리한다. | — |
| `composition-prefer-ui-wrapper-prop-types` | `Ui*` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용하고 라이브러리 원본 Props 참조를 검토한다. | `typescript/types-reuse-existing-contracts-before-new-types` |
| `composition-style-ui-components-through-owned-wrappers` | `Ui*` wrapper의 내부 DOM을 스타일링하거나 root `className` 또는 slot prop을 styling hook으로 주입·노출·사용한다. | `selector-target-third-party-dom-from-owned-roots` |
| `selector-avoid-deep-descendant-dependencies` | descendant 또는 child selector chain을 추가·수정하거나 DOM 계층에 의존하는 project-owned·third-party selector를 검토한다. | — |
| `selector-keep-project-selectors-flat` | project-owned class를 중첩·descendant selector로 연결하거나 raw HTML prose·copy·content wrapper 안 element selector를 추가·수정한다. | — |
| `selector-target-third-party-dom-from-owned-roots` | `.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정하거나 owned wrapper 아래로 범위를 제한한다. | `selector-avoid-deep-descendant-dependencies` |
| `selector-use-pseudo-classes-for-dom-owned-states` | `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정하거나 parent DOM state가 child styling에 영향을 준다. | `values-separate-domain-state-modifiers-from-dom-interaction-states` |
| `values-keep-layout-intent-explicit` | `sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식의 layout responsibility를 추가·변경한다. | — |
| `values-always-provide-css-variable-fallbacks` | `var(--*)`를 추가·수정하거나 theme provider·third-party wrapper·optional token·overlay처럼 변수 주입이 보장되지 않는 경계를 스타일링한다. | — |
| `values-separate-domain-state-modifiers-from-dom-interaction-states` | app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경하거나 focus ring에 손댄다. | — |
| `values-tokenize-repeated-visual-values` | 색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복되거나 새 shared visual value를 하드코딩한다. | `values-always-provide-css-variable-fallbacks` |
| `organization-keep-style-files-owned-by-one-component-or-route` | stylesheet를 새로 만들거나 이동·분할·병합하고 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있다. | — |
| `organization-review-banned-css-patterns-before-finishing` | CSS 또는 TSX class contract 변경이 완료 단계에 들어간다. | — |

Define `U_CSS` as these 21 IDs. Every final fixture explicitly stores `expectedNotApplicable = U_CSS - expectedSelected`; mixed companion partitions appear in Appendix D.

1. `css-route-style-scope-drift`
   - Initial evidence/files: pure rendering change in `src/routes/catalog/index.tsx`, with React and TypeScript only.
   - Drift: add route-owned empty-state className, `src/routes/catalog/_index.css`, and its direct side-effect import in a project without a CSS Modules standard; final skills add CSS.
   - CSS selected: `naming-default-to-plain-css-when-no-module-convention`, `naming-keep-scope-slug-unique-per-owner`, `naming-name-elements-and-modifiers-by-role`, `naming-preserve-route-slug-traceability`, `naming-separate-local-and-route-style-scopes`, `naming-use-scope-slug-element-modifier-syntax`, `composition-compose-classes-with-clsx`, `organization-keep-style-files-owned-by-one-component-or-route`, `organization-review-banned-css-patterns-before-finishing`

2. `css-owner-boundary-split`
   - Evidence/files: split mixed route/document/local ownership from `posts/_index.css` into `pages/_document.css` and `posts/_local/filter-dialog.css`; class names do not change.
   - Skills: `css`
   - CSS selected: `naming-separate-local-and-route-style-scopes`, `organization-keep-style-files-owned-by-one-component-or-route`, `organization-review-banned-css-patterns-before-finishing`

3. `css-domain-state-class-contract`
   - Evidence/files: split `listButtonActive` into base plus `--active`, add a direct `clsx` import, and compose with `clsx()` in `catalog/index.tsx` and `_index.css`; do not change pseudo-states.
   - Skills: `react`, `typescript`, `css`
   - CSS selected: `naming-name-elements-and-modifiers-by-role`, `naming-use-scope-slug-element-modifier-syntax`, `composition-compose-classes-with-clsx`, `composition-keep-classes-single-purpose`, `values-separate-domain-state-modifiers-from-dom-interaction-states`, `organization-review-banned-css-patterns-before-finishing`

4. `css-one-off-structural-modifier`
   - Evidence/files: replace non-repeatable `section--compactTop` spacing patch with a role-named element in `catalog/detail.tsx` and `detail.css`; keep the existing `clsx` import.
   - Skills: `react`, `typescript`, `css`
   - CSS selected: `naming-name-elements-and-modifiers-by-role`, `naming-use-scope-slug-element-modifier-syntax`, `composition-compose-classes-with-clsx`, `composition-do-not-build-structural-variants-with-modifiers`, `organization-review-banned-css-patterns-before-finishing`

5. `css-ui-wrapper-third-party-dom`
   - Initial evidence/files: add a direct `clsx` import and style `UiCollapse` Ant DOM from a new owned wrapper with the shortest chain in `post-filter-dialog.tsx/.css`; initial CSS selection excludes the variable-fallback rule.
   - Drift: replace a hard-coded wrapper color with an optional CSS variable, requiring a fallback and adding `values-always-provide-css-variable-fallbacks` to the final receipt.
   - Skills: `react`, `typescript`, `css`
   - CSS selected: `naming-name-elements-and-modifiers-by-role`, `naming-use-scope-slug-element-modifier-syntax`, `composition-compose-classes-with-clsx`, `composition-style-ui-components-through-owned-wrappers`, `selector-avoid-deep-descendant-dependencies`, `selector-target-third-party-dom-from-owned-roots`, `values-always-provide-css-variable-fallbacks`, `organization-review-banned-css-patterns-before-finishing`

6. `css-ui-wrapper-root-prop-contract`
   - Evidence/files: directly type-import the official root className Props, expose documented `UiButtonProps`, destructure props inside `ui-button.tsx`, and pass an existing layout class from `order-actions.tsx`; add no internal selector or new class.
   - Skills: `react`, `typescript`, `css`
   - CSS selected: `composition-compose-classes-with-clsx`, `composition-prefer-ui-wrapper-prop-types`, `composition-style-ui-components-through-owned-wrappers`, `organization-review-banned-css-patterns-before-finishing`

7. `css-rich-text-owner-block`
   - Evidence/files: move top-level `.wg_entryDetail__prose h2` and `> :first-child` into existing owner-block raw-element nesting; class names and values stay unchanged.
   - Skills: `css`
   - CSS selected: `selector-keep-project-selectors-flat`, `organization-review-banned-css-patterns-before-finishing`

8. `css-dom-interaction-states`
   - Evidence/files: move top-level hover/focus/disabled into the same class block's `&:` nesting and preserve the focus ring; no app modifier or value is added.
   - Skills: `css`
   - CSS selected: `selector-use-pseudo-classes-for-dom-owned-states`, `values-separate-domain-state-modifiers-from-dom-interaction-states`, `organization-review-banned-css-patterns-before-finishing`

9. `css-repeated-values-and-optional-token`
   - Evidence/files: replace repeated color/spacing/radius in `theme-preview.css` with optional CSS variables and fallbacks; selectors and ownership stay unchanged.
   - Skills: `css`
   - CSS selected: `values-always-provide-css-variable-fallbacks`, `values-tokenize-repeated-visual-values`, `organization-review-banned-css-patterns-before-finishing`

10. `css-sticky-layout-intent`
    - Evidence/files: clarify sticky basis and z-index ownership and remove excessive width/height forcing in `dashboard/_index.css`; tokens and selectors stay unchanged.
    - Skills: `css`
    - CSS selected: `values-keep-layout-intent-explicit`, `organization-review-banned-css-patterns-before-finishing`

11. `css-deep-project-descendant-chain`
    - Evidence/files: flatten `.layout .panel .detail .item` to a target element top-level block without changing class names or values.
    - Skills: `css`
    - CSS selected: `selector-avoid-deep-descendant-dependencies`, `selector-keep-project-selectors-flat`, `organization-review-banned-css-patterns-before-finishing`

## Appendix D: Cross-Skill Companion Oracle

Each activated progressive index requires a complete selected/N/A partition in JSON. For every TypeScript set below, materialize `U_TS - selected` as `expectedNotApplicable`; every completed TSX scenario includes the TypeScript finish guardrail.

### React fixtures: TypeScript companion selection

- `RTE01-import-contract-cleanup`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `types-prefer-function-variable-types-over-parameter-annotations`, `types-reuse-callback-signatures-from-existing-contracts`, `types-reuse-existing-contracts-before-new-types`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE02-owner-placement-css-drift`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `guardrails-review-banned-typescript-shortcuts-before-finishing`; the TypeScript set is unchanged after CSS drift.
- `RTE03-route-support-extraction`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `functions-extract-helpers-only-when-the-boundary-is-real`, `functions-use-named-object-params-for-complex-signatures`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-use-helper-for-reusable-pure-helper-functions`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE04-shared-config`: `naming-centralize-shared-config-namespaces`, `naming-preserve-config-origin-with-chained-access`, `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `functions-replace-enum-with-as-const-objects`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`; `docs-require-header-jsdoc-on-key-declarations` is N/A because no custom type/interface is derived.
- `RTE05-toolbar-composition`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE06-nested-forwardref`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE07-visibility-lifecycle`: `guardrails-review-banned-typescript-shortcuts-before-finishing`; the fixture states that Activity is already imported.
- `RTE08-delete-handler-flow`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-mark-unused-parameters-with-underscore`, `types-prefer-function-variable-types-over-parameter-annotations`, `types-reuse-callback-signatures-from-existing-contracts`, `functions-extract-helpers-only-when-the-boundary-is-real`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`; the fixture keeps an unused React event as `_event` and directly imports the reused callback type.
- `RTE09-route-runtime-section`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `types-prefer-function-variable-types-over-parameter-annotations`, `types-reuse-callback-signatures-from-existing-contracts`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE10-derived-selection-state`: `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE11-shared-authority`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE12-query-shaping`: `naming-use-consistent-file-and-symbol-naming`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE13-heavy-search`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `docs-keep-inline-comments-for-constraints-and-caveats`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE14-subscription-effectevent`: `naming-use-consistent-file-and-symbol-naming`, `naming-use-direct-imports-and-public-entry-points`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
- `RTE15-suspense-absence`: `absence-expose-optional-values-instead-of-silent-fallbacks`, `docs-keep-inline-comments-for-constraints-and-caveats`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.

### React fixtures: conditional CSS selection

- `RTE02-owner-placement-css-drift` activates CSS only after drift and selects `naming-default-to-plain-css-when-no-module-convention`, `naming-keep-scope-slug-unique-per-owner`, `naming-name-elements-and-modifiers-by-role`, `naming-separate-local-and-route-style-scopes`, `naming-use-scope-slug-element-modifier-syntax`, `composition-compose-classes-with-clsx`, `organization-keep-style-files-owned-by-one-component-or-route`, `organization-review-banned-css-patterns-before-finishing`.
- Every other React fixture keeps CSS absent from `expectedSkills` because it does not change a class contract, stylesheet, selector, token, or visual styling surface.

Materialize `U_CSS - selected` as the drift `expectedNotApplicable.css` array when Task 6 makes CSS progressive. Task 5 records only CSS activation evidence for this drift because no CSS index exists yet.

### CSS mixed fixtures: companion selection

Pure CSS fixtures intentionally activate no React or TypeScript index. The mixed sets are:

- `css-route-style-scope-drift`
  - TypeScript: `naming-use-direct-imports-and-public-entry-points`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
  - React: `ownership-place-route-local-files-by-scope`, added only after drift.
- `css-domain-state-class-contract`
  - TypeScript: `naming-use-direct-imports-and-public-entry-points`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
  - React: empty exact selected set; state source/update/render behavior is unchanged.
- `css-one-off-structural-modifier`
  - TypeScript: `guardrails-review-banned-typescript-shortcuts-before-finishing`.
  - React: empty exact selected set; existing `clsx`, API, state, handler, and ownership remain unchanged.
- `css-ui-wrapper-third-party-dom`
  - TypeScript: `naming-use-direct-imports-and-public-entry-points`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
  - React: empty exact selected set; the change is a DOM wrapper/class hook and CSS selector concern only.
- `css-ui-wrapper-root-prop-contract`
  - TypeScript: `naming-use-direct-imports-and-public-entry-points`, `types-document-custom-types-and-shapes`, `types-reuse-existing-contracts-before-new-types`, `docs-require-header-jsdoc-on-key-declarations`, `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`, `guardrails-review-banned-typescript-shortcuts-before-finishing`.
  - React: `composition-destructure-props-inside`, `docs-require-jsdoc-on-key-declarations`.

For every mixed fixture, materialize `U_TS - TypeScript selected` and `U_REACT - React selected` in the JSON. An empty React selected set therefore has all 42 React IDs in `expectedNotApplicable`; it is not permission to skip scanning the React index.
