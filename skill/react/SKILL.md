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

각 ordinal은 Selected/N/A/Unknown 중 하나다. exclusion group ordinal의 합집합은 exact N/A이고 이유는 비어 있으면 안 된다. `reviewWith`는 재평가 신호다. `completionGate`는 완료 receipt에서 Selected이며 N/A 불가다. target과 cross-skill companion을 판정한다.

## 4. Read and implement

Selected와 Unknown은 stable ID와 같은 `contracts/<stable-id>.md`를 전부 읽는다. `CRITICAL`이면 연결한 full rule도 반드시 읽는다. 그 밖의 full rule은 exact 판단·Unknown 해소·audit 근거에 필요할 때만 읽고 `Expanded: ID: 이유`를 남긴다. Unknown을 Selected/N/A로 먼저 해소하고 N/A로 해소한 contract의 `requiresSelected`는 적용하지 않는다. Selected로 확정한 contract의 `requiresSelected` target은 companion까지 활성화해 즉시 Selected로 두며 N/A 불가다. Selected contract의 필수 변경만 scope evidence에 합치고 예시·선택적 대안·해소되지 않은 Unknown의 가상 변경은 제외한다. 새 surface·companion·Selected가 생기면 활성 index와 `reviewWith`를 재판정하고 새 contract를 읽는다. 활성 skill·partition·scope evidence의 고정점까지 반복하고 Selected contract와 Expanded 원문만 구현·리뷰 기준으로 쓴다.

## 5. Scope drift

`scope drift`면 scope snapshot부터 모든 활성 progressive index의 scan/receipt를 다시 하고 stale digest receipt를 폐기한다. non-progressive skill도 자체 재판정한다.

## 6. Finish gate

`convention-audit`이 마지막 diff로 활성 progressive index를 독립 재선택한다. digest, receipt, evidence, `Expanded`와 검증을 넘기고 `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md)는 full handbook 요청이나 index/contract/필요 rule 손상·누락으로 fallback할 때만 읽는다.
