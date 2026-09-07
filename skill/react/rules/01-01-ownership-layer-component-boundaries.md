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

컴포넌트의 레이어는 사용 횟수나 조립 규모가 아니라 **무엇을 아는지**로 나눕니다.
먼저 `page` 조건을 확인하고, 해당하지 않으면 도메인 지식으로 구분합니다.

| 순서 | 조건 | 레이어 |
| --- | --- | --- |
| 1 | 화면의 응답·뷰모델 타입이나 라우트 search 파라미터를 프롭스 타입에서 참조합니다 | `page` |
| 1 | 쿼리·뮤테이션·라우터 훅·화면 스토어를 직접 호출합니다 | `page` |
| 1 | 해당 화면의 `Suspense` 경계·폼 프로바이더·모달을 여는 조건을 소유합니다 | `page` |
| 2 | 화면은 모르고 도메인만 압니다 | `widget`. 이름에 도메인 단어가 남아도 됩니다 |
| 2 | 도메인도 화면도 모릅니다 | `ui` |

`children`과 공용 계약만 받아 경계를 제공하는 범용 셸·대화상자는 그 이유만으로 `page`가 되지 않습니다.
특정 화면의 데이터나 흐름을 아는지 확인합니다.

| 혼동하기 쉬운 경우 | 판정 |
| --- | --- |
| 한 화면에서만 사용합니다 | `page` 조건에 해당하지 않으면 사용 횟수만으로 레이어를 바꾸지 않습니다 |
| 여러 `ui` 부품을 조립합니다 | 도메인을 모르면 `ui`입니다. 조립 규모로 `widget`을 고르지 않습니다 |

레이어를 정한 뒤 파일명과 심볼에는 `ownership-prefix-layer-names-on-files-and-symbols`를 적용합니다.

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

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};
```

**Correct (라우터 훅을 호출하는 코드는 화면 레이어에 둡니다):**

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

**Incorrect (화면 타입·훅과 무관한 부품을 사용 횟수만으로 화면 레이어에 둡니다):**

```tsx
// page/detail/_pg-sales-legend-glyph.tsx
// 프롭스가 도메인 타입 하나만 받고 훅도 부르지 않는다. 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSalesLegendGlyph = (props: PgSalesLegendGlyphProps) => {
	return <svg className={clsx("pg_salesLegendGlyph__root")}>{props.children}</svg>;
};
```

**Correct (화면 타입·훅과 무관한 도메인 부품은 `widget`에 둡니다):**

```tsx
// component/widget/sales-legend-glyph/wg-sales-legend-glyph.tsx
export const WgSalesLegendGlyph = (props: WgSalesLegendGlyphProps) => {
	return <svg className={clsx("wg_salesLegendGlyph__root")}>{props.children}</svg>;
};
```

**Incorrect (도메인을 모르는 조합을 조립 규모만 보고 `widget`에 둡니다):**

```tsx
// component/widget/line-chart/wg-line-chart.tsx
// 프롭스가 좌표 배열만 받고 도메인 타입을 모른다. ui 부품을 조립했다는 이유로 widget에 있다.
export const WgLineChart = (props: WgLineChartProps) => {
	return <svg className={clsx("wg_lineChart__root")}>{props.children}</svg>;
};
```

**Correct (도메인 지식이 없는 조합은 `ui`, 있는 조합은 `widget`에 둡니다):**

```tsx
// component/ui/line-chart/ui-line-chart.tsx
export const UiLineChart = (props: UiLineChartProps) => {
	return <svg className={clsx("ui_lineChart__root")}>{props.children}</svg>;
};

// component/widget/sales-window-chart/wg-sales-window-chart.tsx
export const WgSalesWindowChart = (props: WgSalesWindowChartProps) => {
	return <UiLineChart points={toChartPoints(props.readings)} />;
};
```
