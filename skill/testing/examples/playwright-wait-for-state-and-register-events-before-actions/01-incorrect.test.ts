// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("조회 후 목록이 표시된다", async ({ page }) => {
	await page.goto("/orders");
	// [!code error]
	await page.waitForTimeout(1000);
	expect(await page.getByRole("status").textContent()).toBe("조회했습니다");
});
