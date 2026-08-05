---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: 없는 값을 그 자리에서 지어낸 값으로 덮지 않습니다
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
| `?? config.pagination.default_page_size`처럼 설정에 선언된 이름 | 통과 |
| 같은 파일 지역 `const`로 리터럴만 옮긴 것 | 위반. 자리만 바꾼 것입니다 |
| 기본 매개변수나 구조분해 기본값에 **리터럴**을 적은 것. `(size = 10) =>`, `{size = 10}` | 위반 |
| 기본 매개변수가 선언된 이름을 가리키는 것. `(size = config.pagination.default_page_size) =>` | 통과 |
| 삼항 `value ? value : "-"`, `String(value ?? "")` | 위반 |

기본값이 정말 필요하면 그 기본값에 이름을 붙여 선언하고 그 이름을 가리킵니다.
여러 소유자가 쓰면 `naming-centralize-shared-config-namespaces`,
한 소유자만 쓰면 `naming-place-owner-config-in-the-owner-config-folder`가 자리를 정합니다.
같은 파일 위쪽에 `const supportEmailFallback = "help@example.com";`을 두는 것으로는 통과하지 못합니다.
설정에 선언된 이름이어야 합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

빈 배열도 리터럴입니다.
`items ?? []` 대신 `items?.map(…)`으로 값이 없는 상태를 그대로 다룹니다.
선택 값을 그대로 비교하면 기본값이 아예 필요 없는 경우가 많습니다.

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

**Correct (선언된 기본값을 가리킴):**

```ts
const pageSize = query.pageSize ?? config.pagination.default_page_size;
```

**Correct (그대로 비교하면 기본값이 필요 없음):**

```ts
const isCompact = variant === "compact";
const productIds = response.data.rows?.map((row) => row.id);
```
