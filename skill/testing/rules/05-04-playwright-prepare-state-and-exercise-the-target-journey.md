---
title: Prepare State and Exercise the Target Journey
titleKo: 사전조건을 직접 준비하고 검증할 여정은 실제로 수행합니다
impact: HIGH
impactDescription: 불필요한 탐색을 줄이면서 라우팅과 상태 전달의 연결을 실제로 검증합니다
appliesWhen:
  - 브라우저 테스트의 초기 URL, 인증 준비, 이동 경로, 업로드나 다운로드 여정을 바꿀 때
tags: testing, playwright
---

## Prepare State and Exercise the Target Journey

**Impact: HIGH (불필요한 탐색을 줄이면서 라우팅과 상태 전달의 연결을 실제로 검증합니다)**

검증 전 사전조건은 fixture, API, 딥링크로 직접 준비할 수 있습니다.
검증 대상인 클릭, 이동, URL 상태 전달은 실제 UI와 앱 진입점을 통과합니다.

목록에서 상세로 이동하는 계약이면 상세 URL로 바로 여는 것으로 대신하지 않습니다.
서버 로그인 자체가 대상이 아니면 매 테스트마다 로그인 UI를 반복하지 않습니다.
뒤로가기, 새로고침, 지속성이 대상이면 그 과정에서 필요한 저장소를 지우거나 라우터를 새로 만들지 않습니다.
통합 테스트는 필요한 실제 provider와 라우터 계약을 포함하고 자체 harness가 대신하는 경계를 기록합니다.

참고: [공식 문서](https://playwright.dev/docs/best-practices).

**Incorrect 1 (상세 URL로 바로 열어 목록 링크의 연결을 건너뜁니다):**

<<< ../examples/playwright-prepare-state-and-exercise-the-target-journey/01-incorrect.test.ts

**Correct 1 (사전조건인 목록 URL부터 검증할 링크로 이동합니다):**

<<< ../examples/playwright-prepare-state-and-exercise-the-target-journey/02-correct.test.ts
