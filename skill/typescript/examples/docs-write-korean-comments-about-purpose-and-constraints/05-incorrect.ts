// service/product/to-product-save-request.ts
/**
// [!code error]
 * 상품 저장 요청. 서버가 빈 문자열과 앞뒤 공백을 거부하고, 가격은 원 단위 정수만 받으며, 태그는 한도를 넘기면 저장 자체가 실패하기 때문에 여기서 미리 정리해서 보낸다.
 */
export const toProductSaveRequest = (draft: ProductDraft): ProductSaveRequest => {
	return {
		title: draft.title.trim(),
		price: Math.round(draft.price),
		tags: draft.tags.slice(0, product_tag_limit),
	};
};
