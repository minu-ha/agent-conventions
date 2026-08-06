---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: `??`·`||`·기본 매개변수 자리에 리터럴을 적지 않습니다
impact: HIGH
impactDescription: 그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다
appliesWhen:
  - 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때
  - `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때
reviewWith: naming-centralize-shared-config-namespaces, naming-place-owner-config-in-the-owner-config-folder
tags: absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다)**

**`??`와 `||` 오른쪽에 리터럴을 적지 않고 이미 선언된 이름만 가리킵니다.**

| 형태 | 판정 |
| --- | --- |
| `?? "help@example.com"`, `?? 0`, `?? []`, `\|\| "-"` 같은 리터럴 | 위반 |
| `?? config.pagination.defaultPageSize`처럼 설정에 선언된 이름 | 통과 |
| 같은 파일 지역 `const`로 리터럴만 옮긴 것. `const fallback = "-";` | 위반. 자리만 바꾼 것입니다 |
| 선언된 이름 둘을 합성한 결과에 이름을 붙인 것 | 통과. 리터럴이 없습니다 |
| 기본 매개변수나 구조분해 기본값에 **리터럴**을 적은 것. `(size = 10) =>`, `{size = 10}` | 위반 |
| 기본 매개변수가 선언된 이름을 가리키는 것. `(size = config.pagination.defaultPageSize) =>` | 통과 |
| 삼항 `value ? value : "-"`, `String(value ?? "")` | 위반 |

기본값이 정말 필요하면 그 기본값에 이름을 붙여 선언하고 그 이름을 가리킵니다.
여러 소유자가 쓰면 `naming-centralize-shared-config-namespaces`,
한 소유자만 쓰면 `naming-place-owner-config-in-the-owner-config-folder`가 자리를 정합니다.
같은 파일 위쪽에 `const supportEmailFallback = "help@example.com";`을 두는 것으로는 통과하지 못합니다.
설정에 선언된 이름이어야 합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

**어디서 해소할지는 순서로 정합니다.**

1. **없어도 되는지 먼저 봅니다.**
   빈 배열도 리터럴이라 `items ?? []` 대신 `items?.map(…)`으로 값이 없는 상태를 그대로 다룹니다.
   `(variant ?? "default") === "compact"`도 `variant === "compact"`로 쓰면 끝납니다.
   선택 값을 그대로 비교하면 기본값이 아예 필요 없는 경우가 가장 많습니다.
2. **필요하면 값이 들어오는 경계에서 한 번만 해소합니다.**
   라우트 search 스키마의 `.default(config.pagination.defaultPageSize)`, 응답 매핑, 쿼리의 `select`가 그 자리입니다.
   기본값이 선언 안에 들어가므로 그 선언이 곧 출처가 됩니다.
   아래쪽 코드에서는 그 값이 더는 선택 값이 아니어서 `??`가 나올 일이 없습니다.
3. **경계에서 못 하면 쓰는 자리에 그대로 적습니다.**
   `fetchProducts({pageSize: query.pageSize ?? config.pagination.defaultPageSize})`처럼 씁니다.
4. **이름을 붙인다면 파생값임이 드러나는 이름으로 씁니다.**
   `pageSize`가 아니라 `effectivePageSize`입니다.
   붙일지 말지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정하고,
   횟수가 아니라 그 식이 무엇을 고른 값인지가 기준입니다.

**`??` 합성은 별칭이 아닙니다.**
`naming-preserve-config-origin-with-chained-access`가 막는 것은 같은 값에 새 이름만 붙이는 별칭입니다.
`a ?? b`는 출처 둘을 놓고 하나를 고르는 계산이고, 그 결과는 어느 쪽에서 왔는지가 실행할 때 정해지는 파생값입니다.
그래서 이름을 붙일지는 별칭 규칙이 아니라 `functions-name-a-value-only-for-recompute-or-judgment`가 판정합니다.

**Incorrect (`??`와 `||` 오른쪽에 리터럴을 적음):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
const productRows = response.data.rows ?? [];
const isCompact = (variant ?? "default") === "compact";
```

**Correct (없을 수 있다는 사실을 그대로 드러냄):**

```ts
if (!settings.supportEmail) {
	throw new MissingSupportEmailError();
}

sendInvite({from: settings.supportEmail});
```

**Correct (그대로 비교하면 기본값이 필요 없음):**

```ts
const isCompact = variant === "compact";
const productIds = response.data.rows?.map((row) => row.id);
```

**Correct (값이 들어오는 경계에서 한 번 해소해 아래쪽에는 선택 값이 오지 않음):**

```ts
/**
 * product 목록 검색 조건. pageSize는 여기서 채워져 화면에서는 선택 값이 아니다
 */
const productSearchSchema = z.object({
	/**
	 * 한 번에 불러올 개수
	 */
	pageSize: z.number().default(config.pagination.defaultPageSize),
});
```

**Correct (경계에서 못 하면 쓰는 자리에 그대로 적음):**

```ts
fetchProducts({pageSize: query.pageSize ?? config.pagination.defaultPageSize});
```

**Correct (이름을 붙인다면 파생값임이 드러나는 이름):**

```ts
const effectivePageSize = query.pageSize ?? config.pagination.defaultPageSize;

fetchProducts({pageSize: effectivePageSize});
setVisibleRowCount(effectivePageSize);
```
