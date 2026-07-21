---
title: Prefer Children Over Render Props for Static Composition
impact: MEDIUM
impactDescription: keeps shared component composition readable when the parent does not need to push runtime data through callbacks
appliesWhen: shared component에 header·footer·action 같은 정적 slot 또는 render prop을 추가·변경하며 runtime data 주입 필요가 불분명하다.
tags: composition, children, render-props, component-design
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (keeps shared component composition readable when the parent does not need to push runtime data through callbacks)**

shared component가 `stateless compound component`로 충분할 때는 `renderHeader`, `renderFooter` 같은 render prop보다 `children`과 namespaced slot part를 우선합니다.  
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

같은 shell을 재사용하지만 내부 구조는 화면마다 달라질 수 있다면 `stateless compound component`가 더 읽기 쉽습니다.  
이 경우에는 `showFooter`, `showSearch`, `isCreateMode` 같은 boolean prop도 필요 없고, parent가 runtime 데이터를 child 함수에 밀어줄 이유도 없으므로 render prop보다 단순한 구조 조립이 맞습니다. `Panel.Root/Header/Footer`처럼 dot notation으로 묶고, 나중에 state가 필요해지면 같은 이름을 유지한 채 context를 추가합니다.
