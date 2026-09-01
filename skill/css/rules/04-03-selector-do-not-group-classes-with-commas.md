---
title: Do Not Group Classes With Commas to Share Declarations
titleKo: 공통 선언을 쓰려고 클래스를 쉼표로 묶지 않습니다
impact: MEDIUM
impactDescription: 공통 선언을 묶지 않고 각 클래스에 두면 한 클래스의 선언을 한 곳에서 읽습니다
appliesWhen:
  - 여러 클래스가 같은 선언을 반복해 `,`로 묶으려 할 때
  - 한 대상에 진입 조건을 둘 이상 추가할 때
reviewWith: >-
  selector-declare-each-class-in-one-block, values-tokenize-repeated-visual-values
tags: selector, duplication, maintainability
---

## Do Not Group Classes With Commas to Share Declarations

**Impact: MEDIUM (공통 선언을 묶지 않고 각 클래스에 두면 한 클래스의 선언을 한 곳에서 읽습니다)**

여러 클래스를 `,`로 묶어 공통 선언을 공유하지 않습니다.
반복되는 선언은 각 클래스 블록에 그대로 씁니다.
**중복을 감수합니다.**

- 묶으면 한 클래스의 선언을 다 보려고 두 곳을 읽어야 하고, 그 클래스가 목록에 있는지도 확인해야 합니다.
- 클래스를 추가·삭제할 때마다 목록도 함께 고쳐야 합니다.
- 값을 지역 변수로 빼서 묶는 것도 같은 문제입니다.
  `values-tokenize-repeated-visual-values` 규칙이 막습니다.

한 대상에 진입 조건이 여럿이어도 같습니다.
조건마다 블록을 따로 열고 선언을 그대로 씁니다.
`:is()`로 묶지도 않습니다.
묶는 방법을 둘로 두면 언제 어느 쪽인지 다시 판단해야 합니다.

`@media`나 `@supports` 안에서 같은 클래스를 다시 선언하는 것은 이 규칙의 대상이 아닙니다.

| 형태 | 잡는 곳 |
| --- | --- |
| 목록에 든 선택자를 아래에서 단독으로 다시 엶 | `no-duplicate-selectors`의 `disallowInList` 옵션. 아래 첫 Incorrect 예시가 그 경우입니다 |
| 중복 없이 묶기만 함 | 리뷰. 쉼표 묶음 자체는 막지 않습니다 |

**Incorrect (`,`로 공통 선언을 묶고 아래에서 일부만 다시 엽니다):**

```css
.pg_salesPanel__glyph--line,
.pg_salesPanel__glyph--dashed,
.pg_salesPanel__glyph--pin,
.pg_salesPanel__glyph--band {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--band {
	background: rgb(140 152 160 / 12%);
}
```

**Correct (각 클래스가 자기 선언을 전부 가집니다):**

```css
.pg_salesPanel__glyph--line {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--dashed {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--pin {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--band {
	width: 24px;
	height: 24px;
	background: rgb(140 152 160 / 12%);
}
```

**Incorrect (한 대상의 진입 조건을 `,`로 나열합니다):**

```css
.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox,
	&.Mui-focusVisible .pg_salesPanel__spreadBox {
		border-color: #9fadc7;
	}
}
```

**Correct (진입 조건마다 블록을 따로 열고 선언을 그대로 씁니다):**

```css
.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox {
		border-color: #9fadc7;
	}

	&.Mui-focusVisible .pg_salesPanel__spreadBox {
		border-color: #9fadc7;
	}
}
```
