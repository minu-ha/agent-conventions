// test/session/session.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("세션이 없으면 인증 안내가 표시된다", async ({ browser }) => {
	/**
	 * GIVEN
	 * 세션을 넣지 않은 독립 context
	 */
	const context = await browser.newContext({ baseURL: "https://app.example.test" });
	try {
		/**
		 * WHEN
		 * 보호된 주문 화면 진입
		 */
		const page = await context.newPage();
		await page.goto("/orders");

		/**
		 * THEN
		 * 인증이 필요한 사용자 안내
		 */
		await expect(page.getByRole("alert")).toHaveText("로그인이 필요합니다");
	} finally {
		// [!code ++]
		await context.close();
	}
});
