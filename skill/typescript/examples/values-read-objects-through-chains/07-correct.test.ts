import { expect, test } from "@playwright/test";

// Playwright의 매개변수 이름에 따른 fixture 의존성 해석 계약
test("제목이 표시된다", async ({ page }) => {
	await page.goto("/orders");
	await expect(page.getByRole("heading", { name: "주문 목록" })).toBeVisible();
});
