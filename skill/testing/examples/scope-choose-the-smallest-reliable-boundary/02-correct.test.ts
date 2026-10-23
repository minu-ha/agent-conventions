// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("수량은 소수 두 자리로 표시된다", () => {
	// [!code ++]
	expect(formatQuantity(1234)).toBe("1,234.00");
});
