// test/reports/reports.integration.spec.ts
import { expect, test } from "@playwright/test";

const ranges = [
	{ start: "2026-03-01", end: "2026-01-01" },
	{ start: "2026-04-01", end: "2026-02-01" },
	{ start: "2026-05-01", end: "2026-03-01" },
];

for (const range of ranges) {
	test(`뒤집힌 기간 ${range.start}를 보정한다`, async ({ page }) => {
		await page.goto(`/reports?startDate=${range.start}&endDate=${range.end}`);
		await expect(page.getByLabel("시작일")).toHaveValue(range.end);
		await expect(page.getByLabel("종료일")).toHaveValue(range.start);
	});
}
