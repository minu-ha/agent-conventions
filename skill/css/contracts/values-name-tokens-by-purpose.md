# Name Tokens by Purpose, Not by Value

**Impact: MEDIUM-HIGH (값이 바뀌어도 토큰 이름이 쓰임을 나타내고 일관된 형식을 유지합니다)**

토큰 이름은 값이 아니라 쓰임을 나타내는 `--app-<종류>-<쓰임>` 형태로 짓습니다.
값이 바뀌어도 이름이 뜻을 유지해야 하므로 `--app-color-white`, `--app-color-gray-100`,
`--app-space-16`처럼 짓지 않습니다.

| 종류 | 예 |
| --- | --- |
| `color` | `--app-color-surface`, `--app-color-text-primary`, `--app-color-border` |
| `shadow` | `--app-shadow-panel` |
| `space` | `--app-space-inline`, `--app-space-section` |
| `radius` | `--app-radius-control` |
| `z-index` | `--app-z-index-sticky`. 층 이름은 `values-declare-stacking-layers-as-tokens`를 따릅니다 |

`app-` 접두사는 `tooling-configure-stylelint-to-enforce-these-rules`의 `custom-property-pattern`이 검사합니다.
토큰화 대상은 `values-tokenize-repeated-visual-values`,
테마별 값은 `values-switch-themes-by-changing-token-values` 규칙이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-05-values-name-tokens-by-purpose.md)을 읽습니다.
