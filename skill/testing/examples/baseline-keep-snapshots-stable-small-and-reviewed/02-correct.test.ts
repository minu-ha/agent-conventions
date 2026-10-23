// test/_golden/order-rows.test.ts
import { expect, test } from "vitest";

import { toOrderRows } from "@/page/orders/_function/to-order-rows";

test("주문 행이 기준값과 같다", () => {
	const rows = toOrderRows([{ id: "order-1", quantity: 2, status: "open" }]);
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
