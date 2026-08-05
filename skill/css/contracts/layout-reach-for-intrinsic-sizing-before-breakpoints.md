# Reach for Intrinsic Sizing Before Breakpoints

**Impact: HIGH (슬롯 폭이 얼마든 맞는 배치라 같은 컴포넌트를 옮겨도 CSS를 다시 고치지 않습니다)**

분기점을 적기 전에 분기점 없이 되는지 먼저 봅니다.
아래 넷 중 하나에 해당하면 `@media`를 쓰지 않습니다.

| 분기점에서 바꾸려는 것 | 분기점 없이 |
| --- | --- |
| 한 줄에 안 들어가서 줄을 바꿉니다 | `flex-wrap: wrap` + `flex: 1 1 <기준폭>` |
| 폭에 따라 열 개수가 달라집니다 | `grid-template-columns: repeat(auto-fit, minmax(<최소>, 1fr))` |
| 슬롯을 채우되 어느 선에서 멈춥니다 | `flex: 1 1 <기준폭>` + `max-width` |
| 여백이나 글자 크기가 조금씩 달라집니다 | `clamp(<최소>, <선호>, <최대>)` |

**`@media`는 뷰포트만 알고 그 요소가 실제로 받은 폭은 모릅니다.**
같은 컴포넌트를 넓은 본문에서 좁은 사이드바로 옮기면 뷰포트는 그대로인데 자리는 좁아집니다.
분기점으로 짠 배치는 이때 깨지고, 스스로 접히는 배치는 그대로 맞습니다.

분기점이 남는 경우가 있습니다.
배치가 통째로 달라질 때는 위 넷으로 안 됩니다.
사이드바가 사라지거나, 가로 두 칸이 세로 스택이 되거나, 표가 카드 목록으로 바뀌는 것이 그 경우입니다.
그때는 `layout-group-breakpoints-at-the-file-bottom` 규칙이 정한 자리에 적습니다.

**버튼과 입력처럼 낱개로 쓰는 컴포넌트는 자기 폭을 정하지 않습니다.**
버튼과 입력은 `padding`, `min-height`, 글자 크기까지만 자기 것입니다.
폭은 그 컴포넌트를 놓은 쪽이 정합니다.
놓는 쪽에서 그 폭을 왜 고정하는지가 클래스명과 선언에서 읽혀야 합니다.
`layout-keep-layout-intent-explicit` 규칙이 그 판정을 합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-03-layout-reach-for-intrinsic-sizing-before-breakpoints.md)을 읽습니다.
