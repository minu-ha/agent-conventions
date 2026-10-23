// src/service/orders.test.ts
import { expect, test } from "vitest";

import { getOrder } from "@/service/orders";

test("없는 주문은 오류를 반환한다", async () => {
	// [!code ++]
	await expect(getOrder("missing")).rejects.toThrow("주문이 없습니다");
});
