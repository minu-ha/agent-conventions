// test/orders/orders.integration.spec.ts
import { expect, test } from "@playwright/test";

test("빈 주문 목록에 안내가 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 빈 주문 목록을 응답하는 서버
	 */
	// [!code ++]
	await page.route("**/api/orders", async (route) => {
		await route.fulfill({ json: { items: [], total: 0 } });
	});

	/**
	 * WHEN
	 * 실제 주문 화면 진입
	 */
	await page.goto("/orders");

	/**
	 * THEN
	 * 실제 응답 처리 뒤 빈 목록 안내
	 */
	await expect(page.getByRole("status")).toHaveText("주문이 없습니다");
});
