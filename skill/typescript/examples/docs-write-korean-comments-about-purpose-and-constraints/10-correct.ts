// service/order/to-order-save-request.ts
/**
 * 주문 저장 요청. 서버 검증에 맞춰 미리 정리
 *
 *   - 제약: 수량은 정수만 허용 (백엔드 답변 10-07)
 *   - 임시: 배송 메모 200자 자르기. 서버가 한도를 늘리면 삭제 (기획 10-14)
 */
export const toOrderSaveRequest = (draft: OrderDraft): OrderSaveRequest => {
	return {
		quantity: Math.round(draft.quantity),
		memo: draft.memo.slice(0, order_memo_limit),
	};
};
