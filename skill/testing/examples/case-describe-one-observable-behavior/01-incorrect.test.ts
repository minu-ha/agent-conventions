// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("잘된다", () => {
	expect(formatQuantity(null)).toBe("-");
	expect(formatQuantity(1234)).toBe("1,234.00");
});
