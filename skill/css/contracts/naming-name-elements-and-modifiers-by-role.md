# Name Elements and Modifiers by Role

**Impact: MEDIUM (구조나 치수 대신 역할을 이름에 담아 UI의 어느 부분인지 구분합니다)**

요소와 수정자는 구조나 치수 대신 UI 역할로 이름을 짓습니다.
`container`, `wrapper`, `box`는 합성어로도 쓰지 않고 `gap12`처럼 숫자에 뜻을 담지 않습니다.
수정자를 붙일 수 있는지는 `composition-do-not-build-structural-variants-with-modifiers`가 정합니다.

**Incorrect 1 (역할 대신 구조나 치수로 이름을 짓습니다):**

```txt
ui_card__wrapper
ui_card__box
ui_card__body--gap12
```

**Correct 1 (역할과 상태를 기준으로 이름을 붙입니다):**

```txt
ui_card__toolbar
ui_card__body
ui_card__body--dense
```

> 나머지 예시와 예외는 [full rule](../rules/01-03-naming-name-elements-and-modifiers-by-role.md)에 있습니다.
