// test/orders/orders.integration.spec.ts
import { expect, test } from "@playwright/test";

test("저장하면 완료 안내가 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 주문 등록 모달이 열린 화면
	 */
	await page.goto("/orders/new");

	/**
	 * WHEN
	 * 주문 저장
	 */
	// [!code error]
	await page.locator(".MuiDialog-root button").last().click();

	/**
	 * THEN
	 * 저장 완료 안내
	 */
	await expect(page.getByRole("status")).toHaveText("저장했습니다");
});
