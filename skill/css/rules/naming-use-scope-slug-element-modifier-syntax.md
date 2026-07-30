---
title: Use Scope, Slug, Element, and Modifier Syntax
titleKo: scope·slug·element·modifier 문법 지키기
impact: CRITICAL
impactDescription: classname만 보고도 class 소유와 UI 역할을 추적할 수 있게 함
appliesWhen: >-
  plain CSS의 project-owned class를 새로 만들거나 이름, scope, slug, element, modifier 구분자 또는 casing을 변경한다.
tags: naming, class-grammar, ownership
---

## Use Scope, Slug, Element, and Modifier Syntax

**Impact: CRITICAL (classname만 보고도 class 소유와 UI 역할을 추적할 수 있게 함)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다.
구분자는 `_`, `__`, `--`를 고정하고, 각 부분의 책임을 섞지 않습니다.

구성 요소:

- `scope`: `rt`, `wg`, `ui`, `loc` 같은 lowercase owner namespace
- `slug`: owner 식별자. casing은 해당 scope의 house style을 따름
- `element`: owner 안의 UI 역할. `listButton`, `emptyState`처럼 camelCase
- `modifier`: 상태나 반복 variant. `routeActive`, `selected`처럼 camelCase

중요한 것은 모든 scope에 같은 slug casing을 강제하는 것이 아니라,
같은 owner 안에서 표기가 흔들리지 않게 유지하는 것입니다.

**Incorrect (scope별 slug 규칙을 섞거나 element/modifier casing이 흔들림):**

```txt
ui_tag_list__root
rt_catalog_page__root
rt_catalogDetail__main-content
wg_site_header__brandLink
rt_document__main-content
rt_document__main--route_active
```

**Correct (scope는 lowercase, slug는 scope별 house style, element/modifier는 camelCase):**

```txt
ui_tagList__root
rt_catalogIndex__root
rt_catalogDetail__mainContent
wg_siteHeader__brandLink
rt_document__main
rt_document__main--routeActive
```
