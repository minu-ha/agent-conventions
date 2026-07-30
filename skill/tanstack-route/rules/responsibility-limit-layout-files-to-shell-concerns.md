---
title: Limit `*.layout.tsx` Files to Shell Concerns
titleKo: *.layout.tsx는 셸 관심사까지만
impact: HIGH
impactDescription: 부모 route 셸이 말단 화면의 데이터·폼 로직을 흡수하는 것을 막음
tags: layout-files, shell, outlet
---

## Limit `*.layout.tsx` Files to Shell Concerns

**Impact: HIGH (부모 route 셸이 말단 화면의 데이터·폼 로직을 흡수하는 것을 막음)**

`*.layout.tsx`는 부모 경로 등록, 접근 제어, 공통 래퍼, 메뉴 상태 동기화, `<Outlet />`까지만 담당합니다.
이 프로젝트에서는 `*.layout.tsx`를 4-file set의 기본 tunnel route로 항상 두지만,
파일이 있다는 이유로 leaf 화면 전용 API 호출이나 상세 폼 로직을 흡수시키지는 않습니다.
하위 leaf 화면만 쓰는 로직은 layout에 넣지 않고 해당 `index`나 `-local`로 내립니다.

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

**Correct (layout route는 최소 tunnel이어도 `Route` export와 outlet 책임만 유지):**

```tsx
export const Route = createFileRoute("/app/(settings)/settings")({
	component: SettingsLayout,
});

function SettingsLayout() {
	return <Outlet />;
}
```
