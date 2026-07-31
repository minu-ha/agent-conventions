---
title: Reserve `client:only` for SSR-incompatible Components
titleKo: client:only의 SSR 불가 컴포넌트 한정
impact: HIGH
impactDescription: 정상적으로 hydrate 가능한 위젯의 서버 렌더 HTML을 지킵니다
tags: client-only, islands, hydration
---

## Reserve `client:only` for SSR-incompatible Components

**Impact: HIGH (정상적으로 hydrate 가능한 위젯의 서버 렌더 HTML을 지킵니다)**

`client:only`는 server HTML을 건너뛰고 page load 시점에 바로 client 렌더링합니다.
browser API 전용 라이브러리처럼 SSR이 실제로 불가능한 경우에만 사용하고, 그렇지 않다면 `client:load`, `client:idle`,
`client:visible`로 server HTML을 먼저 남깁니다.
`client:only`를 쓸 때는 framework hint를 명시하고, 로딩 공백이 보이면 fallback도 함께 둡니다.

**Incorrect (SSR 가능한 widget까지 습관적으로 `client:only`에 올림):**

```astro
<ThemeToggle client:only="react" />
<FaqAccordion client:only="react" />
```

**Correct (정상 hydration이 되는 widget은 SSR HTML을 남기고, SSR 불가 컴포넌트만 `client:only` 사용):**

```astro
<ThemeToggle client:idle />
<FaqAccordion client:visible />

<MapWidget client:only="react">
	<div slot="fallback">Loading map...</div>
</MapWidget>
```
