---
title: Resolve Defaults Once at the Boundary
titleKo: 기본값은 값이 들어오는 경계에서 한 번만 채웁니다
impact: HIGH
impactDescription: 기본값이 선언 한 곳에 남아 아래쪽 코드에서 `??`가 되풀이되지 않습니다
appliesWhen:
  - 선택 값의 기본값을 어디서 채울지 정할 때
  - 같은 선택 값에 `??` 기본값 해소가 둘 이상의 사용처에 흩어질 때
  - search 스키마, 응답 매핑, 쿼리 `select`에 기본값 채움을 추가·변경할 때
reviewWith: >-
  absence-expose-optional-values-instead-of-silent-fallbacks,
  functions-name-a-value-only-for-recompute-or-judgment,
  values-read-objects-through-chains
tags: absence
---

## Resolve Defaults Once at the Boundary

**Impact: HIGH (기본값이 선언 한 곳에 남아 아래쪽 코드에서 `??`가 되풀이되지 않습니다)**

기본값 자리에 무엇을 적는지는 `absence-expose-optional-values-instead-of-silent-fallbacks`가 정합니다.
여기서는 그 기본값을 어디서 채우는지를 순서로 정합니다.

1. **없어도 되는지 먼저 봅니다.**
   빈 배열도 리터럴이라 `items ?? []` 대신 `items?.map(…)`으로 값이 없는 상태를 그대로 다룹니다.
   `(variant ?? "default") === "compact"`도 `variant === "compact"`로 쓰면 끝납니다.
   선택 값을 그대로 비교하면 기본값이 아예 필요 없는 경우가 가장 많습니다.
2. **필요하면 값이 들어오는 경계에서 한 번만 해소합니다.**
   라우트 search 스키마의 `.default(pagination_default_page_size)`, 응답 매핑, 쿼리의 `select`가 그 자리입니다.
   기본값이 선언 안에 들어가므로 그 선언이 곧 출처가 됩니다.
   아래쪽 코드에서는 그 값이 더는 선택 값이 아니어서 `??`가 나올 일이 없습니다.
3. **경계에서 못 하면 쓰는 자리에 그대로 적습니다.**
   `fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size})`처럼 씁니다.
4. **이름을 붙인다면 파생값임이 드러나는 이름으로 씁니다.**
   `pageSize`가 아니라 `effectivePageSize`입니다.
   붙일지 말지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정하고,
   횟수가 아니라 그 표현식이 무엇을 고른 값인지가 기준입니다.

**`??` 합성은 별칭이 아닙니다.**
`values-read-objects-through-chains`가 막는 것은 같은 값에 새 이름만 붙이는 별칭입니다.
`a ?? b`는 출처 둘을 놓고 하나를 고르는 계산이고, 그 결과는 어느 쪽에서 왔는지가 실행할 때 정해지는 파생값입니다.
그래서 이름을 붙일지는 별칭 규칙이 아니라 `functions-name-a-value-only-for-recompute-or-judgment`가 판정합니다.

**Incorrect (없어도 되는 값에 기본값을 채웁니다):**

```ts
const productIds = (response.data.rows ?? []).map((row) => row.id);
const isCompact = (variant ?? "default") === "compact";
```

**Correct (그대로 비교하면 기본값이 필요 없습니다):**

```ts
const productIds = response.data.rows?.map((row) => row.id);
const isCompact = variant === "compact";
```

**Incorrect (같은 기본값을 사용처마다 다시 채웁니다):**

```ts
fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size});
setVisibleRowCount(query.pageSize ?? pagination_default_page_size);
```

**Correct (값이 들어오는 경계에서 한 번 해소해 아래쪽에는 선택 값이 오지 않습니다):**

```ts
/**
 * product 목록 검색 조건. pageSize는 여기서 채워져 화면에서는 선택 값이 아니다
 */
const productSearchSchema = z.object({
	/**
	 * 한 번에 불러올 개수
	 */
	pageSize: z.number().default(pagination_default_page_size),
});

fetchProducts({pageSize: query.pageSize});
setVisibleRowCount(query.pageSize);
```

**Correct (경계에서 못 하면 쓰는 자리에 그대로 적습니다):**

```ts
fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size});
```

**Correct (이름을 붙인다면 파생값임이 드러나게 짓습니다):**

```ts
const effectivePageSize = query.pageSize ?? pagination_default_page_size;

fetchProducts({pageSize: effectivePageSize});
setVisibleRowCount(effectivePageSize);
```
