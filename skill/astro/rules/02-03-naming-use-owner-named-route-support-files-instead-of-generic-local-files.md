---
title: Use Owner-named Route Support Files Instead of Generic Local Files
titleKo: route support 파일은 generic 대신 owner 이름으로
impact: MEDIUM-HIGH
impactDescription: route 하나가 헬퍼·런타임 컴포넌트·스타일시트를 여럿 가져도 파일을 찾을 수 있게 함
tags: naming, pages, local, support-modules
---

## Use Owner-named Route Support Files Instead of Generic Local Files

**Impact: MEDIUM-HIGH (route 하나가 헬퍼·런타임 컴포넌트·스타일시트를 여럿 가져도 파일을 찾을 수 있게 함)**

Route-local files should name the owner and responsibility directly.

피할 이름:

- `_local.ts`, `_local.css`
- `_api.ts`, `_form.ts`, `_provider.tsx`
- `index.ts`, `page.css`

권장 이름:

- `_admin.ts`, `_admin-api.ts`, `_admin-form.ts`
- `_entry-admin.ts`, `_entry-admin.css`
- `_local/admin-query-provider.tsx`
- `_local/admin-state-notice.tsx`
- `_local/entry-editor.tsx`, `_local/entry-editor.css`

The routed `index.astro` or `[slug].astro` is the only place where generic route file names are expected,
because Astro owns that naming contract.

**Incorrect (support files hide ownership behind generic names):**

```text
src/
  pages/
    admin/
      entries/
        index.astro
        _local.ts
        _local.css
        _api.ts
        _form.ts
        _local/
          provider.tsx
          editor.tsx
          table.tsx
```

**Correct (support files name the route owner and responsibility):**

```text
src/
  pages/
    admin/
      _admin.ts
      _admin-api.ts
      _admin-form.ts
      _local/
        admin-query-provider.tsx
        admin-state-notice.tsx
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

If a helper is used by exactly one component, place it beside that component with the same owner name,
such as `entry-editor.ts` next to `entry-editor.tsx`. If it is shared across the route family,
use the route support owner,
such as `_entry-admin.ts`. Promote it to `shared` or `components` only after the dependency crosses route ownership.
