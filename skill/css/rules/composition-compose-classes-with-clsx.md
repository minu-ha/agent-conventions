---
title: Compose Classes With `clsx()`
impact: HIGH
impactDescription: keeps TSX class composition readable when base classes and state modifiers need to be combined
appliesWhen: TSX의 `className`을 추가·수정하거나 base class, modifier, optional class를 조합한다.
tags: clsx, tsx, className
---

## Compose Classes With `clsx()`

**Impact: HIGH (keeps TSX class composition readable when base classes and state modifiers need to be combined)**

TSX에서 `className`은 `clsx()` 사용을 기본으로 합니다.
기본 element 클래스 하나만 넣는 경우도 같은 기준을 유지하고, 상태 modifier나 optional class가 붙어도 읽기 쉽게 확장합니다.
문자열 연결이나 중복 ternary로 `className`을 조립하지 않습니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"rt_catalogIndex__listButton " + (isActive ? "rt_catalogIndex__listButton--active" : "")}>
	저장
</button>
```

**Correct (기본 클래스와 modifier를 `clsx()`로 조합):**

```tsx
<button
	className={clsx(
		"rt_catalogIndex__listButton",
		isActive && "rt_catalogIndex__listButton--active",
	)}
>
	저장
</button>
```
