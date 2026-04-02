---
title: Run Auth and Permission Guards in `beforeLoad`
impact: CRITICAL
impactDescription: keeps access control in router boundaries instead of after-the-fact screen navigation
tags: auth, guards, beforeload
---

## Run Auth and Permission Guards in `beforeLoad`

**Impact: CRITICAL (keeps access control in router boundaries instead of after-the-fact screen navigation)**

인증과 권한 보장은 라우트 컴포넌트 본문이 아니라 `beforeLoad`에서 처리합니다. 공통 가드 로직은 route 전용 helper로 분리해 재사용하고, 화면 컴포넌트가 렌더링된 뒤 조건부 네비게이션을 하는 패턴은 피합니다.

**Incorrect (컴포넌트 렌더링 이후 조건부 네비게이션):**

```tsx
function ProtectedPage() {
	const token = useTokenStore();
	const navigate = useNavigate();

	if (!token) {
		void navigate({to: "/login"});
	}

	return <Outlet />;
}
```

**Correct (진입 전 가드로 접근을 차단):**

```tsx
export const Route = createFileRoute("/app")({
	beforeLoad: async ({context}) => {
		await ensureAuthenticated(context);
	},
	component: AppLayout,
});
```
