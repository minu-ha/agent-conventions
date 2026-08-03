---
title: Keep Style Files Owned by One Component or Route Surface
titleKo: 스타일 파일의 단일 컴포넌트·route 소유 유지
impact: MEDIUM
impactDescription: 주석·순서·범위를 이해할 수 있도록 stylesheet를 소유자 하나에 맞춥니다
appliesWhen:
  - stylesheet를 새로 만들거나 이동·분할·병합해 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있을 때
tags: files, ownership, comments
---

## Keep Style Files Owned by One Component or Route Surface

**Impact: MEDIUM (주석·순서·범위를 이해할 수 있도록 stylesheet를 소유자 하나에 맞춥니다)**

스타일 파일은 하나의 컴포넌트, route surface, 또는 pages-local shell 책임 범위를 기본 단위로 유지합니다.
가장 중요한 기준은 한 파일 안의 클래스들이 하나의 owner를 설명하느냐입니다.
파일이 길어질 경우 가벼운 섹션 주석이나 선언 순서 규약을 보조적으로 둘 수 있지만,
이 규칙의 핵심은 주석 스타일이 아니라 ownership을 섞지 않는 것입니다.

**Incorrect (여러 소유자의 스타일이 한 파일에 섞이고 구조 주석이 없음):**

```css
/* posts.css */
.pg_catalogIndex__root {
	display: grid;
}

.pg_document__content {
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
.pg_catalogIndex__root {
	display: grid;
}

/* visual */
.pg_catalogIndex__panel {
	background: #fff;
}

/* state */
.pg_catalogIndex__panel--active {
	border-color: #1677ff;
}
```
