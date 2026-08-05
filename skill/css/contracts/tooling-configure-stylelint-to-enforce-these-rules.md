# Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

`stylelint-config-standard`를 확장하고 그 위에 이 컨벤션용 규칙을 얹습니다.

| stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `ownership-use-foreign-classes-only-under-your-own-root`, `selector-nest-dom-state-in-the-owning-block`, `selector-use-classes-instead-of-element-selectors` |
| `max-nesting-depth` | `selector-limit-nesting-block-depth` |
| `keyframes-name-pattern` | `values-namespace-keyframes-and-respect-reduced-motion` |
| `no-duplicate-selectors` | `selector-declare-each-class-in-one-block` |
| `property-disallowed-list` | `values-tokenize-repeated-visual-values` |
| `selector-attribute-name-disallowed-list` | `selector-use-pseudo-classes-for-dom-owned-states` |
| `media-feature-range-notation` | `selector-group-breakpoints-at-the-file-bottom`의 범위 표기. `stylelint-config-standard`에서 옵니다 |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 두게 합니다. `stylelint-config-standard`에서 옵니다 |

접두사가 디렉터리마다 달라서 `selector-class-pattern`과 `selector-disallowed-list`는 `overrides`로 나눕니다.
중첩이 한 겹이라 블록 안 선택자는 `&`로 시작하고, 그래서 블록 바깥에 홀로 둔 것만 걸립니다.

`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
우리 체이닝과 라이브러리 경로를 개수로 구분할 수 없습니다.

도구가 못 가는 자리를 적어 둡니다.

- 쉼표로 묶은 선택자는 어떤 규칙도 막지 않습니다.
  `no-duplicate-selectors`는 같은 선택자가 두 번 나올 때만 걸립니다.
  `selector-do-not-group-classes-with-commas`는 리뷰가 봅니다.
- 최상위 요소 선택자도 못 잡습니다.
  `ownMarkupPatterns`가 `&`로 시작하는 형태만 보고, `selector-max-type`은 넣지 않았습니다.
- 클래스 블록 안에 중첩한 `@media`도 못 잡습니다.
  at-rule 이 최상위에 있어야 한다고 요구하는 규칙이 없습니다.
  분기점 배치와 데스크톱 퍼스트 방향은 `selector-group-breakpoints-at-the-file-bottom`을 리뷰가 봅니다.
- 역할 이름, 승격 판단, 변형 노출, 포커스 대비도 리뷰가 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-tooling-configure-stylelint-to-enforce-these-rules.md)을 읽습니다.
