// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

// [!code ++]
test("수량이 없으면 빈 값 표시를 반환한다", () => {
	/**
	 * GIVEN
	 * 없는 수량
	 */
	const quantity = null;

	/**
	 * WHEN
	 * 수량의 표시 문자열 계산
	 */
	const label = formatQuantity(quantity);

	/**
	 * THEN
	 * 빈 값 표시
	 */
	expect(label).toBe("-");
});

test("수량이 있으면 천 단위 구분과 소수 두 자리로 표시한다", () => {
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
	 * 천 단위 구분과 소수 두 자리
	 */
	expect(label).toBe("1,234.00");
});
