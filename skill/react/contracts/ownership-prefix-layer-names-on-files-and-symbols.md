# Prefix Layer Names on Files and Symbols

**Impact: HIGH (파일 하나만 봐도 어느 레이어 소유인지 드러납니다)**

세 레이어 모두 파일명과 심볼에 계층 접두사를 붙입니다.
예외를 두지 않습니다.

| 레이어 | 파일 | 심볼 | CSS 식별자 |
| --- | --- | --- | --- |
| `ui` | `ui-button.tsx` | `UiButton` | `ui_button` |
| `widget` | `wg-chart.tsx` | `WgChart` | `wg_chart` |
| `page` | `pg-detail.tsx` | `PgDetail` | `pg_detail` |

- 폴더에는 붙이지 않습니다.
  상위 계층 폴더가 이미 계층을 말합니다.
- 접두사가 말하는 부분을 이름에서 되풀이하지 않습니다.
  `ui/button/ui-button.tsx`이고 `ui-button-button.tsx`가 아닙니다.
- 어느 레이어인지 정하는 것은 `ownership-layer-component-boundaries`가 먼저 판정합니다.
  이 규칙은 그 결과를 이름에 적는 것만 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/01-02-ownership-prefix-layer-names-on-files-and-symbols.md)을 읽습니다.
