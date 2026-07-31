---
title: Name Elements and Modifiers by Role
titleKo: element·modifier의 역할 기반 명명
impact: HIGH
impactDescription: class가 UI 부위를 설명하지 못하게 만드는 모호하거나 레이아웃 중심인 이름을 피합니다
appliesWhen:
  - element 또는 modifier class 이름을 새로 지을 때
  - `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경할 때
tags: naming, semantics, modifiers
---

## Name Elements and Modifiers by Role

**Impact: HIGH (class가 UI 부위를 설명하지 못하게 만드는 모호하거나 레이아웃 중심인 이름을 피합니다)**

`element`와 `modifier` 이름은 구조나 치수가 아니라 UI 역할을 표현해야 합니다.
`container`, `wrapper`, `box` 같은 포괄 단어 단독 사용이나 `gap12` 같은 숫자 기반 의미는 피하고,
실제 역할과 상태를 드러내는 이름을 씁니다.

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
