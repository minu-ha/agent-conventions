---
title: Separate Domain State Modifiers From DOM Interaction States
impact: HIGH
impactDescription: keeps app state, focus visibility, and hover behavior readable and accessible without mixing their responsibilities
tags: state, focus, accessibility
---

## Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (keeps app state, focus visibility, and hover behavior readable and accessible without mixing their responsibilities)**

화면 상태나 도메인 상태는 `--active`, `--selected`, `--error` 같은 modifier로 표현하고, 브라우저 상호작용 상태는 같은 클래스 블록 내부 nested `&:hover`, `&:focus-visible`, `&:disabled` 같은 pseudo-class로 표현합니다. 포커스 링 제거는 금지하며, 대체 포커스 스타일을 반드시 제공합니다.

**Incorrect (포커스 스타일을 제거하거나 상태 경계를 섞음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}

.ui_button__root--hover {
	background: var(--app-color-accent, #1677ff);
}
```

**Correct (도메인 상태와 상호작용 상태를 분리하고 포커스를 보존):**

```css
.ui_button__root--active {
	background: var(--app-color-accent, #1677ff);
}

.ui_button__root {
	&:focus-visible {
		outline: 2px solid var(--app-color-accent, #1677ff);
		outline-offset: 2px;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```
