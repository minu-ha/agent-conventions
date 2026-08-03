---
title: Always Provide a Visible Focus Indicator
titleKo: 포커스 표시는 눈에 보이게 항상 남깁니다
impact: HIGH
impactDescription: 포커스 표시를 없애지 않고 형태로 구분해 키보드 사용자가 현재 위치를 봅니다
appliesWhen:
  - `outline`, `:focus`, `:focus-visible` 스타일을 추가·수정할 때
  - interactive 요소의 기본 포커스 링을 덮어쓸 때
reviewWith: values-separate-domain-state-modifiers-from-dom-interaction-states
tags: accessibility, focus, interaction
---

## Always Provide a Visible Focus Indicator

**Impact: HIGH (포커스 표시를 없애지 않고 형태로 구분해 키보드 사용자가 현재 위치를 봅니다)**

포커스 표시를 없애지 않습니다. `outline: none`을 쓰면 대체 스타일을 반드시 함께 제공합니다.

- `:focus`보다 `:focus-visible`을 씁니다. 포인터 클릭에는 링이 안 나오고 키보드 이동에는 나옵니다.
- 색만 바꾸는 것으로 끝내지 않습니다. `outline`, `box-shadow` 링, `border` 두께처럼
  형태가 바뀌는 신호를 함께 씁니다. 색만 쓰면 색각 이상에서 구분되지 않습니다.
- 배경과 링의 대비를 확인합니다. 링이 배경과 같은 계열이면 없는 것과 같습니다.
- 기본 블록에 둡니다. modifier 블록 안에만 두면 그 상태가 아닐 때 표시가 사라집니다.

포커스 표시를 `--focused` 같은 앱 modifier로 대체하지 않습니다.
키보드로 들어왔는지 포인터로 들어왔는지는 브라우저만 알 수 있어서 앱이 재현할 수 없습니다.

**Incorrect (포커스 링을 제거하고 대체를 두지 않음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}
```

**Incorrect (색만 바꾸고, modifier 안에만 둠):**

```css
.ui_button__root--active {
	&:focus-visible {
		outline: none;
		color: #1677ff;
	}
}
```

**Correct (`:focus-visible`에 형태가 바뀌는 표시를 기본 블록에 둠):**

```css
.ui_button__root {
	border: 1px solid #d9d9d9;

	&:focus-visible {
		outline: 2px solid #1677ff;
		outline-offset: 2px;
	}
}
```

**Correct (`outline`을 덮어쓰면 링으로 대체함):**

```css
.ui_input__field {
	border: 1px solid #d9d9d9;

	&:focus-visible {
		outline: none;
		border-color: #1677ff;
		box-shadow: 0 0 0 3px rgb(22 119 255 / 20%);
	}
}
```
