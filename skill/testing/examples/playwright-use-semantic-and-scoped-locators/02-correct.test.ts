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
	// [!code ++]
	await page
		.getByRole("dialog", { name: "주문 등록" })
		.getByRole("button", { name: "저장", exact: true })
		.click();

	/**
	 * THEN
	 * 저장 완료 안내
	 */
	await expect(page.getByRole("status")).toHaveText("저장했습니다");
});
