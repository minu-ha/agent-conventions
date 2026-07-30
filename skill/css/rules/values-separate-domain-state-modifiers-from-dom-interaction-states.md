---
title: Separate Domain State Modifiers From DOM Interaction States
titleKo: 도메인 state modifier와 DOM 상호작용 state 분리
impact: HIGH
impactDescription: >-
  keeps app state, focus visibility, and hover behavior readable and accessible without mixing their responsibilities
impactDescriptionKo: 앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지함
appliesWhen: >-
  app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경하거나 focus ring에 손댄다.
reviewWith: composition-do-not-build-structural-variants-with-modifiers
tags: state, focus, accessibility
---

## Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (keeps app state, focus visibility, and hover behavior readable and accessible without mixing their
responsibilities)**

화면 상태나 도메인 상태는 `--active`, `--selected`, `--error` 같은 modifier로 표현하고,
브라우저 상호작용 상태는 같은 클래스 블록 내부 nested `&:hover`, `&:focus-visible`,
`&:disabled` 같은 pseudo-class로 표현합니다.
새 modifier를 다루면 실제 domain state인지 one-off structural patch인지 확인하기 위해
`composition-do-not-build-structural-variants-with-modifiers`를 다시 판정합니다.
포커스 링 제거는 금지하며, 대체 포커스 스타일을 반드시 제공합니다.

base/modifier 분리에서는 domain state와 무관한 hover, focus,
disabled interaction을 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier block에는 active·selected·error처럼 app state가 소유하는 presentation만 남깁니다.

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
