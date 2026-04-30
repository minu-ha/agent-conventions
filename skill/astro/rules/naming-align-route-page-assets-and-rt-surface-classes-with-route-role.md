---
title: Align Route Page Assets and `rt_*` Surface Classes with Route Role
impact: HIGH
impactDescription: keeps Astro route files, route-local assets, CSS owners, and URL semantics aligned without duplicating folder depth in names
tags: naming, pages, css, route-role
---

## Align Route Page Assets and `rt_*` Surface Classes with Route Role

**Impact: HIGH (keeps Astro route files, route-local assets, CSS owners, and URL semantics aligned without duplicating folder depth in names)**

Routed entry file names follow Astro routing (`index.astro`, `[slug].astro`, `new.astro`). Route-local support files and CSS use the route role as owner, not the whole folder path. Surface class names use `rt_*__*` for route-owned screens. Use short, stable route abbreviations when the route is nested enough that full names become noisy, such as `rt_pi__root` for `posts/index.astro` or `rt_bi__root` for `bookmarks/index.astro`. Document shell keeps `rt_document__*`.

**Incorrect (route depth and generic names leak into file/class names):**

```txt
admin/posts/index.astro -> ft_adminPosts__root
admin/posts/_admin-posts.ts
admin/posts/_local.ts
admin/posts/_local.css
admin/posts/_local/provider.tsx
posts/[slug].astro -> ft_postsDetailPage__body
```

**Correct (route role and asset owner are short, searchable, and aligned):**

```txt
index.astro -> rt_hi__root
posts/index.astro -> rt_pi__root
posts/[slug].astro -> rt_ps__root
admin/posts/index.astro -> rt_pi__root
admin/posts/_post-admin.ts
admin/posts/_post-admin.css
admin/posts/_local/post-admin-runtime.tsx
admin/posts/_local/post-editor.tsx
admin/posts/_local/post-editor.css
_document.astro -> rt_document__body
```

When two route families would collide, choose the smallest owner name that disambiguates the local route, for example `rt_adminPosts__root` only if `rt_pi__root` is ambiguous inside the same stylesheet or review context. Do not switch to `loc_*` for the main page surface just because markup moved into `_local/`; the screen owner remains the route.
