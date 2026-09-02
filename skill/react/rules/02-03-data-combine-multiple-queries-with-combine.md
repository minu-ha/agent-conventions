---
title: Combine Multiple Queries With `combine`
titleKo: 여러 쿼리를 합칠 때는 `combine`을 씁니다
impact: MEDIUM-HIGH
impactDescription: 여러 응답을 합치는 자리가 통신 경계에 남고 화면 본문에 별칭이 쌓이지 않습니다
appliesWhen:
  - 쿼리 결과 둘 이상을 하나의 값으로 합치는 코드를 추가·변경할 때
  - 화면 본문에서 두 `data`를 꺼내 함께 계산하는 코드를 넣거나 뺄 때
reviewWith: data-shape-query-data-with-select, screen-keep-derived-values-close
tags: data, query
---

## Combine Multiple Queries With `combine`

**Impact: MEDIUM-HIGH (여러 응답을 합치는 자리가 통신 경계에 남고 화면 본문에 별칭이 쌓이지 않습니다)**

쿼리 결과 둘 이상을 하나의 값으로 합쳐야 하면 `useSuspenseQueries`나 `useQueries`에 `combine`을 넘깁니다.
`Suspense` 쿼리를 쓰는 화면은 `useSuspenseQueries`를 씁니다.
합친 값에 `isPending`을 만들어 내보내지 않습니다.
그 분기는 `runtime-avoid-ad-hoc-loading-branches`가 죽은 코드로 봅니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 결과 둘 이상을 하나의 값으로 합침 | `useSuspenseQueries` 또는 `useQueries` + `combine` |
| 각각 따로 그림 | 합치지 않고 훅을 따로 부르기 |
| 뒤 쿼리가 앞 결과를 입력으로 받음 | `combine` 대신 `enabled`로 순서 만들기 |

`select`로는 못 합니다.
`select`는 자기 쿼리 데이터만 받습니다.
한 쿼리를 가공하는 자리는 `data-shape-query-data-with-select`가 정합니다.

화면 본문에서 두 `data`를 꺼내 합치지 않습니다.
합친 값이 화면 위쪽 `const`로 남아 출처를 잃습니다.
그 경우는 `screen-keep-derived-values-close`가 금지합니다.

합치는 자리는 그 값을 그리는 섹션 컴포넌트입니다.
라우트 진입은 쿼리를 갖지 않고, 커스텀 훅으로 빼지도 않습니다.
여러 소유자가 같은 조합을 부를 때만 `_hook`으로 올립니다.

**`combine`도 인라인으로 적습니다.**
다시 실행된다는 이유만으로 `useCallback`이나 `useMemo`로 감싸지 않습니다.
React Query의 구조 공유가 합친 결과에서 바뀌지 않은 부분의 참조를 유지합니다.
실측 병목일 때만 `perf-avoid-defensive-memoization`의 예외 기준을 따릅니다.

**Incorrect (화면 본문에서 두 응답을 꺼내 합칩니다):**

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

**Correct (값을 그리는 섹션이 인라인 `combine`으로 합칩니다):**

```tsx
export const PgProductTableSection = () => {
	/**
	 * 분류 이름이 목록 응답에 없어서 표 한 행에 두 응답을 함께 담는다
	 */
	const responseProductRowsSuspense = useSuspenseQueries({
		queries: [productListQueryOptions(), categoryListQueryOptions()],
		combine: ([productResult, categoryResult]) => ({
			rows: productResult.data.products.map((product) => ({
				id: product.id,
				categoryName: categoryResult.data.categories.find(
					(category) => category.id === product.categoryId,
				)?.name,
			})),
		}),
	});

	return <UiTable rows={responseProductRowsSuspense.rows} />;
};
```
