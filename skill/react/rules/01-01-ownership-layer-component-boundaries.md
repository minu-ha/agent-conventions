---
title: Keep UI, Widget, and Page Ownership Separate
titleKo: 컴포넌트를 `ui`, `widget`, `page` 소유 레이어로 나눕니다
impact: CRITICAL
impactDescription: 공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다
appliesWhen:
  - 컴포넌트를 `ui`, `widget`, `page` 중 어느 소유 레이어에 둘지 정할 때
  - 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때
reviewWith: ownership-place-owner-files-in-role-folders, css/ownership-choose-scope-prefix-by-owner-layer
tags: ownership, widget, naming
---

## Keep UI, Widget, and Page Ownership Separate

**Impact: CRITICAL (공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다)**

컴포넌트는 셋 중 한 레이어가 소유합니다.
레이어는 컴포넌트가 무엇을 아는가로만 가릅니다.

| 레이어 | 담는 컴포넌트 |
| --- | --- |
| `ui` | 도메인도 화면도 모르는 컴포넌트 |
| `widget` | 도메인은 알고 화면은 모르는 컴포넌트 |
| `page` | 화면을 아는 뼈대와 컴포넌트 |

이름 표기는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
여기서는 어느 레이어인지만 판정합니다.

**먼저 `page`인지 봅니다.** 다음 중 하나라도 해당하면 `page`입니다.

- 프롭스 타입이 그 화면의 응답·뷰모델 타입이나 라우트 search 파라미터를 참조합니다.
- 쿼리, 뮤테이션, 라우터 훅, 화면 스토어를 직접 부릅니다.
- `Suspense` 경계나 폼 프로바이더를 직접 알거나, 모달을 여는 조건을 자기가 압니다.

**`page`가 아니면 도메인 지식으로 갈립니다.**

- 도메인을 모르면 `ui`입니다.
- 도메인을 알면 `widget`입니다.
  이름에 도메인 단어가 남아도 됩니다.

다음 둘은 판정 기준이 아닙니다.

| 기준이 아닌 것 | 판정 | 기준으로 삼으면 생기는 일 |
| --- | --- | --- |
| 사용 횟수 | 한 화면에서만 쓰여도 위 `page` 판정에 해당하지 않으면 `page`가 아닙니다 | 쓰임이 변할 때마다 컴포넌트가 폴더를 옮겨 다닙니다 |
| 조립 규모 | `ui` 부품 여럿을 조립해도 도메인을 모르면 `ui`입니다 | 도메인을 모르는 조합이 전부 `widget`에 쌓여 레이어 이름이 소유를 말하지 못합니다 |

**Incorrect (공용 레이어에 화면 전용 로직이 섞입니다):**

```tsx
// component/ui/delete-product-button/ui-delete-product-button.tsx
export const UiDeleteProductButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate("/products");
	};

	return <button onClick={handleDeleteButtonClick}>삭제</button>;
};
```

**Correct (라우터 훅을 부르는 코드는 화면 레이어에 남깁니다):**

```tsx
// page/products/_pg-delete-product-button.tsx
export const PgDeleteProductButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate("/products");
	};

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};
```

**Incorrect (화면 타입도 안 쓰고 훅도 안 부르는 부품을 사용 횟수만 보고 화면에 남깁니다):**

```tsx
// page/detail/_pg-sales-legend-glyph.tsx
// 프롭스가 도메인 타입 하나만 받고 훅도 부르지 않는다. 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSalesLegendGlyph = (props: PgSalesLegendGlyphProps) => {
	return <svg className={clsx("pg_salesLegendGlyph__root")}>{/* ... */}</svg>;
};
```

**Correct (화면 타입도 훅도 쓰지 않는 도메인 부품은 `widget`으로 올립니다):**

```tsx
// component/widget/sales-legend-glyph/wg-sales-legend-glyph.tsx
export const WgSalesLegendGlyph = (props: WgSalesLegendGlyphProps) => {
	return <svg className={clsx("wg_salesLegendGlyph__root")}>{/* ... */}</svg>;
};
```

**Incorrect (도메인을 모르는 조합을 조립 규모만 보고 `widget`에 둡니다):**

```tsx
// component/widget/line-chart/wg-line-chart.tsx
// 프롭스가 좌표 배열만 받고 도메인 타입을 모른다. ui 부품을 조립했다는 이유로 widget에 있다.
export const WgLineChart = (props: WgLineChartProps) => {
	return <svg className={clsx("wg_lineChart__root")}>{/* ... */}</svg>;
};
```

**Correct (도메인을 모르는 조합은 `ui`로 내리고 도메인을 아는 조합만 `widget`에 남깁니다):**

```tsx
// component/ui/line-chart/ui-line-chart.tsx
export const UiLineChart = (props: UiLineChartProps) => {
	return <svg className={clsx("ui_lineChart__root")}>{/* ... */}</svg>;
};
```

```tsx
// component/widget/sales-window-chart/wg-sales-window-chart.tsx
export const WgSalesWindowChart = (props: WgSalesWindowChartProps) => {
	return <UiLineChart points={toChartPoints(props.readings)} />;
};
```
