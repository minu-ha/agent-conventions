// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("목록에 주문이 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 조회할 주문 목록
	 */
	const path = "/orders";

	/**
	 * WHEN
	 * 주문 목록 진입
	 */
	await page.goto(path);

	/**
	 * THEN
	 * 목록의 대표 주문
	 */
	await expect(page
		.getByRole("table", { name: "주문 목록" })
		.getByRole("row")
		.filter({ hasText: "order-1" })).toBeVisible();
});

test("주문을 누르면 상세로 이동한다", async ({ page }) => {
	/**
	 * GIVEN
	 * 대표 주문이 있는 목록
	 */
	await page.goto("/orders");

	/**
	 * WHEN
	 * 대표 주문 링크 클릭
	 */
	await page
		.getByRole("table", { name: "주문 목록" })
		.getByRole("row")
		.filter({ hasText: "order-1" }).getByRole("link").click();

	/**
	 * THEN
	 * 선택한 주문의 상세 URL
	 */
	await expect(page).toHaveURL(/\/orders\/order-1$/);
});
