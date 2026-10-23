---
title: Cover Relevant States and Boundaries
titleKo: 계약에 해당하는 상태와 경계값을 선택합니다
impact: HIGH
impactDescription: 정상 경로만 통과하는 테스트에서 빠지기 쉬운 회귀를 검출합니다
appliesWhen:
  - 새 기능의 테스트 사례를 고르거나 입력 범위, 비동기 상태, 오류 처리를 변경할 때
tags: testing, case
---

## Cover Relevant States and Boundaries

**Impact: HIGH (정상 경로만 통과하는 테스트에서 빠지기 쉬운 회귀를 검출합니다)**

변경한 계약에 해당하는 상태와 경계값을 고릅니다.
가능한 모든 값을 늘어놓거나 타입이 보장하는 내부 입력에 임의의 잘못된 값을 넣지 않습니다.

| 계약 | 검토할 사례 |
| --- | --- |
| 범위, 반올림, 날짜 | 하한과 상한의 안팎, 0, 음수, 월말처럼 판정이 바뀌는 값 |
| 목록, 선택 | 정상, 0건, 선택 없음, 마지막 항목 처리 |
| 비동기 화면 | 대기, 성공, 오류, 계약에 있는 재시도와 부분 실패 |
| 입력, 상호작용 | 유효성, 비활성화, 키보드와 포커스 등 직접 구현한 동작 |

0건인 성공 응답과 요청 실패는 별개 상태로 봅니다.
오류 코드와 경계 조합은 실제 처리 분기가 있는 것을 선택하며 모든 상태 코드의 일괄 테스트를 요구하지 않습니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (양수 정상 입력만 확인합니다):**

<<< ../examples/case-cover-relevant-states-and-boundaries/01-incorrect.test.ts

**Correct 1 (0과 빈 값의 서로 다른 계약을 이름별로 확인합니다):**

<<< ../examples/case-cover-relevant-states-and-boundaries/02-correct.test.ts
