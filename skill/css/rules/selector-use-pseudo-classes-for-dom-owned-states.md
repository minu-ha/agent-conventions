---
title: Use Pseudo-classes for DOM-owned States
impact: HIGH
impactDescription: keeps browser-owned interaction states separate from app-owned state modifiers
tags: pseudo-classes, state, interaction
---

## Use Pseudo-classes for DOM-owned States

**Impact: HIGH (keeps browser-owned interaction states separate from app-owned state modifiers)**

`:hover`, `:focus`, `:focus-visible`, `:disabled`, `:checked`처럼 브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 블록 내부 nested pseudo-class로 표현합니다. 반대로 `selected`, `active`, `error`처럼 화면이나 도메인이 결정하는 상태는 modifier 클래스로 유지합니다.

**Incorrect (도메인 상태를 pseudo-class처럼 표현):**

```css
.rt_pmli__assetCard {
	&:selected {
		border-color: var(--cms-color-primary, #1677ff);
	}
}
```

**Correct (DOM 상태는 pseudo-class, 화면 상태는 modifier로 분리):**

```css
.rt_pmli__assetCardButton {
	cursor: default;

	&:disabled {
		opacity: 1;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}

.rt_pmli__assetCard--selected {
	border-color: var(--cms-color-primary, #1677ff);
}
```
