// src/service/msw/orders/get-orders.ts
import { createGetOrdersStatus200 } from "@/service/__kubb/mock/orders/get-orders";
import { getOrdersHandler, getOrdersHandlerResponse200 } from "@/service/__kubb/msw/orders/get-orders-handler";
import { mockOrders } from "@/service/mock/mock-orders";

/**
 * 주문 조회의 성공 응답. 본문 계산은 도메인 builder 소유
 */
// [!code ++]
export const get_orders_handler = getOrdersHandler(() => {
	return getOrdersHandlerResponse200(createGetOrdersStatus200(mockOrders()));
});
