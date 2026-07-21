# Convention Audit

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 6월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=convention-audit`로 다시 생성하세요.

---

## 개요

React, CSS, TypeScript convention이 실제 구현 diff에 끝까지 적용됐는지 검증하는 semantic audit gate입니다. 실제 변경 surface로 companion을 조건부 활성화하고, auditor가 각 activated RULES_INDEX.md 전체를 독립적으로 scan해 digest-bound exact partition을 다시 만듭니다. 구현자 receipt와 비교해 빠진 applicable rule이나 근거 없는 N/A를 coverage FAIL로 막고, auditor-selected/unknown rule 원문과 변경 증거로 PASS/FAIL/UNKNOWN을 판정합니다. lint, build, test, browser 결과는 보조 증거일 뿐 semantic PASS를 대신하지 않으며, FAIL과 UNKNOWN이 모두 0일 때만 완료합니다.

이 가이드는 local Convention Audit 규칙만 담고 있습니다. companion skill은 아래 mode와 appliesWhen에 따라 활성화합니다.

---

## Companion Skill 활성화

- `convention-react` - React Convention · mode: `conditional` · appliesWhen: React component, TSX render, screen/route-local 경계, hook, handler, state/query 또는 rendered behavior를 변경했다. · [SKILL.md](../react/SKILL.md) · [RULES_INDEX.md](../react/RULES_INDEX.md)
- `convention-typescript` - TypeScript Convention · mode: `conditional` · appliesWhen: TypeScript/TSX type, schema, config, API, helper, import/export, fallback 또는 JSDoc 경계를 변경했다. · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)
- `convention-css` - CSS Convention · mode: `conditional` · appliesWhen: stylesheet, selector, token/CSS variable, className contract 또는 visual styling surface를 변경했다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)

---

## 목차

1. [Trigger and Scope](#1-trigger-and-scope) — **CRITICAL**
    - 1.1 [Run Convention Audit for React, CSS, and TypeScript Diffs](#11-run-convention-audit-for-react-css-and-typescript-diffs)
2. [Evidence Packet](#2-evidence-packet) — **CRITICAL**
    - 2.1 [Build an Audit Packet Before Semantic Review](#21-build-an-audit-packet-before-semantic-review)
3. [Exact Rule Coverage](#3-exact-rule-coverage) — **CRITICAL**
    - 3.1 [Activate Companion Skills from Actual Surfaces](#31-activate-companion-skills-from-actual-surfaces)
    - 3.2 [Map Changed Files to Specific Rule IDs](#32-map-changed-files-to-specific-rule-ids)
4. [Independent Semantic Review](#4-independent-semantic-review) — **CRITICAL**
    - 4.1 [Dispatch an Independent Semantic Reviewer When Available](#41-dispatch-an-independent-semantic-reviewer-when-available)
    - 4.2 [Ground Every Verdict in Rule Text and Evidence](#42-ground-every-verdict-in-rule-text-and-evidence)
5. [Repair and Completion](#5-repair-and-completion) — **CRITICAL**
    - 5.1 [Loop Until FAIL and UNKNOWN Are Zero](#51-loop-until-fail-and-unknown-are-zero)
    - 5.2 [Report the Final Verdict Matrix](#52-report-the-final-verdict-matrix)

---

## 1. Trigger and Scope

**Impact: CRITICAL**

local audit gate를 먼저 고정하고 actual changed surface로 React, TypeScript, CSS companion을 조건부 활성화합니다.

### 1.1 Run Convention Audit for React, CSS, and TypeScript Diffs

**Impact: CRITICAL (변경된 domain만 정확히 활성화하면서 audit 자체 gate는 빠뜨리지 않음)**

React/TypeScript/CSS convention이 걸리는 변경은 완료 전 audit 대상입니다. audit은 non-progressive local skill이므로 먼저 local `AGENTS.md`의 8개 audit gate rule 전체를 읽습니다. 그 뒤 actual changed surface를 diff와 파일 목록으로 판별해 companion을 조건부 활성화합니다.

- React: component, TSX render, screen/route-local 경계, hook, handler, state/query, rendered behavior
- TypeScript: type, schema, config, API, helper, import/export, fallback, JSDoc
- CSS: stylesheet, selector, token/CSS variable, className contract, visual styling surface

TSX 변경은 `react`와 `typescript`를 함께 활성화합니다. CSS는 TSX 확장자만으로 켜지 않으며 stylesheet, selector, token/CSS variable, className contract 또는 visual styling 변경이 있어야 합니다. 반대로 `.ts`라도 React hook ownership을 바꾸면 React와 TypeScript를 활성화합니다. scope drift가 생기면 activation을 다시 판단합니다.

**Incorrect (세 companion을 무조건 켜거나 한 domain만 대충 선택):**

```md
TSX 파일이 있으므로 React, TypeScript, CSS 전체 handbook을 읽었습니다.
```

**Correct (변경 surface로 activation을 고정):**

```md
Audit local gate: AGENTS.md 8 rules loaded
Activated: react, typescript
Inactive: css — stylesheet, selector, token, className, visual styling 변경 없음
```

## 2. Evidence Packet

**Impact: CRITICAL**

diff, owner/data/style 경계, runtime evidence와 자동 검증을 audit packet에 분리 기록하고 구현자 receipt는 독립 selection 뒤에만 비교합니다.

### 2.1 Build an Audit Packet Before Semantic Review

**Impact: CRITICAL (독립 auditor가 구현자 주장 대신 실제 변경 증거에서 selection을 재구성하게 함)**

selection 전에 audit packet을 두 artifact로 분리합니다. auditor selection packet에는 raw change evidence만 넣습니다. implementer receipt, selection, verdict는 포함하지 않고 sealed comparison artifact에 별도 보관합니다.

auditor selection packet:

- changed files, diff summary, intent, scope drift
- owner/route/shared 경계와 import/export graph
- component, handler, hook, state/query, type/schema/helper/API/JSDoc outline
- stylesheet owner, selector/className, token/CSS variable, third-party DOM evidence
- runtime/visual evidence와 알려진 미확인 영역
- lint, typecheck, build, test, browser 결과

sealed comparison artifact:

- 구현자의 activated indexes와 digest-bound `Selected/N/A/Unknown` receipt
- 구현자가 읽었다고 선언한 document list와 자체 verdict

auditor에게는 selection packet만 전달합니다. auditor receipt를 완성한 뒤 sealed comparison artifact를 공개해 exact partition을 비교합니다.

lint, typecheck, build, test, browser는 verification evidence로 별도 기록합니다. 이 성공은 selection completeness나 semantic PASS를 증명하지 않습니다.

**Incorrect (구현자 receipt와 자동 검사만 reviewer에게 전달):**

```md
Implementer selected 8 rules. lint/build/browser PASS. 그대로 승인해 주세요.
```

**Correct (독립 재선택에 필요한 원증거 전달):**

```md
Packet: diff + owner/data/style outline + runtime evidence
Selection packet: implementer receipt/selection/verdict excluded
Sealed comparison artifact: opened after auditor receipt is complete
Verification: lint/build/browser PASS; semantic verdict pending
```

## 3. Exact Rule Coverage

**Impact: CRITICAL**

activated index 전체를 current digest 기준 exact ordinal partition으로 덮고 N/A exclusion evidence와 conditional companion 결정을 검증합니다.

### 3.1 Activate Companion Skills from Actual Surfaces

**Impact: CRITICAL (companion을 무조건 full-load하거나 실제 cross-skill concern을 누락하는 양쪽 오류를 막음)**

React, TypeScript, CSS는 metadata의 조건과 actual changed surface로 각각 활성화합니다. activated progressive companion은 `SKILL.md`와 `RULES_INDEX.md`를 사용하고 full companion `AGENTS.md`는 기본 로드하지 않습니다. inactive companion은 조건과 변경 증거가 맞지 않는 이유를 기록합니다.

`reviewWith`의 cross-skill target은 companion 자동 활성화 명령이 아닙니다. target을 만나면 companion condition과 target `appliesWhen`을 현재 packet에서 다시 평가합니다.

- 조건이 맞으면 companion을 활성화하고 그 index 전체 exact partition을 작성합니다.
- 조건이 맞지 않으면 target ID와 non-empty inactive evidence를 activation decision에 남깁니다.
- 이미 activated된 target은 그 skill receipt의 `Selected`, `N/A`, `Unknown` 중 하나로 분류합니다.

**Incorrect (cross-skill target 하나로 CSS를 자동 활성화):**

```md
React rule의 reviewWith에 css/...가 있으므로 스타일 변경 없이 CSS 전체를 활성화했습니다.
```

**Correct (initial과 drift를 별도 판정):**

```md
Initial: CSS inactive — class/style/token surface 없음; cross-target evidence recorded
Drift: stylesheet + className 추가 → CSS activated → current index exact partition 생성
```

### 3.2 Map Changed Files to Specific Rule IDs

**Impact: CRITICAL (current index의 모든 ordinal이 선택 또는 근거 있는 제외로 정확히 설명되게 함)**

각 activated `RULES_INDEX.md` 전체를 scan하고 current routing digest에 묶인 exact ordinal partition을 만듭니다. 구현자와 auditor receipt 각각의 `Selected`, `N/A`, `Unknown`은 서로 겹치지 않아야 하며 합집합이 `1..N` 전체 ordinal과 정확히 같아야 합니다. count만 같거나 rule ID 없이 섹션 단위로 제외하면 실패입니다.

양쪽 receipt의 `N/A exclusion group`은 서로 독립적으로 다음 계약을 모두 지킵니다.

- 모든 `N/A` ordinal을 정확히 한 번 덮음
- `Selected`/`Unknown` ordinal을 포함하지 않음
- 각 group에 non-empty reason이 있음
- reason이 changed files, diff, packet evidence로 `appliesWhen` 불일치를 설명함

빠진 applicable rule은 구현이 우연히 그 rule을 준수하더라도 selection coverage `FAIL`입니다. 근거가 빈약하거나 generic verification 성공만 말하는 N/A도 selection coverage `FAIL`입니다.

**Incorrect (count만 맞고 빠진 rule을 N/A로 숨김):**

```md
Selected 5, N/A 36, Unknown 0 — lint 통과로 나머지는 제외.
```

**Correct (digest와 exact partition을 검증):**

```md
Index: react sha256:<current>, R01..R42
Selected: R15,R23,R24,R26,R42
N/A 37:
- R01-R14 — owner/import/type/composition strategy 변경 없음
- R16-R22 — visibility/ref/screen extraction/route-flow 변경 없음
- R25 — handler naming 또는 currying 변경 없음
- R27-R41 — state/data/performance/compound/inline-comment 변경 없음
Unknown: none
Check: disjoint=true, union=R01..R42, exclusion-union=N/A
```

## 4. Independent Semantic Review

**Impact: CRITICAL**

auditor가 구현자 selection을 보기 전에 독립 scan을 수행하고 reviewWith closure와 selected/unknown 원문을 실제 증거에 대조합니다.

### 4.1 Dispatch an Independent Semantic Reviewer When Available

**Impact: CRITICAL (구현자 selection과 verdict가 auditor의 판단을 선점하는 것을 막음)**

가능하면 구현과 분리된 reviewer가 독립적으로 selection receipt와 semantic verdict를 만듭니다. auditor는 구현자 receipt를 보기 전에 diff와 audit packet만으로 activated index 전체를 scan하고 독립적으로 selection receipt를 완성해야 합니다. 그 뒤 같은 current digest의 구현자 receipt를 열어 exact set을 비교합니다.

independent reviewer를 사용할 수 없으면 main agent가 별도 reviewer mode로 context를 전환해 같은 순서를 수행합니다. 구현자 receipt에 먼저 노출됐거나 context 분리가 불완전하면 그 한계를 보고하고, 독립성을 과장하지 않습니다.

파일 읽기 telemetry가 없으면 actual read/non-read를 observed로 주장하지 않습니다. 전달하거나 읽었다고 선언한 목록은 `declared`로만 표시하고 telemetry limitation을 남깁니다.

**Incorrect (구현자 matrix를 reviewer가 채점):**

```md
구현자가 고른 rule만 확인해 PASS/FAIL을 붙였습니다.
```

**Correct (selection부터 독립 수행):**

```md
Reviewer mode: independent
Receipt exposure: after auditor partition completed
Document telemetry: unavailable; declared list reported
```

### 4.2 Ground Every Verdict in Rule Text and Evidence

**Impact: CRITICAL (exact selection과 원문 증거 없이 취향이나 자동 검사로 PASS를 만드는 것을 막음)**

독립 partition 뒤 auditor-selected/unknown rule 원문만 읽습니다. `N/A` body는 읽지 않고 index의 `appliesWhen`과 packet evidence로 exclusion을 재검증합니다. `Unknown` body를 읽은 뒤 applicability를 `Selected` 또는 근거 있는 `N/A`로 확정하지 못하면 semantic `UNKNOWN`으로 완료를 막습니다.

구현자와 auditor의 `Selected/N/A/Unknown` set을 current same-digest exact ID로 모두 비교합니다. 같은 count라도 member나 분류가 다르면 selection coverage `FAIL`입니다. 구현자에게 빠진 applicable rule, unsupported N/A, stale digest도 coverage `FAIL`이며 semantic verdict로 덮지 않습니다.

모든 `reviewWith` target을 독립적으로 재평가합니다. activated/local target은 `Selected`, `N/A`, `Unknown` 중 하나여야 합니다. inactive cross-skill target은 activation condition과 target `appliesWhen`을 다시 확인하고 non-empty inactive evidence를 남깁니다.

확정된 selected rule은 `PASS`, `FAIL`, `UNKNOWN` 중 하나와 file/line, rule text, packet evidence, reasoning, required fix를 기록합니다. lint/build/browser 성공은 semantic PASS 근거를 대신할 수 없습니다.

**Incorrect (누락된 rule을 코드가 지킨다는 이유로 허용):**

```md
선택에서는 빠졌지만 구현이 결과적으로 맞으므로 PASS입니다.
```

**Correct (coverage와 semantic을 분리):**

```md
Selection coverage: FAIL — auditor R26 missing from implementer Selected
Semantic R26: PASS — handler owns the action
Completion: blocked because coverage FAIL remains
```

## 5. Repair and Completion

**Impact: CRITICAL**

coverage mismatch, unsupported N/A, semantic FAIL/UNKNOWN 또는 scope drift를 고치고 exact receipt와 verdict를 다시 검증한 뒤 한계까지 보고합니다.

### 5.1 Loop Until FAIL and UNKNOWN Are Zero

**Impact: CRITICAL (coverage와 semantic 문제를 경고로 낮추고 완료하는 것을 막음)**

아래 중 하나라도 있으면 완료하지 않습니다.

- stale digest, ordinal 누락/중복/unknown, partition overlap
- 구현자/auditor `Selected/N/A/Unknown` mismatch
- unsupported N/A 또는 exclusion group coverage/reason 오류
- 분류되지 않은 `reviewWith` target
- selection coverage `FAIL`
- semantic `FAIL` 또는 `UNKNOWN`
- scope drift 뒤 activation/index receipt 미갱신

문제에 따라 구현 또는 evidence를 고치고, current index를 다시 읽어 activation, exact partition, exclusion groups, reviewWith closure, semantic verdict를 처음부터 갱신합니다. `warning`이나 사용자 미승인 exception으로 zero gate를 우회하지 않습니다. coverage와 semantic 양쪽 모두 `FAIL = 0`, `UNKNOWN = 0`인 경우에만 완료하며, 하나라도 0이 아니면 repair/rescan합니다.

**Incorrect (문제를 경고로 남기고 종료):**

```md
Coverage mismatch 1건은 경고지만 lint/build가 통과했으므로 완료합니다.
```

**Correct (receipt부터 repair):**

```md
Blocked: selection coverage FAIL 1
Action: scope evidence 수정 → current index rescan → receipt 재작성 → independent re-review
Final gate: coverage FAIL 0, semantic FAIL 0, UNKNOWN 0
```

### 5.2 Report the Final Verdict Matrix

**Impact: CRITICAL (selection completeness, semantic 결과, reviewer와 관찰 한계를 다시 확인할 수 있게 함)**

최종 보고에는 다음을 분리해 기록합니다.

- activated indexes: skill별 current routing digest와 total rule count
- coverage: selected, N/A, unknown count와 exact partition 검증 결과
- excluded groups: ordinal/ID 범위와 non-empty evidence reason
- selection comparison: 구현자/auditor `Selected/N/A/Unknown` all-set exact match 여부
- reviewWith closure와 inactive cross-skill decision
- semantic verdicts: PASS/FAIL/UNKNOWN count와 예외
- reviewer mode, receipt exposure timing, independent reviewer 미사용 사유
- 파일 읽기 telemetry limitation과 `declared` document list
- lint/typecheck/build/test/browser 등 실행한 verification

자동 검사와 browser 결과는 semantic 결과와 같은 줄에 합쳐 PASS처럼 보이게 하지 않습니다. 미실행 검증이나 telemetry 부재도 숨기지 않습니다.

**Incorrect (판정과 한계를 생략):**

```md
컨벤션 검토와 빌드를 모두 마쳤습니다.
```

**Correct (추적 가능한 최종 보고):**

```md
Activated indexes: react 42 sha256:..., typescript 22 sha256:...
Coverage: selected 8, N/A 56, unknown 0; exact=true
Excluded groups: recorded with file/diff reasons
Selection comparison: exact match
Verdicts: PASS 8, FAIL 0, UNKNOWN 0
Reviewer mode: independent; receipt opened after auditor scan
Telemetry: unavailable; document list is declared
Verification: lint/build PASS; browser not run
```

## 참고 자료

- https://react.dev
- https://www.typescriptlang.org/docs/
- https://developer.mozilla.org/en-US/docs/Web/CSS
