// test/reports/reports.integration.spec.ts
import { expect, test } from "@playwright/test";

test("뒤집힌 URL 기간이 입력란에 보정돼 표시된다", async ({ page }) => {
	await page.goto("/reports?startDate=2026-03-01&endDate=2026-01-01");
	// [!code ++]
	await expect(page.getByLabel("시작일")).toHaveValue("2026-01-01");
	await expect(page.getByLabel("종료일")).toHaveValue("2026-03-01");
});
