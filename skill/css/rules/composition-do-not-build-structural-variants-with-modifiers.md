---
title: Do Not Use Modifiers for One-off Structural Patches
impact: HIGH
impactDescription: keeps modifiers reserved for state instead of turning them into a second layout naming system
appliesWhen: >-
  modifier를 추가·변경하거나 반복 가능한 state·API variant와 one-off structural patch 사이를 판정한다. 허용된 state로
  결론 나도 변경된 modifier 분류는 Selected다.
reviewWith: naming-name-elements-and-modifiers-by-role
tags: modifiers, structure, naming
---

## Do Not Use Modifiers for One-off Structural Patches

**Impact: HIGH (keeps modifiers reserved for state instead of turning them into a second layout naming system)**

modifier는 상태나 반복 variant를 표현할 때만 사용합니다.

금지:

- spacing patch
- 방향 보정
- 특정 화면 하나에서만 필요한 구조 차이

허용:

- `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태
- `dense`, `horizontal`, `compact`처럼 component API로 반복 노출되는 variant

금지 대상은 "상태 의미가 아닌 모든 modifier"가 아니라, 재사용 contract 없이 생긴 one-off structural modifier입니다.

이 규칙의 Selected는 modifier가 금지됐다는 뜻이 아니라 변경된 modifier의 계약을 분류했다는 뜻입니다. `active`·`selected`
같은 허용된 domain state로 결론 나면 `Selected + pass`이며,
위반이 없다는 이유로 N/A로 돌리지 않습니다.

**Incorrect (특정 화면용 구조 patch를 modifier로 덧붙임):**

```tsx
<div className={clsx("rt_catalogDetail__section", "rt_catalogDetail__section--compactTop")} />
```

**Correct (one-off patch는 별도 element로 풀고, 반복되는 variant만 제한적으로 허용):**

```tsx
<div className={clsx("rt_catalogDetail__detailSection")} />
```

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
```
