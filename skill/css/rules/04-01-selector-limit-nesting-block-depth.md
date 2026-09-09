---
title: Limit Nesting to One Level and Write the Rest Inline
titleKo: 선택자 중첩은 한 겹까지만 쓰고 나머지 경로는 한 줄로 잇습니다
impact: MEDIUM
impactDescription: 선택자 경로가 여러 중첩 블록에 흩어지지 않습니다
appliesWhen:
  - 중첩 `{}` 블록을 추가하거나 기존 블록을 펼치거나 합칠 때
  - `&`로 조건이나 가상 요소를 붙일 때
reviewWith: >-
  selector-use-classes-instead-of-element-selectors, selector-declare-each-class-in-one-block
tags: selector, nesting, ampersand
---

## Limit Nesting to One Level and Write the Rest Inline

**Impact: MEDIUM (선택자 경로가 여러 중첩 블록에 흩어지지 않습니다)**

선택자 블록 중첩은 **한 겹**, `&`는 **한 선택자에 한 번**만 씁니다.
중첩 깊이는 `{}`로 세되 `@media`, `@supports`, `@container` 같은 at-rule 블록은 제외합니다.

| 작성 위치 | 방법 |
| --- | --- |
| 중첩 블록의 선택자 | 항상 `&`로 시작합니다 |
| 그 블록이 소유한 요소의 조건이나 가상 요소 | `&:hover`, `&::before`처럼 씁니다 |
| 다른 요소로 이어지는 경로 | `&`를 다시 열지 않고 같은 선택자 줄에 이어 씁니다 |
| `.box` 자신의 `::before` | `.box { &::before { } }`로 씁니다 |
| `.button`의 hover에 반응하는 `.box::before` | `.button { &:hover .box::before { } }`로 씁니다 |

`&`가 가리키는 요소가 작성 위치를 결정합니다.
두 겹 이상 중첩하면 `.pg_a .pg_b .pg_c` 같은 전체 경로가 여러 블록에 흩어지고 기계 검사도 각 블록만 봅니다.
`&` 없이 시작하면 자손 선택자가 별도 겹처럼 읽혀 표기에 따라 검사 결과가 달라집니다.
기계 검증은 `max-nesting-depth: 1`이며 최상위는 0겹입니다.

**Incorrect (중첩을 두 겹 이상 열어 실제 선택자를 숨깁니다):**

```css
.pg_products__sortButton {
	&.MuiButtonBase-root {
		&:hover {
			.pg_products__sortBox {
				border-color: #9fadc7;
			}
		}
	}
}
```

**Incorrect 1 (다른 요소의 가상 요소를 `&`로 다시 엽니다):**

```css
.pg_products__sortButton {
	&:hover .pg_products__sortBox {
		&::before {
			border-color: #9fadc7;
		}
	}
}
```

**Correct 1 (`&`는 한 번, 그다음 경로는 같은 줄에 이어 씁니다):**

```css
.pg_products__sortBox {
	&::before {
		border: 2px solid #ced4da;
	}
}

.pg_products__sortButton {
	&.MuiButtonBase-root {
		display: inline-flex;
	}

	&:hover .pg_products__sortBox::before {
		border-color: #9fadc7;
	}
}
```

**Correct (외부 라이브러리 경로도 깊이와 무관하게 한 줄로 씁니다):**

```css
.pg_orderTable__root {
	& .MuiTableHead-root > tr > th {
		border-bottom: 2px solid #d9d9d9;
	}
}
```
