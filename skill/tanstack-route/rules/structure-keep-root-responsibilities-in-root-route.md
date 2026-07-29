---
title: Keep Root Responsibilities in `__root.tsx`
impact: HIGH
impactDescription: prevents app-wide route concerns from mixing with feature-specific shells
tags: root-route, layout, ownership
---

## Keep Root Responsibilities in `__root.tsx`

**Impact: HIGH (prevents app-wide route concerns from mixing with feature-specific shells)**

전역 라우트 컨텍스트와 앱 전체 공통 책임은 `<route-root>/__root.tsx`에서만 관리합니다.
루트는 `head`, 전역 `Outlet`, 전역 로딩/모달 정리처럼 모든 화면이 공유하는 책임만 가져야 하고,
특정 feature 전용 셸이나 화면 로직을 끌어오지 않습니다.

**Incorrect (루트 파일에 feature 전용 셸 책임을 섞음):**

```tsx
// <route-root>/__root.tsx
export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<AuthSidebarLayout>
			<ProjectDashboardHeader />
			<Outlet />
		</AuthSidebarLayout>
	);
}
```

**Correct (루트는 전역 책임만 유지):**

```tsx
// <route-root>/__root.tsx
export const Route = createRootRoute({
	head: () => ({
		meta: [{title: "App"}],
	}),
	component: Root,
});

function Root() {
	return (
		<>
			<GlobalModalHost />
			<Outlet />
		</>
	);
}
```
