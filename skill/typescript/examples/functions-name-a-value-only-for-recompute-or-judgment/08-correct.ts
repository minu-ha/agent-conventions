const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
// [!code ++]
	// 콜백 안으로 옮기면 행마다 다시 계산
// [!code ++]
	const lowerKeyword = keyword.trim().toLowerCase();

// [!code ++]
	return rows.filter((row) => row.title.toLowerCase().includes(lowerKeyword));
};
