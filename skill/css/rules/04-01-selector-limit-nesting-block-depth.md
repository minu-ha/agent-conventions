---
title: Limit Nesting to One Level and Write the Rest Inline
titleKo: 중첩 한 겹 제한과 이후 경로 한 줄 표기
impact: HIGH
impactDescription: 중첩을 항상 한 겹으로 고정해 실제 선택자가 코드에 그대로 보이게 합니다
appliesWhen:
  - 중첩 `{}` block을 추가하거나 기존 block을 펼치거나 합칠 때
  - `&`로 조건이나 pseudo-element를 붙일 때
reviewWith: >-
  selector-use-classes-instead-of-element-selectors, selector-declare-each-class-in-one-block
tags: selector, nesting, ampersand
---

## Limit Nesting to One Level and Write the Rest Inline

**Impact: HIGH (중첩을 항상 한 겹으로 고정해 실제 선택자가 코드에 그대로 보이게 합니다)**

**중첩**은 `{}`를 겹치는 것입니다. 규칙은 하나입니다.

> 중첩은 항상 한 겹이고, `&`도 한 선택자에 한 번입니다.

`&`는 **그 block이 소유한 요소 하나**를 가리킵니다.
그 요소에 조건이나 pseudo-element를 붙일 때만 `&`를 씁니다.
다른 요소로 내려가면 `&`를 다시 열지 않고 같은 선택자 줄에 이어 씁니다.

- `.box { &::before { } }` — box 자신의 pseudo-element라서 `&`입니다.
- `.button { &:hover .box::before { } }` — 이 `::before`는 box의 것이라 `&`로 쓸 수 없습니다.

그래서 `&`를 어디에 쓸지는 고르는 것이 아니라 **어느 요소를 가리키는지로 정해집니다.**
"언제는 중첩, 언제는 한 줄"이 아니라 한 겹까지가 중첩이고 그 다음은 늘 한 줄입니다.

중첩을 두 겹 이상 열면 실제 선택자가 숨습니다.
`.pg_a { & .pg_b { & .pg_c { } } }`에 쓰인 선택자는 `& .pg_c`뿐이어서
`.pg_a .pg_b .pg_c` 체이닝이 보이지 않습니다. lint도 각 block만 봅니다.

기계 검증은 `max-nesting-depth: 1`입니다. top-level이 0단입니다.

**Incorrect (중첩을 두 겹 이상 열어 실제 선택자를 숨김):**

```css
.pg_spikePanel__spreadButton {
	&.MuiButtonBase-root {
		&:hover {
			.pg_spikePanel__spreadBox {
				border-color: #9fadc7;
			}
		}
	}
}
```

**Incorrect (다른 요소의 pseudo-element를 `&`로 다시 엶):**

```css
.pg_spikePanel__spreadButton {
	&:hover .pg_spikePanel__spreadBox {
		&::before {
			border-color: #9fadc7;
		}
	}
}
```

**Correct (`&`는 한 번, 그 다음 경로는 같은 줄에 이어 씀):**

```css
.pg_spikePanel__spreadBox {
	&::before {
		content: '';
		width: 18px;
		height: 18px;
		border: 2px solid #ced4da;
		background: #fff;
	}
}

.pg_spikePanel__spreadButton {
	&.MuiButtonBase-root {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	&:hover .pg_spikePanel__spreadBox::before {
		border-color: #9fadc7;
	}
}
```

**Correct (외부 라이브러리 경로도 깊이와 무관하게 한 줄로 씀):**

```css
.pg_orderTable__root {
	& .ant-table-thead > tr > th {
		border-bottom: 2px solid #d9d9d9;
	}
}
```
