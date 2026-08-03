---
title: Style `Ui*` Components Through Their Root Class Contract
titleKo: Ui* 컴포넌트의 root class 계약 기반 스타일링
impact: HIGH
impactDescription: 공용 UI wrapper의 내부 DOM이 사용처에서 임의로 스타일링되는 것을 막습니다
appliesWhen:
  - `Ui*` wrapper에 `className`을 주거나 wrapper가 노출할 class 계약을 정할 때
  - `Ui*` 내부 DOM을 겨냥하는 스타일을 추가할 때
  - 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우
reviewWith: selector-target-third-party-dom-from-owned-roots
tags: ui-components, wrappers, third-party
---

## Style `Ui*` Components Through Their Root Class Contract

**Impact: HIGH (공용 UI wrapper의 내부 DOM이 사용처에서 임의로 스타일링되는 것을 막습니다)**

`Ui*` wrapper는 root `className`을 받는 것이 기본 계약입니다.
레이아웃 참여, spacing, 크기처럼 root에 걸리는 스타일은 `<UiCollapse className={clsx("pg_x__collapse")} />`처럼
그 계약으로 직접 줍니다.

래핑 `div`를 습관적으로 만들지 않습니다.
DOM 노드가 늘어 flex·grid child 수가 바뀌고, 역할 없는 wrapper class가 생겨
`naming-name-elements-and-modifiers-by-role`과 부딪힙니다.

wrapper는 받은 `className`을 root 노드에만 붙입니다.
내부 노드에 forward하면 소비자가 내부 구조를 알게 되고, 그 구조가 바뀔 때 사용처가 함께 깨집니다.
내부 노드를 스타일링 대상으로 열어야 하면 `headerClassName`처럼 이름 있는 slot prop을 명시적으로 노출합니다.

소비자는 slot prop이 없는 내부 노드를 owner root class 아래에서만 좁힙니다.
방법은 `selector-target-third-party-dom-from-owned-roots`가 정합니다.
wrapper가 root `className`을 아예 받지 않으면 wrapper에 계약을 추가하는 것이 먼저이고,
래핑 `div`는 그것이 불가능할 때의 마지막 수단입니다.

**Incorrect (래핑 div로 root 스타일을 우회):**

```tsx
<div className={clsx("pg_postFilterDialog__collapseWrapper")}>
	<UiCollapse />
</div>
```

**Incorrect (wrapper가 받은 className을 내부 노드로 forward):**

```tsx
export const UiCollapse = (props: UiCollapseProps) => {
	const { className, items } = props;
	return <AntCollapse items={items} rootClassName="" expandIconPosition="end" itemClassName={className} />;
};
```

**Correct (root 계약으로 root 스타일을 주고, 내부는 owner root 안에서만 좁힘):**

```tsx
<UiCollapse className={clsx("pg_postFilterDialog__collapse")} />
```

```css
.pg_postFilterDialog__collapse {
	margin-block-start: var(--app-space-3);

	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
	}
}
```

**Correct (내부 노드를 열려면 이름 있는 slot prop으로 노출):**

```tsx
export interface UiCollapseProps {
	className?: string;
	headerClassName?: string;
}
```
