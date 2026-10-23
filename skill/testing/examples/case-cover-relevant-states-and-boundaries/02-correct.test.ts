// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

// [!code ++]
test.each([
	{ name: "양수", value: 1234, expected: "1,234.00" },
	{ name: "0", value: 0, expected: "0.00" },
	{ name: "빈 값", value: null, expected: "-" },
])("$name 수량의 표시 계약을 지킨다", (input) => {
	expect(formatQuantity(input.value)).toBe(input.expected);
});
