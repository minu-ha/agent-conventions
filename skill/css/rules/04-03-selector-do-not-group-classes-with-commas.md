---
title: Do Not Group Classes With Commas to Share Declarations
titleKo: 공통 선언을 쓰려고 클래스를 쉼표로 묶지 않습니다
impact: MEDIUM
impactDescription: 공통 선언도 각 클래스에 두어 전체 스타일을 한 곳에서 읽습니다
appliesWhen:
  - 여러 클래스가 같은 선언을 반복해 `,`로 묶으려 할 때
  - 한 대상에 진입 조건을 둘 이상 추가할 때
reviewWith: >-
  selector-declare-each-class-in-one-block, values-tokenize-repeated-visual-values
tags: selector, duplication, maintainability
---

## Do Not Group Classes With Commas to Share Declarations

**Impact: MEDIUM (공통 선언도 각 클래스에 두어 전체 스타일을 한 곳에서 읽습니다)**

### 공통 선언 처리

공통 선언을 공유하려고 여러 클래스를 `,`로 묶지 않습니다.
중복되더라도 각 클래스 블록에 선언을 모두 적어 한 클래스의 스타일을 한 곳에서 읽게 합니다.

| 형태 | 처리 |
| --- | --- |
| 여러 클래스가 같은 선언을 씀 | 각 블록에 반복합니다. 목록을 따로 관리하지 않습니다 |
| 한 대상에 진입 조건이 여럿임 | 조건마다 블록을 엽니다. `,`나 `:is()`로 묶지 않습니다 |
| 값을 지역 변수로 빼서 공유함 | `values-tokenize-repeated-visual-values` 규칙에 따라 금지합니다 |
| `@media`나 `@supports` 안에서 같은 클래스를 재선언함 | 이 규칙의 대상이 아닙니다 |

### 기계 검증 범위

| 검사 대상 | 담당 |
| --- | --- |
| 쉼표 목록의 선택자를 아래에서 단독으로 다시 선언함 | `no-duplicate-selectors`의 `disallowInList` 옵션 |
| 중복 없이 쉼표로 묶기만 함 | 리뷰. 기계 검사는 묶음 자체를 막지 않습니다 |

**Incorrect 1 (`,`로 공통 선언을 묶고 아래에서 일부만 다시 엽니다):**

```css
.pg_products__badge--draft,
.pg_products__badge--published,
.pg_products__badge--archived,
.pg_products__badge--deleted {
	width: 24px;
	height: 24px;
}

.pg_products__badge--deleted {
	background: rgb(140 152 160 / 12%);
}
```

**Correct 1 (각 클래스가 자기 선언을 전부 가집니다):**

```css
.pg_products__badge--draft {
	width: 24px;
	height: 24px;
}

.pg_products__badge--published {
	width: 24px;
	height: 24px;
}

.pg_products__badge--archived {
	width: 24px;
	height: 24px;
}

.pg_products__badge--deleted {
	width: 24px;
	height: 24px;
	background: rgb(140 152 160 / 12%);
}
```

**Incorrect 2 (한 대상의 진입 조건을 `,`로 나열합니다):**

```css
.pg_products__sortButton {
	&:hover .pg_products__sortBox,
	&.Mui-focusVisible .pg_products__sortBox {
		border-color: #9fadc7;
	}
}
```

**Correct 2 (진입 조건마다 블록을 따로 열고 선언을 그대로 씁니다):**

```css
.pg_products__sortButton {
	&:hover .pg_products__sortBox {
		border-color: #9fadc7;
	}

	&.Mui-focusVisible .pg_products__sortBox {
		border-color: #9fadc7;
	}
}
```
