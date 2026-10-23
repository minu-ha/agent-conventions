// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("수량은 소수 두 자리로 표시된다", () => {
	/**
	 * GIVEN
	 * 소수 표기를 확인할 수량
	 */
	const quantity = 1234;

	/**
	 * WHEN
	 * 수량의 표시 문자열 계산
	 */
	// [!code ++]
	const label = formatQuantity(quantity);

	/**
	 * THEN
	 * 천 단위 구분과 소수 두 자리
	 */
	expect(label).toBe("1,234.00");
});
