---
title: Align Visual Environment and Matcher Options
titleKo: 시각 비교 환경과 matcher 설정을 맞춥니다
impact: HIGH
impactDescription: 렌더 환경 차이를 통제하고 허용치가 실제 비교에 적용되게 합니다
appliesWhen:
  - 이미지 기준값, 캡처 대상, 렌더 안정화, 비교 허용치나 matcher 설정을 바꿀 때
tags: testing, baseline
---

## Align Visual Environment and Matcher Options

**Impact: HIGH (렌더 환경 차이를 통제하고 허용치가 실제 비교에 적용되게 합니다)**

시각 비교는 기준값과 같은 브라우저, OS, 폰트, viewport 등 필요한 렌더 환경에서 실행합니다.
데이터와 시각을 통제하고 이미지가 안정된 뒤 필요한 영역만 비교합니다.

| 실제 비교 | 적용할 설정 |
| --- | --- |
| page나 locator의 toHaveScreenshot | expect.toHaveScreenshot |
| 이미지 Buffer의 toMatchSnapshot | expect.toMatchSnapshot 또는 그 호출의 옵션 |

두 matcher의 허용치 설정은 서로 대신 적용되지 않습니다.
허용치는 관측한 렌더 오차와 중요한 차이를 검출할 수 있는 근거로 정합니다.
canvas의 사용자 조작이나 레이아웃 자체가 대상이면 이미지 안정화와 DOM, 위치 단언을 함께 선택합니다.
기준 이미지는 변경 결과를 직접 보고 승인하며 플랫폼별 기준의 필요성은 실행 환경에 맞게 정합니다.

참고: [공식 문서](https://playwright.dev/docs/api/class-testconfig#test-config-expect).

**Incorrect 1 (Buffer 비교와 다른 matcher에 허용치를 설정합니다):**

<<< ../examples/baseline-align-visual-environment-and-matcher-options/01-incorrect.config.ts

**Correct 1 (Buffer를 비교하는 matcher에 같은 허용치를 설정합니다):**

<<< ../examples/baseline-align-visual-environment-and-matcher-options/02-correct.config.ts

**Correct (데이터와 렌더 완료를 확인한 이미지를 같은 matcher로 비교합니다):**

<<< ../examples/baseline-align-visual-environment-and-matcher-options/03-correct.test.ts
