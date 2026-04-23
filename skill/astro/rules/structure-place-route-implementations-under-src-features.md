---
title: Place Route Implementations Under `src/features/<feature>`
impact: HIGH
impactDescription: keeps Astro's reserved route files small while giving each route family a stable feature-local home
tags: structure, features, route-implementations
---

## Place Route Implementations Under `src/features/<feature>`

**Impact: HIGH (keeps Astro's reserved route files small while giving each route family a stable feature-local home)**

Astro가 예약한 디렉터리는 `src/pages`뿐이므로, 실제 route 구현은 `src/features/<feature>` 아래에 두어도 됩니다. 이 프로젝트에서는 list/detail/directory screen, feature-owned support module, feature-owned CSS, feature-private UI를 `src/features/<feature>` 아래에 모으고, `src/pages`는 route adapter와 top-level document entry 역할만 맡깁니다. `src/pages/_document.astro`, `_head.astro`, `_document.css`는 pages-local document helper의 예외적인 자리이고, shared public surface는 `src/components`, structured content는 `src/content`에 남기며, feature-local implementation은 `src/features`에서 소유합니다.

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
    _document.astro
    _head.astro
    _document.css
    404.astro
    index.astro
    recent/
      index.astro
      [page].astro
    posts/
      index.astro
      [page].astro
      [slug].astro
    notes/
      index.astro
      [page].astro
      [slug].astro
    tags/
      index.astro
      [tag]/
        index.astro
        [page].astro
    rss.xml.ts
    robots.txt.ts
  features/
    error/
      not-found-page.astro
    home/
      home-page.astro
      home.css
      home.ts
    recent/
      recent-page.astro
      recent.ts
    post/
      posts-page.astro
      post-detail-page.astro
      post.css
      post.ts
      private/
        post-list-item.astro
        post-meta.astro
        post-remove-modal.astro
        post-remove-modal.css
    note/
      notes-page.astro
      note-detail-page.astro
      note.css
      note.ts
    tag/
      tags-page.astro
      tag-page.astro
      tag.css
      tag.ts
  content/
    blog/
      hello-world.md
```

meepin 최신 구조처럼 paginated list를 `recent/`, `posts/`, `notes/`, `tags/[tag]/` family 아래에 모으고 홈은 `src/pages/index.astro`에 분리해 두면, route adapter tree와 feature implementation tree가 함께 읽기 쉬워집니다. feature file 이름은 `recent-page.astro`, `posts-page.astro`, `post-detail-page.astro`, `notes-page.astro`, `note-detail-page.astro`, `tags-page.astro`, `tag-page.astro`처럼 route role이 드러나게 유지합니다.
