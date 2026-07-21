---
title: Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed
impact: HIGH
impactDescription: prevents missing tokens from degrading styles unpredictably when variables are absent
appliesWhen: `var(--*)`를 추가·수정하거나 theme provider·third-party wrapper·optional token·overlay처럼 변수 주입이 보장되지 않는 경계를 스타일링한다.
tags: variables, fallbacks, tokens
---

## Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed

**Impact: HIGH (prevents missing tokens from degrading styles unpredictably when variables are absent)**

CSS 변수 `var(--*)`를 사용할 때는 토큰 존재가 보장되지 않는 경계에서 fallback 값을 함께 지정합니다. theme provider, 서드파티 wrapper, 선택적 토큰, 임시 overlay처럼 변수가 빠질 수 있는 surface에서는 안전한 기본값을 둬야 합니다.   
반대로 프로젝트 전역에서 반드시 주입되는 core design token이라면, 누락을 빨리 드러내기 위해 fallback을 생략할 수도 있습니다.

**Incorrect (존재 보장이 없는 토큰을 fallback 없이 사용):**

```css
.loc_postFilterDialog__panel {
	border: 1px solid var(--mk-color-border-default);
	background: var(--mk-color-bg-surface);
}
```

**Correct (불안정한 경계에는 fallback을 두고, 보장된 core token은 의도적으로 fail-loud 할 수 있음):**

```css
.loc_postFilterDialog__panel {
	border: 1px solid var(--mk-color-border-default, #d9d9d9);
	border-radius: var(--mk-size-radius-card, 4px);
	background-color: var(--mk-color-bg-surface, #fff);
}

.loc_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
		background: var(--mk-color-bg-surface, #fff);
	}
}

.ui_theme__root {
	color: var(--mk-color-text-primary);
}
```
