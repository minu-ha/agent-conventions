---
title: Place Page-adjacent Document Shells Under `src/pages` with an Underscore Prefix
impact: HIGH
impactDescription: keeps top-level document helpers close to route adapters without turning them into routed pages or feature dependencies
tags: structure, pages, underscore, document-shells
---

## Place Page-adjacent Document Shells Under `src/pages` with an Underscore Prefix

**Impact: HIGH (keeps top-level document helpers close to route adapters without turning them into routed pages or feature dependencies)**

Astro는 `src/pages` 안에서 `_`로 시작하는 파일과 폴더를 router에서 제외합니다. 이 프로젝트에서는 이 성질을 이용해 top-level document composition helper를 `src/pages/_*.astro` 아래에 둡니다. `_document.astro`, `_head.astro`, `_page-chrome.astro`처럼 route가 아닌 page-adjacent shell/helper는 `src/pages`에 두되, 실제 route body 구현은 여전히 `src/features/<feature>`가 소유합니다. 이렇게 하면 page entry와 document helper는 가깝게 두고, feature body 렌더링과 top-level document 조립은 분리할 수 있습니다.

**Incorrect (document helper와 body 구현 경계가 흐려짐):**

```text
src/
  features/
    recent/
      _document.astro
      _head.astro
      recent-list-page.astro
  pages/
    index.astro
```

이 구조는 top-level document helper가 feature 안으로 들어가 pages와 features의 의존 방향을 흐리게 만듭니다.

**Correct (page-adjacent document shell은 `src/pages/_*.astro`, body 구현은 `src/features`):**

```text
src/
  pages/
    _document.astro
    _head.astro
    _page-chrome.astro
    index.astro
    404.astro
    posts/
      index.astro
    post/
      [slug].astro
  features/
    recent/
      recent-list-page.astro
      recent.ts
```

이 구조에서는 `_document`, `_head`, `_page-chrome`이 page-adjacent helper라는 점이 파일 위치만으로도 드러나고, routed page는 계속 `src/pages/**`만 담당합니다.
