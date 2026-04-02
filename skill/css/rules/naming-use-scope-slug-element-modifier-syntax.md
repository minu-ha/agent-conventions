---
title: Use Scope, Slug, Element, and Modifier Syntax
impact: CRITICAL
impactDescription: makes class ownership and UI role traceable from the classname alone
tags: naming, class-grammar, ownership
---

## Use Scope, Slug, Element, and Modifier Syntax

**Impact: CRITICAL (makes class ownership and UI role traceable from the classname alone)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다. `scope`는 소유 범위, `slug`는 소유자 축약, `element`는 역할, `modifier`는 상태나 변형을 나타내며, 각 구분자는 `_`, `__`, `--`를 일관되게 유지합니다.

**Incorrect (구분자 의미가 섞여 소유자와 역할이 흐려짐):**

```txt
ui_button_container
rt_pctbi_item_active
wgtable-row-selected
```

**Correct (scope, slug, element, modifier를 분리해 표기):**

```txt
ui_button__root
rt_pctbi__item--active
wg_table__row--selected
```
