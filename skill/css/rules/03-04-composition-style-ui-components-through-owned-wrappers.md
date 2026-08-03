---
title: Expose Only a Root Class on `Ui*` Components
titleKo: Ui* 컴포넌트의 root class 단일 공개
impact: HIGH
impactDescription: wrapper가 내부 DOM 스타일링 창구를 여러 개 열어 사용처가 내부 구조에 묶이는 것을 막습니다
appliesWhen:
  - `Ui*` wrapper에 `className`을 주거나 wrapper가 노출할 class 계약을 정할 때
  - `Ui*` 내부 노드의 모양을 화면마다 다르게 해야 할 때
  - 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우
reviewWith: ownership-use-foreign-classes-only-under-your-own-root, ownership-change-other-owners-through-their-api
tags: ui-components, wrappers, third-party
---

## Expose Only a Root Class on `Ui*` Components

**Impact: HIGH (wrapper가 내부 DOM 스타일링 창구를 여러 개 열어 사용처가 내부 구조에 묶이는 것을 막습니다)**

`Ui*` wrapper가 여는 스타일 창구는 `className` 하나입니다.
wrapper는 받은 값을 자기 root class와 `clsx()`로 합치고, 사용처는 그 클래스로 배치·여백·크기만 줍니다.

`headerClassName`, `itemClassName` 같은 slot class prop을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 wrapper가 `variant` prop을 받아 처리합니다.
variant는 root뿐 아니라 header·content처럼 필요한 노드에 각각 modifier로 붙입니다.
root modifier 하나만 붙이고 내부를 결합자로 잡지 않습니다.

- 받은 `className`을 내부 노드로 넘기지 않습니다.
- 래핑 `div`를 습관적으로 만들지 않습니다. 부모의 flex·grid 자식 수가 바뀌고 역할 없는 클래스가 생깁니다.
- `className`을 아예 받지 않는 wrapper면 그 계약을 추가하는 것이 먼저이고, 래핑은 마지막 수단입니다.

**Incorrect (내부 노드마다 slot class prop을 열어 창구를 늘림):**

```tsx
export interface UiCollapseProps {
	className?: string;
	headerClassName?: string;
	titleClassName?: string;
	contentClassName?: string;
}
```

**Incorrect (받은 className을 내부 노드로 넘김):**

```tsx
export const UiCollapse = (props: UiCollapseProps) => {
	const { className, title, children } = props;

	return (
		<div className={clsx("ui_collapse__root")}>
			<button className={clsx("ui_collapse__header", className)} type="button">
				{title}
			</button>
			<div className={clsx("ui_collapse__content")}>{children}</div>
		</div>
	);
};
```

**Incorrect (variant를 root에만 붙이고 내부를 결합자로 잡음):**

```css
.ui_collapse__root--compact .ui_collapse__header {
	padding: 6px 8px;
}

.ui_collapse__root--compact .ui_collapse__title {
	font-size: 13px;
}
```

**Incorrect (래핑 div로 root 스타일을 우회):**

```tsx
<div className={clsx("pg_postFilterDialog__collapseWrapper")}>
	<UiCollapse />
</div>
```

**Correct (className은 root class와 합치고, variant는 필요한 노드마다 modifier로 붙임):**

```tsx
export interface UiCollapseProps {
	className?: string;
	variant?: "default" | "compact";
	title: ReactNode;
	children: ReactNode;
}

export const UiCollapse = (props: UiCollapseProps) => {
	const { className, variant = "default", title, children } = props;
	const isCompact = variant === "compact";

	return (
		<div className={clsx("ui_collapse__root", isCompact && "ui_collapse__root--compact", className)}>
			<button className={clsx("ui_collapse__header", isCompact && "ui_collapse__header--compact")} type="button">
				<span className={clsx("ui_collapse__title", isCompact && "ui_collapse__title--compact")}>{title}</span>
			</button>
			<div className={clsx("ui_collapse__content", isCompact && "ui_collapse__content--compact")}>{children}</div>
		</div>
	);
};
```

```css
.ui_collapse__header {
	padding: 12px 16px;
}

.ui_collapse__header--compact {
	padding: 6px 8px;
}

.ui_collapse__title--compact {
	font-size: 13px;
}
```

**Correct (사용처는 root 스타일만 주고 내부 의도는 prop으로 넘김):**

```tsx
<UiCollapse className={clsx("pg_postFilterDialog__collapse")} variant="compact" title="필터" />
```

```css
.pg_postFilterDialog__collapse {
	margin-top: 16px;
	width: 100%;
}
```
