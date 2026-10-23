// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("잘된다", () => {
	/**
	 * GIVEN
	 * 빈 수량과 일반 수량
	 */
	const input = { empty: null, quantity: 1234 };

	/**
	 * WHEN
	 * 서로 다른 두 표시 계약의 실행
	 */
	const labels = { empty: formatQuantity(input.empty), quantity: formatQuantity(input.quantity) };

	/**
	 * THEN
	 * 서로 다른 결과를 모은 단언
	 */
	expect(labels.empty).toBe("-");
	expect(labels.quantity).toBe("1,234.00");
});
