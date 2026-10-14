// page/product-detail/_function/to-product-save-request.ts
/**
 * 상품 저장 요청 조립. 서버가 앞뒤 공백이 붙은 name 거부
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {name: values.name.trim()}};
};
