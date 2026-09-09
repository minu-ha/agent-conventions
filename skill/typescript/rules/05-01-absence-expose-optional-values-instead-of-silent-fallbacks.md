---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: `??` · `||` · 기본 매개변수 자리에 리터럴을 적지 않습니다
impact: CRITICAL
impactDescription: 기본값의 출처를 이름으로 드러내고 누락된 데이터의 처리 기준을 유지합니다
appliesWhen:
  - 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때
  - `??`, `||`, 기본값, 빈 값 대체 분기를 추가 · 변경할 때
reviewWith: >-
  absence-resolve-defaults-at-the-boundary,
  naming-place-project-constants-in-the-root-constant-folder,
  naming-place-owner-constants-in-the-owner-constant-folder
tags: absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: CRITICAL (기본값의 출처를 이름으로 드러내고 누락된 데이터의 처리 기준을 유지합니다)**

### 기본값 표현

`??`, `||` 오른쪽과 기본값에는 리터럴 대신 이미 선언된 이름을 참조합니다.
리터럴을 지역 `const`로 옮기거나 이유 주석을 붙이는 것만으로는 규칙을 충족하지 못합니다.

| 기본값 표현 | 판정 |
| --- | --- |
| `?? "help@example.com"`, `?? 0`, `?? []`, `\|\| "-"` | 위반 |
| `?? pagination_default_page_size`처럼 선언된 상수 | 통과 |
| 지역 `const fallback = "-"`로 리터럴만 옮김 | 위반 |
| 선언된 이름 둘을 합성한 파생값 | 통과 |
| `(size = 10) =>`, `{size = 10}` 같은 기본값 리터럴 | 위반 |
| `(size = pagination_default_page_size) =>` | 통과 |
| 삼항의 대체 리터럴 `value ? value : "-"`, `String(value ?? "")` | 위반 |

### 없음으로 취급할 값

| 대체하려는 값 | 연산자 |
| --- | --- |
| `null`, `undefined`만 없음으로 취급 | `??` |
| `0`, `false` · 빈 문자열까지 없음으로 취급하는 계약 | `\|\|` |

선언된 이름이어도 기본값의 의미가 맞아야 합니다. `0`, `false`가 유효하면 `??`를 씁니다.
상수는 소유자를 지워도 남으면 `naming-place-project-constants-in-the-root-constant-folder`,
함께 사라지면 `naming-place-owner-constants-in-the-owner-constant-folder`에 따라 배치합니다.
채우는 위치는 `absence-resolve-defaults-at-the-boundary`가 정합니다.
일반 숫자 리터럴은 `values-declare-meaningful-numbers`가 정하고, 여기서는 없는 값을 대체하는 자리만 봅니다.

**Incorrect 1 (`??`, `||`, 기본 매개변수 자리에 리터럴을 적습니다):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
const displayName = user.nickname || "-";
const toPageRequest = (size = 10): PageRequest => { /* … */ };
```

**Correct 1 (이미 선언된 이름만 가리킵니다):**

```ts
const supportEmail = settings.supportEmail ?? support_email_default;
const displayName = user.nickname || empty_display_text;
const toPageRequest = (size = pagination_default_page_size): PageRequest => { /* … */ };
```
