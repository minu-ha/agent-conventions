// src/service/msw/handlers.test.ts
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { setupServer } from "msw/node";

import { mock_handlers } from "@/service/msw/handlers";

const server = setupServer(...mock_handlers);

beforeAll(() => {
	// [!code error]
	server.listen({ onUnhandledRequest: "bypass" });
});
afterEach(() => {
	server.resetHandlers();
});
afterAll(() => {
	server.close();
});

test("공유 registry가 주문 목록 응답을 돌려준다", async () => {
	/**
	 * GIVEN
	 * Node에 연결한 공유 registry
	 */
	const url = "https://app.example.test/api/orders";

	/**
	 * WHEN
	 * 주문 API 요청
	 */
	const response = await fetch(url);

	/**
	 * THEN
	 * builder가 고정한 대표 주문과 건수
	 */
	expect(await response.json()).toMatchObject({ total: 1, items: [{ id: "order-1" }] });
});
