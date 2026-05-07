---
title: Choose Single Components, Compound Components, and Variants Deliberately
impact: HIGH
impactDescription: helps shared components choose the simplest structure that still exposes the right extension points
tags: composition, compound-components, variants, component-design
---

## Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (helps shared components choose the simplest structure that still exposes the right extension points)**

shared component는 props보다 구조를 먼저 고릅니다.
고정 UI, public part 조립, shared state/action/context, 반복 preset 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 route-local JSX |
| part 조립만 필요함 | `stateless compound component` |
| 여러 part가 같은 state/action/context를 읽음 | `stateful compound component` |
| 같은 compound 조합이 반복됨 | `explicit variant component` |
| parent가 runtime 데이터를 child 콜백에 밀어줘야 함 | `render prop` |

public part는 소비자가 이름으로 조립해야 하거나 shared context/action을 직접 쓰는 영역만 공개합니다.
단순 class wrapper, spacing 보정 DOM, 내부 layout helper는 숨깁니다. stateless compound에 state가 필요해지면 public 이름은 유지하고 context만 추가합니다.

**Incorrect (single component, compound component, explicit variant의 경계를 구분하지 않고 하나의 component에 몰아넣음):**

```tsx
export interface ProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const ProfileDialog = (props: ProfileDialogProps) => {
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

boolean branch, optional slot, render prop, fixed variant를 한 component에 몰아두면 소비자가 실제 구조를 예측하기 어렵습니다.

**Correct (고정 구조면 single component로 유지):**

```tsx
export interface EmptyStateProps {
	title: string;
	description: string;
}

export const EmptyState = (props: EmptyStateProps) => {
	const { title, description } = props;

	return (
		<section className="empty-state">
			<EmptyFolderIllustration />
			<h2>{title}</h2>
			<p>{description}</p>
		</section>
	);
};
```

**Correct (구조를 열어야 하면 stateless compound component로 시작):**

```tsx
export interface SectionProps {
	children: ReactNode;
}

const SectionRoot = (props: SectionProps) => {
	const { children } = props;
	return <section className="section">{children}</section>;
};

const SectionHeader = (props: SectionProps) => {
	const { children } = props;
	return <header className="section__header">{children}</header>;
};

const SectionFooter = (props: SectionProps) => {
	const { children } = props;
	return <footer className="section__footer">{children}</footer>;
};

export const Section = {
	Root: SectionRoot,
	Header: SectionHeader,
	Footer: SectionFooter,
} as const;
```

이런 구조는 지금은 `stateless compound component`지만, 나중에 state가 필요해지면 같은 이름을 유지한 채 `stateful compound component`로 확장할 수 있습니다.

**Correct (여러 part가 state를 공유하면 stateful compound component로 확장):**

```tsx
const TabsContext = createContext<TabsContextValue | null>(null);

const TabsRoot = (props: TabsRootProps) => {
	const { defaultValue, children } = props;
	const [activeValue, setActiveValue] = useState(defaultValue);

	return (
		<TabsContext value={{ activeValue, setActiveValue }}>
			<section>{children}</section>
		</TabsContext>
	);
};

const TabsTrigger = (props: TabsTriggerProps) => {
	const { value, children } = props;
	const tabs = useTabsContext();
	return <button onClick={() => tabs.setActiveValue(value)}>{children}</button>;
};

const TabsPanel = (props: TabsPanelProps) => {
	const { value, children } = props;
	const tabs = useTabsContext();
	return tabs.activeValue === value ? <section>{children}</section> : null;
};
```

`Tabs.Trigger`와 `Tabs.Panel`처럼 여러 part가 같은 state를 읽고 행동을 공유하면, 그 시점부터는 `stateful compound component`입니다.

**Correct (같은 family 조합이 반복되면 explicit variant로 감쌈):**

```tsx
export const ReadOnlyProfileDialog = () => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>View profile</Dialog.Trigger>
			<Dialog.Content>...</Dialog.Content>
		</Dialog.Root>
	);
};
```

이 규칙은 `strategy-avoid-boolean-prop-proliferation`, `strategy-prefer-children-over-render-props`, `screen-avoid-premature-abstraction`과 함께 봅니다.
