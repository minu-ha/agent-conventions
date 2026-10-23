// src/page/orders/_function/to-order-rows.test.ts
import { expect, test } from "vitest";

// [!code ++]
import { toOrderRows } from "@/page/orders/_function/to-order-rows";

test("수량을 표시용 행으로 변환한다", () => {
	expect(
		toOrderRows([{ id: "order-1", quantity: 2, status: "open" }]),
	).toStrictEqual([{ id: "order-1", quantityLabel: "2.00" }]);
});
