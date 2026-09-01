---
title: Name Elements and Modifiers by Role
titleKo: 요소와 수정자는 역할로 이름 짓습니다
impact: MEDIUM
impactDescription: 이름이 모호하거나 치수를 가리키면 클래스가 어느 부위인지 알 수 없습니다
appliesWhen:
  - 요소나 수정자 클래스 이름을 새로 지을 때
  - `container`, `wrapper`, `box`, 치수나 간격 중심 이름을 변경할 때
tags: naming, semantics, modifiers
---

## Name Elements and Modifiers by Role

**Impact: MEDIUM (이름이 모호하거나 치수를 가리키면 클래스가 어느 부위인지 알 수 없습니다)**

요소와 수정자 이름은 구조나 치수가 아니라 UI 역할을 드러냅니다.
`container`, `wrapper`, `box`처럼 뭉뚱그린 낱말은 합성어로도 쓰지 않습니다.
`gap12`처럼 숫자에 뜻을 담지도 않습니다.
요소는 그 자리가 무슨 일을 하는지, 수정자는 어떤 상태인지가 이름에서 읽히게 씁니다.

수정자를 붙일 자격이 있는지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 정합니다.
여기서는 붙이기로 정한 이름이 역할을 가리키는지만 봅니다.

**Incorrect (역할 대신 구조나 치수로 이름을 짓습니다):**

```txt
ui_card__wrapper
ui_card__box
ui_card__body--gap12
```

**Correct (역할과 상태를 기준으로 이름을 붙입니다):**

```txt
ui_card__toolbar
ui_card__body
ui_card__body--active
```
