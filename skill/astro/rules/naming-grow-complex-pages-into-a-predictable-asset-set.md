---
title: Grow Complex Pages into a Predictable Asset Set
impact: MEDIUM-HIGH
impactDescription: gives larger pages searchable homes for helpers, islands, and render parts before they collapse into a monolith
tags: naming, page-assets, support-modules
---

## Grow Complex Pages into a Predictable Asset Set

**Impact: MEDIUM-HIGH (gives larger pages searchable homes for helpers, islands, and render parts before they collapse into a monolith)**

page가 server query 준비, client island, page-only helper를 함께 가지기 시작하면 owner-named asset set으로 키웁니다. URL entry는 `src/pages`에 남기고, render shell과 island, support module은 searchable한 feature 이름으로 분리합니다. 모든 page에 고정된 파일 세트를 강제할 필요는 없지만, 복잡해진 뒤에도 `index.astro`, `utils.ts`, `helper.ts`만 남는 상태는 피합니다.

**Incorrect (page entry 하나에 모든 책임이 뭉치고 support file 이름도 generic함):**

```text
src/
  pages/
    pricing.astro
    utils.ts
    helper.ts
```

**Correct (page가 커지면 owner-named asset set으로 자라나게 유지):**

```text
src/
  pages/
    pricing.astro
  components/
    marketing/
      PricingPage.astro
      PricingCalculator.tsx
  lib/
    marketing/
      pricing-page.ts
```
