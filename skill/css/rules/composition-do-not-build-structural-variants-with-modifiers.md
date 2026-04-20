---
title: Do Not Use Modifiers for One-off Structural Patches
impact: HIGH
impactDescription: keeps modifiers reserved for state instead of turning them into a second layout naming system
tags: modifiers, structure, naming
---

## Do Not Use Modifiers for One-off Structural Patches

**Impact: HIGH (keeps modifiers reserved for state instead of turning them into a second layout naming system)**

modifier는 `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태값에 우선 사용합니다. spacing patch, 방향 보정, 특정 화면에서만 필요한 구조 차이를 덧붙이는 용도로 modifier를 늘리지 않습니다.   
다만 `dense`, `horizontal`, `compact`처럼 컴포넌트 API로 반복해서 쓰이는 명시적 variant라면 modifier를 허용할 수 있습니다. 이런 경우에도 one-off layout fix가 아니라 재사용 가능한 variant라는 근거가 있어야 합니다. guardrail에서 금지하는 대상도 "상태 의미가 아닌 modifier 전체"가 아니라 이런 one-off structural modifier입니다.

**Incorrect (특정 화면용 구조 patch를 modifier로 덧붙임):**

```tsx
<div className={clsx("rt_pcmei__section", "rt_pcmei__section--compactTop")} />
```

**Correct (one-off patch는 별도 element로 풀고, 반복되는 variant만 제한적으로 허용):**

```tsx
<div className={clsx("rt_pcmei__detailSection")} />
```

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
```
