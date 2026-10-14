---
title: Use useEffectEvent for Non-reactive Effect Callbacks
titleKo: 비반응형 이펙트 콜백은 `useEffectEvent`로 분리합니다
impact: MEDIUM
impactDescription: 콜백은 최신 값을 읽고 이펙트는 구독 조건의 변화에만 반응합니다
appliesWhen:
  - 구독 이펙트가 최신 프롭, 상태 콜백을 읽어야 할 때
  - ref 동기화 우회, 의존성 재설치, `useEffectEvent`를 추가, 변경할 때
reviewWith: >-
  docs-require-jsdoc-on-key-declarations, events-curry-extra-handler-arguments,
  events-run-user-actions-in-handlers-not-effects
tags: state, effects
---

## Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM (콜백은 최신 값을 읽고 이펙트는 구독 조건의 변화에만 반응합니다)**

구독 이펙트의 콜백이 최신 프롭스, 상태를 읽되 그 값 때문에 재구독할 필요가 없다면 `useEffectEvent`를 씁니다.
연결 대상, 구독 조건처럼 바뀌면 재설치해야 하는 값은 이펙트 의존성에 남깁니다.

| 조건 | 처리 |
| --- | --- |
| React 19.2 이상 | 비반응형 콜백에 `ref` 우회 대신 `useEffectEvent`를 씁니다 |
| React 19.2 미만 | 의존성에 따른 재구독을 먼저 검토하고, 최신 콜백만 바꿔야 할 때 `ref` 동기화를 검토합니다 |
| 클릭, 제출 등 사용자 액션 | 이름 붙인 핸들러에 둡니다. 이펙트로 옮기지 않습니다 |
| Effect Event 호출 | 같은 컴포넌트의 이펙트나 다른 Effect Event 안에서만 호출합니다 |
| Effect Event 전달 | 다른 컴포넌트, 훅, JSX 이벤트 프롭에 넘기지 않습니다 |

반환 함수는 참조 동일성을 보장하지 않으며 이펙트 의존성에 넣지 않습니다.
의존성 경고를 없애려고 반응해야 할 값까지 감싸지 않습니다.
`useEffectEvent`를 인식하는 최신 `eslint-plugin-react-hooks`와 `biome`을 쓰지 않으면
Correct 예제가 훅 규칙 위반으로 표시됩니다.

**Incorrect 1 (최신 콜백을 읽기 위해 `ref`를 직접 동기화합니다):**

<<< ../examples/state-use-effectevent-for-non-reactive-effect-callbacks/01-incorrect.tsx

**Correct 1 (비반응형 콜백은 `useEffectEvent`로 분리합니다):**

<<< ../examples/state-use-effectevent-for-non-reactive-effect-callbacks/02-correct.tsx
