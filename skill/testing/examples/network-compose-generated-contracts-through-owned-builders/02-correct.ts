// src/service/mock/mock-orders.ts
import { createOrderDto } from "@/service/__kubb/mock/order-dto";

/**
 * 주문 목록의 정상 본문. 화면이 읽는 값과 목록 건수 고정
 */
export const mockOrders = () => {
	// [!code ++]
	const items = [createOrderDto({ id: "order-1", quantity: 1234, status: "open" })];

	return { items, total: items.length, page: 1, updatedAt: "2026-03-01T03:00:00Z" };
};
