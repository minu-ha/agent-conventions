---
title: Do Not Invert Domain State With `:not()`
titleKo: 도메인 상태의 `:not()` 반전 금지
impact: HIGH
impactDescription: 상태가 아닐 때의 표현을 base에 두게 해서 부정 조건과 조상 의존이 함께 사라지게 합니다
appliesWhen:
  - `:not(.--modifier)`로 앱 상태를 뒤집으려 할 때
  - 조상의 modifier가 자손의 표현을 결정해야 할 것 같을 때
reviewWith: selector-use-pseudo-classes-for-dom-owned-states
tags: selector, state, negation
---

## Do Not Invert Domain State With `:not()`

**Impact: HIGH (상태가 아닐 때의 표현을 base에 두게 해서 부정 조건과 조상 의존이 함께 사라지게 합니다)**

도메인 상태를 `:not(.--modifier)`로 뒤집지 않습니다.
그 상태가 아닐 때의 표현은 base block에 두고, 그 상태일 때의 표현만 modifier block에 둡니다.

`:not()`이 나오는 원인은 하나입니다.

> 조상의 modifier로 자손의 표현을 결정하려 했기 때문입니다.

조상이 자손을 결정하려면 조상이 "그 상태가 아님"을 알아야 합니다.
자손에 자기 modifier를 붙이면 부정 조건이 필요 없어집니다.

- 각 요소의 modifier가 그 요소의 표현을 전부 갖습니다.
- 앱이 아는 상태는 그 요소에 modifier로 씁니다. 조상에서 다시 읽지 않습니다.
- `:not(:disabled)`처럼 DOM이 소유한 조건은 대상이 아닙니다. 앱이 그 값을 알 수 없습니다.

무엇이 DOM 상태이고 무엇이 앱 상태인지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

**Incorrect (조상 modifier로 자손 표현을 결정해 부정 조건과 중첩이 따라옴):**

```css
.pg_spikePanel__spreadButton:not(.pg_spikePanel__spreadButton--checked) {
	&.MuiButtonBase-root {
		&:hover {
			.pg_spikePanel__spreadBox::before {
				border-color: #9fadc7;
				box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
			}
		}
	}
}
```

**Correct (각 요소의 modifier가 그 요소의 표현을 가짐):**

```css
.pg_spikePanel__spreadBox {
	&::before {
		content: '';
		width: 18px;
		height: 18px;
		border: 2px solid #ced4da;
		border-radius: 4px;
		background: #fff;
	}
}

.pg_spikePanel__spreadBox--checked {
	&::before {
		border-color: #9fadc7;
		background: #9fadc7;
	}
}

.pg_spikePanel__spreadButton {
	&:hover .pg_spikePanel__spreadBox::before {
		border-color: #9fadc7;
		box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
	}

	&.Mui-focusVisible .pg_spikePanel__spreadBox::before {
		border-color: #9fadc7;
		box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
	}
}
```

**Correct (DOM이 소유한 조건은 그대로 `:not()`으로 씀):**

```css
.pg_assetIndex__cardButton {
	cursor: default;

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```
