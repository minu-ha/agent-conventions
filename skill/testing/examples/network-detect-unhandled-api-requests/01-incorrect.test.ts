// test/_fixture/server.test.ts
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
	http.get("https://app.example.test/api/orders", () => {
		return HttpResponse.json({ items: [], total: 0 });
	}),
);

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

test("주문 목록 응답을 받는다", async () => {
	/**
	 * GIVEN
	 * 모듈 fixture의 주문 목록 handler
	 */
	const url = "https://app.example.test/api/orders";

	/**
	 * WHEN
	 * 주문 API 요청
	 */
	const response = await fetch(url);

	/**
	 * THEN
	 * fixture에서 정한 빈 목록과 건수
	 */
	expect(await response.json()).toStrictEqual({ items: [], total: 0 });
});
