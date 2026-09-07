# Avoid Premature Abstraction in Screen Code

**Impact: MEDIUM (추측에 따른 추출을 줄이고 실제 재사용 경계에 맞춰 코드를 배치합니다)**

반복이 보인다는 이유만으로 공용 훅·컴포넌트·보조 함수를 추출하지 않습니다.
먼저 흐름을 같은 파일에서 읽을 수 있도록 정리합니다.

| 먼저 시도할 방법 | 유지할 위치 |
| --- | --- |
| 단계 변수·섹션 주석·내부 블록으로 정리 | 한 함수 안 |
| 화면 흐름이 보이도록 JSX 정리 | 화면 지역 JSX |
| 작은 변환·`href` 조립·기본값 처리 | 사용처 |

한 컴포넌트·핸들러·쿼리 `select`만 쓰는 보조 함수를 별도 모듈에 쌓지 않습니다.
한 대표 함수만 호출하는 보조도 `_function` 바로 아래에 공개하지 않습니다.
그 배치는 `typescript/functions-give-each-function-its-own-file`을 따릅니다.
이름을 붙이기 좋다는 이유만으로 흐름을 여러 파일에 나누지 않습니다.

| 추출 대상 | 허용 경계 |
| --- | --- |
| 컴포넌트 | `screen-extract-local-section-components-for-runtime-boundaries` |
| 함수 | `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| 훅 | `ownership-prefer-plain-ts-for-local-react-helpers` |

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

> 나머지 예시·예외는 [full rule](../rules/06-02-screen-avoid-premature-abstraction.md)에 있습니다.
