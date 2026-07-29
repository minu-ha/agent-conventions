---
title: Keep Layout Intent Explicit
impact: MEDIUM-HIGH
impactDescription: makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM
appliesWhen: `sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경한다. 같은 element의 base/modifier 분리에서 기존 `display`·spacing 선언을 값 그대로 재배치하면 제외한다.
tags: layout, comments, sticky
---

## Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다. `position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리하며, `sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다.
같은 DOM element의 base/modifier 책임을 분리하면서 기존 `display`나 spacing property-value를 값 그대로 재배치하는 작업은 class responsibility 규칙이 소유하며 이 규칙은 N/A입니다.
position, z-index, 강제 geometry 또는 부모·자식 layout 책임이 바뀌면 다시 Selected입니다.

**Incorrect (레이아웃 강제가 많고 기준 설명이 없음):**

```css
.rt_dashboard__toolbar {
	position: sticky;
	top: 0;
	z-index: 9999;
	width: 100%;
	height: 48px;
}
```

**Correct (기준 컨테이너와 의도를 드러냄):**

```css
.rt_dashboard__toolbar {
	/* sticky toolbar pinned inside the scrollable content pane */
	position: sticky;
	top: 0;
	z-index: var(--app-z-index-toolbar, 10);
}

.rt_dashboard__content {
	display: grid;
	min-height: 0;
}
```
