---
title: Compose Classes With `clsx()`
titleKo: clsx() 기반 class 조합
impact: HIGH
impactDescription: base class와 상태 modifier를 조합할 때 TSX class 조립을 읽을 수 있게 유지합니다
appliesWhen:
  - TSX의 `className`을 추가·수정할 때
  - base class, modifier, optional class를 조합할 때
tags: clsx, tsx, className
---

## Compose Classes With `clsx()`

**Impact: HIGH (base class와 상태 modifier를 조합할 때 TSX class 조립을 읽을 수 있게 유지합니다)**

TSX에서 `className`은 `clsx()` 사용을 기본으로 합니다.
기본 element 클래스 하나만 넣는 경우도 같은 기준을 유지하고,
상태 modifier나 optional class가 붙어도 읽기 쉽게 확장합니다.
문자열 연결이나 중복 ternary로 `className`을 조립하지 않습니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"pg_catalogIndex__listButton " + (isActive ? "pg_catalogIndex__listButton--active" : "")}>
	저장
</button>
```

**Correct (기본 클래스와 modifier를 `clsx()`로 조합):**

```tsx
<button
	className={clsx(
		"pg_catalogIndex__listButton",
		isActive && "pg_catalogIndex__listButton--active",
	)}
>
	저장
</button>
```
