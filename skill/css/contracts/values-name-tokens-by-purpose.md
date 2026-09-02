# Name Tokens by Purpose, Not by Value

**Impact: MEDIUM-HIGH (값이 바뀌어도 토큰 이름이 거짓말이 되지 않고 새 토큰이 한 형태로 모입니다)**

토큰 이름은 `--app-<종류>-<쓰임>` 형태로 짓습니다.
`app-` 접두사는 `tooling-configure-stylelint-to-enforce-these-rules`의 `custom-property-pattern`이 검사합니다.

**쓰임으로 짓고 값으로 짓지 않습니다.**
`--app-color-white`는 다크 모드에서 이름이 거짓말이 됩니다.
`--app-color-surface`는 값이 바뀌어도 이름이 그대로 맞습니다.

| 종류 | 예 |
| --- | --- |
| `color` | `--app-color-surface`, `--app-color-text-primary`, `--app-color-border` |
| `shadow` | `--app-shadow-panel` |
| `space` | `--app-space-inline`, `--app-space-section` |
| `radius` | `--app-radius-control` |
| `z-index` | `--app-z-index-sticky`. 층 이름은 `values-declare-stacking-layers-as-tokens`가 정합니다 |

| 짓는 법 | 예 |
| --- | --- |
| 쓰임 | `--app-color-surface`, `--app-color-text-primary`, `--app-color-border` |
| 값 — 쓰지 않음 | `--app-color-white`, `--app-color-gray-100`, `--app-space-16` |

어느 값을 토큰으로 올릴지는 `values-tokenize-repeated-visual-values`가 정합니다.
테마마다 값이 달라지는 토큰은 `values-switch-themes-by-changing-token-values`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-05-values-name-tokens-by-purpose.md)을 읽습니다.
