// page/product/pg-product-table.tsx
/**
 * 상품 목록 조회, 표 행 뷰모델 가공
 * {@link /api/product}
 */
const responseProductListSuspense = useGetProductListSuspense(
	{ query: { page: urlParams.page } },
	{ query: { select: (response: ProductListResponseDTO) => toProductRows(response) } },
);
