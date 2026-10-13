// [!code ++]
/**
// [!code ++]
 * GET /orders의 P, C, D 코드를 화면의 주문 상태 어휘로 바꾸는 API 경계 계약
// [!code ++]
 */
const order_status_by_api_code = {
	P: "pending",
	C: "completed",
	D: "cancelled",
} as const satisfies Record<OrderStatusCode, OrderStatus>;
