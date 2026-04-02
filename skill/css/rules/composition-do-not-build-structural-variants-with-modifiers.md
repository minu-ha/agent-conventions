---
title: Do Not Build Structural Variants With Modifiers
impact: HIGH
impactDescription: keeps modifiers reserved for state instead of turning them into a second layout naming system
tags: modifiers, structure, naming
---

## Do Not Build Structural Variants With Modifiers

**Impact: HIGH (keeps modifiers reserved for state instead of turning them into a second layout naming system)**

modifier는 `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태값에만 사용합니다. 레이아웃, 간격, 구조 차이 같은 것은 modifier로 조립하지 말고 별도 element 이름으로 분리합니다.

**Incorrect (구조 차이를 modifier로 표현):**

```tsx
<div className={clsx("rt_pcmei__section", "rt_pcmei__section--compactTop")} />
```

**Correct (구조 차이는 별도 element로 분리):**

```tsx
<div className={clsx("rt_pcmei__detailSection")} />
```
