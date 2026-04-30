---
title: Place Route Implementations Under `src/pages`
impact: HIGH
impactDescription: keeps page implementation near the file-based route while using underscore-prefixed files to avoid accidental routes
tags: structure, pages, route-implementations, local
---

## Place Route Implementations Under `src/pages`

**Impact: HIGH (keeps page implementation near the file-based route while using underscore-prefixed files to avoid accidental routes)**

Astro가 file-based routing을 `src/pages`에서 결정하므로, route 구현도 가능한 한 같은 route subtree에 둡니다. Routed entry는 `index.astro`, `[slug].astro`, `new.astro`처럼 URL을 그대로 표현하고, route-only data helpers, CSS, React runtime, modal, form, table, provider는 `_` prefix가 붙은 non-route file이나 `_local/` folder에 둡니다. 여러 route에서 진짜로 재사용되는 primitive나 block만 `src/components/ui` 또는 `src/components/widget`으로 올립니다.

**Incorrect (route 구현이 `src/features`와 generic helper 이름으로 흩어짐):**

```text
src/
  pages/
    posts/
      index.astro
      [slug].astro
  features/
    post/
      page.astro
      slug.astro
      index.ts
      index.css
      private/
        editor.tsx
```

**Correct (route entry와 route-local implementation을 같은 page subtree에 배치):**

```text
src/
  pages/
    index.astro
    _index.ts
    _index.css
    posts/
      index.astro
      _index.ts
      _index.css
      [slug].astro
      _slug.ts
      _slug.css
      new.astro
      _new.ts
      _new.css
      _local/
        post-editor.tsx
        post-editor.css
    admin/
      posts/
        index.astro
        _post-admin.ts
        _post-admin.css
        _local/
          post-admin-runtime.tsx
          post-admin-table.tsx
          post-admin-table.css
```

`src/pages` 안에서 `_`로 시작하는 파일과 폴더는 route가 아니므로 route-local implementation을 안전하게 둘 수 있습니다. 단, `_local/`은 dump folder가 아닙니다. 파일명은 `post-editor.tsx`, `admin-query-provider.tsx`, `bookmark-admin-table.css`처럼 실제 owner와 역할이 드러나야 합니다.
