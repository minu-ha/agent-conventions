---
title: Use Scope, Slug, Element, and Modifier Syntax
titleKo: scope·slug·element·modifier 문법 준수
impact: CRITICAL
impactDescription: classname만 보고도 class 소유와 UI 역할을 추적할 수 있게 합니다
appliesWhen:
  - plain CSS의 project-owned class를 새로 만들 때
  - 이름, scope, slug, element, modifier 구분자 또는 casing을 변경할 때
tags: naming, class-grammar, ownership
---

## Use Scope, Slug, Element, and Modifier Syntax

**Impact: CRITICAL (classname만 보고도 class 소유와 UI 역할을 추적할 수 있게 합니다)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다.
구분자는 `_`, `__`, `--`를 고정하고, 각 부분의 책임을 섞지 않습니다.

구성 요소:

- `scope`: `pg`, `wg`, `ui` 중 하나. lowercase owner namespace
- `slug`: owner 식별자. `camelCase`
- `element`: owner 안의 UI 역할. `listButton`, `emptyState`처럼 camelCase
- `modifier`: 상태나 반복 variant. `routeActive`, `selected`처럼 camelCase

slug에는 prefix가 말하는 부분을 반복하지 않습니다. `UiButton`은 `ui_button`이고 `ui_uiButton`이 아닙니다.

기계 검증은 `selector-class-pattern`에 이 문법을 정규식으로 넣는 것입니다.

**Incorrect (slug와 element에 snake_case·kebab-case가 섞임):**

```txt
ui_tag_list__root
ui_tagList__list-item
wg_site_header__root
wg_siteHeader__brand-link
pg_catalog_detail__root
pg_catalogDetail__main-content
pg_catalogDetail__main--route_active
```

**Correct (scope는 lowercase, slug·element·modifier는 camelCase):**

```txt
ui_tagList__root
ui_tagList__listItem
wg_siteHeader__root
wg_siteHeader__brandLink
pg_catalogDetail__root
pg_catalogDetail__mainContent
pg_catalogDetail__main--routeActive
```
