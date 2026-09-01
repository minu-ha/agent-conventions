---
title: Do Not Add Wrapper Elements for Styling
titleKo: 스타일 때문에 요소를 새로 감싸지 않습니다
impact: HIGH
impactDescription: 래퍼 요소는 부모 레이아웃 계산을 바꾸고 역할 없는 클래스를 늘립니다
appliesWhen:
  - 스타일을 주려고 `div`나 `span`을 새로 감쌀 때
  - `className`을 받지 않는 컴포넌트에 여백이나 크기를 줘야 할 때
reviewWith: >-
  composition-inject-classes-only-at-the-entry-point, naming-name-elements-and-modifiers-by-role
tags: components, wrappers, layout
---

## Do Not Add Wrapper Elements for Styling

**Impact: HIGH (래퍼 요소는 부모 레이아웃 계산을 바꾸고 역할 없는 클래스를 늘립니다)**

스타일을 주려고 요소를 새로 감싸지 않습니다.

- 래퍼 `div` 하나가 부모의 `flex`나 `grid` 자식 수를 바꿉니다.
  `gap`, `:nth-child()`, `grid-auto-flow`가 함께 흔들립니다.
- 역할 없는 클래스가 하나 늘어납니다.
  `naming-name-elements-and-modifiers-by-role` 규칙이 역할 이름을 요구하지만 이 래퍼에는 붙일 역할이 없습니다.

| 컴포넌트 | 처리 |
| --- | --- |
| 우리가 만든 컴포넌트 | `className`을 받도록 먼저 고칩니다 |
| `className`을 받지 않는 외부 라이브러리 컴포넌트 | 감싸기가 마지막 수단으로 남는 유일한 경우입니다. 래퍼에 역할 이름을 붙이고 왜 감쌌는지 주석으로 남깁니다 |

**Incorrect (래퍼 `div`로 최상위 스타일을 우회합니다):**

```tsx
<div className={clsx("pg_postIndex__collapseWrap")}>
	<UiCollapse items={items} />
</div>
```

```css
.pg_postIndex__collapseWrap {
	margin-block-end: 16px;
}
```

**Correct (우리 컴포넌트면 `className` 계약을 추가합니다):**

```tsx
export interface UiCollapseProps {
	className?: string;
	items: UiCollapseItem[];
}

export const UiCollapse = (props: UiCollapseProps) => {
	return (
		<div className={clsx("ui_collapse__root", props.className)}>{/* … */}</div>
	);
};
```

```tsx
<UiCollapse className={clsx("pg_postIndex__collapse")} items={items} />
```

```css
.pg_postIndex__collapse {
	margin-block-end: 16px;
}
```

**Incorrect (역할 없는 이름의 래퍼를 늘립니다):**

```tsx
<div className={clsx("pg_postIndex__box")}>
	<div className={clsx("pg_postIndex__inner")}>
		<LegacyDatePicker value={value} onChange={handleChange} />
	</div>
</div>
```

**Correct (외부 라이브러리가 `className`을 받지 않으면 역할 이름을 붙여 감쌉니다):**

```tsx
{/**
 * LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다
 */}
<div className={clsx("pg_postIndex__dateField")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>
```
