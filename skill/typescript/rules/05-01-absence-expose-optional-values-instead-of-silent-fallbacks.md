---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: `??`·`||`·기본 매개변수 자리에 리터럴을 적지 않습니다
impact: HIGH
impactDescription: 그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다
appliesWhen:
  - 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때
  - `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때
reviewWith: >-
  absence-resolve-defaults-at-the-boundary,
  naming-place-project-constants-in-the-root-constant-folder,
  naming-place-owner-constants-in-the-owner-constant-folder
tags: absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다)**

**`??`와 `||` 오른쪽에 리터럴을 적지 않고 이미 선언된 이름만 가리킵니다.**

| 형태 | 판정 |
| --- | --- |
| `?? "help@example.com"`, `?? 0`, `?? []`, `\|\| "-"` 같은 리터럴 | 위반 |
| `?? pagination_default_page_size`처럼 상수로 선언된 이름 | 통과 |
| 같은 파일 지역 `const`로 리터럴만 옮긴 것. `const fallback = "-";` | 위반. 자리만 바꾼 것입니다 |
| 선언된 이름 둘을 합성한 결과에 이름을 붙인 것 | 통과. 리터럴이 없습니다 |
| 기본 매개변수나 구조분해 기본값에 **리터럴**을 적은 것. `(size = 10) =>`, `{size = 10}` | 위반 |
| 기본 매개변수가 선언된 이름을 가리키는 것. `(size = pagination_default_page_size) =>` | 통과 |
| 삼항 `value ? value : "-"`, `String(value ?? "")` | 위반 |

숫자 리터럴을 쓰는 자리에 적지 않는 일반 규범은 `values-declare-meaningful-numbers`가 정합니다.
여기서는 없는 값을 덮는 자리만 봅니다.

기본값이 정말 필요하면 그 기본값에 이름을 붙여 선언하고 그 이름을 가리킵니다.
소유자를 지워도 남으면 `naming-place-project-constants-in-the-root-constant-folder` 규칙이,
소유자와 함께 사라지면 `naming-place-owner-constants-in-the-owner-constant-folder` 규칙이 자리를 정합니다.
그 기본값을 어디서 채울지는 `absence-resolve-defaults-at-the-boundary`가 정합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

**Incorrect (`??`, `||`, 기본 매개변수 자리에 리터럴을 적습니다):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
const displayName = user.nickname || "-";
const toPageRequest = (size = 10): PageRequest => { /* … */ };
```

**Correct (이미 선언된 이름만 가리킵니다):**

```ts
const supportEmail = settings.supportEmail ?? support_email_default;
const displayName = user.nickname || empty_display_text;
const toPageRequest = (size = pagination_default_page_size): PageRequest => { /* … */ };
```
