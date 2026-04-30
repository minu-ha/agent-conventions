---
title: Place Pages-local Document Helpers Under `src/pages` with an Underscore Prefix
impact: HIGH
impactDescription: keeps route-shared document helpers and route-local support files close to route owners without turning them into routed pages
tags: structure, pages, underscore, document-helpers
---

## Place Pages-local Document Helpers Under `src/pages` with an Underscore Prefix

**Impact: HIGH (keeps route-shared document helpers and route-local support files close to route owners without turning them into routed pages)**

Astro는 `src/pages` 안에서 `_`로 시작하는 파일과 폴더를 router에서 제외합니다. 이 프로젝트에서는 이 성질을 이용해 pages-local document helper와 route-local support file을 `src/pages/_*` 또는 `src/pages/**/_*`에 둡니다. top-level 기본 세트는 `_document.astro`, `_head.astro`, `_document.css`입니다. route subtree 안에서는 `_index.ts`, `_slug.ts`, `_post-admin.ts`, `_local/post-editor.tsx`처럼 routed entry와 짝을 이루는 owner-named 파일을 둡니다. `_document.astro`는 `<html>`, `<head>`, `<body>`와 route-shared body shell을 소유하면서 문서 셸 contract도 자기 로컬 `Props`로 직접 가집니다.

**Incorrect (document helper와 route-local 구현이 route tree 밖으로 밀려남):**

```text
src/
  components/
    layout/
      _document.astro
      _head.astro
      _document.css
    admin/
      post-editor.tsx
  pages/
    admin/
      posts/
        index.astro
```

이 구조는 Astro route와 route-only 구현의 ownership을 흐립니다. `components`는 public shared surface처럼 보이므로 route 전용 파일을 두기에 부적절합니다.

**Correct (pages-local document helper와 route-local 구현을 `_` prefix로 route tree 안에 둠):**

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
      _index.ts
      _index.css
      [slug].astro
      _slug.ts
    admin/
      _local/
        admin-shell.astro
        admin-shell.css
      posts/
        index.astro
        _post-admin.ts
        _local/
          post-editor.tsx
          post-editor.css
```

이 구조에서는 `_document`, `_head`, `_document.css`가 pages-local document helper라는 점과, `_local/` 및 owner-named support file이 route-local 구현이라는 점이 파일 위치만으로 드러납니다.
