---
title: Prefer React Handler Type Aliases Over Inline Event Parameter Annotations
impact: HIGH
impactDescription: React handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함
appliesWhen: React 이벤트 핸들러나 prop callback의 선언·시그니처를 추가·변경하며 기존 React alias 또는 callback 계약을 쓸 수 있다.
reviewWith: typing-reuse-existing-contracts, ownership-avoid-barrel-and-react-namespace-imports
requiresSelected: typescript/types-reuse-callback-signatures-from-existing-contracts
tags: typing, handlers, props
---

## Prefer React Handler Type Aliases Over Inline Event Parameter Annotations

**Impact: HIGH (React handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함)**

React가 제공하는 이벤트 핸들러 타입이나 prop callback 계약이 이미 있다면, 매개변수 타입보다 함수 변수 타입 선언을 우선합니다. React alias를 쓰기 위해 type import를 추가·변경하면 `ownership-avoid-barrel-and-react-namespace-imports`를 다시 판정합니다. 일반 TypeScript 함수 타입 규칙은 companion skill인 `convention-typescript`에서 다루고, 여기서는 React handler alias를 바로 쓰는 경우를 강조합니다.

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
 * @event 추가 버튼 클릭 기본 동작 차단
 */
const handleAddButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```
