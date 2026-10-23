// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("양수 수량을 표시한다", () => {
	/**
	 * GIVEN
	 * 일반 양수 하나
	 */
	const value = 1234;

	/**
	 * WHEN
	 * 수량의 표시 문자열 계산
	 */
	const label = formatQuantity(value);

	/**
	 * THEN
	 * 양수의 표시 형식
	 */
	expect(label).toBe("1,234.00");
});
