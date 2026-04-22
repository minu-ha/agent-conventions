---
title: Place Route Implementations Under `src/features/<feature>`
impact: HIGH
impactDescription: keeps Astro's reserved route files small while giving each route family a stable feature-local home
tags: structure, features, route-implementations
---

## Place Route Implementations Under `src/features/<feature>`

**Impact: HIGH (keeps Astro's reserved route files small while giving each route family a stable feature-local home)**

Astro가 예약한 디렉터리는 `src/pages`뿐이므로, 실제 route 구현은 `src/features/<feature>` 아래에 두어도 됩니다. 이 프로젝트에서는 list/detail screen, feature-owned support module, feature-owned CSS, feature-private UI를 `src/features/<feature>` 아래에 모으고, `src/pages`는 adapter 역할만 맡깁니다. shared public surface는 `src/components`, structured content는 `src/content`에 남기고, feature-local implementation은 `src/features`에서 소유합니다.

**Incorrect (route implementation이 전부 `src/pages` 안으로 자라남):**

```text
src/
  pages/
    posts/
      index.astro
      post-list-item.astro
      post-meta.astro
      post-remove-modal.astro
      post-remove-modal.css
```

**Correct (route adapter와 feature implementation의 자리를 분리):**

```text
src/
  pages/
    posts/
      index.astro
    post/
      [slug].astro
  features/
    post/
      post-list-page.astro
      post-detail-page.astro
      post.css
      post.ts
      private/
        post-list-item.astro
        post-meta.astro
        post-remove-modal.astro
        post-remove-modal.css
  content/
    blog/
      hello-world.md
```
