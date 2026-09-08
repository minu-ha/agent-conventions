---
title: Inject Classes Only at the Component Entry Point
titleKo: 외부 클래스는 컴포넌트 진입점에서만 받습니다
impact: HIGH
impactDescription: 클래스 주입을 한 곳으로 제한해 사용처가 내부 구조에 의존하지 않게 합니다
appliesWhen:
  - 우리가 만든 컴포넌트에 `className`이나 클래스 관련 프롭을 추가할 때
  - 그 컴포넌트 내부 노드의 모양을 화면마다 다르게 해야 할 때
  - 제외: 기존 CSS 최상위 블록 아래 외부 라이브러리 선택자만 고치는 경우
reviewWith: >-
  ownership-use-foreign-classes-only-under-your-own-root, ownership-change-other-owners-through-their-api,
  composition-do-not-add-wrapper-elements-for-styling
tags: components, entry-point, class-props
---

## Inject Classes Only at the Component Entry Point

**Impact: HIGH (클래스 주입을 한 곳으로 제한해 사용처가 내부 구조에 의존하지 않게 합니다)**

우리가 만든 컴포넌트는 레이어와 무관하게 **최상위 진입점 한 곳**에서만 외부 클래스를 받습니다.
내부 노드의 클래스 주입 지점을 늘리면 사용처가 컴포넌트 구조에 의존하게 됩니다.

| 사용처가 바꾸려는 것 | 방법 |
| --- | --- |
| 최상위의 배치, 여백, 크기 | 받은 `className`을 자기 최상위 클래스와 `clsx()`로 합칩니다 |
| 화면마다 달라지는 내부 모양 | `variant` 프롭을 받고 헤더나 본문 등 필요한 노드마다 수정자를 붙입니다 |

| 금지하는 형태 | 이유 또는 예외 |
| --- | --- |
| `headerClassName`, `itemClassName` 같은 내부 클래스 프롭 | 내부 구조가 바뀌면 사용처도 함께 깨집니다 |
| 받은 `className`을 내부 노드에 전달함 | 클래스 주입은 최상위까지만 허용합니다 |
| 최상위 수정자로 내부를 결합해 선택함 | 자손이 조상 구조에 의존합니다. 조상의 DOM 상태를 전달할 때만 `selector-nest-dom-state-in-the-owning-block`에 따라 결합자 하나를 씁니다 |

사용처의 선택은 `ownership-change-other-owners-through-their-api` 규칙이 정합니다.
`className`을 받지 않는 컴포넌트는 `composition-do-not-add-wrapper-elements-for-styling` 규칙을 따릅니다.

**Incorrect (내부 노드마다 클래스 프롭을 열어 주입 지점을 늘립니다):**

```tsx
export interface UiCollapseProps {
	className?: string;
	headerClassName?: string;
	titleClassName?: string;
	contentClassName?: string;
}
```

**Incorrect (받은 `className`을 내부 노드로 넘깁니다):**

```tsx
export const UiCollapse = (props: UiCollapseProps) => {
	return (
		<div className={clsx("ui_collapse__root")}>
			<button className={clsx("ui_collapse__header", props.className)} type="button">
				{props.title}
			</button>
			<div className={clsx("ui_collapse__content")}>{props.children}</div>
		</div>
	);
};
```

**Correct (`className`은 최상위 클래스와 합치고, 변형은 필요한 노드마다 수정자로 붙입니다):**

```tsx
export interface UiCollapseProps {
	className?: string;
	variant?: "default" | "compact";
	title: ReactNode;
	children: ReactNode;
}

export const UiCollapse = (props: UiCollapseProps) => {
	const isCompact = props.variant === "compact";

	return (
		<div className={clsx("ui_collapse__root", props.className)}>
			<button className={clsx("ui_collapse__header", isCompact && "ui_collapse__header--compact")} type="button">
				<span className={clsx("ui_collapse__title", isCompact && "ui_collapse__title--compact")}>{props.title}</span>
			</button>
			<div className={clsx("ui_collapse__content")}>{props.children}</div>
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

**Correct (사용처는 최상위 스타일만 주고 내부 의도는 프롭으로 넘깁니다):**

```tsx
<UiCollapse className={clsx("pg_orderFilterDialog__collapse")} variant="compact" title="필터">
	<PgOrderFilterFields />
</UiCollapse>
```

```css
.pg_orderFilterDialog__collapse {
	margin-block-start: 16px;
	width: 100%;
}
```
