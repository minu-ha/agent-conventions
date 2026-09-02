---
title: Keep Layout Intent Explicit
titleKo: 레이아웃 의도가 클래스명과 선언에서 읽히게 씁니다
impact: MEDIUM
impactDescription: DOM을 거슬러 올라가지 않고 `sticky`, `fixed`, 박스 책임을 파악합니다
appliesWhen:
  - `sticky`·`fixed`, `z-index`, 부모·자식 레이아웃 책임을 추가·변경할 때
  - 로딩 대체 화면의 컨테이너나 높이를 정할 때
  - 제외: 같은 요소를 기본과 수정자로 나누면서 기존 `display`·여백 선언을 값 그대로 옮기는 경우
reviewWith: values-declare-stacking-layers-as-tokens
tags: layout, comments, sticky
---

## Keep Layout Intent Explicit

**Impact: MEDIUM (DOM을 거슬러 올라가지 않고 `sticky`, `fixed`, 박스 책임을 파악합니다)**

레이아웃 의도는 클래스명과 선언만 보고 바로 읽혀야 합니다.
크기를 어디까지 고정할지는 `layout-reach-for-intrinsic-sizing-before-breakpoints` 규칙이 정합니다.

- `z-index`에는 숫자를 직접 쓰지 않고 층 토큰을 씁니다.
  토큰 이름이 곧 쌓임 순서 문서입니다.
  층 목록과 쌓임 맥락 조건은 `values-declare-stacking-layers-as-tokens` 규칙이 정합니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다.
  어느 조상이 스크롤 컨테이너인지는 선언에 안 보입니다.
  `fixed`는 `transform`이 걸린 조상 아래에서 뷰포트 기준을 잃습니다.
  `sticky`는 사이 조상에 `overflow: hidden`이나 `auto`가 있으면 그 조상이 기준이 되어 뷰포트에 붙지 않습니다.
- 로딩 대체 화면은 실제 내용과 같은 컨테이너 클래스 안에 넣습니다.
  높이를 대체 화면에만 따로 적으면 실제 내용이 들어올 때 그 값이 남아 레이아웃이 튑니다.

**Incorrect (층 숫자를 직접 적고 기준 컨테이너 설명이 없습니다):**

```css
.pg_dashboard__toolbar {
	position: sticky;
	top: 0;
	z-index: 9999;
}
```

**Correct (기준 컨테이너와 의도를 드러냅니다):**

```css
.pg_dashboard__toolbar {
	/* .pg_dashboard__content가 스크롤 컨테이너다 */
	position: sticky;
	top: 0;
	z-index: var(--app-z-index-sticky);
}

.pg_dashboard__content {
	display: grid;
	min-height: 0;
	overflow-y: auto;
}
```

**Incorrect (로딩 대체 화면에만 높이를 따로 적습니다):**

```css
.pg_dashboard__chartSkeleton {
	height: 320px;
}
```

**Correct (대체 화면을 실제 내용과 같은 컨테이너 클래스 안에 넣습니다):**

```tsx
<div className={clsx("pg_dashboard__chart")}>
	<Suspense fallback={<UiChartSkeleton />}>
		<PgDashboardChartSection />
	</Suspense>
</div>
```

```css
.pg_dashboard__chart {
	/* 로딩 중과 실제 차트가 같은 높이를 갖는다 */
	min-height: 320px;
}
```
