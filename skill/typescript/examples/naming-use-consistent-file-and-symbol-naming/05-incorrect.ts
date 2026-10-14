// [!code error]
// 서버 계약은 {category_id, product_name}인데 우리 표기로 바꿔 전송
/**
 * 상품 저장 요청 조립
 */
const toProductSaveBody = (values: ProductFormValues) => {
	return {
// [!code error]
		categoryId: values.categoryId,
// [!code error]
		productName: values.name.trim(),
	};
};
