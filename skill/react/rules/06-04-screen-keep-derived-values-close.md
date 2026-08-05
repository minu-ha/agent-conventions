---
title: Keep Derived Values Close to Where They Are Used
titleKo: 파생값은 쓰는 자리 가까이에 둡니다
impact: HIGH
impactDescription: 출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다
appliesWhen:
  - 화면 진입 파일이나 섹션 최상단에 `const` 별칭, 플래그, 표시값을 추가·이동·제거할 때
  - 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 `const`로 빼거나 되돌릴 때
reviewWith: data-preserve-origin-chaining
tags: screen, origin
---

## Keep Derived Values Close to Where They Are Used

**Impact: HIGH (출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다)**

계산한 값은 실제 쓰는 자리에서 만듭니다.
화면 상단으로 끌어올리면 그 값이 어디서 왔는지 알 수 없게 됩니다.

여기서 보는 것은 `useState`와 프롭에서 나온 플래그, 표시값입니다.
응답과 스토어 출처는 `data-preserve-origin-chaining`가 정합니다.

어느 파일이 그 값을 소유하는지도 이 규칙이 정하지 않습니다.
`screen-extract-local-section-components-for-runtime-boundaries`가 정합니다.
여기서는 소유한 파일 안에서 얼마나 가까이 두는지만 봅니다.

- 조건 플래그와 표시 문구를 화면 상단에 미리 만들어 두지 않고 쓰는 자리에서 계산합니다.
  `let` 재할당과 배열 `push` 조립은 `typescript/functions-avoid-imperative-assembly-in-wide-scopes`가 봅니다.
- 훅 파라미터, JSX 표시값, 이펙트 내부 계산은 쓰는 자리의 좁은 스코프에서 직접 계산합니다.
- 이름을 붙일지 말지는 `typescript/functions-name-a-value-only-when-it-is-reused`가 정합니다.
  여기서는 이름을 붙인 값을 화면 어디에 두는지만 봅니다.

**Incorrect (쓰는 자리에서 먼 화면 상단에 플래그와 표시값을 쌓음):**

```tsx
export const PgProductTableSection = (props: PgProductTableSectionProps) => {
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	// 아래 둘은 이름만 남기고 무엇에서 나온 값인지를 지운다
	const hasSelectedRows = selectedRows.length > 0;
	const bulkActionLabel = `${selectedRows.length}건 삭제`;

	return (
		<Fragment>
			<UiTable dataSource={props.products} onRowSelect={setSelectedRows} />

			{hasSelectedRows && <PgProductBulkActionBar label={bulkActionLabel} />}
		</Fragment>
	);
};
```

**Correct (선언을 그대로 두고 쓰는 자리에서 계산):**

```tsx
export const PgProductTableSection = (props: PgProductTableSectionProps) => {
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	return (
		<Fragment>
			<UiTable dataSource={props.products} onRowSelect={handleTableRowSelect} />

			{selectedRows.length > 0 && (
				<PgProductBulkActionBar label={`${selectedRows.length}건 삭제`} />
			)}
		</Fragment>
	);
};
```
