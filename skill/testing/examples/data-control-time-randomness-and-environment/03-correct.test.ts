// test/reports/reports.integration.spec.ts
import { expect, test } from "@playwright/test";
import dayjs from "dayjs";

const scenario_clock = {
	instant: "2026-03-01T12:00:00+09:00",
	date: "2026-03-01",
} as const;

test.use({ timezoneId: "Asia/Seoul" });

test("응답과 화면이 같은 기준 날짜를 사용한다", async ({ page }) => {
	/**
	 * GIVEN
	 * 브라우저와 Node가 공유하는 날짜
	 */
	await page.clock.setFixedTime(dayjs(scenario_clock.instant).toDate());
	await page.route("**/api/reports/range", async (route) => {
		await route.fulfill({
			json: { startDate: scenario_clock.date, endDate: scenario_clock.date },
		});
	});

	/**
	 * WHEN
	 * 기간 화면 진입
	 */
	await page.goto("/reports");

	/**
	 * THEN
	 * 시나리오 기준 날짜로 표시된 종료일
	 */
	await expect(page.getByLabel("종료일")).toHaveValue("2026-03-01");
});
