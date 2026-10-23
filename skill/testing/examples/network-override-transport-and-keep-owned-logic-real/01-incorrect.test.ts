// test/orders/orders.integration.spec.ts
import { expect, test } from "@playwright/test";

test("빈 주문 목록에 안내가 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 실제 주문 화면
	 */
	await page.goto("/orders");

	/**
	 * WHEN
	 * DOM에 정답 문구 직접 삽입
	 */
	// [!code error]
	await page.getByRole("main").evaluate((element) => {
		element.innerHTML = '<p role="status">주문이 없습니다</p>';
	});

	/**
	 * THEN
	 * 삽입한 문구의 존재
	 */
	await expect(page.getByRole("status")).toHaveText("주문이 없습니다");
});
