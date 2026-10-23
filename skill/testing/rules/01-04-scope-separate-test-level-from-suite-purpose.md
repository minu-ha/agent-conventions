---
title: Separate Test Level from Suite Purpose
titleKo: 테스트 층과 smoke, sanity의 선별 목적을 구분합니다
impact: HIGH
impactDescription: 실행 경계와 선별 목적을 나눠 필요한 검증을 빠짐없이 선택합니다
appliesWhen:
  - smoke, sanity, regression의 선정 기준, 태그, 실행 명령을 정하거나 바꿀 때
tags: testing, scope, smoke, sanity
---

## Separate Test Level from Suite Purpose

**Impact: HIGH (실행 경계와 선별 목적을 나눠 필요한 검증을 빠짐없이 선택합니다)**

unit, integration, E2E는 실행 경계이고 smoke, sanity, regression은 실행 목적과 선택 범위입니다.
이름 하나를 같은 층 목록에 섞거나 빠르게 끝났다는 이유로 smoke라고 부르지 않습니다.
아래 선별 기준을 팀의 기본값으로 쓰고 프로젝트의 기존 정의가 다르면 그 계약을 명시합니다.

| 목적 | 고르는 기준 | 통과가 말하는 범위 |
| --- | --- | --- |
| smoke | 배포한 산출물의 진입, 핵심 자원, 대표 흐름 | 다음 검증을 진행할 최소 상태 |
| sanity | 변경점, 결함 수정과 직접 연결된 인접 흐름 | 해당 변경의 좁은 정상 여부 |
| regression | 기존 계약과 실패 이력을 위험에 따라 선택 | 실행한 기존 기능의 회귀 여부 |

smoke는 모든 화면을 순회하지 않고, 배포 환경에서 실행할 수 있는 안전한 대표 사례를 고릅니다.
sanity는 수정 사례 하나에 그치지 않고 끊어질 수 있는 연결과 인접 경계도 포함합니다.
골든과 시각 비교는 비교 방식, negative는 시나리오의 종류이므로 필요한 층에서 함께 씁니다.

태그와 우선순위는 별개입니다. 중요도가 높다고 모두 smoke로 지정하지 않습니다.
기존 사례를 태그나 명시적 목록으로 골라 실행하고 복사해 별도 테스트를 만들지 않습니다.
선별 결과가 0건이면 통과로 보고하지 않으며, mock과 실제 서버의 실행 범위도 함께 적습니다.

참고: [Playwright 태그와 annotation](https://playwright.dev/docs/test-annotations).

**Incorrect 1 (순수 포맷 검사를 배포 smoke의 근거로 삼습니다):**

<<< ../examples/scope-separate-test-level-from-suite-purpose/01-incorrect.test.ts

**Correct 1 (실제 앱의 대표 진입 사례를 smoke로 고릅니다):**

<<< ../examples/scope-separate-test-level-from-suite-purpose/02-correct.test.ts

**Correct (같은 사례를 태그로 선별하고 수집 결과를 먼저 확인합니다):**

<<< ../examples/scope-separate-test-level-from-suite-purpose/03-correct.txt
