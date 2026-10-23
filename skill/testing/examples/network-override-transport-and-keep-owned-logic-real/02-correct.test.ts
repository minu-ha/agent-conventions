// test/orders/orders.integration.spec.ts
import { expect, test } from "@playwright/test";

test("빈 주문 목록에 안내가 표시된다", async ({ page }) => {
	// [!code ++]
	await page.route("**/api/orders", async (route) => {
		await route.fulfill({ json: { items: [], total: 0 } });
	});
	await page.goto("/orders");
	await expect(page.getByRole("status")).toHaveText("주문이 없습니다");
});
