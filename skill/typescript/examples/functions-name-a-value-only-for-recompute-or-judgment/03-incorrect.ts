const toNextPage = (page: number): number => {
// [!code error]
	const nextPage = page + 1;

// [!code error]
	return nextPage;
};

const toRowLabel = (row: Row): string => {
// [!code error]
	const rowLabel = `${row.name} (${row.id})`;

// [!code error]
	return rowLabel;
};
