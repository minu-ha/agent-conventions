---
title: Keep Style Files Owned by One Component, Feature Surface, or Route-adjacent Shell
impact: MEDIUM
impactDescription: keeps stylesheets aligned to a single owner so comments, ordering, and scope remain understandable
tags: files, ownership, comments
---

## Keep Style Files Owned by One Component, Feature Surface, or Route-adjacent Shell

**Impact: MEDIUM (keeps stylesheets aligned to a single owner so comments, ordering, and scope remain understandable)**

스타일 파일은 하나의 컴포넌트, feature page surface, 또는 route-adjacent shell 책임 범위를 기본 단위로 유지합니다. 가장 중요한 기준은 한 파일 안의 클래스들이 하나의 owner를 설명하느냐입니다.   
파일이 길어질 경우 가벼운 섹션 주석이나 선언 순서 규약을 보조적으로 둘 수 있지만, 이 규칙의 핵심은 주석 스타일이 아니라 ownership을 섞지 않는 것입니다.

**Incorrect (여러 소유자의 스타일이 한 파일에 섞이고 구조 주석이 없음):**

```css
/* posts.css */
.ft_posts__root {
	display: grid;
}

.rt_document__content {
	display: flex;
}

.ui_button__root {
	inline-size: 100%;
}
```

**Correct (한 파일당 한 소유자 범위를 유지하고 필요시 섹션 주석을 둠):**

```css
/* posts.css */
/* layout */
.ft_posts__root {
	display: grid;
}

/* visual */
.ft_posts__panel {
	background: var(--cms-color-bg-base, #fff);
}

/* state */
.ft_posts__panel--active {
	border-color: var(--cms-color-primary, #1677ff);
}
```
