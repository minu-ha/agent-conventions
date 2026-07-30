---
title: Place Route Implementations Under `src/pages`
titleKo: route 구현은 src/pages 아래에
impact: HIGH
impactDescription: >-
  keeps page implementation near the file-based route while using underscore-prefixed files to avoid accidental routes
impactDescriptionKo: page 구현을 파일 기반 route 가까이 두고 밑줄 접두사로 의도치 않은 route 생성을 피함
tags: structure, pages, route-implementations, local
---

## Place Route Implementations Under `src/pages`

**Impact: HIGH (keeps page implementation near the file-based route while using underscore-prefixed files to avoid
accidental routes)**

Astro가 file-based routing을 `src/pages`에서 결정하므로, route 구현도 가능한 한 같은 route subtree에 둡니다.

배치 기준:

- Routed entry: `index.astro`, `[slug].astro`, `new.astro`
- Route support: `_index.ts`, `_slug.ts`, `_entry-admin.ts`
- Route CSS: `_index.css`, `_slug.css`, `_entry-admin.css`
- Route-only runtime/UI: `_local/`
- Shared primitive/block: `src/components/ui` or `src/components/widget`

**Incorrect (route 구현이 `src/features`와 generic helper 이름으로 흩어짐):**

```text
src/
  pages/
    entries/
      index.astro
      [slug].astro
  features/
    entry/
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
    entries/
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
        entry-editor.tsx
        entry-editor.css
    admin/
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
```

`src/pages` 안에서 `_`로 시작하는 파일과 폴더는 route가 아니므로 route-local implementation을 안전하게 둘 수 있습니다.
단, `_local/`은 dump folder가 아닙니다.
파일명은 `entry-editor.tsx`, `admin-query-provider.tsx`,
`entry-admin-table.css`처럼 실제 owner와 역할이 드러나야 합니다.
