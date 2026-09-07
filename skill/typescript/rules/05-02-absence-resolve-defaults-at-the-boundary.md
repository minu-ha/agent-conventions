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

기본값은 필요한지 먼저 확인하고, 필요하면 값이 들어오는 경계에서 한 번 채웁니다.
기본값 표현은 `absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.

| 순서 | 판단과 처리 |
| --- | --- |
| 1. 기본값 없이 소비할 수 있는가 | `undefined`를 허용하면 `items?.map(…)`, 선택 값 비교는 `variant === "compact"`로 처리합니다 |
| 2. 경계에서 채울 수 있는가 | search 스키마의 `.default(선언된 상수)`, 응답 매핑, 쿼리의 `select`에서 한 번 채웁니다. 아래에서는 선택 값과 `??`가 남지 않습니다 |
| 3. 경계에서 처리할 수 없는가 | 사용처에 `fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size})`처럼 적습니다 |
| 4. 파생값에 이름이 필요한가 | `pageSize` 대신 `effectivePageSize`처럼 고른 결과임을 드러냅니다. 사용 횟수보다 표현식의 의미를 기준으로 판단합니다 |

배열이 필수인 API에는 반환 계약을 바꾸지 않고 선언된 기본값을 경계에서 채웁니다.
`a ?? b`는 실행 시 두 출처 중 하나를 고르는 계산이므로
`values-read-objects-through-chains`가 금지하는 단순 별칭에 해당하지 않습니다.
이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

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

**Correct (값이 들어오는 경계에서 한 번 채워 이후 코드에서 기본값을 반복하지 않습니다):**

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
