---
title: Compose Owned State with Real Providers
titleKo: Story는 실제 화면과 provider로 재현할 상태를 구성합니다
impact: HIGH
impactDescription: 화면의 실제 처리 흐름을 유지하면서 상태를 작게 재현합니다
appliesWhen:
  - story export, harness의 provider, 초기 라우트, props와 콜백 구성을 만들거나 바꿀 때
tags: testing, story, react
---

## Compose Owned State with Real Providers

**Impact: HIGH (화면의 실제 처리 흐름을 유지하면서 상태를 작게 재현합니다)**

story는 화면, 위젯의 특정 상태를 만드는 브라우저 지원 코드입니다.
실제 컴포넌트와 provider를 사용하고 hook, mapper를 대체해 정답 화면을 만들지 않습니다.
앱 초기 설정은 gallery가 공통으로 맡거나 story가 맡되 provider를 중복 설치하지 않습니다.

| 구성 | 책임 |
| --- | --- |
| named export | 기본, 긴 이름, 선택 상태처럼 의미 있는 재현 상태 하나 |
| props | 같은 상태의 값 차이. Node에서 넘길 때 직렬화 가능해야 합니다 |
| router | 실제로 읽는 경로, params, search와 이동에 필요한 경계 |
| provider | 앱과 같은 query, theme, modal 등 실제 문맥 |
| gallery | story 발견, mount, update, unmount와 렌더 실패의 전파 |

상태를 가진 page 소유자와 우리 동작이 있는 위젯부터 story를 만듭니다.
서드파티 자체의 속성이나 단순 래퍼를 모두 별도 story로 만들지 않습니다.
콜백은 브라우저 story 안에서 만들고 결과를 DOM, URL 등 테스트가 볼 수 있는 값으로 남깁니다.
Node spy나 함수를 props로 넘겨 브라우저에서 실행될 것으로 가정하지 않습니다.

story 파일은 앱의 production 진입 경로로 가져오지 않고 테스트 gallery에서만 발견합니다.
하나의 story에 모든 앱 여정을 붙이지 않고 세션과 라우트 트리 자체가 대상일 때만 범위를 넓힙니다.
storybook은 선택 사항이며 현재 프로젝트의 gallery와 story ID 계약을 유지합니다.

참고: [Playwright의 story와 gallery](https://playwright.dev/docs/test-components).

**Incorrect 1 (실제 화면 대신 기대 문구만 렌더합니다):**

<<< ../examples/story-compose-owned-state-with-real-providers/01-incorrect.story.tsx

**Correct 1 (실제 화면을 앱 provider와 초기 라우트 안에 렌더합니다):**

<<< ../examples/story-compose-owned-state-with-real-providers/02-correct.story.tsx
