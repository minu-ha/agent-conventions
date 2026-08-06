---
title: Curry Extra Arguments Into DOM Event Handlers
titleKo: 이벤트 외 추가 인자는 커링으로 넘깁니다
impact: LOW
impactDescription: JSX에 인자만 넘기려고 만든 래퍼 화살표가 쌓이지 않습니다
appliesWhen:
  - DOM 이벤트 프롭에 추가 인자를 넘기는 핸들러를 추가·변경할 때
  - 인라인 래퍼로 인자를 넘기던 자리를 바꿀 때
  - 제외: 이벤트 객체를 받지 않는 프롭 콜백인 경우
requiresSelected: typing-take-handler-types-from-existing-contracts
reviewWith: composition-named-handlers-over-inline
tags: events, handlers
---

## Curry Extra Arguments Into DOM Event Handlers

**Impact: LOW (JSX에 인자만 넘기려고 만든 래퍼 화살표가 쌓이지 않습니다)**

`onClick`, `onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면
팩토리가 인자를 받고 안쪽 함수가 이벤트를 받습니다.
반환값을 JSX에 그대로 전달합니다.
`onClick={() => handleSelectionToggle(id)}`처럼 감싸는 화살표를 만들지 않습니다.

- 팩토리 이름은 안쪽 핸들러 이름 뒤에 커링으로 받는 값을 붙여 짓습니다.
  `handleListItemClick`은 이벤트만 받는 핸들러이고,
  그것을 만드는 팩토리는 `handleListItemClickWithProductId`입니다.
- 팩토리 반환 타입은 `typing-take-handler-types-from-existing-contracts`를 따라 리액트 별칭으로 고정합니다.
- 이벤트 객체를 받지 않는 프롭 콜백은 대상이 아닙니다.
  `(id) => void` 계약이면 이름 붙인 핸들러를 그대로 넘깁니다.
- `useEffectEvent`로 만든 함수에는 DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다.

**Incorrect (인라인 래퍼로 인자를 넘김):**

```tsx
const handleSelectionToggle = (id: string) => {
	toggleSelection(id);
};

<li onClick={() => handleSelectionToggle(product.id)} />;
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 함수):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 product인지 알아낸다
 */
const handleListItemClickWithProductId =
	(productId: string): MouseEventHandler<HTMLLIElement> =>
	(_event) => {
		toggleSelection(productId);
	};
```

```tsx
<li onClick={handleListItemClickWithProductId(product.id)} />;
```
