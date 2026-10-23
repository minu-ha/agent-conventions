// src/service/orders.test.ts
import { expect, test } from "vitest";

import { getOrder } from "@/service/orders";

test("없는 주문은 오류를 반환한다", async () => {
	// [!code error]
	await getOrder("missing").catch((error: unknown) => {
		expect(error).toBeDefined();
	});
});
