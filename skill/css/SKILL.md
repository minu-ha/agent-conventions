---
name: convention-css
description: Use when editing CSS files, TSX className composition, wrapper-based third-party DOM styling, selector depth, design tokens, or deciding between plain CSS and CSS Modules.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# CSS Convention Router

이 문서는 규칙집이 아니라 필요한 CSS 원문을 고르는 router다. 일반 작업에서 전체 handbook을 먼저 읽지 않는다.

## 1. Scope snapshot

수정 전에 요청, 계획된 파일, 현재 diff를 한 줄로 고정한다. stylesheet, selector, token·CSS variable, `className` contract, visual styling을 만들거나 바꾸면 이 skill을 활성화한다.

판정은 변경 semantic delta만 본다. 추가·삭제·이동·이름 변경·재선언 surface는 포함한다. TSX owner 이동에 byte-equivalent로 따라온 `className`, style import, 기존 stylesheet는 CSS 근거가 아니다.

TSX의 component 구조·render·state·handler 자체는 `convention-react`로 보내고, TypeScript type·import·helper 계약은 `convention-typescript`로 보낸다. 특히 `TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다.`면 conditional TypeScript companion을 활성화한다. 순수 CSS 작업에는 TypeScript를 자동 활성화하지 않는다.

## 2. Index scan

[RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 읽고 모든 local entry의 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. stable ID는 탐색 보조일 뿐 배제 근거가 아니다. 애매한 항목은 `Unknown`으로 둔다.

## 3. Digest-bound receipt

index의 `sha256` digest에 묶인 exact receipt를 유지한다.

```md
Activated: css, <conditional companions>
Index: css@sha256:<digest>
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

`scope drift`면 scope snapshot부터 활성 progressive index scan/receipt를 다시 하고 stale digest receipt를 폐기한다.

## 6. Finish gate

`convention-audit`이 마지막 diff로 활성 progressive index를 독립 재선택한다. digest, receipt, evidence, `Expanded`와 검증을 넘기고 `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md)는 full handbook 요청이나 index/contract/필요 rule 손상·누락으로 fallback할 때만 읽는다.
