---
title: Prefer `src/pages` for Page Entrypoints
impact: CRITICAL
impactDescription: keeps URL-producing entry files searchable and aligned with Astro's file-based routing contract
tags: structure, pages, ownership
---

## Prefer `src/pages` for Page Entrypoints

**Impact: CRITICAL (keeps URL-producing entry files searchable and aligned with Astro's file-based routing contract)**

URL을 직접 만드는 page entry는 `src/pages` 아래에서 소유합니다. `components/`, `features/`, `app/` 폴더 안에 page처럼 동작하는 진입 파일을 숨기지 말고, 페이지가 공용 조립을 재사용하더라도 route contract 자체는 `src/pages`에 남겨 둡니다.

**Incorrect (page entry를 feature 폴더 깊숙이 숨겨 file-based routing을 흐림):**

```text
src/
  components/
    marketing/
      pricing-page.astro
  pages/
    pricing.astro   -> imports and re-exports hidden page file
```

**Correct (`src/pages`가 URL entry를 직접 소유하고 조립은 별도 컴포넌트로 위임):**

```text
src/
  pages/
    pricing.astro
  components/
    marketing/
      PricingPage.astro
```
