---
title: Limit `*.layout.tsx` Files to Shell Concerns
impact: HIGH
impactDescription: prevents parent route shells from absorbing leaf-screen data and form logic
tags: layout-files, shell, outlet
---

## Limit `*.layout.tsx` Files to Shell Concerns

**Impact: HIGH (prevents parent route shells from absorbing leaf-screen data and form logic)**

`*.layout.tsx`는 부모 경로 등록, 접근 제어, 공통 래퍼, 메뉴 상태 동기화, `<Outlet />`까지만 담당합니다. 하위 leaf 화면만 쓰는 API 호출이나 상세 폼 로직은 layout에 넣지 않고 해당 `index`나 `-local`로 내립니다.

**Incorrect (layout 파일이 leaf 화면 전용 로직까지 가짐):**

```tsx
function SettingsLayout() {
	const query = useSettingsDetailQuery();
	const form = useSettingsForm(query.data);

	return (
		<SettingsShell form={form}>
			<Outlet />
		</SettingsShell>
	);
}
```

**Correct (layout은 셸과 outlet 책임만 유지):**

```tsx
function AppLayout() {
	return <Outlet />;
}
```
