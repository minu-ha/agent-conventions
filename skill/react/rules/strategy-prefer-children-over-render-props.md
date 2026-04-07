---
title: Prefer Children Over Render Props for Static Composition
impact: MEDIUM
impactDescription: keeps shared component composition readable when the parent does not need to push runtime data through callbacks
tags: composition, children, render-props, component-design
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (keeps shared component composition readable when the parent does not need to push runtime data through callbacks)**

shared component가 `stateless compound component`로 충분할 때는 `renderHeader`, `renderFooter` 같은 render prop보다 `children`과 namespaced slot part를 우선합니다.  
render prop은 parent가 child에 item, index, state 같은 runtime 데이터를 전달해야 할 때만 사용합니다.

**Incorrect (정적인 구조를 render prop으로 조립):**

```tsx
export interface WorkspaceSectionProps {
	renderHeader?: () => ReactNode;
	renderFooter?: () => ReactNode;
}

export const WorkspaceSection = (props: WorkspaceSectionProps) => {
	const { renderHeader, renderFooter } = props;

	return (
		<section className="workspace-section">
			{renderHeader?.()}
			<MemberList />
			{renderFooter?.()}
		</section>
	);
};
```

**Correct (children과 namespaced slot part로 구조를 드러냄):**

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

export const WorkspaceSettingsScreen = () => {
	return (
		<>
			<WorkspaceSection.Root>
				<WorkspaceSection.Header>
					<h2>Members</h2>
					<MemberSearchField />
				</WorkspaceSection.Header>
				<MemberList />
				<WorkspaceSection.Footer>
					<Pagination />
				</WorkspaceSection.Footer>
			</WorkspaceSection.Root>

			<WorkspaceSection.Root>
				<WorkspaceSection.Header>
					<h2>Invite members</h2>
				</WorkspaceSection.Header>
				<InviteMemberForm />
			</WorkspaceSection.Root>
		</>
	);
};
```

같은 shell을 재사용하지만 내부 구조는 화면마다 달라질 수 있다면 `stateless compound component`가 더 읽기 쉽습니다.  
이 경우에는 `showFooter`, `showSearch`, `isInviteMode` 같은 boolean prop도 필요 없고, parent가 runtime 데이터를 child 함수에 밀어줄 이유도 없으므로 render prop보다 단순한 구조 조립이 맞습니다. `WorkspaceSection.Root/Header/Footer`처럼 dot notation으로 묶고, 나중에 state가 필요해지면 같은 이름을 유지한 채 context를 추가합니다.
