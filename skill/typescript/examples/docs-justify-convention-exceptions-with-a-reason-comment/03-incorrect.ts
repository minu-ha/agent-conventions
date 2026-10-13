// [!code error]
// 안전하게 다시 계산하지 않도록
const filteredRows = useMemo(() => {
	return rows.filter((row) => matchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
