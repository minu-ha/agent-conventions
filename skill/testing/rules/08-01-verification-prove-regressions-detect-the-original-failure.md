---
title: Prove Regressions Detect the Original Failure
titleKo: 회귀 테스트가 원래 결함을 검출하는지 확인합니다
impact: HIGH
impactDescription: 수정한 구현에서 통과만 하는 테스트와 결함을 검출하는 테스트를 구분합니다
appliesWhen:
  - 버그 재현 테스트를 추가하거나 기존 실패 테스트와 기준값을 수정할 때
tags: testing, verification
---

## Prove Regressions Detect the Original Failure

**Impact: HIGH (수정한 구현에서 통과만 하는 테스트와 결함을 검출하는 테스트를 구분합니다)**

버그를 막는 테스트는 원래 결함이 있는 상태에서 그 결함 때문에 실패하고 수정 후 통과하는지 확인합니다.
가져오기 오류, 서버 시작 실패처럼 다른 원인의 실패를 재현 근거로 삼지 않습니다.

이미 수정했다면 격리된 임시 변경이나 별도 환경에서 결함을 재현하고 정상 상태를 복구합니다.
동시 작업을 되돌리거나 사용자의 변경을 지우지 않습니다.
실패를 재현할 수 없으면 확인한 범위와 남은 불확실성을 그대로 보고합니다.
프로젝트와 요청이 정한 테스트 범위를 따르며 이 규칙을 모든 변경의 일괄 TDD 의무로 넓히지 않습니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (호출이 예외를 던지지 않는다는 것만 확인합니다):**

<<< ../examples/verification-prove-regressions-detect-the-original-failure/01-incorrect.test.ts

**Correct 1 (원래 결함인 0의 빈 값 처리를 구체적인 결과로 검출합니다):**

<<< ../examples/verification-prove-regressions-detect-the-original-failure/02-correct.test.ts
