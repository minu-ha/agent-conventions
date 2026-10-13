// [!code ++]
// page/products/pg-products.tsx
export const PgProducts = () => {
// [!code ++]
	/**
// [!code ++]
	 * 실패는 셸의 화면 층 경계가 처리. 본문은 성공 경로만 그림
// [!code ++]
	 */
	const responseProductListSuspense = useProductListSuspense();

	return <UiTable rows={responseProductListSuspense.data.products} />;
};
