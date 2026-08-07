# Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

`stylelint-config-standard`를 확장하고 그 위에 이 컨벤션용 규칙을 얹습니다.

| stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `css/naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `css/ownership-use-foreign-classes-only-under-your-own-root`, `css/selector-nest-dom-state-in-the-owning-block`, `css/selector-use-classes-instead-of-element-selectors` |
| `max-nesting-depth` | `css/selector-limit-nesting-block-depth` |
| `keyframes-name-pattern` | `css/a11y-namespace-keyframes-and-respect-reduced-motion` |
| `no-duplicate-selectors` | `css/selector-declare-each-class-in-one-block`, `css/selector-do-not-group-classes-with-commas`의 단독 재선언 |
| `property-disallowed-list` | `css/values-tokenize-repeated-visual-values` |
| `selector-attribute-name-disallowed-list` | `css/selector-use-pseudo-classes-for-dom-owned-states` |
| `selector-disallowed-list`의 `:not(.` | `css/selector-do-not-invert-domain-state-with-not` |
| `declaration-no-important` | `css/a11y-namespace-keyframes-and-respect-reduced-motion`의 전역 처리만 예외입니다 |
| `media-feature-range-notation` | `css/layout-group-breakpoints-at-the-file-bottom`의 범위 표기. `stylelint-config-standard`에서 옵니다 |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 두게 합니다. `stylelint-config-standard`에서 옵니다 |

접두사가 디렉터리마다 달라서 `selector-class-pattern`과 `selector-disallowed-list`는 `overrides`로 나눕니다.
중첩이 한 겹이라 블록 안 선택자는 `&`로 시작하고, 그래서 블록 바깥에 홀로 둔 것만 걸립니다.

`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
우리 체이닝과 라이브러리 경로를 개수로 구분할 수 없습니다.

기계가 못 가는 자리를 적어 둡니다.

- 중복 없이 묶기만 한 쉼표 목록은 어떤 규칙도 막지 않습니다.
  `disallowInList` 옵션 덕분에 목록에 든 선택자를 아래에서 단독으로 다시 여는 형태는 걸립니다.
  묶음 자체는 `css/selector-do-not-group-classes-with-commas` 규칙을 리뷰가 봅니다.
- 요소 선택자를 최상위에 둔 형태는 못 잡습니다.
  `ownMarkupPatterns`의 요소 선택자 항목이 `&`로 시작하는 형태만 보고, `selector-max-type`은 넣지 않았습니다.
- 클래스 블록 안에 중첩한 `@media`도 못 잡습니다.
  `at-rule`이 최상위에 있어야 한다고 요구하는 규칙이 없습니다.
  브레이크포인트 배치와 데스크톱 퍼스트 방향은 `css/layout-group-breakpoints-at-the-file-bottom` 규칙을 리뷰가 봅니다.
- 구조 선택자로 우리 마크업을 겨냥한 것도 못 잡습니다.
  `:first-child`나 `:nth-child()`는 클래스에도 붙어서 형태로 구분할 수 없습니다.
- 역할 이름, 승격 판단, 변형 노출, 포커스 대비도 리뷰가 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/08-01-tooling-configure-stylelint-to-enforce-these-rules.md)을 읽습니다.
