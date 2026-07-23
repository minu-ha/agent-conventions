---
title: Name Elements and Modifiers by Role
impact: HIGH
impactDescription: avoids vague or layout-only names that stop classes from describing what the UI part actually is
appliesWhen: element 또는 modifier class를 새로 짓거나 `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경한다.
tags: naming, semantics, modifiers
---

## Name Elements and Modifiers by Role

**Impact: HIGH (avoids vague or layout-only names that stop classes from describing what the UI part actually is)**

`element`와 `modifier` 이름은 구조나 치수가 아니라 UI 역할을 표현해야 합니다. `container`, `wrapper`, `box` 같은 포괄 단어 단독 사용이나 `gap12` 같은 숫자 기반 의미는 피하고, 실제 역할과 상태를 드러내는 이름을 씁니다.

**Incorrect (역할 대신 구조나 치수에 기대는 이름):**

```txt
ui_card__wrapper
ui_card__box
ui_card__body--gap12
rt_catalogDetail__section--compactTop
```

**Correct (역할과 상태를 기준으로 이름을 붙임):**

```txt
ui_card__toolbar
ui_card__body
ui_card__body--active
rt_catalogDetail__detailSection
```
