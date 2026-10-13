// service/product/to-product-save-request.ts
/**
 * 상품 저장 요청. 서버 검증에 맞춰 미리 정리
 *
 * - title: 앞뒤 공백 거부
 * - price: 원 단위 정수만 허용
 * - tags: 한도를 넘기면 저장 실패
 */
export const toProductSaveRequest = (draft: ProductDraft): ProductSaveRequest => {
	return {
		title: draft.title.trim(),
		price: Math.round(draft.price),
		tags: draft.tags.slice(0, product_tag_limit),
	};
};
