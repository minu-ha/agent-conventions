// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("조회 후 목록이 표시된다", async ({ page }) => {
	await page.goto("/orders");
	// [!code ++]
	await expect(page.getByRole("status")).toHaveText("조회했습니다");
});
