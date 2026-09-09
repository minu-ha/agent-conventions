---
title: Do Not Negate With `:not()`
titleKo: 선택자에 `:not()`을 쓰지 않습니다
impact: MEDIUM
impactDescription: 기본 모습을 기본 블록에 두어 부정 조건을 따로 해석하지 않게 합니다
appliesWhen:
  - 선택자에 `:not()`을 넣으려 할 때
  - 기존 `:not()` 조건을 없애거나 긍정 조건으로 바꿀 때
reviewWith: selector-use-pseudo-classes-for-dom-owned-states
tags: selector, state, negation
---

## Do Not Negate With `:not()`

**Impact: MEDIUM (기본 모습을 기본 블록에 두어 부정 조건을 따로 해석하지 않게 합니다)**

`:not()`을 쓰지 않고 기본 모습은 기본 블록에, 상태가 켜진 모습은 상태 블록에 둡니다.
부정 조건을 없앨 때도 **상태별 결과를 보존합니다.**

| 기존 형태 | 변경 방법 |
| --- | --- |
| `&:not(:disabled)` | 해당 선언을 기본 블록으로 옮기고 `&:disabled`에서 필요한 속성을 덮습니다 |
| `:not(:disabled):hover` | 부정 조건만 지우지 않습니다. 기본 상태와 비활성 상태의 조합을 확인하고 해당 속성을 명시적으로 되돌립니다 |
| 네이티브 폼 컨트롤의 활성 상태만 선택함 | `:enabled:hover` 같은 긍정 조건을 쓸 수 있습니다 |
| 조상 수정자가 자손의 모습을 바꿈 | 자손 수정자로 옮깁니다. 선택 여부 각각에서 hover와 포커스 결과도 확인합니다 |

앱 상태는 각 요소의 수정자로 표현하고 조상에서 다시 읽지 않습니다.
각 수정자가 해당 요소의 모습을 모두 정의합니다.
DOM 상태와 앱 상태의 구분은 `selector-use-pseudo-classes-for-dom-owned-states` 규칙을 따릅니다.

**Incorrect 1 (활성 버튼의 hover를 부정 조건으로 표현합니다):**

```css
.pg_products__cardButton {
	&:not(:disabled):hover {
		background: #f5f5f5;
	}
}
```

**Correct 1 (네이티브 버튼의 활성 상태를 긍정 조건으로 표현합니다):**

```css
.pg_products__cardButton {
	&:enabled:hover {
		background: #f5f5f5;
	}
}
```

**Incorrect 2 (DOM 상태를 `:not()`으로 뒤집어 기본 모습을 상태 블록에 넣습니다):**

```css
.pg_products__cardButton {
	&:not(:disabled) {
		cursor: pointer;
	}

	&:disabled {
		cursor: default;
	}
}
```

**Correct 2 (DOM 상태도 기본을 먼저 두고 그 상태만 덮습니다):**

```css
.pg_products__cardButton {
	cursor: pointer;

	&:disabled {
		cursor: default;
	}
}
```
