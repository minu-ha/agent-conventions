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

모든 ordinal은 `Selected`, `Not applicable`, `Unknown` 중 정확히 하나에만 있어야 한다. exclusion group의 ordinal 합집합은 exact N/A set과 같아야 하며 이유는 비어 있으면 안 된다. `reviewWith`는 자동 선택 명령이 아니라 재평가 신호다. 각 target을 scope로 다시 판정해 세 집합 중 하나에 넣고, cross-skill target이면 companion 활성화도 다시 판정한다. `Unknown`은 contract/full-rule 증거로 완료 전에 해소한다.

## 4. Read and implement

Selected와 Unknown은 stable ID와 같은 이름의 `contracts/<stable-id>.md`를 전부 읽는다. contract가 `CRITICAL`이면 contract가 연결한 `rules/*.md` full rule도 반드시 읽는다. non-CRITICAL도 exact syntax·예외 판단이 필요하거나 Unknown이 contract와 코드만으로 해소되지 않거나 audit PASS 근거가 부족하면 full rule로 확장한다. 확장한 ordinal·ID와 이유를 `Expanded`에 기록하고 Unknown은 완료 전 `none`으로 만든다. contract의 규범과 확장 원문의 예시를 구현·리뷰 기준으로 사용한다.

## 5. Scope drift

새 파일, abstraction, import, type/API, fallback, 주석 surface가 생기면 scope snapshot부터 index 전체 scan과 receipt를 다시 수행한다. digest가 달라져도 이전 receipt를 폐기한다.

## 6. Finish gate

마지막 diff 기준으로 `convention-audit`이 index를 독립 재선택하게 한다. digest, exact partition, exclusion evidence, selected contracts, `Expanded` full rules, 검증 결과를 넘기고 `FAIL 0`, `UNKNOWN 0`일 때만 완료한다.

전체 [AGENTS.md](./AGENTS.md)는 사용자가 full handbook/onboarding을 명시적으로 요청했거나 generated index/contract 또는 필요한 rule 원문이 손상·누락되어 fallback이 필요할 때만 읽는다.
