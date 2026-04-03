---
title: Prefer Children Over Render Props for Static Composition
impact: MEDIUM
impactDescription: keeps shared component composition readable when the parent does not need to push runtime data through callbacks
tags: composition, children, render-props, api
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (keeps shared component composition readable when the parent does not need to push runtime data through callbacks)**

shared component가 구조를 조립하기만 하면 될 때는 `renderHeader`, `renderFooter` 같은 render prop보다 `children`이나 named slot composition을 우선합니다.   
render prop은 parent가 child에 item, index, state 같은 runtime 데이터를 전달해야 할 때만 사용합니다.

**Incorrect (정적인 구조를 render prop으로 조립):**

```tsx
export interface WidgetEntryPanelProps {
	renderHeader?: () => ReactNode;
	renderFooter?: () => ReactNode;
}

export const WidgetEntryPanel = (props: WidgetEntryPanelProps) => {
	const { renderHeader, renderFooter } = props;

	return (
		<section>
			{renderHeader?.()}
			<EntryBody />
			{renderFooter?.()}
		</section>
	);
};
```

**Correct (children과 named slot component로 구조를 드러냄):**

```tsx
export const WidgetEntryPanel = (props: PropsWithChildren) => {
	const { children } = props;
	return <section>{children}</section>;
};

export const WidgetEntryPanelFooter = (props: PropsWithChildren) => {
	const { children } = props;
	return <footer>{children}</footer>;
};

return (
	<WidgetEntryPanel>
		<EntryHeader />
		<EntryBody />
		<WidgetEntryPanelFooter>
			<EntrySaveButton />
		</WidgetEntryPanelFooter>
	</WidgetEntryPanel>
);
```
