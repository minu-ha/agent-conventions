---
title: Align Route Page Assets and `rt_*` Surface Classes with Route Role
titleKo: route 자산과 rt_* class를 route 역할에 맞추기
impact: HIGH
impactDescription: >-
  keeps Astro route files, route-local assets, CSS owners, and URL semantics aligned without duplicating folder depth in
  names
impactDescriptionKo: 이름에 폴더 깊이를 중복하지 않고 route 파일·자산·CSS 소유자·URL 의미를 일치시킴
tags: naming, pages, css, route-role
---

## Align Route Page Assets and `rt_*` Surface Classes with Route Role

**Impact: HIGH (keeps Astro route files, route-local assets, CSS owners, and URL semantics aligned without duplicating
folder depth in names)**

Routed entry file names follow Astro routing (`index.astro`, `[slug].astro`,
`new.astro`). Route-local support files and CSS use the route role as owner, not the whole folder path.

Naming 기준:

- Route-owned surface class는 `rt_*__*`를 사용합니다.
- `rt_*` slug는 route family와 screen role이 읽히는 이름을 기본으로 합니다.
- 팀이 공유하는 route map이 없는 짧은 acronym은 정답 예시로 쓰지 않습니다.
- 같은 route family가 충돌하면 더 명시적인 owner name을 선택합니다.
- Document shell은 `rt_document__*`를 유지합니다.

**Incorrect (route depth and generic names leak into file/class names):**

```txt
admin/entries/index.astro -> loc_adminEntriesPage__root
admin/entries/_admin-entries.ts
admin/entries/_local.ts
admin/entries/_local.css
admin/entries/_local/provider.tsx
entries/[slug].astro -> loc_entryDetailPage__body
```

**Correct (route role and asset owner are short, searchable, and aligned):**

```txt
index.astro -> rt_home__root
entries/index.astro -> rt_entriesIndex__root
entries/[slug].astro -> rt_entryDetail__root
admin/entries/index.astro -> rt_adminEntriesIndex__root
admin/entries/_entry-admin.ts
admin/entries/_entry-admin.css
admin/entries/_local/entry-admin-runtime.tsx
admin/entries/_local/entry-editor.tsx
admin/entries/_local/entry-editor.css
_document.astro -> rt_document__body
```

When two route families would collide, choose the smallest owner name that disambiguates the local route.
Do not switch to `loc_*` for the main page surface just because markup moved into `_local/`; the screen owner remains
the route.
