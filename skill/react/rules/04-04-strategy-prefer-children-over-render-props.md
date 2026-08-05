---
title: Prefer Children Over Render Props for Static Composition
titleKo: 정적 조립에서는 렌더 프롭 대신 `children`을 씁니다
impact: MEDIUM
impactDescription: 부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다
appliesWhen:
  - 공용 컴포넌트에 머리말·꼬리말·동작 같은 정적 슬롯을 추가·변경할 때
  - 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때
tags: strategy, composition, components
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 프롭보다 `children`과 네임스페이스 슬롯 부품을 우선합니다.
렌더 프롭은 부모가 자식에게 항목, 순번, 상태 같은 실행 환경 데이터를 전달해야 할 때만 씁니다.

**Incorrect (정적인 구조를 렌더 프롭으로 조립):**

```tsx
export interface UiPanelProps {
	renderHeader?: () => ReactNode;
	renderFooter?: () => ReactNode;
}

export const UiPanel = (props: UiPanelProps) => {
	return (
		<section className={clsx("ui_panel__root")}>
			{props.renderHeader?.()}
			<UiItemList />
			{props.renderFooter?.()}
		</section>
	);
};
```

**Correct (`children`과 네임스페이스 슬롯 부품으로 구조를 드러냄):**

```tsx
/**
 * 패널 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface UiPanelProps {
	/**
	 * 그 부품 자리에 소비자가 넣을 내용
	 */
	children: ReactNode;
}

const UiPanelRoot = (props: UiPanelProps) => {
	return <section className={clsx("ui_panel__root")}>{props.children}</section>;
};

const UiPanelHeader = (props: UiPanelProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};

const UiPanelFooter = (props: UiPanelProps) => {
	return <footer className={clsx("ui_panel__footer")}>{props.children}</footer>;
};

export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Footer: UiPanelFooter,
} as const;

export const PgProductScreen = () => {
	return (
		<Fragment>
			<UiPanel.Root>
				<UiPanel.Header>
					<h2>제품</h2>
					<PgProductSearchField />
				</UiPanel.Header>
				<PgProductList />
				<UiPanel.Footer>
					<UiPagination />
				</UiPanel.Footer>
			</UiPanel.Root>

			<UiPanel.Root>
				<UiPanel.Header>
					<h2>제품 등록</h2>
				</UiPanel.Header>
				<PgProductCreateForm />
			</UiPanel.Root>
		</Fragment>
	);
};
```
