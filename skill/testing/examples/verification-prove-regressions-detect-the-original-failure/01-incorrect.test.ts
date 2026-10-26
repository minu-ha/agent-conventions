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
	 * 수량 표시 문자열을 계산하는 호출
	 */
	const format = () => formatQuantity(value);

	/**
	 * THEN
	 * 오류 발생 여부만 검사
	 */
	// [!code error]
	expect(format).not.toThrow();
});
