---
title: Separate Domain State Modifiers From DOM Interaction States
titleKo: 도메인 상태 수정자와 DOM 상호작용 상태를 나눕니다
impact: HIGH
impactDescription: 앱 상태와 `:hover`, 포커스 동작을 섞지 않아 읽기 쉽고 접근성도 지킵니다
appliesWhen:
  - 앱 상태 수정자와 `:hover`, `:focus-visible`, `:disabled` 같은 DOM 상호작용 상태를 추가·변경할 때
  - 포커스 링을 수정할 때
reviewWith: composition-do-not-build-structural-variants-with-modifiers, a11y-always-provide-a-visible-focus-indicator
tags: state, focus, accessibility
---

## Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (앱 상태와 `:hover`, 포커스 동작을 섞지 않아 읽기 쉽고 접근성도 지킵니다)**

도메인 상태와 DOM 상호작용 상태는 다른 블록에 둡니다.

| 상태 | 자리 |
| --- | --- |
| 도메인 상태와 무관한 `:hover`, `:focus-visible`, `:disabled` | 조건 없는 기본 블록. 수정자 아래로 옮겨 적용 대상을 좁히지 않습니다 |

수정자가 켜진 경우에만 상호작용이 달라져야 한다는 제품 요구가 있을 때만 예외를 적습니다.

수정자 아래로 옮기면 그 상태가 아닐 때 `:hover`와 `:focus-visible`이 사라집니다.
읽는 사람은 기본 블록만 보고 상호작용이 없다고 판단합니다.

포커스 표시 자체는 `a11y-always-provide-a-visible-focus-indicator` 규칙이 담당합니다.
무엇을 수정자로 두고 무엇을 가상 클래스로 둘지는 `selector-use-pseudo-classes-for-dom-owned-states` 규칙이 정합니다.

**Incorrect (상호작용 상태를 수정자 아래로 옮겨 적용 대상을 좁힙니다):**

```css
.ui_button__root--active {
	background: var(--app-color-accent);

	&:hover {
		background: var(--app-color-accent-strong);
	}

	&:focus-visible {
		outline: 2px solid var(--app-color-focus);
	}
}
```

**Correct (도메인 상태와 상호작용 상태를 분리하고 포커스를 보존합니다):**

```css
.ui_button__root--active {
	background: var(--app-color-accent);
}

.ui_button__root {
	&:focus-visible {
		outline: 2px solid var(--app-color-accent);
		outline-offset: 2px;
	}

	&:disabled {
		cursor: not-allowed;
	}
}
```
