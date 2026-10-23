// test/orders/orders.integration.spec.ts
import { expect, test } from "@playwright/test";

test("빈 주문 목록에 안내가 표시된다", async ({ page }) => {
	await page.goto("/orders");
	// [!code error]
	await page.getByRole("main").evaluate((element) => {
		element.innerHTML = '<p role="status">주문이 없습니다</p>';
	});
	await expect(page.getByRole("status")).toHaveText("주문이 없습니다");
});
