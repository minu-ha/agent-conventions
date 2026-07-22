---
title: Keep Layout Intent Explicit
impact: MEDIUM-HIGH
impactDescription: makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM
appliesWhen: `sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경한다. 같은 element의 기존 `display`·spacing을 동작 변화 없이 base와 modifier 사이에서 옮기기만 하면 제외한다.
tags: layout, comments, sticky
---

## Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다. `position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리하며, `sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다. 같은 DOM element의 base와 modifier 사이에서 기존 `display`나 spacing 선언을 재배치하되 position, z-index, 강제 geometry, 부모·자식 책임과 실제 layout 동작이 그대로라면 이 규칙은 N/A입니다.

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
