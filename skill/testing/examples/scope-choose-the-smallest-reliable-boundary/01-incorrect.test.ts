// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("수량은 소수 두 자리로 표시된다", async ({ page }) => {
	await page.goto("/orders/new");
	await page.getByLabel("수량").fill("1234");
	await expect(page.getByRole("status")).toHaveText("1,234.00");
});
