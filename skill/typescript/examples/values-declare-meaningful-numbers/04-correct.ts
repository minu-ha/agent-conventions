// page/products/pg-products.tsx
const toFirstRow = (rows: Row[]): Row | undefined => {
// [!code ++]
	return rows[0];
};

const toNextPage = (page: number): number => {
// [!code ++]
	return page + 1;
};
