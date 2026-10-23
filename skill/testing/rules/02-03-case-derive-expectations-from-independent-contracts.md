---
title: Derive Expectations from Independent Contracts
titleKo: 기대값은 구현과 독립된 계약에서 정합니다
impact: HIGH
impactDescription: 구현과 같은 오류를 기대값에서도 반복해 통과하는 테스트를 막습니다
appliesWhen:
  - 기대값을 추가, 변경하거나 테스트 안에서 기대 결과를 계산할 때
tags: testing, case
---

## Derive Expectations from Independent Contracts

**Impact: HIGH (구현과 같은 오류를 기대값에서도 반복해 통과하는 테스트를 막습니다)**

기대값은 요구사항, 직접 확인할 수 있는 작은 예제, 명시적인 불변 관계에서 정합니다.
검증 대상 함수를 다시 호출하거나 같은 알고리즘과 제품 상수를 그대로 복사해 기대값을 만들지 않습니다.

구체적인 값이 계약이면 그 값과 구조를 확인합니다.
존재나 참 여부가 계약일 때만 존재 단언을 사용합니다.
관계가 계약이면 정렬 순서, 합계 보존처럼 그 관계와 실패 입력을 분명히 드러냅니다.
현재 구현을 정답으로 받아 기준값을 갱신하기 전에 변경 의도를 확인합니다.

참고: [공식 문서](https://vitest.dev/guide/learn/writing-tests-with-ai).

**Incorrect 1 (검증 대상 함수를 기대값에서도 호출합니다):**

<<< ../examples/case-derive-expectations-from-independent-contracts/01-incorrect.test.ts

**Correct 1 (직접 확인한 출력값과 비교합니다):**

<<< ../examples/case-derive-expectations-from-independent-contracts/02-correct.test.ts
