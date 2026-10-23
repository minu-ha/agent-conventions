// src/page/orders/_function/to-order-rows.test.ts
import { expect, test } from "vitest";

import type { OrderDto } from "@/service/orders";

import { toOrderRows } from "@/page/orders/_function/to-order-rows";

test("수량을 행에 표시한다", () => {
	/**
	 * GIVEN
	 * 표에 표시할 주문 입력
	 */
	// [!code ++]
	const order = { id: "order-1", quantity: 2, status: "open" } satisfies OrderDto;

	/**
	 * WHEN
	 * 실제 주문 행 변환
	 */
	const rows = toOrderRows([order]);

	/**
	 * THEN
	 * 입력 수량의 표시 문자열
	 */
	expect(rows[0].quantityLabel).toBe("2.00");
});
