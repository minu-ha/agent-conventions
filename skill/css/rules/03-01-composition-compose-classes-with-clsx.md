---
title: Compose Classes With `clsx()`
titleKo: 클래스는 `clsx()`로 조립합니다
impact: HIGH
impactDescription: 기본 클래스와 상태 수정자를 섞어도 TSX 조립이 한눈에 읽힙니다
appliesWhen:
  - TSX의 `className`을 추가·수정할 때
  - 기본 클래스, 수정자, 선택 클래스를 함께 엮을 때
tags: clsx, tsx, className
---

## Compose Classes With `clsx()`

**Impact: HIGH (기본 클래스와 상태 수정자를 섞어도 TSX 조립이 한눈에 읽힙니다)**

TSX에서 `className`은 `clsx()`로 조립합니다.
문자열을 이어 붙이지 않습니다.
삼항 연산자로 클래스를 고르지도 않습니다.

클래스가 하나일 때도 `clsx()`를 씁니다.
수정자가 하나 붙을 때 문자열 연결로 되돌아가지 않습니다.
`className` 형태가 파일마다 갈리지 않으므로 검색하고 리뷰할 때 한 패턴만 찾습니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"pg_catalogIndex__listButton " + (isActive ? "pg_catalogIndex__listButton--active" : "")}>
	목록
</button>
```

**Correct (기본 클래스와 수정자를 `clsx()`로 조합):**

```tsx
<button
	className={clsx(
		"pg_catalogIndex__listButton",
		isActive && "pg_catalogIndex__listButton--active",
	)}
>
	목록
</button>
```
