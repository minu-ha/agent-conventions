export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 search 파라미터로 올리지 않음
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

// [!code error]
	// 아래 둘은 이름만 남기고 무엇에서 나온 값인지 지움
// [!code error]
	const hasSelectedRows = selectedRows.length > 0;
// [!code error]
	const bulkActionLabel = `${selectedRows.length}건 삭제`;

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.items} onRowSelect={handleTableRowSelect} />

// [!code error]
			{hasSelectedRows && <PgProductBulkActionBar label={bulkActionLabel} />}
		</Fragment>
	);
};
