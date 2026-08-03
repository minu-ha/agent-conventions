---
title: Separate Domain State Modifiers From DOM Interaction States
titleKo: 도메인 상태 수정자와 DOM 상호작용 상태를 나눕니다
impact: HIGH
impactDescription: 앱 상태와 hover, 포커스 동작을 섞지 않아 읽기 쉽고 접근성도 지킵니다
appliesWhen:
  - 앱 상태 수정자와 hover, focus, disabled 같은 DOM 상호작용 상태를 추가·변경할 때
  - 포커스 링을 수정할 때
reviewWith: composition-do-not-build-structural-variants-with-modifiers
tags: state, focus, accessibility
---

## Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (앱 상태와 hover, 포커스 동작을 섞지 않아 읽기 쉽고 접근성도 지킵니다)**

도메인 상태와 무관한 hover, focus, disabled는 조건 없는 기본 블록에 둡니다.
이 선택자들을 수정자 아래로 옮겨 적용 대상을 좁히지 않습니다.
수정자 블록에는 `active`, `selected`, `error`처럼 앱이 정하는 모습만 남깁니다.
수정자가 켜진 경우에만 상호작용이 달라져야 한다는 제품 요구가 있을 때만 그 예외를 적습니다.

수정자 아래로 옮기면 그 상태가 아닐 때 hover와 focus가 사라집니다.
읽는 사람은 기본 블록만 보고 상호작용이 없다고 판단합니다.

포커스 표시 자체는 `values-always-provide-a-visible-focus-indicator`가 담당합니다.
무엇을 수정자로 두고 무엇을 가상 클래스로 둘지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

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
