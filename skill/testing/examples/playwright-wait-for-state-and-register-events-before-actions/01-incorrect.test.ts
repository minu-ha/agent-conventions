// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("조회 후 목록이 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 주문 목록의 진입 경로
	 */
	const path = "/orders";

	/**
	 * WHEN
	 * 주문 조회 뒤 고정 시간 대기
	 */
	await page.goto(path);
	// [!code error]
	await page.waitForTimeout(1000);

	/**
	 * THEN
	 * 한 번 읽은 완료 문구
	 */
	expect(await page.getByRole("status").textContent()).toBe("조회했습니다");
});
