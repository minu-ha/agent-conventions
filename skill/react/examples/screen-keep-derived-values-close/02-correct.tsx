export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 search 파라미터로 올리지 않음
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.products} onRowSelect={handleTableRowSelect} />

// [!code ++]
			{selectedRows.length > 0 && (
// [!code ++]
				<PgProductBulkActionBar label={`${selectedRows.length}건 삭제`} />
// [!code ++]
			)}
		</Fragment>
	);
};
