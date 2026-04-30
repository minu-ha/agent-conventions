---
title: Keep `src/pages` as the Route-local Owner Layer
impact: CRITICAL
impactDescription: keeps Astro route ownership close to the file-based route without leaking screen implementation into shared or generic helper layers
tags: structure, pages, route-local, routing
---

## Keep `src/pages` as the Route-local Owner Layer

**Impact: CRITICAL (keeps Astro route ownership close to the file-based route without leaking screen implementation into shared or generic helper layers)**

Astro에서 `src/pages`는 required route tree입니다. 이 프로젝트에서는 route file을 단순 adapter로만 보지 않고, URL contract, `getStaticPaths()`, `prerender`, request-time data selection, document handoff, 그리고 화면 흐름을 함께 소유하는 route-local owner로 봅니다. 화면 구현이 현재 route에만 속한다면 routed `index.astro`, `[slug].astro`, `new.astro` 같은 entry에 직접 둡니다. 분리가 필요해지면 `src/pages/**/_local/`과 owner-named support file로 내리고, shared `ui`/`widget`이나 generic helper layer로 먼저 올리지 않습니다.

**Incorrect (`src/pages`를 얇게 만들기 위해 route-only 구현을 shared/feature layer로 밀어냄):**

```text
src/
  pages/
    admin/
      posts/
        index.astro
  features/
    admin-posts/
      admin-posts-page.astro
      private/
        post-editor.tsx
```

이 구조는 실제 route와 구현 owner가 멀어지고, `admin/posts` 같은 route depth가 feature 이름으로 다시 중복됩니다.

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
      posts/
        index.astro
        _post-admin.ts
        _post-admin.css
        _local/
          post-admin-runtime.tsx
          post-admin-table.tsx
          post-admin-table.css
          post-editor.tsx
          post-editor.css
```

이 구조에서는 route contract와 route-only 구현이 함께 움직입니다. `src/components/ui`와 `src/components/widget`은 여러 route에서 재사용되는 public surface만 받습니다.
