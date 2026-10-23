// test/orders/orders.integration.spec.ts
import { expect, test } from "@playwright/test";

test("기본 주문 목록의 수량을 표시한다", async ({ page }) => {
	/**
	 * GIVEN
	 * spec마다 직접 복사한 정상 응답
	 */
	// [!code error]
	await page.route("**/api/orders", async (route) => {
		await route.fulfill({ json: { items: [{ id: "order-1", quantity: 1234 }], total: 1 } });
	});

	/**
	 * WHEN
	 * 주문 화면 진입
	 */
	await page.goto("/orders");

	/**
	 * THEN
	 * 표시된 수량
	 */
	await expect(page.getByRole("cell", { name: "1,234.00", exact: true })).toBeVisible();
});
