---
title: Compose Classes With `clsx()`
titleKo: clsx() 기반 클래스 조합
impact: HIGH
impactDescription: base 클래스와 상태 modifier를 조합할 때 TSX 클래스 조립을 읽을 수 있게 유지합니다
appliesWhen:
  - TSX의 `className`을 추가·수정할 때
  - base 클래스, modifier, optional 클래스를 조합할 때
tags: clsx, tsx, className
---

## Compose Classes With `clsx()`

**Impact: HIGH (base 클래스와 상태 modifier를 조합할 때 TSX 클래스 조립을 읽을 수 있게 유지합니다)**

TSX에서 `className`은 `clsx()`로 조립합니다.
문자열을 이어 붙이거나 ternary를 겹쳐 쓰지 않습니다.

클래스가 하나일 때도 `clsx()`를 씁니다.
modifier가 붙는 순간 문자열 연결로 되돌아가는 diff를 막습니다.
그리고 `className` 형태가 파일마다 갈리지 않아서 grep과 리뷰가 한 패턴만 봅니다.

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
