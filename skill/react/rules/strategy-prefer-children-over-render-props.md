---
title: Prefer Children Over Render Props for Static Composition
impact: MEDIUM
impactDescription: >-
  keeps shared component composition readable when the parent does not need to push runtime data through callbacks
appliesWhen: >-
  shared component에 header·footer·action 같은 정적 slot 또는 render prop을 추가·변경하며 runtime data 주입 필요가
  불분명하다.
tags: composition, children, render-props, component-design
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (keeps shared component composition readable when the parent does not need to push runtime data through
callbacks)**

shared component가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 render prop보다 `children`과 namespaced slot part를 우선합니다.
render prop은 parent가 child에 item, index, state 같은 runtime 데이터를 전달해야 할 때만 사용합니다.

**Incorrect (정적인 구조를 render prop으로 조립):**

```tsx
export interface PanelProps {
	renderHeader?: () => ReactNode;
	renderFooter?: () => ReactNode;
}

export const Panel = (props: PanelProps) => {
	const { renderHeader, renderFooter } = props;

	return (
		<section className="panel">
			{renderHeader?.()}
			<ItemList />
			{renderFooter?.()}
		</section>
	);
};
```

**Correct (children과 namespaced slot part로 구조를 드러냄):**

```tsx
export interface PanelProps {
	children: ReactNode;
}

const PanelRoot = (props: PanelProps) => {
	const { children } = props;
	return <section className="panel">{children}</section>;
};

const PanelHeader = (props: PanelProps) => {
	const { children } = props;
	return <header className="panel__header">{children}</header>;
};

const PanelFooter = (props: PanelProps) => {
	const { children } = props;
	return <footer className="panel__footer">{children}</footer>;
};

export const Panel = {
	Root: PanelRoot,
	Header: PanelHeader,
	Footer: PanelFooter,
} as const;

export const EntryScreen = () => {
	return (
		<>
			<Panel.Root>
				<Panel.Header>
					<h2>Entries</h2>
					<EntrySearchField />
				</Panel.Header>
				<EntryList />
				<Panel.Footer>
					<Pagination />
				</Panel.Footer>
			</Panel.Root>

			<Panel.Root>
				<Panel.Header>
					<h2>Create entry</h2>
				</Panel.Header>
				<EntryCreateForm />
			</Panel.Root>
		</>
	);
};
```
