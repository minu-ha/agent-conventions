---
title: Prefer Sibling `index.astro` and `[page].astro` Files for Paginated Route Families
impact: HIGH
impactDescription: keeps paginated route families shallow and makes list plus pagination contracts readable from one folder
tags: routing, pagination, pages, route-families
---

## Prefer Sibling `index.astro` and `[page].astro` Files for Paginated Route Families

**Impact: HIGH (keeps paginated route families shallow and makes list plus pagination contracts readable from one folder)**

페이지네이션이 있는 list route family는 가능하면 같은 폴더 안에서 `index.astro`와 `[page].astro`를 sibling으로 둡니다. 루트 recent라면 `src/pages/index.astro`와 `src/pages/[page].astro`, section list라면 `src/pages/posts/index.astro`와 `src/pages/posts/[page].astro`, filtered tag list라면 `src/pages/tag/[tag]/index.astro`와 `src/pages/tag/[tag]/[page].astro`처럼 둡니다. 이렇게 해야 list entry와 pagination contract가 한 폴더에 모여 route family 전체가 더 얕고 읽기 쉬워집니다.

**Incorrect (pagination route를 `page/` 하위 폴더로 한 단계 더 감쌈):**

```text
src/pages/page/[page].astro
src/pages/posts/page/[page].astro
src/pages/notes/page/[page].astro
src/pages/tag/[tag]/page/[page].astro
```

이 구조는 같은 route family를 불필요한 `page/` 서브폴더로 나눠, tree를 훑을 때 list와 pagination contract를 한눈에 보기 어렵게 만듭니다.

**Correct (list와 pagination을 sibling file로 둠):**

```text
src/pages/index.astro
src/pages/[page].astro

src/pages/posts/index.astro
src/pages/posts/[page].astro

src/pages/notes/index.astro
src/pages/notes/[page].astro

src/pages/tag/[tag]/index.astro
src/pages/tag/[tag]/[page].astro
```

이 구조에서는 각 route family의 entry page와 pagination page가 같은 폴더에 모여 있어 URL contract를 file tree만 보고도 바로 이해할 수 있습니다.
