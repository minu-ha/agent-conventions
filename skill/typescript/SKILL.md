---
name: convention-typescript
description: Use when editing TypeScript or TSX modules, shared utilities, configs, types, helper boundaries, fallback handling, or JSDoc-heavy declarations.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TypeScript Convention Router

이 문서는 규칙집이 아니라 필요한 원문을 고르는 router다. 일반 작업에서 전체 handbook을 먼저 읽지 않는다.

## 1. Scope snapshot

수정 전에 요청, 계획된 파일, 현재 diff를 한 줄로 고정한다. `.ts`/`.tsx`, type·schema·config·API·helper, import/export, fallback, JSDoc 변경이면 이 skill을 활성화한다. React 경계나 CSS class contract까지 바꾸면 해당 companion skill도 별도로 활성화한다.

판정은 변경 semantic delta만 본다. 추가·삭제·이동·이름 변경·재선언 surface는 포함한다. read-only 문맥과 byte-equivalent로 따라온 내부 구문은 별도 rule 근거가 아니다.

## 2. Index scan

[RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 읽고 모든 local entry의 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. stable ID는 탐색 보조일 뿐 배제 근거가 아니다. 애매한 항목은 `Unknown`으로 둔다.

## 3. Digest-bound receipt

index의 `sha256` digest에 묶인 exact receipt를 유지한다.

```md
Activated: typescript, <companions>
Index: typescript@sha256:<digest>
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
