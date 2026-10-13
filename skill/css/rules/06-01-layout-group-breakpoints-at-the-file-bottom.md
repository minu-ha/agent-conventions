---
title: Group Breakpoints at the Bottom of the File
titleKo: `@media` 브레이크포인트는 파일 맨 아래에 모읍니다
impact: MEDIUM
impactDescription: 각 브레이크포인트에서 달라지는 스타일을 한 블록에서 확인합니다
appliesWhen:
  - `@media` 브레이크포인트를 추가하거나 옮길 때
  - 화면 폭에 따라 값이 달라지는 선언을 넣을 때
reviewWith: >-
  layout-write-breakpoints-desktop-first, layout-reach-for-intrinsic-sizing-before-breakpoints,
  selector-declare-each-class-in-one-block, values-switch-themes-by-changing-token-values
tags: selector, responsive
---

## Group Breakpoints at the Bottom of the File

**Impact: MEDIUM (각 브레이크포인트에서 달라지는 스타일을 한 블록에서 확인합니다)**

브레이크포인트 재선언은 파일 맨 아래 `@media` 블록에 모으고 클래스 블록 안에 중첩하지 않습니다.
같은 폭에서 툴바, 패널, 사이드바가 어떻게 달라지는지 한 블록에서 읽도록 합니다.

기본 선언과 조건 선언이 나뉘지만 화면 전체의 폭별 변화를 함께 확인하기 위해 이 배치를 택합니다.
`selector-declare-each-class-in-one-block`은 이 배치를 위해 `@media` 재선언을 허용합니다.
조건 방향과 값은 `layout-write-breakpoints-desktop-first`를 따릅니다.

| 반복되거나 별도로 판단할 것 | 처리 |
| --- | --- |
| 같은 역할에서 값만 파일마다 다름 | 토큰 파일에서 값을 나눕니다 |
| 선택자와 선언까지 같은 배치 책임이 여러 파일에 반복됨 | 배치를 컴포넌트 하나로 모을지 검토하고 브레이크포인트를 그 파일에만 둡니다 |
| 조건 숫자만 같고 역할은 다름 | 컴포넌트를 합치지 않습니다 |
| 브레이크포인트 없이 배치할 수 있음 | `layout-reach-for-intrinsic-sizing-before-breakpoints` 규칙을 먼저 적용합니다 |
| `prefers-color-scheme` 테마 조건 | 이 규칙의 대상이 아닙니다 |

테마 조건은 `values-switch-themes-by-changing-token-values`에 따라 토큰 파일의 최상위 `@media`에 둡니다.

**Incorrect 1 (클래스 블록 안에 중첩해서 브레이크포인트가 흩어집니다):**

<<< ../examples/layout-group-breakpoints-at-the-file-bottom/01-incorrect.css

**Correct 1 (선언은 위에 두고 브레이크포인트는 파일 아래 한곳에 모읍니다):**

<<< ../examples/layout-group-breakpoints-at-the-file-bottom/02-correct.css

**Incorrect 2 (같은 `@media` 블록을 파일마다 복사합니다):**

<<< ../examples/layout-group-breakpoints-at-the-file-bottom/03-incorrect.css

**Correct 2 (반복되는 배치를 컴포넌트 하나로 만들고 브레이크포인트는 그 파일에만 둡니다):**

<<< ../examples/layout-group-breakpoints-at-the-file-bottom/04-correct.css
