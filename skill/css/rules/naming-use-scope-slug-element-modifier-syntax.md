---
title: Use Scope, Slug, Element, and Modifier Syntax
impact: CRITICAL
impactDescription: makes class ownership and UI role traceable from the classname alone
tags: naming, class-grammar, ownership
---

## Use Scope, Slug, Element, and Modifier Syntax

**Impact: CRITICAL (makes class ownership and UI role traceable from the classname alone)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다. `scope`는 소유 범위, `slug`는 소유자 식별자, `element`는 역할, `modifier`는 상태나 변형을 나타내며, 각 구분자는 `_`, `__`, `--`를 일관되게 유지합니다. `scope` 자체는 `rt`, `wg`, `ui`, `loc`처럼 소문자 namespace를 유지합니다.

`slug`는 모든 scope에 동일한 casing을 강제하지 말고, 해당 scope의 house style을 따릅니다. 예를 들어 `rt_*` route slug는 lower-case 축약으로 route traceability를 유지하는 경우가 많고, `wg_*`, `ui_*`, `loc_*` 같은 component/local scope는 프로젝트가 owner slug를 camelCase로 굳혀 두었다면 그 표기를 그대로 유지할 수 있습니다. 중요한 것은 scope별 규칙을 섞지 않고, 같은 owner에서 slug 표기가 흔들리지 않게 유지하는 것입니다.

`element`와 `modifier`는 `listButton`, `detailExpanded`, `submitButton`, `emptyState`처럼 camelCase로 작성합니다. element/modifier 내부에서 `list-button`, `list_button`처럼 추가 구분자를 다시 도입하지 않습니다.

**Incorrect (scope별 slug 규칙을 섞거나 element/modifier casing이 흔들림):**

```txt
ui_tag_list__root
rt_siteHeader__panel
wg_site_header__brandLink
rt_pctbi__list-button
rt_pctbi__listButton--detail_expanded
```

**Correct (scope는 lowercase namespace를 유지하고, slug는 scope별 house style을 따르며, element/modifier는 camelCase로 표기):**

```txt
ui_tagList__root
rt_pctbi__item--active
wg_siteHeader__brandLink
rt_pctbi__listButton
rt_pctbi__listButton--detailExpanded
```
