---
title: Prefer React Handler Type Aliases Over Inline Event Parameter Annotations
titleKo: 매개변수마다 타입을 붙이지 않고 리액트 핸들러 별칭을 씁니다
impact: HIGH
impactDescription: 핸들러 시그니처와 콜백 의도가 선언 자리에서 바로 드러납니다
appliesWhen:
  - 리액트 이벤트 핸들러나 프롭 콜백의 선언·시그니처를 추가·변경할 때
  - 기존 리액트 별칭이나 콜백 계약을 그대로 쓸 수 있는 상황일 때
  - 커링한 팩토리가 최종 반환하는 핸들러를 다룰 때
reviewWith: typing-reuse-existing-contracts
requiresSelected: typescript/types-reuse-callback-signatures-from-existing-contracts
tags: typing, handlers, props
---

## Prefer React Handler Type Aliases Over Inline Event Parameter Annotations

**Impact: HIGH (핸들러 시그니처와 콜백 의도가 선언 자리에서 바로 드러납니다)**

리액트가 제공하는 이벤트 핸들러 타입이나 프롭 콜백 계약이 이미 있다면
매개변수 타입보다 함수 변수 타입 선언을 우선합니다.

커링한 핸들러 팩토리가 반환하는 함수도 JSX 이벤트 프롭에 전달되는 리액트 핸들러 선언입니다.
JSX가 나중에 문맥 타입 지정을 제공한다는 이유로 반환 함수 타입을 생략하지 않고,
팩토리 반환 타입을 `MouseEventHandler<...>` 같은 기존 별칭으로 고정합니다.

- `query.select` 같은 훅 옵션의 일회성 문맥 콜백과 UI를 모르는 도메인 함수는
  리액트 이벤트 핸들러나 프롭 콜백 구현이 아닙니다. 이 경우 이 규칙은 적용하지 않습니다.
- 일반 TypeScript 함수 타입 규칙은 동반 스킬인 `convention-typescript`가 다룹니다.
  여기서는 리액트 핸들러 별칭을 바로 쓰는 경우만 봅니다.

**Incorrect (핸들러 타입이 있는데 매개변수만 타입 지정):**

```ts
const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};
```

**Correct (함수 변수 타입으로 시그니처를 고정):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 추가 버튼 클릭 기본 동작 차단
 */
const handleAddButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```
