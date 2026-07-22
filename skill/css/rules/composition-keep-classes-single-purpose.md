---
title: Keep Classes Single-purpose
impact: HIGH
impactDescription: stops one class from carrying both base styling and multiple state or structural meanings at once
appliesWhen: base class 이름에 상태·variant 의미를 합치거나 한 class에 독립 시각 책임을 추가·재사용·분리한다. 책임 보존 owner prefix/single-purpose rename은 제외한다.
tags: composition, modifiers, responsibility
---

## Keep Classes Single-purpose

**Impact: HIGH (stops one class from carrying both base styling and multiple state or structural meanings at once)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다. 상태나 변형이 필요하면 modifier를 별도로 두고, 기본 클래스에 모든 의미를 몰아넣지 않습니다. 스타일 선언과 책임을 그대로 보존한 responsibility-preserving owner prefix 수정이나 single-purpose class rename만으로는 이 규칙을 선택하지 않습니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("rt_catalogIndex__listButtonActive")} />
```

**Correct (기본 클래스와 상태 modifier를 분리):**

```tsx
<div className={clsx("rt_catalogIndex__listButton", isActive && "rt_catalogIndex__listButton--active")} />
```
