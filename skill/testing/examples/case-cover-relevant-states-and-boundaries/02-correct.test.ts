// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

// [!code ++]
test.each([
	{ name: "양수", value: 1234, expected: "1,234.00" },
	{ name: "0", value: 0, expected: "0.00" },
	{ name: "빈 값", value: null, expected: "-" },
])("$name 수량의 표시 계약을 지킨다", (input) => {
	/**
	 * GIVEN
	 * test.each의 이름으로 구분되는 경계 입력
	 */

	/**
	 * WHEN
	 * 수량의 표시 문자열 계산
	 */
	const label = formatQuantity(input.value);

	/**
	 * THEN
	 * 입력 표에 적힌 독립 기대값
	 */
	expect(label).toBe(input.expected);
});
