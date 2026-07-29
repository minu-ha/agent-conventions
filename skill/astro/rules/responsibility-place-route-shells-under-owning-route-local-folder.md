---
title: Place Route Shells Under the Owning Route `_local/` Folder
impact: HIGH
impactDescription: >-
  prevents route shell files from becoming a blurry shared component tier between pages and reusable building blocks
tags: responsibility, layouts, local, ownership
---

## Place Route Shells Under the Owning Route `_local/` Folder

**Impact: HIGH (prevents route shell files from becoming a blurry shared component tier between pages and reusable building blocks)**

Route-specific shell files are not shared layouts. Put them under the owning route's `_local/` folder.

기준:

- Route subtree shell: `src/pages/admin/_local/admin-shell.astro`
- Shell style: same owner file, such as `admin-shell.css`
- Shared visual pieces: `ui` and `widget`
- Site-wide document shell: top-level `_document.astro`, `_head.astro`, `_document.css`

Do not create `src/layouts`, `src/components/layouts`, `ui-page-shell`,
or `widget-page-shell` just because several children in one route subtree share a shell.

**Incorrect (route shell floats as a shared component layer):**

```text
src/
  components/
    layouts/
      admin-layout.astro
      admin-layout.css
    ui/
      page-shell/ui-page-shell.astro
  pages/
    admin/
      entries/
        index.astro
```

이 구조는 admin route shell과 site-wide document shell의 자리를 동시에 흐리게 만들고,
shell ownership도 route 밖으로 밀어냅니다.

**Correct (route shell은 owning route `_local/` 아래에 두고 shared 조각만 ui/widget으로 재사용):**

```text
src/
  components/
    ui/
      box/ui-box.astro
      stack/ui-stack.astro
    widget/
      site-header/wg-site-header.astro
  pages/
    _document.astro
    _document.css
    _head.astro
    admin/
      _local/
        admin-shell.astro
        admin-shell.css
      entries/
        index.astro
```

이 구조에서는 `admin-shell.astro`가 admin route family shell을 소유하고,
site-wide document shell은 `src/pages/_*`가 소유하며, shared visual block만 `ui`와 `widget`에서 가져와 조립합니다.
