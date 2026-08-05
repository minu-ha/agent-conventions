# Group Breakpoints at the Bottom of the File

**Impact: HIGH (한 분기점에서 무엇이 달라지는지 한 블록에서 읽히고 두 방향이 겹치지 않습니다)**

분기점 재선언은 파일 맨 아래 `@media` 블록에 모읍니다.
클래스 블록 안에 `@media`를 중첩하지 않습니다.

분기점 하나는 보통 클래스 하나가 아니라 여러 클래스를 같이 건드립니다.
툴바 간격만 줄이는 게 아니라 패널 여백과 사이드바 폭이 함께 바뀝니다.
그 결정이 클래스 블록마다 흩어지면 "1024px 아래에서 무엇이 달라지는가"를 파일 전체를 훑어야 답합니다.

**대가가 있습니다.**
한 클래스의 선언이 기본 블록과 분기점 블록 두 곳에 있습니다.
`selector-declare-each-class-in-one-block` 규칙이 `@media` 안의 재선언을 예외로 두는 이유가 이것입니다.
여기서 그 예외의 자리를 못 박습니다.
그래도 이쪽을 고릅니다.
분기점을 고치는 일은 클래스 하나를 고치는 일이 아니라 그 폭에서 화면이 어떻게 보이는지를 고치는 일이기 때문입니다.

**데스크톱 퍼스트로 씁니다.**
기본 선언이 가장 넓은 화면 기준이고, 좁아질 때만 덮습니다.
`(width >= ...)` 조건과 섞지 않습니다.
두 방향을 섞으면 둘 다 맞는 구간에서 어느 쪽이 이기는지 매번 따져야 합니다.

블록 순서는 넓은 쪽부터 좁은 쪽입니다.
좁은 화면에서는 조건이 여러 개 동시에 맞고 마지막에 쓴 것이 이깁니다.

조건은 범위 표기로 씁니다.
`(width < 1024px)`로 쓰고 `(max-width: 1023.98px)`로 쓰지 않습니다.
`max-width: 1024px`은 1024를 포함해서 `min-width: 1024px`과 겹치므로 소수 보정이 필요했습니다.
범위 표기는 겹치지 않습니다.
`tooling-configure-stylelint-to-enforce-these-rules` 규칙이 그 표기를 강제합니다.

분기점 숫자는 아래 셋만 씁니다.
이름은 경계가 아니라 그 아래 구간을 가리킵니다.
기본 선언은 `1440px` 이상 기준입니다.

| 조건 | 구간 이름 | 여기부터 좁아짐 |
| --- | --- | --- |
| `(width < 1440px)` | `~lg` | 좁은 데스크톱 |
| `(width < 1024px)` | `~md` | 가로 태블릿, 좁은 노트북 |
| `(width < 640px)` | `~sm` | 세로 태블릿 아래 |

숫자를 토큰으로 빼지 않습니다.
`@media`의 조건에는 `var()`를 쓸 수 없어서 토큰으로 만들어도 그 자리에서 못 씁니다.
그래서 세 값을 규칙에 못 박고 그대로 적습니다.

`@media` 블록이 여러 파일에 반복되면 `composition-do-not-add-wrapper-elements-for-styling` 규칙이 소유자를 정합니다.

분기점을 적기 전에 분기점 없이 되는지 먼저 봅니다.
`values-reach-for-intrinsic-sizing-before-breakpoints` 규칙이 그 판정을 합니다.

테마 조건은 여기에 걸리지 않습니다.
`prefers-color-scheme`은 토큰 파일에서 최상위 `@media`로 씁니다.
`values-switch-themes-by-changing-token-values` 규칙이 그 자리를 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-08-selector-group-breakpoints-at-the-file-bottom.md)을 읽습니다.
