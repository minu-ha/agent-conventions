// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("목록의 주문 링크로 상세에 진입한다", async ({ page }) => {
	await page.goto("/orders?sort=quantity");
	// [!code ++]
	await page.getByRole("link", { name: "주문 order-1", exact: true }).click();
	await expect(
		page.getByRole("heading", { name: "주문 order-1" }),
	).toBeVisible();
});
