---
title: Declare Each Class in One Block
titleKo: 한 클래스의 선언은 한 블록에 모읍니다
impact: MEDIUM
impactDescription: 한 클래스의 선언을 한 블록에서 확인하고 수정합니다
appliesWhen:
  - 이미 선언한 클래스에 스타일을 더 추가할 때
  - 파일 아래쪽에서 위쪽 선언을 덮어쓰려 할 때
reviewWith: selector-do-not-group-classes-with-commas, layout-group-breakpoints-at-the-file-bottom
tags: selector, cascade, maintainability
---

## Declare Each Class in One Block

**Impact: MEDIUM (한 클래스의 선언을 한 블록에서 확인하고 수정합니다)**

한 클래스의 선언은 파일 안 한 블록에 모읍니다.
같은 클래스를 여러 곳에서 다시 열어 선언 순서로 덮어쓰지 않습니다.

| 형태 | 판정 |
| --- | --- |
| 기본 클래스와 수정자 | 서로 다른 클래스이므로 각자 블록을 둡니다. 한 요소에 함께 붙으면 명시도와 선언 순서를 확인합니다 |
| 쉼표로 묶어 선언을 나눔 | `selector-do-not-group-classes-with-commas` 규칙이 금지합니다 |
| `@media`, `@supports`, `@container` 안의 재선언 | 조건이 다른 별개 블록이므로 허용합니다 |

조건 블록의 위치는 `layout-group-breakpoints-at-the-file-bottom`을 따르고,
기계 검사는 `no-duplicate-selectors`가 담당합니다.

**Incorrect 1 (같은 클래스를 파일 두 곳에서 열어 선언 순서에 의존합니다):**

<<< ../examples/selector-declare-each-class-in-one-block/01-incorrect.css

**Correct 1 (한 블록에 모으고 최종 값만 남깁니다):**

<<< ../examples/selector-declare-each-class-in-one-block/02-correct.css

**Correct (조건이 다르면 별개 블록으로 둡니다):**

<<< ../examples/selector-declare-each-class-in-one-block/03-correct.css
