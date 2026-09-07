# Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (자동 검사 범위를 설정으로 고정하고 의미 판단은 리뷰에 남깁니다)**

`stylelint-config-standard`를 확장해 아래 규칙을 적용하고 기계가 확인하지 못하는 의미는 리뷰에서 판단합니다.

| Stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `css/naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `css/ownership-use-foreign-classes-only-under-your-own-root`, `css/selector-nest-dom-state-in-the-owning-block`, `css/selector-use-classes-instead-of-element-selectors` |
| `max-nesting-depth` | `css/selector-limit-nesting-block-depth` |
| `keyframes-name-pattern` | `css/a11y-namespace-keyframes-and-respect-reduced-motion` |
| `no-duplicate-selectors` | `css/selector-declare-each-class-in-one-block`, `css/selector-do-not-group-classes-with-commas`의 단독 재선언 |
| `property-disallowed-list`, `custom-property-pattern` | `css/values-tokenize-repeated-visual-values`. 이름 패턴은 토큰 선언 파일에서만 켭니다 |
| `selector-attribute-name-disallowed-list` | `css/selector-use-pseudo-classes-for-dom-owned-states` |
| `selector-max-id` | `css/naming-use-scope-slug-element-modifier-syntax`. 선택은 클래스로만 합니다 |
| `selector-pseudo-class-disallowed-list` | `css/selector-do-not-negate-with-not` |
| `declaration-no-important` | `css/a11y-namespace-keyframes-and-respect-reduced-motion`의 전역 처리만 예외입니다 |
| `media-feature-range-notation` | `css/layout-write-breakpoints-desktop-first`의 범위 표기. 표준 설정에 포함됩니다 |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 둡니다. 표준 설정에 포함됩니다 |

디렉터리별 접두사는 `selector-class-pattern`과 `selector-disallowed-list`의 `overrides`로 나눕니다.
예제 정규식은 `&`로 시작하는 중첩 선택자와 최상위를 구분하지만 `&`의 소유자까지 검증하지는 않습니다.
`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
개수만으로 우리 선택자와 라이브러리 경로를 구분할 수 없습니다.

| 리뷰에서 확인할 것 | 기계 검사의 한계 |
| --- | --- |
| 쉼표 묶음 자체 | `disallowInList`는 목록 선택자를 단독 재선언할 때만 검사합니다. 묶음은 `css/selector-do-not-group-classes-with-commas`로 판단합니다 |
| 최상위 요소 선택자 | `ownMarkupPatterns`는 `&`로 시작하는 형태만 검사하고 `selector-max-type`은 쓰지 않습니다 |
| 파일별 소유자 하나, 다른 소유자 클래스의 블록 위치 | 같은 레이어의 다른 식별자와 미등록 외부 클래스는 잡지 못합니다 |
| 중첩 `@media`와 데스크톱 퍼스트 방향 | at-rule의 최상위 배치를 강제하지 못합니다. `css/layout-group-breakpoints-at-the-file-bottom`, `css/layout-write-breakpoints-desktop-first`로 판단합니다 |
| 우리 마크업의 구조 선택자 | `:first-child`, `:nth-child()`는 클래스에도 붙으므로 표기만으로 구분하지 못합니다 |
| 역할 이름, 승격 판단, 변형 노출, 포커스 대비 | 리뷰에서 의미를 확인합니다 |

> 예시·예외가 필요하면 [full rule](../rules/08-01-tooling-configure-stylelint-to-enforce-these-rules.md)을 읽습니다.
