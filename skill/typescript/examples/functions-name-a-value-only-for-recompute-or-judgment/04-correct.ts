const toNextPage = (page: number): number => {
// [!code ++]
	return page + 1;
};

const toRowLabel = (row: Row): string => {
// [!code ++]
	return `${row.title} (${row.id})`;
};
