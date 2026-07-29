---
title: Prefer Flat Files for Leaf Dynamic Routes
impact: HIGH
impactDescription: keeps dynamic route trees shallow until a route actually owns child routes
tags: routing, dynamic-routes, folders, pages
---

## Prefer Flat Files for Leaf Dynamic Routes

**Impact: HIGH (keeps dynamic route trees shallow until a route actually owns child routes)**

하위 route가 없는 dynamic page는 folder로 감싸지 말고 flat file로 둡니다. `index.astro` folder는 같은 resource 아래에 child route가 실제로 생겼을 때 사용합니다.

판단 기준:

- Leaf public detail은 `src/pages/posts/[slug].astro`처럼 둡니다.
- Leaf filtered list도 child route가 없으면 `src/pages/tags/[slug].astro`처럼 둡니다.
- 같은 dynamic resource 아래에 `feed.xml`, `[page].astro`, settings 같은 child route가 생기면 그때 `src/pages/tags/[slug]/index.astro`로 승격합니다.
- 공개 URL contract가 이미 배포됐다면 파일 구조 선호보다 URL 보존과 redirect 계획을 먼저 봅니다.

**Incorrect (하위 route가 없는데 dynamic route를 folder로 감쌈):**

```text
src/pages/posts/[slug]/index.astro
src/pages/tags/[slug]/index.astro
src/pages/authors/[author]/index.astro
```

이 구조는 route tree depth만 늘리고, route entry와 page-adjacent `_slug.css`/`_author.css` 같은 support asset의 대응도 흐립니다.

**Correct (leaf route는 flat file, child route가 있을 때만 folder):**

```text
src/pages/posts/[slug].astro
src/pages/posts/_slug.css

src/pages/tags/[slug].astro
src/pages/tags/_slug.css

src/pages/topics/[topic]/index.astro
src/pages/topics/[topic]/[page].astro
src/pages/topics/[topic]/feed.xml.ts
```

`topics/[topic]/index.astro`는 child route를 실제로 가지므로 folder가 route owner입니다.
반대로 `posts/[slug].astro`와 `tags/[slug].astro`는 leaf route라 flat file이 더 읽기 쉽습니다.
