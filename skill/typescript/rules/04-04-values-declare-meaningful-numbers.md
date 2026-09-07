---
title: Declare Meaningful Numbers Instead of Writing Them Inline
titleKo: 의미 있는 숫자는 사용처에 적지 않고 상수로 선언합니다
impact: MEDIUM
impactDescription: 숫자의 의미를 이름으로 드러내고 한곳에서 변경할 수 있습니다
appliesWhen:
  - 비교, 계산, 호출 인자에 숫자 리터럴을 새로 적을 때
  - 제외: 관용값이나 배열 인덱스처럼 뜻이 없는 숫자를 쓰는 경우
reviewWith: >-
  naming-place-project-constants-in-the-root-constant-folder,
  absence-expose-optional-values-instead-of-silent-fallbacks
tags: values, config
---

## Declare Meaningful Numbers Instead of Writing Them Inline

**Impact: MEDIUM (숫자의 의미를 이름으로 드러내고 한곳에서 변경할 수 있습니다)**

제품 정책처럼 뜻이 있는 숫자는 상수로 선언하고, 사용처에서는 그 이름을 참조합니다.
`attempts > 42` 대신 `attempts > retry_max_attempts`로 씁니다.

| 숫자의 용도 | 처리 |
| --- | --- |
| 재시도 횟수 `3`, 페이지 크기 `20` 등 제품 정책 | 작거나 흔한 숫자여도 상수로 선언합니다 |
| 일반 연산의 `0`, `1`, 단위 변환의 `60` | 그대로 적습니다 |
| 배열 인덱스, 선언 초기값, 상수 선언 자신의 값 | 그대로 적습니다 |
| `??`, `\|\|` 오른쪽이나 기본 매개변수 | `absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다 |
| 여러 숫자가 한 뜻을 이룸 | 배열 대신 `{first: 0x1100, last: 0x115f}`처럼 이름 있는 객체 필드로 둡니다 |

소유자를 지워도 남으면 루트 `constant`, 함께 사라지면 소유자의 `_constant`에 둡니다.
배치는 `naming-place-project-constants-in-the-root-constant-folder`가 정합니다.
같은 파일의 지역 `const`로 옮기는 것은 규칙을 충족하지 못합니다.
지역 변수에는 `functions-name-a-value-only-for-recompute-or-judgment`의 두 사유 중 하나가 필요합니다.
조회표를 둘지는 `values-avoid-lookup-tables-for-simple-choices`가 정합니다.

`tooling-configure-biome-to-enforce-these-rules`의 `style/noMagicNumbers`로 검사합니다.
테스트 파일에서는 리터럴 자체가 기대 계약일 수 있어 이 검사를 끕니다.

**Incorrect (뜻이 있는 숫자를 쓰는 자리에 적거나 지역 `const`로 자리만 옮깁니다):**

```ts
// page/products/pg-products.tsx
const maxAttempts = 42;

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > maxAttempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, 37);
};
```

**Correct (`constant` 폴더에 선언하고 쓰는 자리에서 이름을 가리킵니다):**

```ts
// constant/retry.ts
/**
 * 이 횟수를 넘으면 사용자에게 실패를 보여 준다
 */
export const retry_max_attempts = 42;

// constant/preview.ts
/**
 * 미리보기에 그릴 행 수. 서버가 한 번에 주는 최대치와 맞춘다
 */
export const preview_row_count = 37;

// page/products/pg-products.tsx
import {preview_row_count} from "@/constant/preview";
import {retry_max_attempts} from "@/constant/retry";

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > retry_max_attempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, preview_row_count);
};
```

**Incorrect (뜻이 없는 숫자에까지 이름을 붙입니다):**

```ts
// constant/table.ts
export const table_first_row_index = 0;
export const table_page_step = 1;

// page/products/pg-products.tsx
import {table_first_row_index, table_page_step} from "@/constant/table";

const toFirstRow = (rows: Row[]): Row | undefined => {
	return rows[table_first_row_index];
};

const toNextPage = (page: number): number => {
	return page + table_page_step;
};
```

**Correct (뜻이 없는 숫자는 그대로 둡니다):**

```ts
// page/products/pg-products.tsx
const toFirstRow = (rows: Row[]): Row | undefined => {
	return rows[0];
};

const toNextPage = (page: number): number => {
	return page + 1;
};
```
