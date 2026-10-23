---
title: Report Failures Flakes and Executed Scope
titleKo: 실행 범위와 실패 상태를 보존해 보고합니다
impact: HIGH
impactDescription: 미실행과 재시도 통과를 성공으로 섞거나 오래된 결과서를 새 근거로 쓰지 않습니다
appliesWhen:
  - 테스트 실행 결과, 커버리지, skip, retry, 결과서와 CI 종료 코드를 추가하거나 바꿀 때
tags: testing, verification
---

## Report Failures Flakes and Executed Scope

**Impact: HIGH (미실행과 재시도 통과를 성공으로 섞거나 오래된 결과서를 새 근거로 쓰지 않습니다)**

실행한 명령, 범위와 환경, 최초 통과, 재시도 통과, 실패, 미실행을 구분합니다.
재시도와 timeout을 늘리는 것만으로 불안정한 원인을 해결했다고 보고하지 않습니다.

| 결과 | 처리 |
| --- | --- |
| skip, fixme, 알려진 실패 | 이유와 추적 대상을 남기고 통과 수에 섞지 않습니다 |
| 결과서 생성 | 이번 실행의 결과만 사용하고 러너나 준비 단계의 실패 종료 코드를 보존합니다 |
| 커버리지 | 측정한 소스와 제외 범위, 수집기와 소스맵을 기록합니다 |

커버리지 비율은 검증의 충분성을 대신하지 않고 서로 다른 결과의 비율을 더하거나 평균내지 않습니다.
고정된 전역 비율보다 변경한 계약과 중요한 분기의 누락을 먼저 확인합니다.
테스트를 바꾸면 해당 범위와 프로젝트 필수 검사를 실행하고 미실행은 미실행으로 적습니다.
기계 검사가 통과해도 규칙 선택과 예제의 의미가 맞는지는 별도로 대조합니다.

참고: [공식 문서](https://playwright.dev/docs/test-retries).

**Incorrect 1 (재시도 통과와 미실행을 포함해 전체 성공으로 적습니다):**

<<< ../examples/verification-report-failures-flakes-and-executed-scope/01-incorrect.txt

**Correct 1 (실행 상태와 검증 범위를 구분해 남깁니다):**

<<< ../examples/verification-report-failures-flakes-and-executed-scope/02-correct.txt
