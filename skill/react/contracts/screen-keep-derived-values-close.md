# Keep Derived Values Close to Where They Are Used

**Impact: MEDIUM (파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다)**

`useState`와 프롭스에서 나온 조건 플래그·표시값은 사용하는 곳에서 계산합니다.
화면 상단에 준비 코드로 모으지 않고, 훅 인자·JSX·이펙트 내부의 좁은 스코프에 둡니다.

| 관련 판단 | 기준 |
| --- | --- |
| 응답과 스토어의 출처 유지 | `data-preserve-origin-chaining` |
| 값을 소유할 파일 선택 | `screen-extract-local-section-components-for-runtime-boundaries` |
| `let` 재할당·배열 `push`로 조립 | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| 계산한 값에 이름을 붙일지 결정 | `typescript/functions-name-a-value-only-for-recompute-or-judgment` |

이 규칙은 소유 파일 안에서 계산 위치를 정합니다. 소유자나 이름을 새로 정하는 기준은 위 규칙을 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/06-04-screen-keep-derived-values-close.md)을 읽습니다.
