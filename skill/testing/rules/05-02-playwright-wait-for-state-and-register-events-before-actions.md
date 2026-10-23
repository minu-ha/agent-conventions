---
title: Wait for State and Register Events Before Actions
titleKo: 관찰 가능한 상태를 기다리고 이벤트 대기는 액션 전에 등록합니다
impact: HIGH
impactDescription: 임의의 대기 시간과 이벤트 등록 순서로 생기는 불안정한 실패를 줄입니다
appliesWhen:
  - 브라우저 테스트의 대기, 상태 단언, 요청, 다운로드, 팝업 이벤트 검사를 바꿀 때
tags: testing, playwright
---

## Wait for State and Register Events Before Actions

**Impact: HIGH (임의의 대기 시간과 이벤트 등록 순서로 생기는 불안정한 실패를 줄입니다)**

화면 상태는 await expect와 locator의 재시도 가능한 matcher로 기다립니다.
요청, 다운로드, 팝업처럼 놓칠 수 있는 이벤트는 그 이벤트를 발생시키는 액션 전에 대기를 등록합니다.

| 필요한 확인 | 방법 |
| --- | --- |
| 표시, 문구, 개수, URL | 해당 locator나 page의 비동기 matcher |
| DOM 밖의 관측값 | 상한이 있는 expect.poll 등 조건 반복 |
| 준비 이벤트가 없는 canvas | 렌더 완료 신호나 안정된 관측 조건과 시간 상한 |

임의의 sleep, networkidle, force 옵션으로 준비 상태를 대신하지 않습니다.
안정화에 필요한 반복 간격과 제품의 지연 시간 검증은 구분하고 실패 시 관측값을 남깁니다.

참고: [공식 문서](https://playwright.dev/docs/best-practices#use-web-first-assertions).

**Incorrect 1 (고정 시간 뒤에 한 번만 문구를 읽습니다):**

<<< ../examples/playwright-wait-for-state-and-register-events-before-actions/01-incorrect.test.ts

**Correct 1 (문구가 계약을 만족할 때까지 제한 시간 안에서 재시도합니다):**

<<< ../examples/playwright-wait-for-state-and-register-events-before-actions/02-correct.test.ts

**Correct (액션 전에 등록한 대기로 다운로드 이벤트를 놓치지 않습니다):**

<<< ../examples/playwright-wait-for-state-and-register-events-before-actions/03-correct.test.ts
