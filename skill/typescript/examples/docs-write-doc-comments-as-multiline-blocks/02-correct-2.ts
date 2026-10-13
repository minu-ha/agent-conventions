// service/product/save-product.ts
// [!code ++]
/**
// [!code ++]
 * 상품 저장 요청. 응답 본문이 없어 성공은 상태 코드로만 확인
// [!code ++]
 */
export const saveProduct = async (product: Product): Promise<void> => {
	await client.post("/products", product);
};
