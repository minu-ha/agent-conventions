---
title: Use Semantic and Scoped Locators
titleKo: 의미와 범위가 분명한 locator를 사용합니다
impact: HIGH
impactDescription: DOM 순서와 서드파티 클래스 변경에 흔들리지 않고 의도한 요소를 조작합니다
appliesWhen:
  - Playwright의 요소 탐색, 필터, 클릭 대상 locator를 추가하거나 바꿀 때
tags: testing, playwright
---

## Use Semantic and Scoped Locators

**Impact: HIGH (DOM 순서와 서드파티 클래스 변경에 흔들리지 않고 의도한 요소를 조작합니다)**

role과 접근 가능한 이름, label로 요소를 찾고 모달이나 구역 안으로 범위를 좁힙니다.
같은 이름이 여러 개면 정확한 이름과 소유 구역으로 구분하며 last나 nth로 모호함을 숨기지 않습니다.

순서 자체가 계약인 행과 셀에는 인덱스를 사용할 수 있습니다.
텍스트나 의미로 찾을 수 없는 canvas 등에는 명시적인 test id를 사용합니다.
CSS 클래스와 좌표는 스타일이나 렌더 위치 자체를 검사할 때 필요한 범위에서 사용하고 일반 클릭의 기본 선택자로 삼지
않습니다.
키보드와 포커스가 계약인 요소는 해당 조작으로도 확인합니다.

참고: [공식 문서](https://playwright.dev/docs/locators).

**Incorrect 1 (클래스와 마지막 버튼이라는 우연한 순서로 선택합니다):**

<<< ../examples/playwright-use-semantic-and-scoped-locators/01-incorrect.test.ts

**Correct 1 (이름 붙은 모달 안에서 저장 버튼을 선택합니다):**

<<< ../examples/playwright-use-semantic-and-scoped-locators/02-correct.test.ts
