// [!code ++]
// page/product-detail/_function/to-product-save-request.ts
// [!code ++]
/**
// [!code ++]
 * 상품 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title 거부
// [!code ++]
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
// [!code ++]
	return {body: {title: values.title.trim()}};
};
