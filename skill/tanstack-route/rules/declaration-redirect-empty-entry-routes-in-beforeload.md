---
title: Redirect Empty Entry Routes in `beforeLoad`
titleKo: 빈 진입 route는 beforeLoad에서 리다이렉트
impact: HIGH
impactDescription: moves entry redirects to the router boundary before screens mount and side effects begin
tags: redirect, beforeload, navigation
---

## Redirect Empty Entry Routes in `beforeLoad`

**Impact: HIGH (moves entry redirects to the router boundary before screens mount and side effects begin)**

실화면이 없는 중간 route의 기본 진입은 `index` route의 `beforeLoad`에서 redirect로 처리합니다.
path param이나 search를 유지해야 하면 `beforeLoad`에서 명시적으로 다시 넘겨 화면 마운트 이후 강제 이동을 피합니다.

**Incorrect (컴포넌트 렌더링 후 `useEffect`로 강제 이동):**

```tsx
function SettingsIndex() {
	const navigate = useNavigate();

	useEffect(() => {
		void navigate({to: "/app/settings/general"});
	}, [navigate]);

	return null;
}
```

**Correct (route 진입 단계에서 redirect 처리):**

```tsx
export const Route = createFileRoute("/app/(settings)/settings/")({
	beforeLoad: ({search}) => {
		throw redirect({to: "/app/settings/general", search, replace: true});
	},
});
```
