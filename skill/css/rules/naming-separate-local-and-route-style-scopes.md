---
title: Separate Route, Local, and Shared Style Scopes
impact: HIGH
impactDescription: keeps route-owned page styles, shared component styles, and truly local helper styles from mixing into the same namespace or file
tags: route-scope, local-scope, shared-scope, css-files
---

## Separate Route, Local, and Shared Style Scopes

**Impact: HIGH (keeps route-owned page styles, shared component styles, and truly local helper styles from mixing into the same namespace or file)**

Astro route page, route-local support UI, route-local runtime CSS가 같은 screen owner를 설명한다면 `rt_*` scope를 기본으로 사용합니다. `_local/` 아래로 파일이 내려갔다는 이유만으로 main screen surface를 `loc_*`로 바꾸지 않습니다. `loc_*`는 route surface와 독립된 leaf helper가 자기 owner를 가질 때만 사용합니다. 여러 route에서 재사용되는 block은 `wg_*`, primitive는 `ui_*`, pages-local document shell은 `rt_document__*`처럼 owner 범위를 분리합니다. 서로 다른 owner 범위는 한 파일에 섞지 않습니다.

**Incorrect (route surface, local helper, shared component owner를 한 파일/네임스페이스에 섞음):**

```txt
posts/_index.css
  rt_postsIndex__root
  loc_filterDialog__root
  rt_document__content
  ui_button__root
```

**Correct (route owner, document owner, local helper owner를 분리):**

```txt
posts/_index.css
  rt_postsIndex__root
  rt_postsIndex__list
  rt_postsIndex__empty

pages/_document.css
  rt_document__body
  rt_document__content

posts/_local/filter-dialog.css
  loc_filterDialog__root
```
