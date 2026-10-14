// service/product/to-product-save-request.ts
/**
 * 상품 저장 요청. 서버 검증 기준 사전 정리
 *
 *   - 제약: name 앞뒤 공백 불가
 *   - 제약: price 원 단위 정수만 허용
 *   - 제약: tags 한도 초과 시 저장 실패
 */
export const toProductSaveRequest = (draft: ProductDraft): ProductSaveRequest => {
	return {
		name: draft.name.trim(),
		price: Math.round(draft.price),
		tags: draft.tags.slice(0, product_tag_limit),
	};
};
