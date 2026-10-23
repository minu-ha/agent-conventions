import { expect, test } from "@playwright/test";

// Playwright의 매개변수 이름에 따른 fixture 의존성 해석 계약
test("제목이 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 주문 목록의 진입 경로
	 */
	const path = "/orders";

	/**
	 * WHEN
	 * fixture가 제공한 page로 진입
	 */
	await page.goto(path);

	/**
	 * THEN
	 * 주문 목록 제목
	 */
	await expect(page.getByRole("heading", { name: "주문 목록" })).toBeVisible();
});
