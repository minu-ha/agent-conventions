---
name: convention-typescript
description: Use when editing TypeScript or TSX modules, types, configs, API or helper contracts, fallbacks, imports, exports, or JSDoc.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TypeScript Convention Router

## 1. Scope snapshot

요청·계획·diff의 `.ts`/`.tsx`·type·schema·config·API·helper·import/export·fallback·JSDoc 변경 semantic delta만 판정한다. 추가·삭제·이동·이름 변경·재선언은 포함하고 read-only·byte-equivalent 이동은 제외한다. 이름·shape·동작이 같은 이동은 diff의 삭제+추가를 별도 변경으로 다시 세지 않는다. 단, byte-equivalent named shape의 새 callable input/output 역할은 semantic delta다. N/A rule의 optional pattern으로 자가 활성화하지 말고 최소 semantic patch만 구현한다. React/CSS 경계면 companion도 활성화한다. 판정 직후 수정 전 범위를 scope snapshot으로 고정한다.

## 2. Index scan

[RULES_INDEX.md](./RULES_INDEX.md) 전체 scan: 모든 `appliesWhen`을 scope evidence와 대조하고 첫 match에서 절대 멈추지 않는다. 애매하면 `Unknown`이다.

## 3. Digest-bound receipt

index `sha256` receipt에 `Activated/Index/Selected/Not applicable/Excluded groups/Unknown/Expanded`를 기록한다. Selected/Unknown은 ordinal+stable ID, N/A는 ordinal exact set이다. Selected/N/A/Unknown은 disjoint하며 전체 ordinal을 exact partition한다. exclusion group의 ordinal 합집합은 exact N/A이며 이유는 비어 있으면 안 된다. `reviewWith`는 재평가 신호, `completionGate`는 완료 시 Selected이며 N/A 불가다.

## 4. Read and implement

Selected와 Unknown의 stable ID에 맞는 `contracts/<stable-id>.md`를 전부 읽는다. `CRITICAL`이면 matching full rule도 반드시 읽는다. 그 외는 exact·Unknown·audit 때 이유와 함께 확장한다. Unknown은 Selected/N/A로 먼저 해소하고 N/A의 `requiresSelected`는 적용하지 않는다. Selected로 확정한 contract의 `requiresSelected` target은 companion 활성화 후 즉시 Selected이며 N/A 불가다. Selected contract의 필수 변경만 scope evidence다. 예시·선택적 대안·해소되지 않은 Unknown의 가상 변경은 제외한다. 새 surface·companion·Selected·`reviewWith`면 고정점까지 반복한다. 고정점의 Selected contract와 Expanded 원문만 구현·리뷰 기준이다.

## 5. Scope drift

scope drift면 snapshot부터 activation을 재판정하고 활성 progressive index를 재scan하며 stale receipt를 폐기한다.

## 6. Finish gate

digest-bound implementer receipt·Expanded·evidence·검증을 sealed comparison용으로 audit에 넘긴 뒤, 활성 progressive index를 `convention-audit`이 독립 재선택한다. `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md) full handbook은 명시적으로 요청하거나 index/contract/필요 rule 손상·누락 fallback 때만 읽는다.
