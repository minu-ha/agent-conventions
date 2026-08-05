---
title: Combine Multiple Queries With `useQueries` and `combine`
titleKo: 여러 쿼리를 합칠 때는 `useQueries`의 `combine`을 씁니다
impact: HIGH
impactDescription: 여러 응답을 합치는 자리가 통신 경계에 남고 화면 본문에 별칭이 쌓이지 않습니다
appliesWhen:
  - 쿼리 결과 둘 이상을 하나의 값으로 합치는 코드를 추가·변경할 때
  - 화면 본문에서 두 `data`를 꺼내 함께 계산하는 코드를 넣거나 뺄 때
reviewWith: data-shape-query-data-with-select, screen-keep-derived-values-close
tags: data, query
---

## Combine Multiple Queries With `useQueries` and `combine`

**Impact: HIGH (여러 응답을 합치는 자리가 통신 경계에 남고 화면 본문에 별칭이 쌓이지 않습니다)**

쿼리 결과 둘 이상을 하나의 값으로 합쳐야 하면 `useQueries`에 `combine`을 넘깁니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 결과 둘 이상을 하나의 값으로 합친다 | `useQueries` + `combine` |
| 각각 따로 그린다 | 합치지 않고 훅을 따로 부릅니다 |
| 뒤 쿼리가 앞 결과를 입력으로 받는다 | `combine`이 아니라 `enabled`로 순서를 만듭니다 |

`select`로는 못 합니다.
`select`는 자기 쿼리 데이터만 받습니다.
한 쿼리를 가공하는 자리는 `data-shape-query-data-with-select`가 정합니다.

화면 본문에서 두 `data`를 꺼내 합치지 않습니다.
합친 값이 화면 위쪽 `const`로 남아 출처를 잃습니다.
`screen-keep-derived-values-close`가 그것을 막습니다.

**`combine` 함수는 모듈 최상위 상수로 둡니다.**
라이브러리가 이전 `combine`과 같은 함수인지로 재실행을 가르는데,
인라인 화살표는 렌더마다 새 함수라 그 비교가 늘 어긋나 매번 다시 돕니다.
`select`도 같은 이유로 같은 처방을 씁니다.

합친 결과는 구조 공유되어 참조가 안정적입니다.
그래서 `useMemo`로 다시 감싸지 않습니다.
`perf-avoid-defensive-memoization`이 그것을 막습니다.

**Incorrect (화면 본문에서 두 응답을 꺼내 합침):**

```tsx
const responseProductListSuspense = useProductListSuspense();
const responseCategoryListSuspense = useCategoryListSuspense();

const rows = responseProductListSuspense.data.products.map((product) => ({
	id: product.id,
	categoryName: responseCategoryListSuspense.data.categories.find(
		(category) => category.id === product.categoryId,
	)?.name,
}));
```

**Incorrect (`combine`을 인라인으로 적어 렌더마다 다시 돎):**

```tsx
const rows = useQueries({
	queries: [productListQueryOptions(), categoryListQueryOptions()],
	combine: (results) => toProductRows(results),
});
```

**Correct (모듈 최상위 `combine`으로 통신 경계에서 합침):**

```tsx
/**
 * product 응답과 category 응답을 목록 한 행씩으로 합친다
 */
const combineProductRows = (
	results: [UseQueryResult<ProductListResponse>, UseQueryResult<CategoryListResponse>],
) => {
	const [productResult, categoryResult] = results;

	return {
		isPending: productResult.isPending || categoryResult.isPending,
		rows: toProductRows(productResult.data, categoryResult.data),
	};
};

export const PgProducts = () => {
	const responseProductRows = useQueries({
		queries: [productListQueryOptions(), categoryListQueryOptions()],
		combine: combineProductRows,
	});

	return <UiTable dataSource={responseProductRows.rows} />;
};
```

**Correct (뒤 쿼리가 앞 결과를 받으면 `enabled`로 순서를 만듦):**

```tsx
/**
 * 선택한 product 조회 API
 */
const responseProductSuspense = useProductGetItemSuspense({productId: search.productId});

/**
 * 그 product 의 배송 이력 조회 API. product 를 받은 뒤에만 부른다
 */
const responseShipmentList = useShipmentList(
	{orderId: responseProductSuspense.data.orderId},
	{query: {enabled: Boolean(responseProductSuspense.data.orderId)}},
);
```
