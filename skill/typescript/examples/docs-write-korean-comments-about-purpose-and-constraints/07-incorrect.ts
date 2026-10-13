/**
// [!code error]
 * @api 상품 목록. 조회 실패는 호출부에서 처리
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
