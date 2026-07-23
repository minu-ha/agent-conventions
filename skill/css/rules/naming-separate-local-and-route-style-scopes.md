---
title: Separate Route, Local, and Shared Style Scopes
impact: HIGH
impactDescription: keeps route-owned page styles, shared component styles, and truly local helper styles from mixing into the same namespace or file
appliesWhen: 스타일 owner를 route screen/support, document, 독립 leaf helper, reusable widget, UI primitive 중에서 결정하거나 서로 다른 owner를 이동·분리한다.
reviewWith: organization-keep-style-files-owned-by-one-component-or-route
tags: route-scope, local-scope, shared-scope, css-files
---

## Separate Route, Local, and Shared Style Scopes

**Impact: HIGH (keeps route-owned page styles, shared component styles, and truly local helper styles from mixing into the same namespace or file)**

route/framework skill이 route-owned surface로 판단한 스타일은 `rt_*` scope를 유지합니다. route screen의 흐름을 구성하거나 지원하는 route support surface는 파일이 `_local/` 같은 helper folder로 내려가도 `rt_*`입니다. route 맥락을 몰라도 되는 독립 leaf helper만 `loc_*`를 사용합니다. 파일 위치만으로 main screen 또는 route support surface를 `loc_*`로 바꾸지 않습니다.

scope 기준:

- `rt_*`: route-owned screen, route support surface, route/document owner
- `loc_*`: route 맥락과 독립된 leaf helper
- `wg_*`: 여러 route에서 재사용되는 block
- `ui_*`: primitive component

서로 다른 owner 범위는 한 파일에 섞지 않습니다. 어떤 markup이 route-owned인지 판단하는 책임은 활성화된 framework convention이 가집니다.

**Incorrect (route surface, local helper, shared component owner를 한 파일/네임스페이스에 섞음):**

```txt
entries/_index.css
  rt_entriesIndex__root
  loc_filterDialog__root
  rt_document__content
  ui_button__root
```

**Correct (route owner, document owner, local helper owner를 분리):**

```txt
entries/_index.css
  rt_entriesIndex__root
  rt_entriesIndex__list
  rt_entriesIndex__empty

pages/_document.css
  rt_document__body
  rt_document__content

entries/_local/filter-dialog.css
  loc_filterDialog__root
```
