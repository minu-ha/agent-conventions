---
title: Mock Only the Endpoints Required by the Spec
impact: HIGH
impactDescription: keeps integration test setup readable by mocking only the dependencies that matter to the scenario
tags: integration, mocks, routes
---

## Mock Only the Endpoints Required by the Spec

**Impact: HIGH (keeps integration test setup readable by mocking only the dependencies that matter to the scenario)**

Integration에서 `page.route()`는 반드시 `page.goto()` 전에 등록하고, 해당 테스트 목적에 필요한 엔드포인트만 선언합니다.
인증이 필요하면 공용 authenticated session helper를 우선 사용하고, 어디서 무엇이 응답되는지 spec에서 바로 읽을 수 있어야 합니다.

**Incorrect (무관한 엔드포인트까지 넓게 mock):**

```ts
test("멤버 검색", async ({page}) => {
	await page.route("**/*", async (route) => {
		await route.fulfill({body: "{}"});
	});
});
```

**Correct (필요한 경계만 명시적으로 mock):**

```ts
test("멤버 검색 결과를 표시한다", async ({page}) => {
	await support.route.setupAuthenticatedSession(page);
	await page.route("**/api/members?keyword=kim", async (route) => {
		await route.fulfill({body: JSON.stringify({list: [{name: "Kim"}]})});
	});
});
```
