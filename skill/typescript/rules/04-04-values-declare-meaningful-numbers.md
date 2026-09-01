---
title: Declare Meaningful Numbers Instead of Writing Them Inline
titleKo: 뜻이 있는 숫자는 그 자리에 적지 않고 상수로 선언합니다
impact: MEDIUM
impactDescription: 숫자가 무엇을 뜻하는지 이름이 말하고 바꿀 때 고칠 자리가 한 곳입니다
appliesWhen:
  - 비교, 계산, 호출 인자에 숫자 리터럴을 새로 적을 때
  - 제외: 관용값이나 배열 인덱스처럼 뜻이 없는 숫자를 쓰는 경우
reviewWith: >-
  naming-place-project-constants-in-the-root-constant-folder,
  absence-expose-optional-values-instead-of-silent-fallbacks
tags: values, config
---

## Declare Meaningful Numbers Instead of Writing Them Inline

**Impact: MEDIUM (숫자가 무엇을 뜻하는지 이름이 말하고 바꿀 때 고칠 자리가 한 곳입니다)**

뜻이 있는 숫자는 쓰는 자리에 적지 않고 상수로 선언한 이름을 가리킵니다.
`attempts > 42`가 아니라 `attempts > retry_max_attempts`입니다.

어디에 선언할지는 `naming-place-project-constants-in-the-root-constant-folder` 규칙이 정합니다.
소유자를 지워도 남으면 루트 `constant` 폴더, 소유자와 함께 사라지면 그 소유자의 `_constant` 폴더입니다.

**같은 파일에 지역 `const`로 옮기는 것으로는 끝나지 않습니다.**
지역 변수를 만들 이유 둘은 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.
숫자를 옮기는 것은 그 둘 중 어디에도 없어, 갈 곳은 지역 변수가 아니라 `constant` 폴더입니다.

**뜻이 없는 숫자는 그대로 적습니다.**
아래는 이름을 붙여도 읽는 사람이 얻는 것이 없습니다.

| 그대로 적는 것 | 예 |
| --- | --- |
| 관용값 | `0`, `1`, `2`, `10`, `24`, `60` |
| 배열 인덱스 | `rows[0]`, `parts[1]` |
| 선언의 초기값 | `let count = 0` |
| 상수 선언 자신의 값 | `export const retry_max_attempts = 42` |

`??`·`||` 오른쪽과 기본 매개변수는 이 규칙이 아니라
`absence-expose-optional-values-instead-of-silent-fallbacks`가 봅니다.
없는 값을 다루는 자리라 판정이 다릅니다.

**여러 숫자가 한 뜻을 이루면 배열이 아니라 객체로 둡니다.**
`{first: 0x1100, last: 0x115f}`처럼 키를 붙이면 숫자마다 이름이 생깁니다.
`[0x1100, 0x115f]`처럼 배열에 담으면 자리 번호로만 읽어야 합니다.
조회표를 둘지 자체는 `values-avoid-lookup-tables-for-simple-choices`가 정하고, 두기로 했으면 각 칸에 이름을 붙입니다.

`tooling-configure-biome-to-enforce-these-rules` 규칙이 `style/noMagicNumbers`로 이 선을 강제합니다.
그 규칙은 테스트 파일에서만 꺼집니다.
기대값은 리터럴 자체가 계약이라 상수로 빼면 검증할 것이 남지 않습니다.

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
