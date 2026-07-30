---
title: Validate Search Before Using Route Search
titleKo: search는 쓰기 전에 검증
impact: CRITICAL
impactDescription: normalizes query strings once at the route boundary instead of reparsing them throughout the screen
impactDescriptionKo: 화면 곳곳에서 다시 파싱하지 않고 query string 을 route 경계에서 한 번 정규화함
tags: validateSearch, zod, search-params
---

## Validate Search Before Using Route Search

**Impact: CRITICAL (normalizes query strings once at the route boundary instead of reparsing them throughout the
screen)**

쿼리스트링을 읽는 화면은 `Route.useSearch()` 사용 전에 `validateSearch`를 선언합니다.
search schema는 `z.object(...)`로 작성하고, 숫자형 페이지네이션이나 선택값은 `z.coerce.number()`로 보정하며,
초기값이나 방어값이 필요하면 `.default()`와 `.catch()`를 함께 사용합니다.

**Incorrect (사용처마다 문자열 파싱을 반복):**

```tsx
const search = useSearch({from: "/app/users"});
const page = Number(search.page ?? 1);
const size = Number(search.size ?? 20);
```

**Correct (route에서 먼저 search를 정규화):**

```tsx
export const Route = createFileRoute("/app/(users)/users/")({
	validateSearch: z.object({
		page: z.coerce.number().int().min(1).default(1).catch(1),
		size: z.coerce.number().int().min(1).max(100).default(20).catch(20),
	}),
	component: UsersIndex,
});
```
