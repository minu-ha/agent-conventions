const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
// [!code error]
	return rows.filter((row) => row.name.toLowerCase().includes(keyword.trim().toLowerCase()));
};
