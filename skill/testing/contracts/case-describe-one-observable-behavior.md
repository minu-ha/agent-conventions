# Describe One Observable Behavior

**Impact: MEDIUM (실패한 제목만으로 깨진 동작과 필요한 사전조건을 찾을 수 있습니다)**

제목은 조건과 관찰 가능한 결과를 설명하고 테스트 하나는 그 동작에 필요한 준비, 실행, 검증을 담습니다.
하나의 표시 계약에 속한 여러 필드나 부수효과는 같은 테스트에서 함께 단언할 수 있습니다.

서로 독립적인 실패 원인이면 테스트를 나누거나 입력별로 이름이 남는 매개변수화를 사용합니다.
같은 상태 전이의 여러 단계는 step으로 구분할 수 있습니다.
GIVEN, WHEN, THEN은 논리적 구분이며 짧은 테스트에 세 주석을 기계적으로 붙이지 않습니다.
주석 형식, 제목 언어, 케이스 ID가 결과서 생성에 쓰이면 그 프로젝트의 형식을 지킵니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (이름만으로 어떤 조건이 깨졌는지 알 수 없습니다):**

```ts
// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("잘된다", () => {
	expect(formatQuantity(null)).toBe("-");
	expect(formatQuantity(1234)).toBe("1,234.00");
});
```

**Correct 1 (제목과 본문이 같은 표시 동작을 설명합니다):**

```ts
// src/util/number/format-quantity.test.ts
import { expect, test } from "vitest";

import { formatQuantity } from "@/util/number/format-quantity";

test("수량이 없으면 빈 값 표시를 반환한다", () => {
	expect(formatQuantity(null)).toBe("-");
});

test("수량이 있으면 천 단위 구분과 소수 두 자리로 표시한다", () => {
	expect(formatQuantity(1234)).toBe("1,234.00");
});
```

> 나머지 예시와 예외는 [full rule](../rules/02-01-case-describe-one-observable-behavior.md)에 있습니다.
