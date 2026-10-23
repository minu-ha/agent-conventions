// test/_golden/order-rows.test.ts
import { expect, test } from "vitest";

import { toOrderRows } from "@/page/orders/_function/to-order-rows";

test("주문 행이 기준값과 같다", () => {
	/**
	 * GIVEN
	 * 수량이 2인 주문
	 */
	const orders = [{ id: "order-1", quantity: 2, status: "open" as const }];

	/**
	 * WHEN
	 * 표시용 주문 행 계산
	 */
	const rows = toOrderRows(orders);

	/**
	 * THEN
	 * 행의 의미가 남는 작은 기준값
	 */
	// [!code ++]
	expect(rows).toMatchInlineSnapshot(`
		[
			{
				"id": "order-1",
				"quantityLabel": "2.00",
			},
		]
	`);
});
