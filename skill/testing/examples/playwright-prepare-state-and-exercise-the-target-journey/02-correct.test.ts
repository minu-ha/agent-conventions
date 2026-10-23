// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("목록의 주문 링크로 상세에 진입한다", async ({ page }) => {
	/**
	 * GIVEN
	 * 수량 정렬된 주문 목록
	 */
	await page.goto("/orders?sort=quantity");

	/**
	 * WHEN
	 * 목록의 주문 링크 클릭
	 */
	// [!code ++]
	await page.getByRole("link", { name: "주문 order-1", exact: true }).click();

	/**
	 * THEN
	 * 선택한 주문의 상세 화면
	 */
	await expect(
		page.getByRole("heading", { name: "주문 order-1" }),
	).toBeVisible();
});
