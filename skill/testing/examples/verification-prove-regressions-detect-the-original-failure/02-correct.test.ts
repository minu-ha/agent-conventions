// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("0도 수량으로 처리한다", () => {
	/**
	 * GIVEN
	 * 빈 값으로 오인하면 안 되는 0
	 */
	const value = 0;

	/**
	 * WHEN
	 * 수량의 표시 문자열 계산
	 */
	const label = formatQuantity(value);

	/**
	 * THEN
	 * 0의 실제 표시 결과
	 */
	// [!code ++]
	expect(label).toBe("0.00");
});
