// [!code error]
// 서버 계약은 {product_id, display_name}인데 우리 표기로 바꿔 전송
/**
// [!code error]
 * 상품 저장 요청 조립
 */
const toProductSaveBody = (values: ProductFormValues) => {
	return {
// [!code error]
		productId: values.productId,
// [!code error]
		displayName: values.displayName.trim(),
	};
};
