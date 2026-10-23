// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("수량은 소수 두 자리로 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 수량 입력 화면
	 */
	await page.goto("/orders/new");

	/**
	 * WHEN
	 * 수량 1234 입력
	 */
	await page.getByLabel("수량").fill("1234");

	/**
	 * THEN
	 * 천 단위 구분과 소수 두 자리
	 */
	await expect(page.getByRole("status")).toHaveText("1,234.00");
});
