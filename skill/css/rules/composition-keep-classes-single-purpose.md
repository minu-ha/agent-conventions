---
title: Keep Classes Single-purpose
impact: HIGH
impactDescription: stops one class from carrying both base styling and multiple state or structural meanings at once
tags: composition, modifiers, responsibility
---

## Keep Classes Single-purpose

**Impact: HIGH (stops one class from carrying both base styling and multiple state or structural meanings at once)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다. 상태나 변형이 필요하면 modifier를 별도로 두고, 기본 클래스에 모든 의미를 몰아넣지 않습니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("rt_pctbi__listButtonActive")} />
```

**Correct (기본 클래스와 상태 modifier를 분리):**

```tsx
<div className={clsx("rt_pctbi__listButton", isActive && "rt_pctbi__listButton--active")} />
```
