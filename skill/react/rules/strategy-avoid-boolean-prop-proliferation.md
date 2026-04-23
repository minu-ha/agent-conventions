---
title: Avoid Boolean Prop Proliferation in Shared Components
impact: HIGH
impactDescription: exported shared components stay explicit instead of accumulating hidden variant combinations
tags: composition, props, variants, component-design
---

## Avoid Boolean Prop Proliferation in Shared Components

**Impact: HIGH (exported shared components stay explicit instead of accumulating hidden variant combinations)**

여러 파일과 레이어에서 재사용되는 shared component에 `isCompact`, `isEditing`, `showSearch` 같은 boolean prop을 계속 추가하지 않습니다.  
boolean이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어나기 때문입니다.  
이 규칙은 exported shared component에 적용합니다.  
route entry 안의 일회성 분기는 로컬에서 유지할 수 있지만, shared `ui`나 `widget`는 explicit variant component나 compound component로 드러냅니다. `.Root` 같은 namespaced part 문법은 권장 예시일 뿐이고, 이 규칙의 본질은 boolean을 없애고 구조를 명시적으로 드러내는 데 있습니다.

**Incorrect (boolean prop 조합으로 shared component가 비대해짐):**

```tsx
export interface WgEntryToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
	const { isCompact, isEditing, showSearch } = props;

	return (
		<header>
			{showSearch ? <EntrySearchField /> : null}
			{isEditing ? <EntryEditActions compact={isCompact} /> : <EntryBrowseActions compact={isCompact} />}
		</header>
	);
};
```

**Correct (variant를 explicit component와 stateless compound component로 분리):**

```tsx
const WgEntryToolbarRoot = (props: { children: ReactNode }) => {
	const { children } = props;
	return <header>{children}</header>;
};

export const WgEntryToolbar = {
	Root: WgEntryToolbarRoot,
	Search: EntrySearchField,
	BrowseActions: EntryBrowseActions,
	EditActions: EntryEditActions,
} as const;

export const WgEntryBrowseToolbar = () => {
	return (
		<WgEntryToolbar.Root>
			<WgEntryToolbar.Search />
			<WgEntryToolbar.BrowseActions />
		</WgEntryToolbar.Root>
	);
};

export const WgEntryEditToolbar = () => {
	return (
		<WgEntryToolbar.Root>
			<WgEntryToolbar.EditActions />
		</WgEntryToolbar.Root>
	);
};
```

핵심은 `WgEntryToolbar` 하나에 boolean 모드를 계속 추가하지 않는 것입니다.  
explicit variant는 standalone component여도 되고, 이렇게 compound component 위에서 조립해도 됩니다.
