// [!code ++]
// 행 5,000개에서 매 렌더 필터링 120ms 측정. 지연한 검색어에만 재계산
const filteredRows = useMemo(() => {
	return rows.filter((row) => matchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
