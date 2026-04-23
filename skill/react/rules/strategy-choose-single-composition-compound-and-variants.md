---
title: Choose Single Components, Compound Components, and Variants Deliberately
impact: HIGH
impactDescription: helps shared components choose the simplest structure that still exposes the right extension points
tags: composition, compound-components, variants, component-design
---

## Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (helps shared components choose the simplest structure that still exposes the right extension points)**

shared component를 설계할 때는 처음부터 모든 것을 하나의 거대한 component에 몰아넣지 않습니다.  
먼저 고정 구조인지, part 조립이 필요한지, shared state가 필요한지, 같은 조합이 반복되는지를 보고 가장 단순한 구조를 고릅니다.

문서에서는 `composition`을 상위 원칙으로만 사용합니다.  
실전 선택 단위는 `single component`, `compound component`, `explicit variant component`입니다.  
`X.Root`, `X.Header`, `X.Footer`처럼 part를 조립하는 구조는 넓게 `compound component`로 보고, shared state, action, context가 없으면 `stateless compound component`, 있으면 `stateful compound component`로 구분합니다.

**빠른 선택표**

| 상황 | 기본 선택 |
| --- | --- |
| 한 화면 안에서만 쓰는 고정 UI | `single component` 또는 route-local JSX |
| part를 조립해야 하지만 shared state, action, context는 없음 | `stateless compound component` |
| part를 조립하고 여러 part가 같은 state, action, context를 읽음 | `stateful compound component` |
| 같은 raw compound 조합이 여러 곳에서 반복됨 | `explicit variant component` |
| parent가 runtime 데이터를 child 콜백에 밀어줘야 함 | `render prop` |

문서에서는 `WorkspaceSection.Root/Header/Footer` 같은 구조도 stateless compound component로 다룹니다.  
dot notation은 흔한 이름 조직 방식이지만 필수는 아니고, 중요한 점은 part를 조립하는 public surface를 같은 가족으로 유지하는 것입니다.  
나중에 state가 필요해지면 같은 public 이름을 유지한 채 context만 추가해 stateful compound component로 확장합니다.

public part도 무조건 많이 노출하지 않습니다.  
`Header`, `Footer`, `Content`, `Trigger`처럼 소비자가 이름으로 조립해야 하는 의미 있는 영역이거나, shared context를 직접 읽는 part만 공개 part로 올립니다.  
단순 class wrapper나 내부 레이아웃 보정용 DOM은 내부 구현으로 숨깁니다.

**Incorrect (single component, compound component, explicit variant의 경계를 구분하지 않고 하나의 component에 몰아넣음):**

```tsx
export interface WgProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
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
export interface WorkspaceEmptyStateProps {
	title: string;
	description: string;
}

export const WorkspaceEmptyState = (props: WorkspaceEmptyStateProps) => {
	const { title, description } = props;

	return (
		<section className="workspace-empty-state">
			<EmptyFolderIllustration />
			<h2>{title}</h2>
			<p>{description}</p>
		</section>
	);
};
```

**Correct (구조를 열어야 하면 stateless compound component로 시작):**

```tsx
export interface WorkspaceSectionProps {
	children: ReactNode;
}

const WorkspaceSectionRoot = (props: WorkspaceSectionProps) => {
	const { children } = props;
	return <section className="workspace-section">{children}</section>;
};

const WorkspaceSectionHeader = (props: WorkspaceSectionProps) => {
	const { children } = props;
	return <header className="workspace-section-header">{children}</header>;
};

const WorkspaceSectionFooter = (props: WorkspaceSectionProps) => {
	const { children } = props;
	return <footer className="workspace-section-footer">{children}</footer>;
};

export const WorkspaceSection = {
	Root: WorkspaceSectionRoot,
	Header: WorkspaceSectionHeader,
	Footer: WorkspaceSectionFooter,
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
export const MemberProfileDialog = () => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>View profile</Dialog.Trigger>
			<Dialog.Content>...</Dialog.Content>
		</Dialog.Root>
	);
};
```

이 규칙은 `strategy-avoid-boolean-prop-proliferation`, `strategy-prefer-children-over-render-props`, `screen-avoid-premature-abstraction`과 함께 봅니다.
