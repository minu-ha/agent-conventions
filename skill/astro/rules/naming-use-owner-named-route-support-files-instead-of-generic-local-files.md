---
title: Use Owner-named Route Support Files Instead of Generic Local Files
impact: MEDIUM-HIGH
impactDescription: keeps route-local files searchable even when a route owns several helpers, runtime components, and stylesheets
tags: naming, pages, local, support-modules
---

## Use Owner-named Route Support Files Instead of Generic Local Files

**Impact: MEDIUM-HIGH (keeps route-local files searchable even when a route owns several helpers, runtime components, and stylesheets)**

Route-local files should name the owner and responsibility directly. Avoid generic `_local.ts`, `_local.css`, `_api.ts`, `_form.ts`, `_provider.tsx`, `index.ts`, or `page.css` names. Prefer `_admin.ts`, `_admin-api.ts`, `_admin-form.ts`, `_post-admin.ts`, `_post-admin.css`, `_local/admin-query-provider.tsx`, `_local/admin-state-notice.tsx`, `_local/post-editor.tsx`, and `_local/post-editor.css`. The routed `index.astro` or `[slug].astro` is the only place where generic route file names are expected, because Astro owns that naming contract.

**Incorrect (support files hide ownership behind generic names):**

```text
src/
  pages/
    admin/
      posts/
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

If a helper is used by exactly one component, place it beside that component with the same owner name, such as `post-editor.ts` next to `post-editor.tsx`. If it is shared across the route family, use the route support owner, such as `_post-admin.ts`. Promote it to `shared` or `components` only after the dependency crosses route ownership.
