// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("목록에 주문이 표시된다", async ({ page }) => {
	await page.goto("/orders");
	await expect(
		page
			.getByRole("table", { name: "주문 목록" })
			.getByRole("row")
			.filter({ hasText: "order-1" }),
	).toBeVisible();
});

test("주문을 누르면 상세로 이동한다", async ({ page }) => {
	await page.goto("/orders");
	await page
		.getByRole("table", { name: "주문 목록" })
		.getByRole("row")
		.filter({ hasText: "order-1" })
		.getByRole("link")
		.click();
	await expect(page).toHaveURL(/\/orders\/order-1$/);
});
