---
title: Preserve Established Public URL Contracts When Normalizing Route Folders
impact: HIGH
impactDescription: >-
  prevents file tree cleanup from silently changing published URLs that users and crawlers already rely on
tags: routing, urls, migrations, route-families
---

## Preserve Established Public URL Contracts When Normalizing Route Folders

**Impact: HIGH (prevents file tree cleanup from silently changing published URLs that users and crawlers already rely on)**

route folder를 더 예쁘게 정리할 수 있더라도, 이미 공개된 URL contract가 있다면 그 계약을 먼저 존중합니다.
현재 사이트가 이미 `/recent/:page?`, `/posts/:page?`, `/posts/:slug`,
`/tags/:slug` 같은 경로를 쓰고 있다면 폴더 대칭성만을 이유로 root pagination, singular folder,
다른 slug family로 URL을 바꾸지 않습니다.
이 skill에서는 "새로 설계할 때의 선호 구조"와 "이미 배포된 공개 URL"을 분리해서 판단합니다.

**Incorrect (폴더 모양을 맞추려는 이유만으로 공개 URL을 바꿈):**

```text
before:
src/pages/index.astro
src/pages/recent/index.astro
src/pages/recent/[page].astro
src/pages/posts/index.astro
src/pages/posts/[page].astro
src/pages/posts/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[page].astro
src/pages/notes/[slug].astro
src/pages/tags/index.astro
src/pages/tags/[slug].astro

after:
src/pages/index.astro
src/pages/[page].astro
src/pages/posts/index.astro
src/pages/posts/[page].astro
src/pages/post/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[page].astro
src/pages/note/[slug].astro
src/pages/tag/[slug].astro
```

이 변경은 file tree는 더 대칭적으로 보일 수 있지만, 이미 배포된 `/recent/*`, `/posts/*`, `/notes/*`,
`/tags/*` 링크와 canonical을 깨뜨리는 공개 URL 변경이므로 별도 migration이나 redirect 계획 없이 수행하면 안 됩니다.

**Correct (현재 공개 URL을 유지하거나, 바꾼다면 명시적 migration으로 다룸):**

```text
current public contract:
src/pages/index.astro
src/pages/recent/index.astro
src/pages/recent/[page].astro
src/pages/posts/index.astro
src/pages/posts/[page].astro
src/pages/posts/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[page].astro
src/pages/notes/[slug].astro
src/pages/tags/index.astro
src/pages/tags/[slug].astro
```

이 경우에는 convention이 현재 공개 URL을 존중하도록 맞추고, 정말 URL을 바꾸고 싶다면 redirect, canonical, internal link,
sitemap까지 포함한 migration 작업으로 분리합니다.
