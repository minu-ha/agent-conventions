# Switch Themes by Changing Token Values

**Impact: MEDIUM-HIGH (테마 분기가 한 파일에만 있어 색을 하나 더할 때 파일 여러 개를 열지 않습니다)**

테마는 **토큰 값만** 바꿉니다.
`prefers-color-scheme`과 `[data-theme]`는 토큰 파일 안에만 둡니다.
컴포넌트 CSS 파일에서 이 둘이 보이면 위반입니다.

`layout-group-breakpoints-at-the-file-bottom` 규칙이 정하는 것은 폭 조건입니다.
여기서 바꾸는 것은 클래스가 아니라 `:root`의 변수 값입니다.
두 블록을 섞지 않습니다.

컴포넌트가 분기를 가지면 색을 하나 더할 때마다 그 색을 쓰는 파일을 모두 찾아 두 번씩 적어야 합니다.
빠뜨린 한 곳은 테마를 바꿔 보기 전까지 드러나지 않습니다.

**토큰 이름은 값이 아니라 쓰임으로 짓습니다.**
`--app-color-white`는 다크에서 이름이 거짓말이 됩니다.
`--app-color-surface`는 값이 바뀌어도 이름이 그대로 맞습니다.

| 짓는 법 | 예 |
| --- | --- |
| 쓰임 | `--app-color-surface`, `--app-color-text-primary`, `--app-color-border` |
| 값 — 쓰지 않습니다 | `--app-color-white`, `--app-color-gray-100` |

**`color-scheme`을 선언합니다.**
스크롤바, 폼 컨트롤, 기본 배경은 우리 토큰이 닿지 않는 브라우저 UI라 이 속성으로만 따라옵니다.
선언하지 않으면 어두운 화면에 밝은 스크롤바가 남습니다.

**그림자도 테마 토큰입니다.**
어두운 배경에서 검은 그림자는 보이지 않습니다.
`box-shadow` 값을 직접 적지 말고 토큰으로 두어 테마마다 다르게 잡습니다.

**다크 모드를 지원하지 않기로 했으면 `prefers-color-scheme`을 아예 쓰지 않습니다.**
일부 화면만 대응하면 같은 앱 안에서 화면마다 배경이 달라져 지원하지 않는 것보다 나쁩니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-values-switch-themes-by-changing-token-values.md)을 읽습니다.
