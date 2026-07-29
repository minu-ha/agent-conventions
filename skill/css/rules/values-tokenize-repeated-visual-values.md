---
title: Tokenize Repeated Visual Values
impact: HIGH
impactDescription: >-
  keeps repeated colors, spacing, and radius values aligned with shared design tokens instead of drifting into magic
  numbers
appliesWhen: 색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복되거나 새 shared visual value를 하드코딩한다.
reviewWith: values-always-provide-css-variable-fallbacks
tags: tokens, variables, reuse
---

## Tokenize Repeated Visual Values

**Impact: HIGH (keeps repeated colors, spacing, and radius values aligned with shared design tokens instead of drifting
into magic numbers)**

색상, 간격, 타이포, 그림자 같은 반복 가능한 시각 값은 CSS 변수와 디자인 토큰을 우선 사용합니다.
같은 값이 2회 이상 반복되면 하드코딩을 늘리기 전에 토큰화 여부를 먼저 검토합니다.

**Incorrect (반복 가능한 값을 그대로 하드코딩):**

```css
.ui_table__toolbar {
	gap: 12px;
}

.ui_table__row {
	background: #f5f5f5;
	border-radius: 4px;
}
```

**Correct (토큰과 변수를 우선 사용):**

```css
.ui_table__toolbar {
	gap: var(--app-space-3, 12px);
}

.ui_table__row--selected {
	background: var(--app-color-fill-muted, #f5f5f5);
	border-radius: var(--app-radius-control, 4px);
}
```
