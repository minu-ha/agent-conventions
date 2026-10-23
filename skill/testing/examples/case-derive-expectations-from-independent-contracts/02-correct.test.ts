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
	 * 직접 확인한 표시 형식
	 */
	// [!code ++]
	expect(label).toBe("1,234.00");
});
