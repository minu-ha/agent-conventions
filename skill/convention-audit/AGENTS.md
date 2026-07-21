# Convention Audit

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 6월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=convention-audit`로 다시 생성하세요.

---

## 개요

React, CSS, TypeScript convention skill을 실제 구현 diff에 끝까지 적용했는지 검증하는 semantic audit workflow입니다. 이 skill은 단순 lint나 금지 패턴 검사가 아니라, 변경 파일의 구조 증거를 모아 route-local 경계, 모듈화, 캡슐화, helper 추출, query shaping, selector ownership, shared 승격 근거처럼 판단이 필요한 규칙을 rule-by-rule로 대조하게 만듭니다. 자동 checker가 있으면 audit packet 생성기로 사용하고, 없으면 에이전트가 같은 증거를 수동으로 작성합니다. 완료 전에는 독립 reviewer 또는 main-agent reviewer가 React/CSS/TypeScript rule 원문과 변경 증거를 함께 보며 PASS/FAIL/UNKNOWN 판정을 남기고, FAIL 또는 UNKNOWN이 있으면 구현으로 돌아가야 합니다.

이 가이드는 local Convention Audit 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)
- `convention-css` - CSS Convention 공통 규칙 guide: [CSS Convention](../css/AGENTS.md)
- `convention-react` - React Convention 공통 규칙 guide: [React Convention](../react/AGENTS.md)

---

## 목차

1. [Trigger and Scope](#1-trigger-and-scope) — **CRITICAL**
    - 1.1 [Run Convention Audit for React, CSS, and TypeScript Diffs](#11-run-convention-audit-for-react-css-and-typescript-diffs)
2. [Evidence Packet](#2-evidence-packet) — **CRITICAL**
    - 2.1 [Build an Audit Packet Before Semantic Review](#21-build-an-audit-packet-before-semantic-review)
3. [Rule Coverage Matrix](#3-rule-coverage-matrix) — **CRITICAL**
    - 3.1 [Map Changed Files to Specific Rule IDs](#31-map-changed-files-to-specific-rule-ids)
    - 3.2 [Treat Companion Skills as Required Review Inputs](#32-treat-companion-skills-as-required-review-inputs)
4. [Semantic Review Gate](#4-semantic-review-gate) — **CRITICAL**
    - 4.1 [Dispatch an Independent Semantic Reviewer When Available](#41-dispatch-an-independent-semantic-reviewer-when-available)
    - 4.2 [Ground Every Verdict in Rule Text and Evidence](#42-ground-every-verdict-in-rule-text-and-evidence)
5. [Repair and Completion](#5-repair-and-completion) — **CRITICAL**
    - 5.1 [Loop Until FAIL and UNKNOWN Are Zero](#51-loop-until-fail-and-unknown-are-zero)
    - 5.2 [Report the Final Verdict Matrix](#52-report-the-final-verdict-matrix)

---

## 1. Trigger and Scope

**Impact: CRITICAL**

React/CSS/TypeScript convention이 걸리는 변경에서는 audit을 선택 사항으로 두지 않고, 변경 표면과 companion skill을 먼저 확정해야 합니다.

### 1.1 Run Convention Audit for React, CSS, and TypeScript Diffs

**Impact: CRITICAL (convention skill을 로드했다는 말만 남기고 판단형 rule 검증을 건너뛰는 것을 막음)**

React 컴포넌트, TSX 화면 흐름, TypeScript support code, CSS/className, shared/helper/config 경계가 바뀌면 이 audit을 완료 전 필수 단계로 사용합니다. 이 skill은 `convention-react`, `convention-css`, `convention-typescript`를 대체하지 않습니다. 세 companion skill의 rule 원문을 실제 diff에 적용했는지 검증하는 마지막 gate입니다.

시작 시 확정할 것:

- 변경 파일 목록
- 변경 intent와 primary scope
- 적용할 companion skill
- 자동 checker 또는 수동 audit packet 생성 방식
- 완료 전 reviewer 방식: subagent reviewer, 별도 세션 reviewer, 또는 main-agent strict reviewer

**Incorrect (스킬 이름만 나열):**

```md
React/CSS/TypeScript 스킬을 적용했습니다. lint와 build가 통과했습니다.
```

**Correct (audit을 완료 조건으로 고정):**

```md
Convention audit 대상:
- skill: convention-react, convention-css, convention-typescript
- changed files: src/pages/detail/local/**, src/pages/detail/detail-page.css
- evidence: diff, file outline, imports, exports, CSS selector map, query select chain
- reviewer: independent code quality reviewer
- completion rule: FAIL/UNKNOWN 0개
```

## 2. Evidence Packet

**Impact: CRITICAL**

판단형 rule은 감으로 검토하지 않고 diff, 파일 outline, import/export, component/state/data flow, CSS selector 같은 구조 증거를 먼저 모아야 합니다.

### 2.1 Build an Audit Packet Before Semantic Review

**Impact: CRITICAL (reviewer가 기억이나 취향으로 판정하지 않고 변경 증거를 기준으로 rule을 대조하게 함)**

semantic review 전에 audit packet을 작성합니다. 프로젝트에 `tools/conventions/check.ts`, `npm run convention:audit`, `npm run lint:conventions` 같은 증거 생성기가 있으면 먼저 실행합니다. 없으면 에이전트가 수동으로 같은 항목을 작성합니다.

필수 증거:

- changed files와 diff summary
- 파일별 owner scope와 route/shared boundary
- TS/TSX outline: exported symbol, component, hook, helper, handler, type
- import/export graph와 새 shared entry point
- state/data flow: query, select, store, derived value, fallback, effect
- helper extraction 근거: callsite 수, owner 수, 재사용 근거
- CSS evidence: stylesheet owner, class prefix, selector nesting, third-party DOM target, token/fallback
- 테스트/브라우저 검증과 convention 검증을 구분한 결과

**Incorrect (검토 전에 증거가 없음):**

```md
전체적으로 구조가 괜찮아 보입니다.
```

**Correct (review input을 먼저 고정):**

```md
Audit packet:
- route entry: 74 LOC, render branch 2개, handler 3개
- new support modules: panel-model.ts, evidence-table.tsx
- shared touched: src/shared/util.ts, callsites 1개
- query select: useGet... select 2개, post-select shaping helper 1개
- CSS owner: loc_fundamentalMiPanel, deep selectors 2개
```

## 3. Rule Coverage Matrix

**Impact: CRITICAL**

변경 파일마다 적용되는 React/CSS/TypeScript rule을 명시적으로 매핑해야 누락된 companion rule과 애매한 경계를 드러낼 수 있습니다.

### 3.1 Map Changed Files to Specific Rule IDs

**Impact: CRITICAL (큰 skill 문서를 대충 훑고 관련 rule 누락이 발생하는 것을 막음)**

변경 파일마다 적용할 rule id를 명시합니다. "React 규칙 확인"처럼 뭉뚱그리지 않습니다. 최소한 관련 섹션과 rule 파일명을 적고, 왜 적용 또는 제외되는지 한 줄 근거를 둡니다.

coverage matrix 항목:

- file
- changed concern
- applicable rule ids
- evidence needed
- verdict owner

**Incorrect (coverage가 없음):**

```md
React, CSS, TypeScript 규칙 전반을 확인했습니다.
```

**Correct (rule별 검토 대상 고정):**

```md
| file | concern | rules |
| --- | --- | --- |
| fundamental-mi-panel.tsx | route entry | react/screen-keep-route-flow-visible, react/state-preserve-origin-chaining |
| fundamental-mi-panel-model.ts | query shaping | react/state-shape-query-data-with-select, typescript/functions-extract-helpers-only-when-the-boundary-is-real |
| fundamental-mi-panel.css | owner selector | css/naming-separate-local-and-route-style-scopes, css/selector-target-third-party-dom-from-owned-roots |
```

### 3.2 Treat Companion Skills as Required Review Inputs

**Impact: CRITICAL (React 변경에서 TypeScript/CSS companion rule이 빠지는 반복 누락을 막음)**

React/TSX 변경은 기본적으로 `convention-react`와 `convention-typescript`를 함께 봅니다. `className`, CSS import, stylesheet, selector, token이 바뀌면 `convention-css`도 필수입니다. audit에서 companion skill을 제외하려면 "이번 diff에는 해당 표면이 없다"는 파일 근거가 있어야 합니다.

**Incorrect (React만 보고 종료):**

```md
TSX를 수정했지만 React 구조만 확인했습니다. CSS는 스타일 파일이 작아서 생략했습니다.
```

**Correct (companion 제외도 증거로 설명):**

```md
Companion coverage:
- convention-react: TSX render/state/helper 경계 변경으로 필수
- convention-typescript: model.ts helper/type/export 변경으로 필수
- convention-css: className과 css 파일 변경으로 필수
- convention-playwright-test: 테스트 파일 미수정, 브라우저 e2e 미작성이라 제외
```

## 4. Semantic Review Gate

**Impact: CRITICAL**

자동 검사로 끝내지 않고 독립 reviewer 또는 main-agent reviewer가 rule 원문과 증거를 대조해 PASS/FAIL/UNKNOWN을 판정해야 합니다.

### 4.1 Dispatch an Independent Semantic Reviewer When Available

**Impact: CRITICAL (구현자가 자기 diff를 낙관적으로 판정해 high severity convention 위반을 놓치는 것을 줄임)**

subagent, 별도 리뷰 세션, reviewer tool을 사용할 수 있으면 구현자와 분리된 semantic reviewer를 실행합니다. reviewer에게는 구현 의도 요약, audit packet, diff, 적용 rule ids를 주고 "통과시켜 달라"가 아니라 "FAIL/UNKNOWN을 찾으라"고 요청합니다.

reviewer prompt에는 반드시 포함합니다:

- 적용할 skill: `convention-react`, `convention-css`, `convention-typescript`
- 변경 파일과 audit packet
- rule별 PASS/FAIL/UNKNOWN 판정 요구
- FAIL/UNKNOWN이 있으면 파일/라인/근거/수정 방향 요구
- lint/build/test 성공은 convention PASS 근거가 아니라는 조건

subagent를 쓸 수 없으면 main agent가 reviewer 역할로 context를 전환하고 같은 형식의 엄격한 review를 작성합니다. 이 경우 완료 보고에 "독립 reviewer 미사용"을 명시합니다.

**Incorrect (구현자가 자기 판단으로 통과):**

```md
제가 봤을 때 컨벤션에 맞습니다.
```

**Correct (reviewer에게 반례를 찾게 함):**

```md
Reviewer task:
이 diff가 react/css/typescript convention을 위반하는 지점을 찾아라.
각 rule은 PASS/FAIL/UNKNOWN 중 하나로 판정하고, UNKNOWN은 완료 차단 이슈로 보고하라.
```

### 4.2 Ground Every Verdict in Rule Text and Evidence

**Impact: CRITICAL (취향 리뷰나 일반적인 clean code 조언이 convention 준수 판정으로 둔갑하는 것을 막음)**

각 verdict는 rule 원문과 audit packet 증거를 함께 인용해야 합니다. "좋아 보임", "적절함", "문제 없음"만으로 PASS를 줄 수 없습니다.

verdict 형식:

- rule id
- verdict: PASS, FAIL, UNKNOWN, NOT_APPLICABLE
- evidence
- reasoning
- fix required 또는 exception request

UNKNOWN은 "확인하지 못했지만 괜찮음"이 아닙니다. 증거가 부족하면 audit packet을 보강하거나 구현으로 돌아갑니다.

**Incorrect (근거 없는 PASS):**

```md
react/screen-extract-utilities-selectively: PASS - 구조가 깔끔합니다.
```

**Correct (rule과 증거를 연결):**

```md
react/screen-extract-utilities-selectively: FAIL
Evidence: `src/shared/util.ts`에 새 formatter 2개가 추가됐지만 현재 callsite가 `fundamental-mi-panel-model.ts` 1곳뿐임.
Reasoning: rule은 실제 재사용 경계가 생길 때만 shared/util 승격을 허용함.
Fix: route-local support module로 되돌리거나 두 번째 owner 근거를 제시.
```

## 5. Repair and Completion

**Impact: CRITICAL**

FAIL 또는 UNKNOWN을 남긴 채 완료하지 않고, 수정 반복과 최종 verdict 보고를 완료 조건으로 삼아야 합니다.

### 5.1 Loop Until FAIL and UNKNOWN Are Zero

**Impact: CRITICAL (convention 위반을 문서화만 하고 완료하는 것을 막음)**

semantic review에서 FAIL 또는 UNKNOWN이 하나라도 나오면 완료하지 않습니다. 수정하고, audit packet을 갱신하고, 같은 rule ids를 다시 review합니다. 예외가 필요하면 사용자에게 예외 근거와 제거 조건을 먼저 확인합니다.

반복 조건:

- FAIL: 구현 수정
- UNKNOWN: 증거 보강 또는 구현 수정
- exception: 사용자 승인 전 완료 금지
- PASS: evidence가 있는 경우에만 인정

**Incorrect (위반을 남기고 종료):**

```md
일부 helper 추출 경계는 애매하지만 추후 정리하면 됩니다.
```

**Correct (완료 차단):**

```md
Audit blocked:
- FAIL 1: shared formatter premature extraction
- UNKNOWN 1: post-select shaping layer responsibility
Action: route-local로 되돌리고 query select chain evidence 갱신 후 re-review.
```

### 5.2 Report the Final Verdict Matrix

**Impact: CRITICAL (사용자가 어떤 rule을 어떤 근거로 통과시켰는지 추적할 수 있게 함)**

완료 보고에는 convention audit 결과를 짧은 matrix로 포함합니다. 자동 검사와 semantic review를 구분하고, reviewer 사용 여부와 미실행 항목을 숨기지 않습니다.

필수 보고 항목:

- 적용한 companion skill
- audit packet 생성 방식
- reviewer 방식
- rule별 PASS/FAIL/UNKNOWN 개수
- FAIL/UNKNOWN이 0인지
- 예외 승인 여부
- 실행한 검증 명령

**Incorrect (검증 내용을 뭉뚱그림):**

```md
컨벤션 리뷰까지 마쳤습니다.
```

**Correct (최종 판정 추적 가능):**

```md
Convention audit:
- skills: convention-react, convention-css, convention-typescript
- packet: tools/conventions/check.ts --changed origin/dev
- reviewer: independent semantic reviewer
- verdict: PASS 14, FAIL 0, UNKNOWN 0, NOT_APPLICABLE 3
- exceptions: none
```

## 참고 자료

- https://react.dev
- https://www.typescriptlang.org/docs/
- https://developer.mozilla.org/en-US/docs/Web/CSS
