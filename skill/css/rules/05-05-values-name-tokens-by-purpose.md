---
title: Name Tokens by Purpose, Not by Value
titleKo: 토큰 이름은 값이 아니라 쓰임으로 짓습니다
impact: MEDIUM-HIGH
impactDescription: 값이 바뀌어도 토큰 이름이 거짓말이 되지 않고 새 토큰이 한 형태로 모입니다
appliesWhen:
  - 색·그림자·간격·층 같은 디자인 토큰을 새로 만들거나 이름을 바꿀 때
  - 토큰 파일에 `white`, `gray-100`처럼 값을 말하는 이름을 넣거나 뺄 때
reviewWith: values-tokenize-repeated-visual-values, values-switch-themes-by-changing-token-values
tags: values, naming
---

## Name Tokens by Purpose, Not by Value

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

**Incorrect (값으로 이름을 짓습니다):**

```css
/* src/style/token.css */
:root {
	--app-color-white: #fff;
	--app-color-gray-100: #f1f3f5;
	--app-space-16: 16px;
}

/* src/page/products/pg-products.css */
.pg_products__panel {
	background-color: var(--app-color-white);
	padding: var(--app-space-16);
}
```

**Correct (쓰임으로 이름을 짓습니다):**

```css
/* src/style/token.css */
:root {
	--app-color-surface: #fff;
	--app-color-surface-muted: #f1f3f5;
	--app-space-section: 16px;
}

/* src/page/products/pg-products.css */
.pg_products__panel {
	background-color: var(--app-color-surface);
	padding: var(--app-space-section);
}
```
