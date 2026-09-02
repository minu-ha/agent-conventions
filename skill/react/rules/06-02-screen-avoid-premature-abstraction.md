---
title: Avoid Premature Abstraction in Screen Code
titleKo: 화면 코드를 미리 추상화하지 않습니다
impact: MEDIUM-HIGH
impactDescription: 짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다
appliesWhen:
  - 화면 코드를 보조 함수, 훅, 컴포넌트, 모듈로 추출할 때
  - 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries,
  typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: screen
---

## Avoid Premature Abstraction in Screen Code

**Impact: MEDIUM-HIGH (짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다)**

반복이 보인다는 이유만으로 공용 훅, 컴포넌트, 보조 함수를 만들지 않습니다.

추출 전에 먼저 시도할 방법:

- 한 함수 안에서 단계 변수, 섹션 주석, 내부 블록으로 정리
- 화면 지역 JSX에 남기고 흐름을 보이게 유지
- 작은 변환 함수, `href` 조립, 기본값 처리는 사용처에 유지

추출해도 되는 경계는 이 규칙이 정하지 않습니다.
컴포넌트는 `screen-extract-local-section-components-for-runtime-boundaries`가,
함수는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이,
훅은 `ownership-prefer-plain-ts-for-local-react-helpers`가 판정합니다.

먼저 시도한 뒤에도 남는 금지 구조:

- 한 컴포넌트, 한 핸들러, 한 쿼리 `select`만 쓰는 보조 함수를 보조 모듈에 쌓는 구조
- 내보낸 보조 함수가 다른 내보낸 보조 함수 하나만을 위해 존재하는 구조.
  대표 함수 자기 이름 폴더 안의 전용 보조는 `typescript/functions-give-each-function-its-own-file`이 정한 예외입니다
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복 뒤에 숨기는 구조

**Incorrect (컴포넌트 하나만 쓰는 단계 보조 함수를 보조 모듈에 남깁니다):**

```tsx
const toEditHref = ({editHrefBase, row}: {editHrefBase: string; row: ProductRow}) =>
	`${editHrefBase}${row.id}/`;

const toProductRows = (response: ProductListResponse) =>
	response.data.map((product) => ({id: product.id, title: product.title}));

export const PgProductTable = (props: PgProductTableProps) => {
	const responseProductListSuspense = useProductListSuspense({}, {query: {select: toProductRows}});

	return responseProductListSuspense.data.map((row) => (
		<a href={toEditHref({editHrefBase: props.editHrefBase, row})} key={row.id}>
			{row.title}
		</a>
	));
};
```

**Correct (작은 쿼리 가공과 `href` 조립은 사용처에 둡니다):**

```tsx
export const PgProductTable = (props: PgProductTableProps) => {
	/**
	 * 링크에 필요한 두 필드만 남겨 표가 응답 구조를 모르게 한다
	 */
	const responseProductListSuspense = useProductListSuspense(
		{},
		{query: {select: (response) => response.data.map((product) => ({id: product.id, title: product.title}))}},
	);

	return responseProductListSuspense.data.map((row) => (
		<a href={`${props.editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};
```
**Incorrect (사용처가 한 화면뿐인데 공용 훅으로 먼저 빼냅니다):**

```ts
// _hook/use-product-filter-form.ts
export const useProductFilterForm = () => {
	const [keyword, setKeyword] = useState("");
	const [categoryId, setCategoryId] = useState<string>();

	return {categoryId, keyword, setCategoryId, setKeyword};
};
```

```tsx
// page/products/pg-products.tsx: 이 훅을 부르는 화면은 여기 하나뿐이다
export const PgProducts = () => {
	const productFilterForm = useProductFilterForm();

	return <PgProductFilterSection keyword={productFilterForm.keyword} />;
};
```

**Correct (두 화면이 같은 흐름을 부르게 된 뒤에 공용화합니다):**

```ts
/**
 * 등록 화면과 수정 화면이 저장 실패를 같은 문구로 보여 줘야 해서 한 곳에 묶는다.
 * 두 화면이 모두 이 훅을 부르므로 한쪽만 고치면 표시가 갈린다
 */
export const useProductEditor = () => {
	const form = useForm<ProductEditorFormValues>();

	/**
	 * 저장 실패 문구를 이 훅이 함께 들고 있어야 해서 여기서 부른다
	 */
	const mutationProductSave = useProductSave();
	const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

	return {form, mutationProductSave, setSubmitErrorMessage, submitErrorMessage};
};
```

**Correct (여러 보조 함수 대신 한 함수 안에서 단계별로 정리합니다):**

```ts
/**
 * 화면이 보낼 값 조립을 한 함수 안에서 끝낸다. 단계마다 보조 함수를 만들지 않는다
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	// 1. 사용자가 넣은 앞뒤 공백을 서버로 보내기 전에 정리한다
	const title = formValues.title.trim();
	const description = formValues.description.trim();

	// 2. API가 받는 payload 형태로 조립한다
	return {categoryId: formValues.categoryId, description, title};
};
```

