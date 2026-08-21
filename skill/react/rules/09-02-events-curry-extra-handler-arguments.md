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

- 팩토리도 커링 없는 핸들러와 같은 `handle*` 이름을 그대로 씁니다.
  `With<인자>` 접미사를 붙이지 않습니다 — 인라인 래퍼가 금지라 JSX에서 인자를 받아
  호출되는 `handle*`는 언제나 팩토리이고, 무엇으로 만드는지는 호출 인자가 이미 보여줍니다.
- 팩토리 반환 타입은 `typing-take-handler-types-from-existing-contracts`를 따라 리액트 별칭으로 고정합니다.
- 팩토리는 화살표 두 단계로 적습니다.
  블록 본문 안에서 안쪽 핸들러에 이름을 붙여 반환하지 않습니다.
  안쪽에 붙일 이름은 팩토리 이름의 반복이 되고, 같은 반환 타입을 두 자리에 적게 됩니다.
- 반환 전에 준비 계산이 실제로 있을 때만 바깥에 블록 본문을 열고,
  그때도 반환하는 화살표에는 이름을 붙이지 않습니다.
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

**Incorrect (블록 본문에서 안쪽 핸들러에 이름을 붙이고 팩토리에 With 접미사를 붙임):**

```tsx
const handleListItemClickWithProductId = (productId: string): MouseEventHandler<HTMLLIElement> => {
	const handleListItemClick: MouseEventHandler<HTMLLIElement> = (_event) => {
		toggleSelection(productId);
	};

	return handleListItemClick;
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 함수):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 product인지 알아낸다
 */
const handleListItemClick =
	(productId: string): MouseEventHandler<HTMLLIElement> =>
	(_event) => {
		toggleSelection(productId);
	};
```

```tsx
<li onClick={handleListItemClick(product.id)} />;
```
