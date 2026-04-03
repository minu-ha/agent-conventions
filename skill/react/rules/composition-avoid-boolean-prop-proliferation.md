---
title: Avoid Boolean Prop Proliferation in Shared Component APIs
impact: HIGH
impactDescription: exported component contracts stay explicit instead of accumulating hidden variant combinations
tags: composition, props, variants, api
---

## Avoid Boolean Prop Proliferation in Shared Component APIs

**Impact: HIGH (exported component contracts stay explicit instead of accumulating hidden variant combinations)**

여러 파일과 레이어에서 재사용되는 shared component API에 `isCompact`, `isEditing`, `showSearch` 같은 boolean prop을 계속 추가하지 않습니다.   
boolean이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어나기 때문입니다.   
이 규칙은 exported shared component API에 적용합니다.   
route entry 안의 일회성 분기는 로컬에서 유지할 수 있지만, shared `ui`나 `widget`는 explicit variant component나 children composition으로 드러냅니다.

**Incorrect (boolean prop 조합으로 shared API가 비대해짐):**

```tsx
export interface WidgetEntryToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WidgetEntryToolbar = (props: WidgetEntryToolbarProps) => {
	const { isCompact, isEditing, showSearch } = props;

	return (
		<header>
			{showSearch ? <EntrySearchField /> : null}
			{isEditing ? <EntryEditActions compact={isCompact} /> : <EntryBrowseActions compact={isCompact} />}
		</header>
	);
};
```

**Correct (variant를 explicit component와 composition으로 분리):**

```tsx
export const WidgetEntryBrowseToolbar = () => {
	return (
		<WidgetEntryToolbarFrame>
			<EntrySearchField />
			<EntryBrowseActions />
		</WidgetEntryToolbarFrame>
	);
};

export const WidgetEntryEditToolbar = () => {
	return (
		<WidgetEntryToolbarFrame>
			<EntryEditActions />
		</WidgetEntryToolbarFrame>
	);
};
```
