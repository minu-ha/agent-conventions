// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("목록의 주문 링크로 상세에 진입한다", async ({ page }) => {
	/**
	 * GIVEN
	 * 목록에서 선택할 주문 ID
	 */
	const orderId = "order-1";

	/**
	 * WHEN
	 * 링크를 거치지 않고 상세 직접 진입
	 */
	// [!code error]
	await page.goto(`/orders/${orderId}`);

	/**
	 * THEN
	 * 상세 화면의 제목
	 */
	await expect(
		page.getByRole("heading", { name: "주문 order-1" }),
	).toBeVisible();
});
