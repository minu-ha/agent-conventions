---
title: Style `Ui*` Components Through Owned Wrappers
impact: HIGH
impactDescription: prevents shared UI wrappers from exposing uncontrolled styling hooks through ad-hoc className injection
tags: ui-components, wrappers, third-party
---

## Style `Ui*` Components Through Owned Wrappers

**Impact: HIGH (prevents shared UI wrappers from exposing uncontrolled styling hooks through ad-hoc className injection)**

`Ui*` 컴포넌트(`UiCollapse`, `UiAvatar`, `UiButton` 등)에 직접 `className`을 주입하지 않습니다. 스타일링이 필요하면 화면이나 local 래퍼 클래스를 두고, 그 래퍼 아래에서만 서드파티 라이브러리 내부 DOM을 제한적으로 타겟팅합니다.

**Incorrect (`Ui*` 컴포넌트에 직접 className을 부여):**

```tsx
<UiCollapse className={clsx("rt_srol__collapse")} />
```

**Correct (소유 래퍼를 두고 그 아래에서 스타일링):**

```tsx
<div className={clsx("rt_srol__collapse")}>
	<UiCollapse />
</div>
```

```css
.rt_srol__collapse {
	& .ant-collapse-item {
		border-radius: var(--cms-border-radius, 10px);
	}
}
```
