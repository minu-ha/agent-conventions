/**
 * 상품 목록. 조회 실패 처리는 호출부 담당
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
