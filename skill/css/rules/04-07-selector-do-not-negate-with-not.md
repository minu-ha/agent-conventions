---
title: Do Not Negate With `:not()`
titleKo: 선택자에 `:not()`을 쓰지 않습니다
impact: MEDIUM-HIGH
impactDescription: 그 상태가 아닐 때의 모습이 늘 기본 블록에 있어 부정 조건을 되짚지 않습니다
appliesWhen:
  - 선택자에 `:not()`을 넣으려 할 때
  - 조상 클래스와 자손 클래스를 한 선택자에 함께 쓸 때
reviewWith: selector-use-pseudo-classes-for-dom-owned-states
tags: selector, state, negation
---

## Do Not Negate With `:not()`

**Impact: MEDIUM-HIGH (그 상태가 아닐 때의 모습이 늘 기본 블록에 있어 부정 조건을 되짚지 않습니다)**

선택자에 `:not()`을 쓰지 않습니다.
그 상태가 아닐 때의 모습은 기본 블록에 두고, 그 상태일 때의 모습만 상태 블록에 둡니다.

`:not()`이 나오는 원인은 하나입니다.

> 조상의 수정자로 자손의 모습을 정하려 한 것입니다.

조상이 자손을 결정하려면 조상이 "그 상태가 아님"을 알아야 합니다.
자손에 자기 수정자를 붙이면 부정 조건이 필요 없어집니다.

- 각 요소의 수정자가 그 요소의 모습을 전부 갖습니다.
- 앱이 아는 상태는 그 요소에 수정자로 씁니다.
  조상에서 다시 읽지 않습니다.
- DOM이 소유한 조건도 같습니다.
  `&:not(:disabled)`로 쓰던 것은 기본 블록에 두고 `&:disabled`만 덮습니다.
  앱이 그 값을 몰라도 "아닐 때"가 기본이라는 사실은 달라지지 않습니다.

무엇이 DOM 상태이고 무엇이 앱 상태인지는 `selector-use-pseudo-classes-for-dom-owned-states` 규칙이 정합니다.

**Incorrect (조상 수정자로 자손 모습을 정해 부정 조건과 중첩이 따라옴):**

```css
.pg_salesPanel__spreadButton:not(.pg_salesPanel__spreadButton--checked) {
	&.MuiButtonBase-root {
		&:hover {
			.pg_salesPanel__spreadBox::before {
				border-color: #9fadc7;
				box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
			}
		}
	}
}
```

**Correct (각 요소의 수정자가 그 요소의 모습을 가짐):**

```css
.pg_salesPanel__spreadBox {
	&::before {
		content: '';
		width: 18px;
		height: 18px;
		border: 2px solid #ced4da;
		border-radius: 4px;
		background: #fff;
	}
}

.pg_salesPanel__spreadBox--checked {
	&::before {
		border-color: #9fadc7;
		background: #9fadc7;
	}
}

.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox::before {
		border-color: #9fadc7;
		box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
	}

	&.Mui-focusVisible .pg_salesPanel__spreadBox::before {
		border-color: #9fadc7;
		box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
	}
}
```

**Correct (DOM 상태도 기본을 먼저 두고 그 상태만 덮음):**

```css
.pg_assetIndex__cardButton {
	cursor: pointer;

	&:disabled {
		cursor: default;
	}
}
```
