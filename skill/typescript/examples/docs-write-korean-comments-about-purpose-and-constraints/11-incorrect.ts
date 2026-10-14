// page/product/pg-product-table.tsx
/**
 * 상품들을 표에 그릴 형태로
 */
const responseProductListSuspense = useGetProductListSuspense(
	{ query: { page: urlParams.page } },
	{ query: { select: (response: ProductListResponseDTO) => toProductRows(response) } },
);
