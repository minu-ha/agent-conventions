---
title: Configure Stylelint to Enforce These Rules
titleKo: `stylelint`로 자동 검사할 규칙을 설정합니다
impact: MEDIUM
impactDescription: 자동 검사 범위를 설정으로 고정하고 의미 판단은 리뷰에 남깁니다
appliesWhen:
  - stylelint 설정을 새로 만들거나 규칙을 추가, 수정할 때
  - 이 컨벤션 중 어디까지 자동으로 잡히는지 확인할 때
reviewWith: >-
  ownership-use-foreign-classes-only-under-your-own-root, selector-limit-nesting-block-depth,
  naming-use-scope-slug-element-modifier-syntax
tags: tooling, stylelint, automation
---

## Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (자동 검사 범위를 설정으로 고정하고 의미 판단은 리뷰에 남깁니다)**

### 규칙별 담당

`stylelint-config-standard`를 확장해 아래 규칙을 적용하고 기계가 확인하지 못하는 의미는 리뷰에서 판단합니다.

| Stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `css/naming-use-scope-slug-element-modifier-syntax` |
| `max-nesting-depth` | `css/selector-limit-nesting-block-depth` |
| `keyframes-name-pattern` | `css/a11y-namespace-keyframes-and-respect-reduced-motion` |
| `property-disallowed-list`, `custom-property-pattern` | `css/values-tokenize-repeated-visual-values`. 이름 패턴은 토큰 선언 파일에서만 켭니다 |
| `selector-attribute-name-disallowed-list` | `css/selector-use-pseudo-classes-for-dom-owned-states` |
| `selector-max-id` | `css/naming-use-scope-slug-element-modifier-syntax`. 선택은 클래스로만 합니다 |
| `selector-pseudo-class-disallowed-list` | `css/selector-do-not-negate-with-not` |
| `declaration-no-important` | `css/a11y-namespace-keyframes-and-respect-reduced-motion`의 전역 처리만 예외입니다 |
| `media-feature-range-notation` | `css/layout-write-breakpoints-desktop-first`의 범위 표기. 표준 설정에 포함됩니다 |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 둡니다. 표준 설정에 포함됩니다 |

`selector-disallowed-list`는 다음 세 컨벤션을 담당합니다.

- `css/ownership-use-foreign-classes-only-under-your-own-root`
- `css/selector-nest-dom-state-in-the-owning-block`
- `css/selector-use-classes-instead-of-element-selectors`

`no-duplicate-selectors`는 `css/selector-declare-each-class-in-one-block`과
`css/selector-do-not-group-classes-with-commas`의 단독 재선언을 담당합니다.
폴더별 접두사는 `selector-class-pattern`과 `selector-disallowed-list`의 `overrides`로 나눕니다.
`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
개수만으로 우리 선택자와 라이브러리 경로를 구분할 수 없습니다.

### 도구 한계와 리뷰

| 대상 | 도구 한계 | 처리 |
| --- | --- | --- |
| 쉼표 묶음 자체 | `disallowInList`는 단독 재선언만 검사합니다 | `css/selector-do-not-group-classes-with-commas`로 판단합니다 |
| 최상위 요소 선택자 | `ownMarkupPatterns`는 `&`로 시작하는 형태만 검사합니다 | `selector-max-type`은 쓰지 않고 리뷰에서 확인합니다 |
| 파일별 소유자 하나, 다른 소유자 클래스의 블록 위치 | 같은 레이어의 다른 식별자와 미등록 외부 클래스는 잡지 못합니다 | 리뷰에서 확인합니다 |
| 중첩 `@media`와 데스크톱 퍼스트 방향 | at-rule의 최상위 배치를 강제하지 못합니다 | `css/layout-group-breakpoints-at-the-file-bottom`으로 판단합니다 |
| 우리 마크업의 구조 선택자 | `:first-child`, `:nth-child()`는 클래스에도 붙습니다 | 표기만으로 구분하지 못해 리뷰에서 확인합니다 |
| 역할 이름, 승격 판단, 변형 노출, 포커스 대비 | 기계가 뜻을 판단하지 못합니다 | 리뷰에서 확인합니다 |

**Correct (공통 규칙에 폴더별 접두사 `overrides`를 더합니다):**

<<< ../examples/tooling-configure-stylelint-to-enforce-these-rules/01-correct.js
