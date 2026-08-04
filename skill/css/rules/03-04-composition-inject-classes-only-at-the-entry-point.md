---
title: Inject Classes Only at the Component Entry Point
titleKo: 클래스 주입은 컴포넌트 진입점까지만 닿습니다
impact: HIGH
impactDescription: 내부 노드마다 창구를 열면 사용처가 그 컴포넌트 구조에 묶입니다
appliesWhen:
  - 우리가 만든 컴포넌트에 `className`이나 클래스 관련 프롭을 추가할 때
  - 그 컴포넌트 내부 노드의 모양을 화면마다 다르게 해야 할 때
  - 제외: 기존 CSS 최상위 블록 아래 외부 라이브러리 선택자만 고치는 경우
reviewWith: >-
  ownership-use-foreign-classes-only-under-your-own-root, ownership-change-other-owners-through-their-api
tags: components, entry-point, class-props
---

## Inject Classes Only at the Component Entry Point

**Impact: HIGH (내부 노드마다 창구를 열면 사용처가 그 컴포넌트 구조에 묶입니다)**

우리가 만든 컴포넌트가 여는 스타일 창구는 **진입점 하나**입니다.
`ui_`든 `wg_`든 `pg_`든 같습니다. 외부에서 주입하는 클래스는 그 컴포넌트의 최상위까지만 닿습니다.

컴포넌트는 받은 `className`을 자기 최상위 클래스와 `clsx()`로 합칩니다.
사용처는 그 클래스로 배치, 여백, 크기만 줍니다.

`headerClassName`, `itemClassName`처럼 내부 노드로 가는 클래스 프롭을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 컴포넌트가 `variant` 프롭을 받아 처리합니다.
변형은 최상위뿐 아니라 머리말이나 본문처럼 필요한 노드에 각각 수정자로 붙입니다.
최상위에 수정자 하나만 붙이고 내부를 결합자로 잡지 않습니다.

받은 `className`을 내부 노드로 넘기지 않습니다.

사용처 쪽에서 무엇을 고를지는 `ownership-change-other-owners-through-their-api`가 정하고,
`className`을 받지 않는 컴포넌트를 어떻게 다룰지는 `composition-do-not-add-wrapper-elements-for-styling`이 정합니다.

**Incorrect (내부 노드마다 클래스 프롭을 열어 창구를 늘림):**

```tsx
export interface UiCollapseProps {
	className?: string;
	headerClassName?: string;
	titleClassName?: string;
	contentClassName?: string;
}
```

**Incorrect (받은 `className`을 내부 노드로 넘김):**

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

**Incorrect (변형을 최상위에만 붙이고 내부를 결합자로 잡음):**

```css
.ui_collapse__root--compact .ui_collapse__header {
	padding: 6px 8px;
}

.ui_collapse__root--compact .ui_collapse__title {
	font-size: 13px;
}
```

**Correct (`className`은 최상위 클래스와 합치고, 변형은 필요한 노드마다 수정자로 붙임):**

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

**Correct (사용처는 최상위 스타일만 주고 내부 의도는 프롭으로 넘김):**

```tsx
<UiCollapse className={clsx("pg_postFilterDialog__collapse")} variant="compact" title="필터" />
```

```css
.pg_postFilterDialog__collapse {
	margin-top: 16px;
	width: 100%;
}
```
