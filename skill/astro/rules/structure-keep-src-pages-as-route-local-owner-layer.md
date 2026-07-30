---
title: Keep `src/pages` as the Route-local Owner Layer
titleKo: src/pages를 route-local 소유 레이어로 유지
impact: CRITICAL
impactDescription: >-
  keeps Astro route ownership close to the file-based route without leaking screen implementation into shared or generic
  helper layers
tags: structure, pages, route-local, routing
---

## Keep `src/pages` as the Route-local Owner Layer

**Impact: CRITICAL (keeps Astro route ownership close to the file-based route without leaking screen implementation into
shared or generic helper layers)**

Astro에서 `src/pages`는 required route tree입니다.
Route file은 얇은 import adapter가 아니라 URL contract와 route-local screen flow를 함께 소유합니다.

`src/pages`가 소유하는 것:

- URL contract와 file-based route
- `getStaticPaths()`, `prerender`, request-time data selection
- document helper로 넘기는 page meta handoff
- 현재 route에만 속한 screen implementation

분리가 필요하면 `src/pages/**/_local/`과 owner-named support file로 내립니다.
Shared `ui`/`widget`이나 generic helper layer로 먼저 올리지 않습니다.

**Incorrect (`src/pages`를 얇게 만들기 위해 route-only 구현을 shared layer로 밀어냄):**

```text
src/
  pages/
    admin/
      entries/
        index.astro
  components/
    layout/
      admin-entries-page.astro
    internal/
      entry-editor.tsx
```

이 구조는 실제 route와 구현 owner가 멀어지고, route-only file이 shared component처럼 보이게 만듭니다.

**Correct (route entry와 route-local 구현을 같은 route folder에 둠):**

```text
src/
  pages/
    _document.astro
    _head.astro
    _document.css
    admin/
      _admin.ts
      _admin-api.ts
      _admin-form.ts
      _local/
        admin-shell.astro
        admin-shell.css
        admin-query-provider.tsx
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
          entry-editor.tsx
          entry-editor.css
```

이 구조에서는 route contract와 route-only 구현이 함께 움직입니다.
`src/components/ui`와 `src/components/widget`은 여러 route에서 재사용되는 public surface만 받습니다.
