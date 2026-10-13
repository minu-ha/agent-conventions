// service/product/fetch-product-list.ts
// [!code ++]
/**
// [!code ++]
 * 상품 목록. 조회 실패는 호출부에서 처리
// [!code ++]
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
