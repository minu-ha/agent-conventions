---
title: Keep UI, Widget, and Page Ownership Separate
titleKo: 컴포넌트를 `ui`, `widget`, `page` 소유 레이어로 나눕니다
impact: CRITICAL
impactDescription: 공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다
appliesWhen:
  - 컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때
  - 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때
reviewWith: ownership-place-owner-files-in-role-folders, css/ownership-choose-scope-prefix-by-reuse-range
tags: ownership, widget, naming
---

## Keep UI, Widget, and Page Ownership Separate

**Impact: CRITICAL (공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다)**

컴포넌트는 셋 중 한 레이어가 소유합니다.

| 레이어 | 책임 |
| --- | --- |
| `ui` | 도메인을 모르는 순수 화면 |
| `widget` | 화면 조립을 전제하지 않는 공용 조합 |
| `page` | 한 화면 안에서만 쓰이는 뼈대와 컴포넌트 |

이름 표기는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
여기서는 어느 레이어인지만 판정합니다.

**먼저 `page`인지 봅니다.** 다음 중 하나라도 해당하면 `page`입니다.

- 프롭스 타입이 그 화면의 응답·뷰모델 타입이나 라우트 검색 매개변수를 참조합니다.
- 쿼리, 뮤테이션, 라우터 훅, 화면 스토어를 직접 부릅니다.
- `Suspense`, 폼 프로바이더, 모달을 직접 소유합니다.

**`page`가 아니면 도메인 지식으로 갈립니다.**

- 도메인을 모르면 `ui`입니다.
- 도메인을 알면 `widget`입니다.
  이름에 도메인 단어가 남아도 됩니다.

사용 횟수는 판정 기준이 아닙니다.
한 화면에서만 쓰여도 위 셋에 해당하지 않으면 `widget`입니다.
사용 횟수로 판정하면 쓰임이 변할 때마다 폴더를 옮겨 다닙니다.

**Incorrect (공용 레이어에 화면 전용 로직이 섞임):**

```tsx
// ui/button/ui-delete-product-button.tsx
const UiDeleteProductButton = () => {
	const navigate = useNavigate();

	return <button onClick={() => void navigate({ to: "/products" })}>삭제</button>;
};
```

**Incorrect (화면 타입도 안 쓰고 훅도 안 부르는 부품을 사용 횟수만 보고 화면에 남김):**

```tsx
// page/detail/component/pg-sales-legend-glyph.tsx
// 프롭스가 도메인 타입 하나만 받고 훅도 부르지 않는다. 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSalesLegendGlyph = (props: PgSalesLegendGlyphProps) => {
	return <svg className={clsx("pg_salesLegendGlyph__root")}>{/* ... */}</svg>;
};
```

**Correct (레이어별 책임과 이름이 분리됨):**

```tsx
// ui/button/ui-button.tsx
/**
 * 도메인을 모르는 버튼 계약
 *
 * 표시할 글자를 프롭으로 받지 않고 `children`으로 받아 문구 결정을 사용처에 남긴다.
 */
export interface UiButtonProps {
	/**
	 * 버튼 안에 그릴 내용. 이 글자가 화면 낭독기가 읽는 이름이 된다
	 */
	children: ReactNode;
	/**
	 * 눌렀을 때
	 */
	onClick: MouseEventHandler<HTMLButtonElement>;
}

export const UiButton = (props: UiButtonProps) => {
	return <button onClick={props.onClick}>{props.children}</button>;
};
```

```tsx
// widget/product-toolbar/wg-product-toolbar.tsx
export const WgProductToolbar = (props: WgProductToolbarProps) => {
	return <UiButton onClick={props.onClose}>닫기</UiButton>;
};
```

**Correct (화면 타입도 훅도 쓰지 않는 도메인 부품은 `widget`으로 올림):**

```tsx
// widget/sales-legend-glyph/wg-sales-legend-glyph.tsx
export const WgSalesLegendGlyph = (props: WgSalesLegendGlyphProps) => {
	return <svg className={clsx("wg_salesLegendGlyph__root")}>{/* ... */}</svg>;
};
```

**Correct (라우터 훅을 부르는 코드는 화면 레이어에 남김):**

```tsx
// page/products/component/pg-delete-product-button.tsx
const PgDeleteProductButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate({ to: "/products" });
	};

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};
```
