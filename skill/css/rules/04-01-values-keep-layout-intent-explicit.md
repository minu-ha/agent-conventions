---
title: Keep Layout Intent Explicit
titleKo: 레이아웃 의도의 명시적 표현
impact: MEDIUM-HIGH
impactDescription: DOM을 역추적하지 않고도 sticky·fixed·박스 책임을 이해할 수 있게 합니다
appliesWhen:
  - `sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경할 때
  - 제외: 같은 element의 base/modifier 분리에서 기존 `display`·spacing 선언을 값 그대로 재배치하는 경우
tags: layout, comments, sticky
---

## Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (DOM을 역추적하지 않고도 sticky·fixed·박스 책임을 이해할 수 있게 합니다)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다.
`position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리합니다.

- `z-index`에는 숫자를 직접 쓰지 않고 layer 토큰을 씁니다. 토큰 이름이 곧 stacking 순서 문서입니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다. 어느 조상이 scroll container인지는 선언에 안 보입니다.

**Incorrect (레이아웃 강제가 많고 기준 설명이 없음):**

```css
.pg_dashboard__toolbar {
	position: sticky;
	top: 0;
	z-index: 9999;
	width: 100%;
	height: 48px;
}
```

**Correct (기준 컨테이너와 의도를 드러냄):**

```css
.pg_dashboard__toolbar {
	/* sticky toolbar pinned inside the scrollable content pane */
	position: sticky;
	top: 0;
	z-index: var(--app-z-index-toolbar);
}

.pg_dashboard__content {
	display: grid;
	min-height: 0;
}
```
