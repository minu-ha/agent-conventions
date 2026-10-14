// service/order/to-order-save-request.ts
/**
 * 주문 저장 요청. 서버 검증 기준 사전 정리
 *
 *   - 제약: 수량은 정수만 허용 (백엔드 답변 10-07)
 *   - 임시: 배송 메모 200자 절단, 서버 한도 확장 시 삭제 (기획 10-14)
 */
export const toOrderSaveRequest = (draft: OrderDraft): OrderSaveRequest => {
	return {
		quantity: Math.round(draft.quantity),
		memo: draft.memo.slice(0, order_memo_limit),
	};
};
