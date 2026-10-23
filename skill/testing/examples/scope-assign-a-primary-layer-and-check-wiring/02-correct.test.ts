// test/reports/reports.integration.spec.ts
import { expect, test } from "@playwright/test";

test("뒤집힌 URL 기간이 입력란에 보정돼 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 뒤집힌 기간이 있는 URL
	 */
	const path = "/reports?startDate=2026-03-01&endDate=2026-01-01";

	/**
	 * WHEN
	 * URL로 화면 진입
	 */
	await page.goto(path);

	/**
	 * THEN
	 * 보정된 날짜와 입력란의 실제 연결
	 */
	// [!code ++]
	await expect(page.getByLabel("시작일")).toHaveValue("2026-01-01");
	await expect(page.getByLabel("종료일")).toHaveValue("2026-03-01");
});
