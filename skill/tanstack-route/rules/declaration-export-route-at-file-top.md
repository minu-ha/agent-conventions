---
title: Export `Route` at the Top of the File
impact: HIGH
impactDescription: keeps the router contract obvious before the screen implementation details begin
tags: createfileroute, exports, route-definition
---

## Export `Route` at the Top of the File

**Impact: HIGH (keeps the router contract obvious before the screen implementation details begin)**

각 라우트 파일은 `export const Route = createFileRoute("...")({...})` 형태를 기본으로 하고, export 이름은 항상 `Route`로 고정합니다. route definition은 파일 상단에 두고, 화면 컴포넌트나 owner-named support module import는 그 아래에 배치합니다.

**Incorrect (컴포넌트와 보조 코드 뒤에 route definition을 숨김):**

```tsx
function UsersIndex() {
	return <UsersScreen />;
}

const usersRoutePath = "/app/(users)/users/";

export const UsersRoute = createFileRoute(usersRoutePath)({
	component: UsersIndex,
});
```

**Correct (파일 상단에서 `Route` 계약을 먼저 선언):**

```tsx
export const Route = createFileRoute("/app/(users)/users/")({
	component: UsersIndex,
});

function UsersIndex() {
	return <UsersScreen />;
}
```
