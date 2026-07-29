---
title: Review Banned Playwright Shortcuts Before Finishing
impact: MEDIUM
impactDescription: catches the shortcuts that most often blur test level meaning or introduce flaky browser behavior before the work is closed
tags: review, guardrails, flakiness
---

## Review Banned Playwright Shortcuts Before Finishing

**Impact: MEDIUM (catches the shortcuts that most often blur test level meaning or introduce flaky browser behavior before the work is closed)**

마무리 전에 반복적으로 금지되는 Playwright 지름길을 다시 확인합니다.
한 파일 안의 Integration/E2E 혼합,
E2E에서 핵심 API route mocking,
CSS class와 DOM 구조에 과도하게 의존한 locator,
`waitForTimeout()`,
전역 숨은 mock,
공유 계정 destructive 사용 같은 패턴은 정리하고
끝냅니다.

**Incorrect (금지 패턴을 그대로 남김):**

```ts
test("real login", async ({page}) => {
	await page.route("**/api/login", async (route) => {
		await route.fulfill({body: JSON.stringify({token: "fake"})});
	});

	await page.waitForTimeout(1000);
	await page.locator(".btn:nth-child(2)").click();
});
```

**Correct (레벨 의미와 안정성을 유지):**

```ts
test("실제 로그인 성공 smoke", async ({page}) => {
	await support.auth.loginWithRealAccount(page);
	await expect(page).toHaveURL(/dashboard/);
	await page.getByRole("button", {name: "설정"}).click();
});
```
