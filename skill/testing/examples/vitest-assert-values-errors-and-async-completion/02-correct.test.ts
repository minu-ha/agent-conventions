// src/service/orders.test.ts
import { expect, test } from "vitest";

import { getOrder } from "@/service/orders";

test("없는 주문은 오류를 반환한다", async () => {
	/**
	 * GIVEN
	 * 존재하지 않는 주문 ID
	 */
	const orderId = "missing";

	/**
	 * WHEN
	 * 주문 조회 시작
	 */
	const request = getOrder(orderId);

	/**
	 * THEN
	 * 약속된 오류의 비동기 완료
	 */
	// [!code ++]
	await expect(request).rejects.toThrow("주문이 없습니다");
});
