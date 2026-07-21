---
name: convention-react
description: Use when editing React or TSX components, screen files, local UI boundaries, handler flow, state/data flow, or React-adjacent TypeScript that shapes rendered behavior.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# React Convention Router

이 문서는 규칙집이 아니라 필요한 React 원문을 고르는 router다. 일반 작업에서 전체 handbook을 먼저 읽지 않는다.

## 1. Scope snapshot과 companion

수정 전에 요청, 계획 파일, 현재 diff를 한 줄로 고정한다. React component·TSX render, screen/route-local 경계, handler, state·query, React 인접 support code를 바꾸면 활성화한다.

React가 활성화되면 `convention-typescript`를 필수로 활성화한다. `class contract, stylesheet 또는 styling surface를 변경한다.`면 그때만 `convention-css`도 활성화하고, 이 조건이 없으면 CSS는 활성화하지 않는다. route/search/navigation이나 browser test surface는 해당 전용 skill을 별도로 판정한다.

## 2. Progressive index scan

모든 활성화된 skill은 먼저 자기 `SKILL.md`의 로딩 계약을 따른다. `metadata.json`이 `progressiveDisclosure: true`이고 `RULES_INDEX.md`가 있는 skill만 전체 index scan과 digest-bound receipt를 수행한다. non-progressive skill은 자기 `SKILL.md`가 지시하는 `AGENTS.md`와 rule 원문 로딩 계약을 따른다.

React를 포함한 모든 활성화된 progressive skill의 index를 처음부터 끝까지 읽고 각 local entry의 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. stable ID는 탐색 보조일 뿐 배제 근거가 아니다. 애매한 항목은 `Unknown`으로 둔다.

## 3. Digest-bound receipt

각 활성화된 progressive skill의 index마다 `sha256` digest에 묶인 exact receipt를 유지한다.

```md
Activated: react, typescript, <conditional companions>
Index: react@sha256:<digest>
Selected: <ordinal + stable ID>
Not applicable: <나머지 전체 ordinal>
Excluded groups: <N/A ordinal group>: <비어 있지 않은 scope-evidence 이유>
Unknown: <ordinal + stable ID 또는 none>
Expanded: <full rule을 추가로 읽은 ordinal + stable ID: 이유 또는 none>
```

모든 ordinal은 세 집합 중 정확히 하나에만 있어야 한다. exclusion group의 ordinal 합집합은 exact N/A set과 같아야 하고 이유는 비어 있으면 안 된다. `reviewWith`는 자동 선택이 아니라 재평가 신호다. target을 scope로 다시 판정하고 cross-skill target이면 companion 활성화도 재판정한다.

## 4. Read and implement

Selected와 Unknown은 stable ID와 같은 이름의 `contracts/<stable-id>.md`를 전부 읽는다. contract가 `CRITICAL`이면 contract가 연결한 `rules/*.md` full rule도 반드시 읽는다. non-CRITICAL도 exact syntax·예외 판단이 필요하거나 Unknown이 contract와 코드만으로 해소되지 않거나 audit PASS 근거가 부족하면 full rule로 확장한다. 확장한 ordinal·ID와 이유를 `Expanded`에 기록하고 Unknown은 완료 전 `none`으로 만든다. contract의 규범과 확장 원문의 예시를 구현·리뷰 기준으로 사용한다.

## 5. Scope drift

새 파일, component 경계, abstraction, handler/state/API, class/style surface가 생기면 scope snapshot부터 모든 활성화된 progressive skill의 index scan과 receipt를 다시 수행한다. non-progressive skill도 자기 로딩 계약의 재판정 절차를 따른다. digest가 달라져도 이전 receipt를 폐기한다.

## 6. Finish gate

마지막 diff 기준으로 `convention-audit`이 활성화된 progressive index를 독립 재선택하게 한다. digest, exact partition, exclusion evidence, selected contracts, `Expanded` full rules, non-progressive skill의 자체 finish gate와 검증 결과를 넘기고 `FAIL 0`, `UNKNOWN 0`일 때만 완료한다.

전체 [AGENTS.md](./AGENTS.md)는 사용자가 full handbook/onboarding을 명시적으로 요청했거나 generated index/contract 또는 필요한 rule 원문이 손상·누락되어 fallback이 필요할 때만 읽는 opt-in 문서다.
