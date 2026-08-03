---
title: Separate Domain State Modifiers From DOM Interaction States
titleKo: 도메인 state modifier와 DOM 상호작용 state 분리
impact: HIGH
impactDescription: 앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지합니다
appliesWhen:
  - app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경할 때
  - focus ring을 수정할 때
reviewWith: composition-do-not-build-structural-variants-with-modifiers
tags: state, focus, accessibility
---

## Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지합니다)**

domain state와 무관한 hover, focus, disabled interaction은 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier block에는 `active`·`selected`·`error`처럼 app state가 소유하는 presentation만 남깁니다.
modifier가 켜진 경우에만 interaction이 달라져야 한다는 제품 요구가 있을 때만 그 예외를 명시합니다.

modifier 아래로 옮기면 그 상태가 아닐 때 hover와 focus가 사라집니다.
읽는 사람은 base block만 보고 interaction이 없다고 판단하게 됩니다.

포커스 표시 자체는 `values-always-provide-a-visible-focus-indicator`가 담당합니다.
무엇을 modifier로 두고 무엇을 pseudo-class로 둘지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

**Incorrect (포커스 스타일을 제거하거나 상태 경계를 섞음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}

.ui_button__root--hover {
	background: var(--app-color-accent);
}
```

**Correct (도메인 상태와 상호작용 상태를 분리하고 포커스를 보존):**

```css
.ui_button__root--active {
	background: var(--app-color-accent);
}

.ui_button__root {
	&:focus-visible {
		outline: 2px solid var(--app-color-accent);
		outline-offset: 2px;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```
