# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (실행 문맥이 필요 없는 조립을 JSX 구조로 바로 읽을 수 있습니다)**

상태 없는 합성으로 충분한 공용 컴포넌트는 렌더 프롭보다 `children`을 우선합니다.

| 상황 | 선택 |
| --- | --- |
| 부모가 자식 자리만 열어 줌 | `children`과 네임스페이스 슬롯 부품 |
| 부모가 항목 · 순번 · 상태 같은 실행 문맥을 자식에게 전달해야 함 | 이때만 `renderHeader`, `renderFooter` 같은 렌더 프롭을 씁니다 |

| 별도 이름이 필요한 계약 | 이름 |
| --- | --- |
| `ReactNode` 값 | `<Owner>Slot` |
| 실행 문맥을 받아 `ReactNode`를 만드는 함수 | `<Owner>Renderer` |

한 번만 쓰는 익명 형태에 접미사를 붙이려고 새 타입을 만들지는 않습니다.

**Incorrect 1 (정적인 구조를 렌더 프롭으로 조립합니다):**

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

**Correct 1 (`children`과 네임스페이스 슬롯 부품으로 구조를 드러냅니다):**

```tsx
/**
 * 패널 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface UiPanelPartProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}

/**
 * 패널 틀
 */
const UiPanelRoot = (props: UiPanelPartProps) => {
	return <section className={clsx("ui_panel__root")}>{props.children}</section>;
};

/**
 * 패널 위쪽 제목 자리
 */
const UiPanelHeader = (props: UiPanelPartProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};

/**
 * 패널 아래쪽 동작 자리
 */
const UiPanelFooter = (props: UiPanelPartProps) => {
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

> 나머지 예시 · 예외는 [full rule](../rules/04-04-strategy-prefer-children-over-render-props.md)에 있습니다.
