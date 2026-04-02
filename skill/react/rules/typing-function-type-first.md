---
title: Prefer Function Variable Types Over Parameter Annotations
impact: HIGH
impactDescription: handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함
tags: typing, handlers, props
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: HIGH (handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함)**

이벤트 핸들러나 이미 알려진 함수 타입이 있다면, 매개변수 타입보다 함수 변수 타입 선언을 우선합니다. 표준 함수 타입이 없을 때만 매개변수에 직접 타입을 적습니다.

**Incorrect (핸들러 타입이 있는데 매개변수만 타입 지정):**

```ts
const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};
```

**Correct (함수 변수 타입으로 시그니처를 고정):**

```ts
import type { MouseEventHandler } from "react";

const handleAddButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```
