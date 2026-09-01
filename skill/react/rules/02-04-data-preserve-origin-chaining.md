---
title: Preserve Response and Store Origin Down to the JSX
titleKo: 응답·뮤테이션·스토어 원본은 JSX에 닿을 때까지 이름 그대로 갑니다
impact: MEDIUM
impactDescription: 파일 전체에서 별칭을 따라가지 않고 값의 출처를 바로 압니다
appliesWhen:
  - 응답, 뮤테이션, 스토어에서 값을 꺼내 쓰는 코드를 추가·변경할 때
  - 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때
reviewWith: screen-keep-derived-values-close, data-shape-query-data-with-select
tags: data, state, origin
---

## Preserve Response and Store Origin Down to the JSX

**Impact: MEDIUM (파일 전체에서 별칭을 따라가지 않고 값의 출처를 바로 압니다)**

`response...`, `mutation...`, `*Store` 원본은 JSX에 닿을 때까지 이름 그대로 갑니다.
구조분해와 별칭으로 끊지 않는 규범은 `typescript/values-read-objects-through-chains`가 모든 객체에 정합니다.
여기서는 리액트 화면에서 그 원본이 무엇인지만 짚습니다.

- 스코프가 넓든 좁든 같습니다.
  핸들러 안이든 이펙트 안이든 `responseProductSearchSuspense.data.products`로 읽습니다.
- 쿼리 결과를 화면에서 다시 빚고 싶으면 끊지 말고 `data-shape-query-data-with-select`가 정한
  `query.select`에서 형태를 잡습니다.
  받는 쪽에서 끊으면 깊이는 그대로고 출처만 사라집니다.
- 프롭스는 `composition-read-props-without-destructuring`이 같은 말을 한 번 더 합니다.

**Incorrect (구조분해로 출처가 흐려짐):**

```ts
const {products, selectedProduct} = responseProductListSuspense.data;
```

**Correct (원본 체이닝으로 출처를 유지):**

```tsx
<Fragment>
	<UiList dataSource={responseProductListSuspense.data.products} />
	<UiTable dataSource={responseProductListSuspense.data.selectedProduct.fields} />
</Fragment>;
```

**Correct (이펙트 안에서도 원본 이름 그대로):**

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
