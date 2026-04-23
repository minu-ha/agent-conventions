---
title: Use Owner-named Feature Files Instead of Generic `page`, `slug`, and `index`
impact: MEDIUM-HIGH
impactDescription: keeps feature roots searchable even after the number of screens and support files grows
tags: naming, features, support-modules
---

## Use Owner-named Feature Files Instead of Generic `page`, `slug`, and `index`

**Impact: MEDIUM-HIGH (keeps feature roots searchable even after the number of screens and support files grows)**

`src/features/<feature>` 아래의 파일은 generic name보다 owner-named file을 우선합니다. 즉 `page.astro`, `slug.astro`, `index.css`, `index.ts`처럼 의미가 약한 이름보다 `recent-page.astro`, `posts-page.astro`, `post-detail-page.astro`, `notes-page.astro`, `note-detail-page.astro`, `tags-page.astro`, `tag-entries-page.astro`, `post.css`, `post.ts`처럼 feature 이름과 역할이 함께 드러나는 이름을 사용합니다. list, hub, directory screen은 route 이름을 그대로 따르고, detail screen은 singular + `detail-page`를 우선합니다. 이 규칙은 grep/search 탐색성을 높이고, feature 수가 많아져도 파일명이 서로 구분되게 만듭니다. route adapter 파일인 `src/pages/**/[slug].astro` 같은 이름은 Astro route contract 자체이므로 예외입니다.

**Incorrect (`src/features` 안에서 generic file name을 남발함):**

```text
src/
  features/
    post/
      page.astro
      slug.astro
      index.css
      index.ts
      private/
        modal.astro
        meta.astro
```

**Correct (feature 이름과 역할이 함께 드러나는 owner-named file을 사용):**

```text
src/
  features/
    post/
      posts-page.astro
      post-detail-page.astro
      post.css
      post.ts
      private/
        post-remove-modal.astro
        post-meta.astro
```
