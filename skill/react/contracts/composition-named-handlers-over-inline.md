# Use Named Handlers Instead of Hiding Logic in JSX

**Impact: MEDIUM (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다)**

JSX에는 이름 붙인 핸들러 참조만 넘깁니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 핸들러로 분리합니다.

추가 인자를 넘기려고 `onClick={() => handleX(id)}` 같은 인라인 래퍼를 쓰지 않습니다.
그 자리는 `events-curry-extra-handler-arguments`가 커링으로 정합니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

**Incorrect (분기와 비동기를 JSX 안에 숨깁니다):**

```tsx
<UiButton
	onClick={() => {
		if (!selectedProduct) {
			return;
		}

		mutationProductRemove.mutate({params: {productId: selectedProduct.id}});
	}}
>
	삭제
</UiButton>
```

**Correct (로직을 이름 붙인 핸들러로 뺍니다):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 선택된 product 를 지운다. 성공 뒤 이동은 mutation 콜백이 이어 간다
 */
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (!selectedProduct) {
		return;
	}

	mutationProductRemove.mutate({params: {productId: selectedProduct.id}});
};

<UiButton onClick={handleRemoveProductButtonClick}>삭제</UiButton>;
```

> 나머지 예시·예외는 [full rule](../rules/05-03-composition-named-handlers-over-inline.md)에 있습니다.
