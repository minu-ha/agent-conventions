// src/util/date/normalize-date-range.test.ts
import dayjs from "dayjs";
import { expect, test } from "vitest";

import { normalizeDateRange } from "@/util/date/normalize-date-range";

test("빈 기간의 종료일은 오늘이다", () => {
	const range = normalizeDateRange({ startDate: "", endDate: "" });
	// [!code error]
	expect(range.endDate).toBe(dayjs().format("YYYY-MM-DD"));
});
