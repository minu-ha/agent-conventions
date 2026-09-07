---
title: Curry Extra Arguments Into DOM Event Handlers
titleKo: 이벤트 외 추가 인자는 커링으로 넘깁니다
impact: LOW
impactDescription: 추가 인자 전달만을 위한 JSX 인라인 래퍼를 줄입니다
appliesWhen:
  - DOM 이벤트 프롭에 추가 인자를 넘기는 핸들러를 추가·변경할 때
  - 인라인 래퍼로 인자를 넘기던 자리를 바꿀 때
  - 제외: 이벤트 객체를 받지 않는 프롭 콜백인 경우
requiresSelected: typing-take-handler-types-from-existing-contracts
reviewWith: composition-named-handlers-over-inline
tags: events, handlers
---

## Curry Extra Arguments Into DOM Event Handlers

**Impact: LOW (추가 인자 전달만을 위한 JSX 인라인 래퍼를 줄입니다)**

`onClick`·`onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면 커링합니다.
팩토리가 추가 인자를 받고, 안쪽 함수가 이벤트를 받으며, 반환한 함수를 JSX에 직접 전달합니다.
`onClick={() => handleSelectionToggle(id)}` 같은 인라인 래퍼는 만들지 않습니다.

| 작성할 부분 | 기준 |
| --- | --- |
| 팩토리 이름 | 커링 없는 핸들러처럼 `handle*`을 씁니다. 호출 인자로 용도를 알 수 있으므로 `With<인자>`는 붙이지 않습니다 |
| 반환 타입 | `typing-take-handler-types-from-existing-contracts`에 따라 리액트 별칭을 씁니다 |
| 함수 형태 | 화살표 두 단계로 적고, 안쪽 함수에 별도 이름을 붙여 반환하지 않습니다 |
| 반환 전 준비 계산이 있음 | 이때만 바깥 블록 본문을 엽니다. 반환하는 화살표는 이름을 붙이지 않습니다 |
| 이벤트를 받지 않는 `(id) => void` 프롭 콜백 | 커링하지 않고 이름 붙인 핸들러를 그대로 넘깁니다 |
| `useEffectEvent` 반환 함수 | DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다 |

안쪽 핸들러에 이름을 붙이면 팩토리 이름을 반복하고 같은 반환 타입도 두 번 적게 됩니다.

**Incorrect (인라인 래퍼로 인자를 넘깁니다):**

```tsx
<UiButton onClick={() => handleListItemClick(product.id)}>{product.name}</UiButton>;
```

**Correct (JSX에는 팩토리 호출만 두고 감싸는 화살표를 만들지 않습니다):**

```tsx
<UiButton onClick={handleListItemClick(product.id)}>{product.name}</UiButton>;
```

**Incorrect (안쪽 핸들러에 별도 이름을 붙이고 팩토리에 `With` 접미사를 붙입니다):**

```tsx
const handleListItemClickWithProductId = (productId: string): MouseEventHandler<HTMLButtonElement> => {
	const handleListItemClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
		toggleSelection(productId);
	};

	return handleListItemClick;
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 함수입니다):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 product인지 알아낸다
 */
const handleListItemClick =
	(productId: string): MouseEventHandler<HTMLButtonElement> =>
	(_event) => {
		toggleSelection(productId);
	};
```
