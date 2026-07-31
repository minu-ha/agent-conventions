# Declare Core Tokens Once and Fall Back Everywhere Else

**Impact: HIGH (토큰 누락이 스타일을 조용히 망가뜨리는 것을 막고 fallback이 매직 넘버로 번지는 것도 막습니다)**

프로젝트는 전역에서 항상 주입되는 **core token 목록**을 한 곳에 선언합니다.
`:root` 또는 전역 theme stylesheet가 그 목록의 단일 출처입니다.

판정은 목록 대조로 끝냅니다.

| 대상 | fallback |
| --- | --- |
| core token 목록에 있는 변수 | **쓰지 않습니다.** 누락을 fail-loud로 드러냅니다 |
| 그 밖의 모든 `var()` | **씁니다.** 값이 없을 때 안전한 기본값을 둡니다 |

core token에 fallback을 붙이지 않는 이유는 `values-tokenize-repeated-visual-values`와 충돌하기 때문입니다.
`var(--app-space-3, 12px)`가 100곳에 있으면 `12px`을 100곳에 하드코딩한 것과 같아서 토큰화의 목적이 사라집니다.
값을 한 곳에서 바꾸려면 그 한 곳이 유일해야 합니다.

fallback이 필요한 쪽은 주입 주체가 프로젝트가 아닌 경계입니다.
서드파티 wrapper 내부, 선택적 theme, 임시 overlay, 조건부로만 주입되는 변수가 여기 해당합니다.

요청에 없는 CSS variable을 이 규칙 때문에 새로 발명하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-02-values-always-provide-css-variable-fallbacks.md)을 읽습니다.
