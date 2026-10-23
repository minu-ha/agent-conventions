// test/session/session.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("세션이 없으면 인증 안내가 표시된다", async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto("/orders");
	// [!code error]
	await expect(page.getByRole("alert")).toHaveText("로그인이 필요합니다");
	await context.close();
});
