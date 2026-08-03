---
title: Use Modifiers Only for States and Repeated Variants
titleKo: modifier는 상태와 반복되는 모양에만 씁니다
impact: HIGH
impactDescription: modifier가 두 번째 레이아웃 이름 체계로 자라지 않게 막습니다
appliesWhen:
  - modifier를 추가·변경할 때
  - 여러 곳에서 쓰이는 variant인지 한 곳만의 보정인지 판정할 때
reviewWith: naming-name-elements-and-modifiers-by-role
tags: modifiers, structure, naming
---

## Use Modifiers Only for States and Repeated Variants

**Impact: HIGH (modifier가 두 번째 레이아웃 이름 체계로 자라지 않게 막습니다)**

modifier는 두 가지만 표현합니다.

| 쓰는 자리 | 예 |
| --- | --- |
| 켜지고 꺼지는 상태 | `--active`, `--selected`, `--disabled`, `--error`, `--hidden` |
| 여러 곳에서 반복되는 모양 | `--dense`, `--compact`, `--horizontal` |

한 곳에서만 필요한 여백이나 배치 보정에는 쓰지 않습니다.
`--compactTop`, `--marginLeft0`, `--alignRight`처럼 그 화면 하나를 고치려고 붙이는 이름이 여기 해당합니다.
그런 보정은 modifier가 아니라 **역할 이름을 가진 별도 요소 클래스**로 풉니다.

갈리는 기준은 하나입니다.

> 이 modifier를 다른 화면에서도 같은 이름으로 쓸 수 있는가?

쓸 수 있으면 반복되는 모양이라 허용합니다.
그 화면에서만 통하는 이름이면 이미 위치 정보를 담고 있으니 요소로 바꿉니다.

**Incorrect (그 화면 하나를 고치려고 modifier를 붙임):**

```tsx
<div className={clsx("pg_catalogDetail__section", "pg_catalogDetail__section--compactTop")} />
<div className={clsx("pg_catalogDetail__aside", "pg_catalogDetail__aside--marginLeft0")} />
```

**Correct (한 곳만의 보정은 역할 이름을 가진 요소로 분리):**

```tsx
<div className={clsx("pg_catalogDetail__detailSection")} />
<div className={clsx("pg_catalogDetail__flushAside")} />
```

**Correct (상태와 반복되는 모양만 modifier로):**

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
<div className={clsx("pg_catalogIndex__row", isSelected && "pg_catalogIndex__row--selected")} />
```
