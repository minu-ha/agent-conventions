// src/page/orders/_function/to-order-rows.test.ts
import { expect, test, vi } from "vitest";

import { toOrderRows } from "@/page/orders/_function/to-order-rows";

// [!code error]
vi.mock(import("@/page/orders/_function/to-order-rows"), () => ({
	toOrderRows: vi.fn(() => [{ id: "order-1", quantityLabel: "2.00" }]),
}));

test("수량을 표시용 행으로 변환한다", () => {
	expect(
		toOrderRows([{ id: "order-1", quantity: 2, status: "open" }]),
	).toStrictEqual([{ id: "order-1", quantityLabel: "2.00" }]);
});
