---
title: Control Time Randomness and Environment
titleKo: 시간과 환경을 명시적인 테스트 입력으로 통제합니다
impact: HIGH
impactDescription: 실행 날짜와 실행 위치가 바뀌어도 같은 입력이 같은 결과를 냅니다
appliesWhen:
  - 테스트가 현재 시각, 난수, 타임존, 로케일, viewport를 읽는 코드나 설정을 추가하거나 바꿀 때
requiresSelected: data-isolate-and-restore-test-state
tags: testing, data
---

## Control Time Randomness and Environment

**Impact: HIGH (실행 날짜와 실행 위치가 바뀌어도 같은 입력이 같은 결과를 냅니다)**

결과에 영향을 주는 시각과 환경을 테스트 입력으로 고정합니다.
날짜 경계는 오프셋이 있는 기준 시각과 표시 타임존을 함께 정하고 모듈이 처음 값을 읽기 전에 적용합니다.

| 실행 위치 | 처리 |
| --- | --- |
| Vitest의 현재 날짜 | Date만 필요하면 Date를 대체하고 종료 후 복구합니다 |
| 브라우저 날짜 | 타이머를 진행시킬 때는 Playwright의 setFixedTime을 사용합니다 |
| Node에서 만드는 브라우저 테스트 응답 | 같은 기준 시각을 생성기에 전달합니다. 브라우저 clock이 Node의 Date를 바꾸지는 않습니다 |
| 로케일, 시간대, 화면 폭 | 계약에 영향을 줄 때 러너 설정으로 명시합니다 |

타이머 동작 자체를 검증할 때만 시간을 수동으로 진행합니다.
공유 프로세스의 시간대나 전역 난수 상태를 병렬 테스트가 서로 바꾸지 않게 합니다.

참고: [공식 문서](https://playwright.dev/docs/clock).

**Incorrect 1 (실행하는 날의 날짜를 입력과 기대값에서 함께 읽습니다):**

<<< ../examples/data-control-time-randomness-and-environment/01-incorrect.test.ts

**Correct 1 (Date만 고정하고 종료 시 원래 시간으로 복구합니다):**

<<< ../examples/data-control-time-randomness-and-environment/02-correct.test.ts

**Correct (브라우저 날짜와 Node 응답에 같은 시나리오 입력을 전달합니다):**

<<< ../examples/data-control-time-randomness-and-environment/03-correct.test.ts
