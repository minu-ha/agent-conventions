# Declare Stacking Layers as Tokens in One Place

**Impact: MEDIUM-HIGH (무엇이 무엇 위에 오는지가 한 파일에서 읽히고 숫자 경쟁이 생기지 않습니다)**

층은 전역 토큰 파일에 한 번 선언하고 `z-index`는 그 이름만 씁니다.
`values-keep-layout-intent-explicit`가 숫자를 직접 쓰지 말라고 하고, 여기서는 그 목록을 정합니다.

층은 넷입니다.
사이에 새 값을 끼워 넣지 않습니다.

| 토큰 | 값 | 무엇이 오는가 |
| --- | --- | --- |
| `--app-z-index-base` | `0` | 보통 흐름 |
| `--app-z-index-sticky` | `100` | 붙어 있는 머리말, 도구 모음 |
| `--app-z-index-overlay` | `200` | 모달, 서랍, 뒤 배경 |
| `--app-z-index-popper` | `300` | 툴팁, 드롭다운, 알림 |

새 층이 필요해 보이면 먼저 넷 중 하나에 들어가는지 봅니다.
정말 없으면 토큰 파일에 추가하고, 그 자리에서 순서를 다시 읽을 수 있게 값 간격을 유지합니다.

**층 순서는 같은 쌓임 맥락 안에서만 성립합니다.**
조상에 `transform`, `filter`, `opacity` 미만 1, `contain`, `will-change`, `backdrop-filter` 중 하나라도 있으면
새 쌓임 맥락이 생기고, 그 안의 `popper`가 바깥의 `sticky`에 집니다.
겹쳐 뜨는 요소가 가려지면 `z-index` 값을 올리기 전에 조상부터 확인합니다.

- `position`이 `static`이면 `z-index`가 아무 일도 하지 않습니다.
  `relative`부터 듣습니다.
- 같은 층 안에서 순서를 다투면 층이 잘못 잡힌 것입니다.
  값을 `+1` 하지 않습니다.
- 화면 밖으로 나가야 하는 것은 층을 올리지 말고 포털로 옮깁니다.
  그러면 조상의 쌓임 맥락에서 벗어납니다.

> 예시·예외가 필요하면 [full rule](../rules/05-07-values-declare-stacking-layers-as-tokens.md)을 읽습니다.
