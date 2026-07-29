---
title: Prefer Sibling `index.astro` and `[page].astro` Files for Paginated Route Families
impact: HIGH
impactDescription: >-
  keeps paginated route families shallow and makes list plus pagination contracts readable from one folder
tags: routing, pagination, pages, route-families
---

## Prefer Sibling `index.astro` and `[page].astro` Files for Paginated Route Families

**Impact: HIGH (keeps paginated route families shallow and makes list plus pagination contracts readable from one folder)**

페이지네이션이 있는 list route family는 가능하면 같은 폴더 안에서 `index.astro`와 `[page].astro`를 sibling으로 둡니다.

배치 기준:

- Home이 별도 landing이면 `src/pages/index.astro`는 그대로 둡니다.
- 하위 route가 없는 dynamic leaf는 `src/pages/articles/[slug].astro`처럼 flat file로 둡니다.
- Paginated archive는 `src/pages/archive/index.astro`와 `src/pages/archive/[page].astro`처럼 전용 family 아래에 둡니다.
- Section list는 `src/pages/articles/index.astro`와 `src/pages/articles/[page].astro`처럼 둡니다.
- Dynamic resource 아래 pagination은 `src/pages/topics/[topic]/index.astro`와
  `src/pages/topics/[topic]/[page].astro`처럼 resource folder 안에 둡니다.

**Incorrect (pagination route를 `page/` 하위 폴더로 한 단계 더 감쌈):**

```text
src/pages/[page].astro
src/pages/articles/page/[page].astro
src/pages/docs/page/[page].astro
src/pages/topics/[topic]/page/[page].astro
```

이 구조는 홈과 archive의 역할을 섞거나,
같은 route family를 불필요한 `page/` 서브폴더로 나눠 tree를 훑을 때 list와 pagination contract를 한눈에 보기 어렵게
만듭니다.

**Correct (list와 pagination을 sibling file로 둠):**

```text
src/pages/index.astro
src/pages/archive/index.astro
src/pages/archive/[page].astro

src/pages/articles/index.astro
src/pages/articles/[page].astro
src/pages/articles/[slug].astro

src/pages/docs/index.astro
src/pages/docs/[page].astro
src/pages/docs/[slug].astro

src/pages/topics/index.astro
src/pages/topics/[topic]/index.astro
src/pages/topics/[topic]/[page].astro
```

이 구조에서는 홈은 별도 route로 남고,
각 paginated route family의 entry page와 pagination page가 같은 폴더에 모여 있어 URL contract를 file tree만 보고도 바로
이해할 수 있습니다.
