---
title: Hydrate Only Truly Interactive Widgets
impact: CRITICAL
impactDescription: keeps Astro pages mostly static and reserves JavaScript for real interaction boundaries
tags: islands, hydration, performance
---

## Hydrate Only Truly Interactive Widgets

**Impact: CRITICAL (keeps Astro pages mostly static and reserves JavaScript for real interaction boundaries)**

Hydration은 검색 입력, 필터, 플레이어, 차트, 폼 상태처럼 실제 상호작용이 필요한 widget에만 사용합니다.
정적 hero,
marketing copy,
read-only card,
simple CTA wrapper는 `.astro`로 렌더링하고
불필요한 `client:*`를 붙이지 않습니다.

**Incorrect (정적 정보 블록 전체를 습관적으로 hydrate함):**

```astro
---
import FeatureGrid from "../components/FeatureGrid.tsx";
---

<FeatureGrid client:load features={features} />
```

**Correct (정적 grid는 `.astro`로 두고 interactive search만 island로 분리):**

```astro
---
import FeatureGrid from "../components/FeatureGrid.astro";
import FeatureSearch from "../components/FeatureSearch.tsx";
---

<FeatureGrid features={features} />
<FeatureSearch client:visible />
```
