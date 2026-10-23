// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

// [!code ++]
test("수량이 없으면 빈 값 표시를 반환한다", () => {
	expect(formatQuantity(null)).toBe("-");
});

test("수량이 있으면 천 단위 구분과 소수 두 자리로 표시한다", () => {
	expect(formatQuantity(1234)).toBe("1,234.00");
});
