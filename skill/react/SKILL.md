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

판정은 변경 semantic delta만 본다. 추가·삭제·이동·이름 변경·재선언 surface는 포함한다. read-only 문맥과 owner 이동에 byte-equivalent로 따라온 import, `className`, style import는 별도 rule·CSS 근거가 아니다.

React가 활성화되면 `convention-typescript`를 필수로 활성화한다. `class contract, stylesheet 또는 styling surface를 변경한다.`면 그때만 `convention-css`도 활성화하고, 이 조건이 없으면 CSS는 활성화하지 않는다. route/search/navigation이나 browser test surface는 해당 전용 skill을 별도로 판정한다.

## 2. Progressive index scan

모든 활성 skill은 자기 `SKILL.md`의 load contract를 따른다. `progressiveDisclosure: true`와 `RULES_INDEX.md`가 있는 skill만 전체 index scan과 digest receipt를 수행하고, non-progressive skill은 자체 계약을 따른다.

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

각 ordinal은 셋 중 하나다. exclusion group 합집합은 exact N/A이고 이유는 필수다. `reviewWith`는 재평가 신호이며, `completionGate`는 완료 receipt에서 Selected다.

## 4. Read and implement

Selected/Unknown의 matching contract를 모두 읽고, `CRITICAL`은 full rule도 즉시 읽는다. 다른 full rule은 exact 판단·Unknown·audit에 필요할 때만 `Expanded: ID: 이유`와 함께 읽는다. Unknown을 먼저 해소한다. final N/A는 `requiresSelected`를 전파하지 않고, final Selected의 target은 companion까지 활성화해 Selected로 고정한다. 필수 변경만 scope evidence에 더한 뒤 새 surface·companion·Selected가 생기면 index와 `reviewWith`를 다시 판정한다. 고정점에서 Selected contract와 Expanded 원문만 구현·리뷰한다.

## 5. Scope drift

`scope drift`면 scope snapshot부터 모든 활성 progressive index의 scan/receipt를 다시 하고 stale digest receipt를 폐기한다. non-progressive skill도 자체 재판정한다.

## 6. Finish gate

`convention-audit`이 마지막 diff로 활성 progressive index를 독립 재선택한다. digest, receipt, evidence, `Expanded`와 검증을 넘기고 `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md)는 full handbook 요청이나 index/contract/필요 rule 손상·누락으로 fallback할 때만 읽는다.
