# Keep Derived Values Close to Where They Are Used

**Impact: MEDIUM (파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다)**

`useState`와 프롭스에서 나온 조건 플래그, 표시값은 사용처에서 계산합니다.
화면 상단에 준비 코드로 모으지 않고, 훅 인자, JSX, 이펙트 내부의 좁은 스코프에 둡니다.
이 규칙은 소유 파일 안에서 계산 위치만 정합니다.
응답과 스토어의 출처는 `data-preserve-origin-chaining`,
이름을 붙일지는 `typescript/functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

**Incorrect 1 (쓰는 자리에서 먼 화면 상단에 플래그와 표시값을 쌓습니다):**

```tsx
export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 search 파라미터로 올리지 않음
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	// 아래 둘은 이름만 남기고 무엇에서 나온 값인지 지움
	const hasSelectedRows = selectedRows.length > 0;
	const bulkActionLabel = `${selectedRows.length}건 삭제`;

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.items} onRowSelect={handleTableRowSelect} />

			{hasSelectedRows && <PgProductBulkActionBar label={bulkActionLabel} />}
		</Fragment>
	);
};
```

**Correct 1 (선언을 그대로 두고 쓰는 자리에서 계산합니다):**

```tsx
export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 search 파라미터로 올리지 않음
	 */
	const handleTableRowSelect: UiTableProps<ProductRow>["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.items} onRowSelect={handleTableRowSelect} />

			{selectedRows.length > 0 && (
				<PgProductBulkActionBar label={`${selectedRows.length}건 삭제`} />
			)}
		</Fragment>
	);
};
```

> 나머지 예시와 예외는 [full rule](../rules/06-04-screen-keep-derived-values-close.md)에 있습니다.
