---
title: Prefer Children Over Render Props for Static Composition
titleKo: 정적 조립에서는 렌더 prop 대신 children 을 씁니다
impact: MEDIUM
impactDescription: 부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다
appliesWhen:
  - 공용 컴포넌트에 header·footer·동작 같은 정적 슬롯을 추가·변경할 때
  - 렌더 prop을 추가·변경하는데 실행 환경 data 주입이 꼭 필요한지 불분명할 때
tags: composition, children, render-props, component-design
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 prop보다 `children`과 namespaced 슬롯 부품을 우선합니다.
렌더 prop은 parent가 child에 item, index, 상태 같은 실행 환경 데이터를 전달해야 할 때만 사용합니다.

**Incorrect (정적인 구조를 렌더 prop으로 조립):**

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

**Correct (children과 namespaced 슬롯 부품으로 구조를 드러냄):**

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
