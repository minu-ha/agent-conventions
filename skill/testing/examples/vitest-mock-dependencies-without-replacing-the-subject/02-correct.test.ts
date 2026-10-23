// src/page/orders/_function/to-order-rows.test.ts
import { expect, test } from "vitest";

// [!code ++]
import { toOrderRows } from "@/page/orders/_function/to-order-rows";

test("수량을 표시용 행으로 변환한다", () => {
	/**
	 * GIVEN
	 * 변환할 실제 주문 입력
	 */
	const orders = [{ id: "order-1", quantity: 2, status: "open" as const }];

	/**
	 * WHEN
	 * 표시용 주문 행 변환
	 */
	const rows = toOrderRows(orders);

	/**
	 * THEN
	 * ID와 표시 문자열의 변환 계약
	 */
	expect(rows).toStrictEqual([{ id: "order-1", quantityLabel: "2.00" }]);
});
