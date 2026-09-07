---
title: Name Elements and Modifiers by Role
titleKo: 요소와 수정자는 역할로 이름을 짓습니다
impact: MEDIUM
impactDescription: 구조나 치수 대신 역할을 이름에 담아 UI의 어느 부분인지 구분합니다
appliesWhen:
  - 요소나 수정자 클래스 이름을 새로 지을 때
  - `container`, `wrapper`, `box`, 치수나 간격 중심 이름을 변경할 때
tags: naming, semantics, modifiers
---

## Name Elements and Modifiers by Role

**Impact: MEDIUM (구조나 치수 대신 역할을 이름에 담아 UI의 어느 부분인지 구분합니다)**

요소와 수정자는 구조나 치수 대신 UI 역할로 이름을 짓습니다.
요소는 무엇을 하는 자리인지, 수정자는 어떤 상태인지 드러내야 합니다.
`container`, `wrapper`, `box`는 합성어로도 쓰지 않고 `gap12`처럼 숫자에 뜻을 담지 않습니다.

수정자를 붙일 수 있는지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 정합니다.
이 규칙은 붙이기로 한 이름이 역할을 드러내는지 판단합니다.

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
ui_card__body--dense
```
