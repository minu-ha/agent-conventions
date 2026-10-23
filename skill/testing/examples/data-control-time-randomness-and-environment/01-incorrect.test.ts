// src/util/date/normalize-date-range.test.ts
import dayjs from "dayjs";
import { expect, test } from "vitest";

import { normalizeDateRange } from "@/util/date/normalize-date-range";

test("빈 기간의 종료일은 오늘이다", () => {
	/**
	 * GIVEN
	 * 종료일이 없는 기간
	 */
	const input = { startDate: "", endDate: "" };

	/**
	 * WHEN
	 * 기간 보정
	 */
	const range = normalizeDateRange(input);

	/**
	 * THEN
	 * 현재 날짜에서 다시 계산한 기대값
	 */
	// [!code error]
	expect(range.endDate).toBe(dayjs().format("YYYY-MM-DD"));
});
