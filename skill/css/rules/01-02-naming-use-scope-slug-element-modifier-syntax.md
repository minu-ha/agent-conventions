---
title: Use Scope, Slug, Element, and Modifier Syntax
titleKo: 클래스 이름은 `범위_식별자__요소--수정자` 형식으로 씁니다
impact: HIGH
impactDescription: 클래스 이름에서 소유자와 역할을 확인할 수 있습니다
appliesWhen:
  - 일반 CSS에서 프로젝트가 소유한 클래스를 새로 만들 때
  - 이름, 범위, 식별자, 요소, 수정자의 구분자나 대소문자 표기를 바꿀 때
tags: naming, class-grammar, ownership
---

## Use Scope, Slug, Element, and Modifier Syntax

**Impact: HIGH (클래스 이름에서 소유자와 역할을 확인할 수 있습니다)**

클래스 이름은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 씁니다.
다른 규칙에서도 아래 한국어 이름을 씁니다.

| 자리 | 읽는 이름 | 담는 것 |
| --- | --- | --- |
| `scope` | 범위 | `pg`, `wg`, `ui` 중 하나. 소문자로 씁니다 |
| `slug` | 식별자 | CSS 파일 소유자의 이름. camelCase로 씁니다 |
| `element` | 요소 | 소유자 안의 UI 역할. `listButton`, `emptyState`처럼 camelCase로 씁니다 |
| `modifier` | 수정자 | 클래스 뒤에 `--`로 붙는 이름. camelCase로 씁니다 |

수정자의 허용 범위는 `composition-do-not-build-structural-variants-with-modifiers`가 정합니다.
식별자에는 접두사가 이미 드러낸 낱말을 반복하지 않으므로 `UiButton`은 `ui_button`입니다.
기계 검사는 이 문법을 정규식으로 등록한 `selector-class-pattern`이 담당합니다.

**Incorrect 1 (식별자, 요소, 수정자에 snake_case와 kebab-case가 섞입니다):**

<<< ../examples/naming-use-scope-slug-element-modifier-syntax/01-incorrect.txt

**Correct 1 (범위는 소문자로 쓰고 식별자, 요소, 수정자는 camelCase로 씁니다):**

<<< ../examples/naming-use-scope-slug-element-modifier-syntax/02-correct.txt
