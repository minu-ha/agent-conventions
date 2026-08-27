---
title: Do Not Build Structural Variants With Modifiers
titleKo: 수정자는 상태와 반복되는 모양에만 씁니다
impact: MEDIUM-HIGH
impactDescription: 수정자가 두 번째 레이아웃 이름 체계로 자라지 않게 막습니다
appliesWhen:
  - 수정자를 추가·변경할 때
  - 여러 곳에서 반복되는 모양인지 한 곳만의 보정인지 가릴 때
reviewWith: naming-name-elements-and-modifiers-by-role
tags: modifiers, structure, naming
---

## Do Not Build Structural Variants With Modifiers

**Impact: MEDIUM-HIGH (수정자가 두 번째 레이아웃 이름 체계로 자라지 않게 막습니다)**

수정자는 두 가지만 표현합니다.

| 표현하는 것 | 예 |
| --- | --- |
| 앱이 켜고 끄는 상태 | `--active`, `--selected`, `--error`, `--expanded`, `--current` |
| 여러 곳에서 반복되는 모양 | `--dense`, `--compact`, `--horizontal` |

브라우저가 부여하는 `:disabled`, `:checked`는 수정자로 만들지 않습니다.
`selector-use-pseudo-classes-for-dom-owned-states` 규칙이 정합니다.

한 곳에서만 필요한 여백이나 배치 보정에는 쓰지 않습니다.
`--compactTop`, `--marginLeft0`, `--alignRight`처럼 그 화면 하나를 고치려고 붙이는 이름이 여기 해당합니다.
그런 보정은 수정자가 아니라 **역할 이름이 있는 별도 요소 클래스**로 풉니다.

갈리는 기준은 하나입니다.

> 이 수정자 이름이 지금 저장소에서 두 개 이상의 `scope_slug`에 이미 있는가?

| 답 | 판정 |
| --- | --- |
| 있다 | 반복되는 모양이라 수정자로 허용합니다 |
| 없다 | 그 자리의 여백과 배치 사정을 담은 이름이라 요소 클래스로 둡니다 |

두 번째 소유자가 같은 이름을 쓰게 되는 순간 수정자로 올립니다.
그 전까지는 요소 클래스로 둡니다.

**Incorrect (그 화면 하나를 고치려고 수정자를 붙임):**

```tsx
<div className={clsx("pg_catalogDetail__section", "pg_catalogDetail__section--compactTop")} />
<div className={clsx("pg_catalogDetail__aside", "pg_catalogDetail__aside--marginLeft0")} />
```

**Correct (한 곳만의 보정은 역할 이름이 있는 요소로 분리):**

```tsx
<div className={clsx("pg_catalogDetail__detailSection")} />
<div className={clsx("pg_catalogDetail__flushAside")} />
```

**Correct (상태와 반복되는 모양만 수정자로):**

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
<div className={clsx("pg_catalogIndex__row", isSelected && "pg_catalogIndex__row--selected")} />
```
