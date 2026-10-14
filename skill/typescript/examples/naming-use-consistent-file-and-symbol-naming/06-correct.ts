/**
 * 상품 저장 요청 조립. 서버 계약이 snake_case라 그 표기 그대로 전달
 */
const toProductSaveBody = (values: ProductFormValues) => {
	return {
// [!code ++]
		category_id: values.categoryId,
// [!code ++]
		product_name: values.name.trim(),
	};
};
