// src/page/orders/_function/to-order-rows.test.ts
import { expect, test } from "vitest";

import type { OrderDto } from "@/service/orders";

import { toOrderRows } from "@/page/orders/_function/to-order-rows";

// [!code ++]
const order = { id: "order-1", quantity: 2, status: "open" } satisfies OrderDto;

test("수량을 행에 표시한다", () => {
	expect(toOrderRows([order])[0].quantityLabel).toBe("2.00");
});
