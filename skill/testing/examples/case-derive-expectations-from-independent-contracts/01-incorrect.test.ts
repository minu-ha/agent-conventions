// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("수량을 표시한다", () => {
	/**
	 * GIVEN
	 * 천 단위 구분이 필요한 수량
	 */
	const quantity = 1234;

	/**
	 * WHEN
	 * 수량의 표시 문자열 계산
	 */
	const label = formatQuantity(quantity);

	/**
	 * THEN
	 * 같은 구현으로 다시 계산한 기대값
	 */
	// [!code error]
	expect(label).toBe(formatQuantity(quantity));
});
