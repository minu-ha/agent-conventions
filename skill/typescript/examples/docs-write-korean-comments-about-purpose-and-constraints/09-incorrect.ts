// service/order/to-order-save-request.ts
/**
 * 주문 저장 요청
 *
 * 10-07 서버가 수량을 정수로만 받게 되어 반올림 추가
 * 배송 메모는 서버가 200자에서 자름 (10-14)
 */
export const toOrderSaveRequest = (draft: OrderDraft): OrderSaveRequest => {
	return {
		quantity: Math.round(draft.quantity),
		memo: draft.memo.slice(0, order_memo_limit),
	};
};
