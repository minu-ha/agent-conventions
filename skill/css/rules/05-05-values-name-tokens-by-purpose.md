---
title: Name Tokens by Purpose, Not by Value
titleKo: 토큰 이름은 값이 아니라 쓰임으로 짓습니다
impact: MEDIUM
impactDescription: 값이 바뀌어도 토큰 이름이 쓰임을 나타내고 일관된 형식을 유지합니다
appliesWhen:
  - 색 · 그림자 · 간격 · 층 같은 디자인 토큰을 새로 만들거나 이름을 바꿀 때
  - 토큰 파일에 `white`, `gray-100`처럼 값을 말하는 이름을 넣거나 뺄 때
reviewWith: values-tokenize-repeated-visual-values, values-switch-themes-by-changing-token-values
tags: values, naming
---

## Name Tokens by Purpose, Not by Value

**Impact: MEDIUM (값이 바뀌어도 토큰 이름이 쓰임을 나타내고 일관된 형식을 유지합니다)**

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
