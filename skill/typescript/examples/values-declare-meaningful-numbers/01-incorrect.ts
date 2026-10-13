// page/products/pg-products.tsx
// [!code error]
const maxAttempts = 42;

const isOverRetryLimit = (attempts: number): boolean => {
// [!code error]
	return attempts > maxAttempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
// [!code error]
	return rows.slice(0, 37);
};
