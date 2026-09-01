# Do Not Build Structural Variants With Modifiers

**Impact: MEDIUM-HIGH (수정자가 두 번째 레이아웃 이름 체계로 자라지 않게 막습니다)**

수정자는 두 가지만 표현합니다.

| 표현하는 것 | 예 |
| --- | --- |
| 앱이 켜고 끄는 상태 | `--active`, `--selected`, `--error`, `--expanded`, `--current` |
| 여러 곳에서 반복되는 모양 | `--dense`, `--compact`, `--horizontal` |

브라우저가 부여하는 `:disabled`, `:checked`는 수정자로 만들지 않습니다.
`selector-use-pseudo-classes-for-dom-owned-states` 규칙이 정합니다.

한 곳에서만 필요한 여백이나 배치 보정에는 쓰지 않습니다.
`--compactTop`, `--marginLeft0`, `--alignRight`처럼 그 화면 하나를 고치려고 붙이는 이름이 여기 해당합니다.
그런 보정은 수정자가 아니라 **역할 이름이 있는 별도 요소 클래스**로 풉니다.

반복되는 모양인지는 아래 기준으로 가릅니다.
앱이 켜고 끄는 상태는 이 기준을 보지 않고 언제나 수정자입니다.

> 이 수정자 이름이 지금 저장소에서 두 개 이상의 `scope_slug`에 이미 있는가?

| 답 | 판정 |
| --- | --- |
| 있음 | 반복되는 모양이라 수정자로 허용합니다 |
| 없음 | 그 한 곳의 사정이라 역할 이름을 새로 지어 요소 클래스로 둡니다 |

두 번째 소유자가 같은 이름을 쓰게 되는 순간 수정자로 올립니다.
그 전까지는 요소 클래스로 둡니다.

> 예시·예외가 필요하면 [full rule](../rules/03-02-composition-do-not-build-structural-variants-with-modifiers.md)을 읽습니다.
