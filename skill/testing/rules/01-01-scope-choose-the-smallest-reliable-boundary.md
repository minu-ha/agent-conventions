---
title: Choose the Smallest Reliable Test Boundary
titleKo: 신뢰를 얻을 수 있는 가장 작은 범위를 선택합니다
impact: HIGH
impactDescription: 검증에 필요한 실제 경계를 유지하면서 실행 비용과 실패 원인을 줄입니다
appliesWhen:
  - 새 테스트의 실행 환경이나 단위, 통합, E2E 범위를 정할 때
  - 제외: 기존 테스트의 기대 문구만 고치는 경우
tags: testing, scope
---

## Choose the Smallest Reliable Test Boundary

**Impact: HIGH (검증에 필요한 실제 경계를 유지하면서 실행 비용과 실패 원인을 줄입니다)**

검증할 계약을 먼저 적고 그 계약이 실제로 실행되는 가장 작은 범위를 선택합니다.
러너 이름이나 화면 수로 테스트 층을 정하지 않습니다.

| 검증할 계약 | 선택 기준 |
| --- | --- |
| 계산, 변환, 정렬, 입력 판정 | DOM 없이 실제 함수를 실행합니다 |
| 응답에 따른 화면 상태, provider와 화면의 연결 | 필요한 컴포넌트와 실제 provider를 함께 실행합니다 |
| 앱 진입, 라우팅, 세션 전달, 파일 처리 여정 | 앱 전체의 해당 경계를 통과합니다 |
| 서버 인증, 저장, 응답 계약 | 실제 서버를 포함한 별도 검증이 필요합니다 |

레이아웃, 측정, 스크롤, canvas처럼 브라우저 동작이 계약이면 실제 브라우저를 사용합니다.
단순 래퍼나 서드파티 자체의 동작을 반복하는 테스트는 추가하지 않습니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (브라우저 전체에서 숫자 포맷만 확인합니다):**

<<< ../examples/scope-choose-the-smallest-reliable-boundary/01-incorrect.test.ts

**Correct 1 (실제 포맷 함수만 실행합니다):**

<<< ../examples/scope-choose-the-smallest-reliable-boundary/02-correct.test.ts
