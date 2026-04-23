---
title: Place Pages-local Document Helpers Under `src/pages` with an Underscore Prefix
impact: HIGH
impactDescription: keeps route-shared document helpers and support files close to route adapters without turning them into routed pages or feature dependencies
tags: structure, pages, underscore, document-helpers
---

## Place Pages-local Document Helpers Under `src/pages` with an Underscore Prefix

**Impact: HIGH (keeps route-shared document helpers and support files close to route adapters without turning them into routed pages or feature dependencies)**

Astro는 `src/pages` 안에서 `_`로 시작하는 파일과 폴더를 router에서 제외합니다. 이 프로젝트에서는 이 성질을 이용해 pages-local document helper와 support file을 `src/pages/_*`에 둡니다. 기본 세트는 `_document.astro`, `_head.astro`, `_document.css`입니다. `_document.astro`는 `<html>`, `<head>`, `<body>`와 route-shared body shell을 소유하면서 문서 셸 contract도 자기 로컬 `Props`로 직접 가집니다. `_head.astro`는 head/meta 전용 contract를 자기 로컬 `Props`로 직접 소유하고, `_document.css`는 route-shared body shell 스타일을 소유합니다. 실제 route body 구현은 여전히 `src/features/<feature>`가 소유합니다.

**Incorrect (pages-local document helper와 body 구현 경계가 흐려짐):**

```text
src/
  features/
    recent/
      _document.astro
      _head.astro
      _document.css
      recent-page.astro
  pages/
    index.astro
```

이 구조는 route-shared document helper가 feature 안으로 들어가 pages와 features의 의존 방향을 흐리게 만듭니다.

**Correct (pages-local document helper는 `src/pages/_*`, body 구현은 `src/features`):**

```text
src/
  pages/
    _document.astro
    _head.astro
    _document.css
    index.astro
    404.astro
    posts/
      index.astro
    post/
      [slug].astro
  features/
    recent/
      recent-page.astro
      recent.ts
```

이 구조에서는 `_document`, `_head`, `_document.css`가 pages-local helper라는 점이 파일 위치만으로도 드러나고, routed page는 계속 `src/pages/**`만 담당합니다.
