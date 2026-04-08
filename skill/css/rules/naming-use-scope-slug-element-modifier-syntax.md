---
title: Use Scope, Slug, Element, and Modifier Syntax
impact: CRITICAL
impactDescription: makes class ownership and UI role traceable from the classname alone
tags: naming, class-grammar, ownership
---

## Use Scope, Slug, Element, and Modifier Syntax

**Impact: CRITICAL (makes class ownership and UI role traceable from the classname alone)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다. `scope`는 소유 범위, `slug`는 소유자 축약, `element`는 역할, `modifier`는 상태나 변형을 나타내며, 각 구분자는 `_`, `__`, `--`를 일관되게 유지합니다. `scope`와 `slug`는 소문자 축약을 유지하고, `element`와 `modifier`는 `listButton`, `detailExpanded`, `submitButton`, `emptyState`처럼 camelCase로 작성합니다. element/modifier 내부에서 `list-button`, `list_button`처럼 추가 구분자를 다시 도입하지 않습니다.

**Incorrect (구분자 의미가 섞이거나 element/modifier casing이 흔들림):**

```txt
ui_button_container
rt_pctbi_item_active
wgtable-row-selected
rt_pctbi__list-button
rt_pctbi__listButton--detail_expanded
```

**Correct (scope/slug는 소문자 축약, element/modifier는 camelCase로 표기):**

```txt
ui_button__root
rt_pctbi__item--active
wg_table__row--selected
rt_pctbi__listButton
rt_pctbi__listButton--detailExpanded
```
