---
title: Limit Nesting to One Level and Write the Rest Inline
titleKo: 중첩은 한 겹까지, 그다음은 한 줄로 씁니다
impact: MEDIUM
impactDescription: 중첩이 늘 한 겹이라 실제 선택자가 코드에 그대로 보입니다
appliesWhen:
  - 중첩 `{}` 블록을 추가하거나 기존 블록을 펼치거나 합칠 때
  - `&`로 조건이나 가상 요소를 붙일 때
reviewWith: >-
  selector-use-classes-instead-of-element-selectors, selector-declare-each-class-in-one-block
tags: selector, nesting, ampersand
---

## Limit Nesting to One Level and Write the Rest Inline

**Impact: MEDIUM (중첩이 늘 한 겹이라 실제 선택자가 코드에 그대로 보입니다)**

**중첩**은 `{}`를 겹치는 것입니다.
규칙은 하나입니다.

> 중첩은 항상 한 겹이고, `&`도 한 선택자에 한 번입니다.

`&`는 **그 블록이 소유한 요소 하나**를 가리킵니다.
그 요소에 조건이나 가상 요소를 붙일 때만 `&`를 씁니다.
다른 요소로 내려가면 `&`를 다시 열지 않고 같은 선택자 줄에 이어 씁니다.

- `.box { &::before { } }` — `.box` 자신의 가상 요소라서 `&`입니다.
- `.button { &:hover .box::before { } }` — 이 `::before`는 `.box`의 것이라 `&`로 쓸 수 없습니다.

그래서 `&`를 어디에 쓸지 고르지 않습니다.
**어느 요소를 가리키느냐가 정합니다.**
"어떤 때는 중첩, 어떤 때는 한 줄"이 아니라 한 겹까지가 중첩이고 그다음은 늘 한 줄입니다.

중첩을 두 겹 이상 열면 실제 선택자가 숨습니다.
`.pg_a { & .pg_b { & .pg_c { } } }`에 쓰인 선택자는 `& .pg_c`뿐이어서
`.pg_a .pg_b .pg_c`로 이어지는 것이 보이지 않습니다.
기계 검사도 각 블록만 봅니다.

기계 검증은 `max-nesting-depth: 1`입니다.
최상위가 0겹입니다.

**Incorrect (중첩을 두 겹 이상 열어 실제 선택자를 숨김):**

```css
.pg_salesPanel__spreadButton {
	&.MuiButtonBase-root {
		&:hover {
			.pg_salesPanel__spreadBox {
				border-color: #9fadc7;
			}
		}
	}
}
```

**Incorrect (다른 요소의 가상 요소를 `&`로 다시 엶):**

```css
.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox {
		&::before {
			border-color: #9fadc7;
		}
	}
}
```

**Correct (`&`는 한 번, 그다음 경로는 같은 줄에 이어 씀):**

```css
.pg_salesPanel__spreadBox {
	&::before {
		content: '';
		width: 18px;
		height: 18px;
		border: 2px solid #ced4da;
		background: #fff;
	}
}

.pg_salesPanel__spreadButton {
	&.MuiButtonBase-root {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	&:hover .pg_salesPanel__spreadBox::before {
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
