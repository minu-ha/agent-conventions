// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

// [!code error]
test("배포 smoke: 수량을 표시한다", () => {
	/**
	 * GIVEN
	 * 일반 수량 입력
	 */
	const quantity = 1234;

	/**
	 * WHEN
	 * 포맷 함수만 실행
	 */
	const label = formatQuantity(quantity);

	/**
	 * THEN
	 * 배포 산출물을 거치지 않은 함수 결과
	 */
	expect(label).toBe("1,234.00");
});
