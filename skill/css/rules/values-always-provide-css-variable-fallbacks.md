---
title: Always Provide CSS Variable Fallbacks
impact: HIGH
impactDescription: prevents missing tokens from degrading styles unpredictably when variables are absent
tags: variables, fallbacks, tokens
---

## Always Provide CSS Variable Fallbacks

**Impact: HIGH (prevents missing tokens from degrading styles unpredictably when variables are absent)**

CSS 변수 `var(--*)`를 사용할 때는 반드시 폴백 값을 함께 지정합니다. 폴백 값은 디자인 시스템 기본값이나 브라우저 안전 값을 사용해, 변수가 정의되지 않았을 때도 스타일이 무너지지 않게 합니다.

**Incorrect (폴백 없는 CSS 변수 사용):**

```css
.rt_pcmei__detailPanel {
	border: 1px solid var(--cms-color-border);
	background: var(--cms-color-bg-base);
}
```

**Correct (항상 폴백 값을 함께 지정):**

```css
.rt_pcmei__detailPanel {
	border: 1px solid var(--cms-color-border, #d9d9d9);
	border-radius: var(--cms-border-radius, 4px);
	background-color: var(--cms-color-bg-base, #fff);
}

.rt_srol__collapse {
	& .ant-collapse-item {
		border-radius: var(--cms-border-radius, 10px);
		background: var(--cms-color-bg-base, #fff);
	}
}
```
