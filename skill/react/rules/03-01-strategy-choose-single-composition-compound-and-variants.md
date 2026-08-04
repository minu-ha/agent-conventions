---
title: Choose Single Components, Compound Components, and Variants Deliberately
titleKo: 단일, 합성, 변형 중 가장 단순한 조립을 고릅니다
impact: HIGH
impactDescription: 필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다
appliesWhen:
  - 내보낸 공용 컴포넌트에 슬롯·공개 부품·공용 컨텍스트/동작을 추가할 때
  - 반복되는 기본 설정이나 모드 API를 추가할 때
  - 공용 컴포넌트의 조립 구조를 재설계할 때
reviewWith: >-
  strategy-expose-only-assembled-compound-parts, strategy-avoid-boolean-prop-proliferation,
  strategy-prefer-children-over-render-props, screen-avoid-premature-abstraction
tags: strategy, composition, variants, component-design
---

## Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
고정 UI, 공개 부품 조립, 공용 상태/동작/컨텍스트, 반복 기본 설정 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 화면 지역 JSX |
| 부품 조립만 필요함 | `stateless compound component` |
| 여러 부품이 같은 상태/동작/컨텍스트를 읽음 | `stateful compound component` |
| 같은 합성 조합이 반복됨 | `explicit variant component` |

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.

무엇을 공개 부품으로 열지는 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (단일·합성·드러난 변형의 경계를 구분하지 않고 한 컴포넌트에 몰아넣음):**

```tsx
export interface UiProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const UiProfileDialog = (props: UiProfileDialogProps) => {
	const { isCompact, showActivity, showFocus, dialogTitle, renderFooter } = props;

	return (
		<section className={isCompact ? "dialog dialog--compact" : "dialog"}>
			<header>
				<h3>{dialogTitle ?? "Profile"}</h3>
			</header>
			<ProfileSummary />
			{showActivity ? <ActivityPanel /> : null}
			{showFocus ? <FocusPanel /> : null}
			<footer>{renderFooter?.()}</footer>
		</section>
	);
};
```

**Correct (고정 구조면 단일 컴포넌트로 유지):**

```tsx
export interface UiEmptyStateProps {
	title: string;
	description: string;
}

export const UiEmptyState = (props: UiEmptyStateProps) => {
	const { title, description } = props;

	return (
		<section className={clsx("ui_emptyState__root")}>
			<EmptyFolderIllustration />
			<h2>{title}</h2>
			<p>{description}</p>
		</section>
	);
};
```

**Correct (구조를 열어야 하면 상태 없는 합성 컴포넌트로 시작):**

```tsx
export interface UiSectionProps {
	children: ReactNode;
}

const UiSectionRoot = (props: UiSectionProps) => {
	const { children } = props;
	return <section className={clsx("ui_section__root")}>{children}</section>;
};

const UiSectionHeader = (props: UiSectionProps) => {
	const { children } = props;
	return <header className={clsx("ui_section__header")}>{children}</header>;
};

const UiSectionFooter = (props: UiSectionProps) => {
	const { children } = props;
	return <footer className={clsx("ui_section__footer")}>{children}</footer>;
};

export const UiSection = {
	Root: UiSectionRoot,
	Header: UiSectionHeader,
	Footer: UiSectionFooter,
} as const;
```

**Correct (여러 부품이 상태를 공유하면 상태를 가진 합성 컴포넌트로 확장):**

```tsx
const UiTabsContext = createContext<UiTabsContextValue | null>(null);

const UiTabsRoot = (props: UiTabsRootProps) => {
	const { defaultValue, children } = props;
	const [activeValue, setActiveValue] = useState(defaultValue);

	return (
		<UiTabsContext value={{ activeValue, setActiveValue }}>
			<section>{children}</section>
		</UiTabsContext>
	);
};

const UiTabsTrigger = (props: UiTabsTriggerProps) => {
	const { value, children } = props;
	const tabs = useTabsContext();

	/**
	 * 탭 버튼 클릭 시 활성 값 전환
	 */
	const handleTriggerClick: MouseEventHandler<HTMLButtonElement> = () => {
		tabs.setActiveValue(value);
	};

	return (
		<button className={clsx("ui_tabs__trigger")} onClick={handleTriggerClick}>
			{children}
		</button>
	);
};

const UiTabsPanel = (props: UiTabsPanelProps) => {
	const { value, children } = props;
	const tabs = useTabsContext();
	return tabs.activeValue === value ? <section>{children}</section> : null;
};
```

**Correct (같은 계열 조합이 반복되면 드러난 변형으로 감쌈):**

```tsx
export const UiReadOnlyProfileDialog = () => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>View profile</Dialog.Trigger>
			<Dialog.Content>...</Dialog.Content>
		</Dialog.Root>
	);
};
```
