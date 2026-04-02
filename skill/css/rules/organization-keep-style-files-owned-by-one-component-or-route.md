---
title: Keep Style Files Owned by One Component or Route
impact: MEDIUM
impactDescription: keeps stylesheets aligned to a single owner so comments, ordering, and scope remain understandable
tags: files, ownership, comments
---

## Keep Style Files Owned by One Component or Route

**Impact: MEDIUM (keeps stylesheets aligned to a single owner so comments, ordering, and scope remain understandable)**

스타일 파일은 하나의 컴포넌트나 route 책임 범위를 기본 단위로 유지합니다. 파일이 길어질 경우 섹션 주석으로 블록을 구분하고, 선언 순서는 레이아웃, 박스 모델, 타이포그래피, 시각 효과, 상태/변형 순서를 기본으로 삼습니다.

**Incorrect (여러 소유자의 스타일이 한 파일에 섞이고 구조 주석이 없음):**

```css
/* entries.css */
.rt_entries__list {
	display: grid;
}

.loc_mecf__root {
	display: flex;
}

.ui_button__root {
	inline-size: 100%;
}
```

**Correct (한 파일당 한 소유자 범위를 유지하고 필요시 섹션 주석을 둠):**

```css
/* entries.css */
/* layout */
.rt_entries__layout {
	display: grid;
}

/* visual */
.rt_entries__panel {
	background: var(--cms-color-bg-base, #fff);
}

/* state */
.rt_entries__panel--active {
	border-color: var(--cms-color-primary, #1677ff);
}
```
