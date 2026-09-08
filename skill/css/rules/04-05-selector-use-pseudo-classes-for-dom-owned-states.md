---
title: Use Pseudo-classes for DOM-owned States
titleKo: DOM이 표현하는 상태는 가상 클래스로 씁니다
impact: HIGH
impactDescription: DOM 상태와 앱 상태를 구분해 같은 상태를 중복 표현하지 않습니다
appliesWhen:
  - `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가 · 수정할 때
  - 조상의 DOM 상태가 자손 스타일에 영향을 줄 때
requiresSelected: selector-nest-dom-state-in-the-owning-block
tags: pseudo-classes, state, interaction
---

## Use Pseudo-classes for DOM-owned States

**Impact: HIGH (DOM 상태와 앱 상태를 구분해 같은 상태를 중복 표현하지 않습니다)**

네이티브 DOM 기능이 표현하는 상태는 가상 클래스로, 앱이 정하는 상태는 수정자 클래스로 씁니다.
앱이 `disabled`나 `checked`를 제어해도 같은 상태의 수정자를 추가하지 않습니다.

| 상태 | 스타일 표현 | 주의점 |
| --- | --- | --- |
| `hover`, `visited`, `focus-visible`, 네이티브 `disabled`와 `checked` | 해당 가상 클래스 | `--disabled`, `--checked`로 복제하지 않습니다 |
| 앱의 `selected`, `active`, `error`, `expanded`, `current` | `--수정자` 클래스 | `aria-*`, `data-*` 속성 선택자로 지정하지 않습니다 |
| 네이티브 `disabled`를 지원하지 않는 요소의 비활성 상태 | 접근성 속성과 앱 수정자 | `aria-disabled="true"`만으로 `:disabled`가 적용되지 않습니다. 실제 동작은 마크업과 이벤트 처리에서 막습니다 |
| 사용자가 요소를 누르는 동안의 상태 | `:active` | 앱의 `--active`와 뜻이 다르므로 서로 바꾸지 않습니다 |

`aria-*`는 접근성 계약이므로 마크업에 유지합니다.
같은 스타일 상태를 속성 선택자와 수정자로 중복 선언하지 않습니다.
접근성 속성과 수정자가 함께 필요하면 같은 값에서 계산합니다.
가상 클래스의 위치는 `selector-nest-dom-state-in-the-owning-block`,
`:not()` 금지는 `selector-do-not-negate-with-not` 규칙을 따릅니다.

**Incorrect (앱이 정하는 상태를 `data-*` 속성 선택자로 잡습니다):**

```css
.pg_assetIndex__row {
	&[data-pg-expanded="true"] {
		background: #f5f5f5;
	}
}
```

**Correct (앱이 정하는 상태는 수정자 클래스로 씁니다):**

```css
.pg_assetIndex__row--expanded {
	background: #f5f5f5;
}
```

**Incorrect (같은 상태를 속성과 수정자 두 표기로 씁니다):**

```css
.pg_assetIndex__card--selected {
	border-color: #1677ff;
}

.pg_assetIndex__card[aria-pressed="true"] {
	box-shadow: 0 0 0 1px #1677ff;
}
```

**Correct (두 표기를 수정자 하나로 모읍니다):**

```css
.pg_assetIndex__card--selected {
	border-color: #1677ff;
	box-shadow: 0 0 0 1px #1677ff;
}
```
**Incorrect (앱 상태를 속성 선택자로 잡고 DOM 상태를 수정자로 만듭니다):**

```tsx
<button
	type="button"
	aria-pressed={isSelected}
	className={clsx("pg_assetIndex__card", isDisabled && "pg_assetIndex__card--disabled")}
>
	{asset.name}
</button>
```

```css
.pg_assetIndex__card {
	border: 1px solid #d9d9d9;

	&[aria-pressed="true"] {
		border-color: #1677ff;
	}
}

.pg_assetIndex__card--disabled {
	opacity: 0.5;
}
```

**Correct (`aria-*`는 마크업에 두고 앱 상태는 수정자로, DOM 상태는 가상 클래스로 씁니다):**

```tsx
<button
	type="button"
	aria-pressed={isSelected}
	disabled={isDisabled}
	className={clsx("pg_assetIndex__card", isSelected && "pg_assetIndex__card--selected")}
>
	{asset.name}
</button>
```

```css
.pg_assetIndex__card {
	border: 1px solid #d9d9d9;

	&:disabled {
		opacity: 0.5;
	}
}

.pg_assetIndex__card--selected {
	border-color: #1677ff;
}
```
