---
title: Preserve Response and Store Origin Down to the JSX
titleKo: 응답·뮤테이션·스토어는 JSX까지 원본 이름으로 읽습니다
impact: CRITICAL
impactDescription: 별칭을 추적하지 않고 사용하는 곳에서 값의 출처를 확인할 수 있습니다
appliesWhen:
  - 응답, 뮤테이션, 스토어에서 값을 꺼내 쓰는 코드를 추가·변경할 때
  - 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때
reviewWith: screen-keep-derived-values-close, data-shape-query-data-with-select
tags: data, state, origin
---

## Preserve Response and Store Origin Down to the JSX

**Impact: CRITICAL (별칭을 추적하지 않고 사용하는 곳에서 값의 출처를 확인할 수 있습니다)**

`response...`·`mutation...`·`*Store`는 JSX까지 원본 이름으로 읽습니다.
핸들러·이펙트 안에서도 `responseProductSearchSuspense.data.products`처럼 출처를 유지합니다.

| 필요한 판단 | 기준 |
| --- | --- |
| 객체 구조분해와 별칭 | `typescript/values-read-objects-through-chains` |
| 쿼리 결과 가공 | `data-shape-query-data-with-select`에 따라 `query.select`에서 처리합니다. 받는 쪽의 별칭은 깊이를 줄이지 못하고 출처만 지웁니다 |
| 프롭스 접근 | `composition-read-props-without-destructuring` |

**Incorrect (구조분해로 출처가 흐려집니다):**

```tsx
const {products, selectedProduct} = responseProductListSuspense.data;

<Fragment>
	<UiList rows={products} />
	<UiTable rows={selectedProduct.fields} />
</Fragment>;
```

**Correct (원본 객체의 속성을 직접 읽어 출처를 유지합니다):**

```tsx
<Fragment>
	<UiList rows={responseProductListSuspense.data.products} />
	<UiTable rows={responseProductListSuspense.data.selectedProduct.fields} />
</Fragment>;
```

**Incorrect (이펙트 의존성도 구조분해한 이름으로 적어 출처가 드러나지 않습니다):**

```ts
const {products} = responseProductSearchSuspense.data;

useEffect(() => {
	if (products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
}, [products, urlParams.keyword]);
```

**Correct (이펙트 안에서도 원본 이름 그대로 씁니다):**

```ts
/**
 * 검색 결과가 있으면 빈 검색 보고를 건너뛴다. 결과가 없을 때만 한 번 보고한다
 */
useEffect(() => {
	if (responseProductSearchSuspense.data.products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
}, [responseProductSearchSuspense.data, urlParams.keyword]);
```
