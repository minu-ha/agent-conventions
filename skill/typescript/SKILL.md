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

## 2. Index scan

[RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 읽고 모든 local entry의 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. title/tag는 탐색 보조일 뿐 배제 근거가 아니다. 애매한 항목은 `Unknown`으로 둔다.

## 3. Digest-bound receipt

index의 `sha256` digest에 묶인 exact receipt를 유지한다.

```md
Activated: typescript, <companions>
Index: typescript@sha256:<digest>
Selected: <ordinal + stable ID>
Not applicable: <나머지 전체 ordinal>
Excluded groups: <N/A ordinal group>: <비어 있지 않은 scope-evidence 이유>
Unknown: <ordinal + stable ID 또는 none>
```

모든 ordinal은 `Selected`, `Not applicable`, `Unknown` 중 정확히 하나에만 있어야 한다. exclusion group의 ordinal 합집합은 exact N/A set과 같아야 하며 이유는 비어 있으면 안 된다. `reviewWith`는 자동 선택 명령이 아니라 재평가 신호다. 각 target을 scope로 다시 판정해 Selected 또는 근거가 있는 N/A에 넣고, cross-skill target이면 companion 활성화도 다시 판정한다.

## 4. Read and implement

Selected와 Unknown의 `rules/*.md` 원문을 전부 읽는다. Unknown은 원문과 실제 코드로 적용 여부를 해소해 완료 전 `none`으로 만든다. 원문의 Incorrect/Correct와 owner 계약을 구현 및 리뷰 기준으로 사용한다.

## 5. Scope drift

새 파일, abstraction, import, type/API, fallback, 주석 surface가 생기면 scope snapshot부터 index 전체 scan과 receipt를 다시 수행한다. digest가 달라져도 이전 receipt를 폐기한다.

## 6. Finish gate

마지막 diff 기준으로 `convention-audit`이 index를 독립 재선택하게 한다. digest, exact partition, exclusion evidence, 선택 원문, 검증 결과를 넘기고 `FAIL 0`, `UNKNOWN 0`일 때만 완료한다.

전체 [AGENTS.md](./AGENTS.md)는 사용자가 full handbook/onboarding을 명시적으로 요청했거나 index 생성물이 손상되어 fallback이 필요할 때만 읽는다.
