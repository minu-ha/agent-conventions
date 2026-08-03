---
title: Expose Only a Root Class on `Ui*` Components
titleKo: Ui* 컴포넌트의 root class 단일 공개
impact: HIGH
impactDescription: wrapper가 내부 DOM 스타일링 창구를 여러 개 열어 사용처가 내부 구조에 묶이는 것을 막습니다
appliesWhen:
  - `Ui*` wrapper에 `className`을 주거나 wrapper가 노출할 class 계약을 정할 때
  - `Ui*` 내부 DOM을 겨냥하는 스타일을 추가할 때
  - 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우
reviewWith: selector-target-third-party-dom-from-owned-roots
tags: ui-components, wrappers, third-party
---

## Expose Only a Root Class on `Ui*` Components

**Impact: HIGH (wrapper가 내부 DOM 스타일링 창구를 여러 개 열어 사용처가 내부 구조에 묶이는 것을 막습니다)**

`Ui*` wrapper가 여는 스타일 창구는 root `className` 하나입니다.
사용처는 그 클래스로 배치, 여백, 크기처럼 root에 걸리는 스타일만 줍니다.

`headerClassName`, `itemClassName` 같은 slot class prop을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 **wrapper가 variant prop을 받아 내부에서 결정**합니다.
사용처는 `variant="compact"`처럼 의도만 넘기고 어떤 노드가 어떻게 바뀌는지는 모릅니다.

- wrapper는 받은 `className`을 root 노드에만 붙이고 내부 노드로 forward하지 않습니다.
- 래핑 `div`를 습관적으로 만들지 않습니다. 부모의 flex·grid 자식 수가 바뀌고 역할 없는 클래스가 생깁니다.
- root `className`을 받지 않는 wrapper면 그 계약을 추가하는 것이 먼저이고, 래핑은 마지막 수단입니다.

내부 노드를 직접 손대야 하는 경우는 `selector-target-third-party-dom-from-owned-roots`가 다룹니다.

**Incorrect (내부 노드마다 slot class prop을 열어 창구를 늘림):**

```tsx
export interface UiCollapseProps {
	className?: string;
	headerClassName?: string;
	itemClassName?: string;
	contentClassName?: string;
}
```

**Incorrect (wrapper가 받은 className을 내부 노드로 forward):**

```tsx
export const UiCollapse = (props: UiCollapseProps) => {
	const { className, items } = props;
	return <AntCollapse items={items} itemClassName={className} />;
};
```

**Incorrect (래핑 div로 root 스타일을 우회):**

```tsx
<div className={clsx("pg_postFilterDialog__collapseWrapper")}>
	<UiCollapse />
</div>
```

**Correct (root className 하나만 열고 내부 모양은 variant로 받음):**

```tsx
export interface UiCollapseProps {
	className?: string;
	variant?: "default" | "compact";
}

export const UiCollapse = (props: UiCollapseProps) => {
	const { className, variant = "default" } = props;

	return (
		<AntCollapse
			className={clsx("ui_collapse__root", variant === "compact" && "ui_collapse__root--compact")}
			rootClassName={className}
		/>
	);
};
```

**Correct (사용처는 root 스타일만 주고 내부 의도는 prop으로 넘김):**

```tsx
<UiCollapse className={clsx("pg_postFilterDialog__collapse")} variant="compact" />
```

```css
.pg_postFilterDialog__collapse {
	margin-top: 16px;
	width: 100%;
}
```
