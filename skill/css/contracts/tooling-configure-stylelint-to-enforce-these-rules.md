# Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

`stylelint-config-standard`를 확장하고 그 위에 이 컨벤션용 규칙을 얹습니다.

| stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `ownership-use-foreign-classes-only-under-your-own-root` |
| `max-nesting-depth` | `selector-limit-nesting-block-depth` |
| `no-duplicate-selectors` | `selector-do-not-group-classes-with-commas`, `selector-declare-each-class-in-one-block` |
| `property-disallowed-list` | `values-tokenize-repeated-visual-values` |
| `selector-attribute-name-disallowed-list` | `selector-use-pseudo-classes-for-dom-owned-states` |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 두게 합니다 |

접두사가 디렉터리마다 달라서 `selector-class-pattern`과 `selector-disallowed-list`는 `overrides`로 나눕니다.
중첩이 한 겹이라 블록 안 선택자는 `&`로 시작하고, 그래서 단독 최상위만 걸립니다.

`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
우리 체이닝과 라이브러리 경로를 개수로 구분할 수 없습니다.

역할 이름, 승격 판단, variant 노출, 포커스 대비는 리뷰가 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-tooling-configure-stylelint-to-enforce-these-rules.md)을 읽습니다.
