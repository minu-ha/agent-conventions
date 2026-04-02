---
title: Use Real Backend, Auth, and Routing in E2E
impact: CRITICAL
impactDescription: preserves the meaning of e2e by keeping the core backend, auth, and routing path real
tags: e2e, backend, auth
---

## Use Real Backend, Auth, and Routing in E2E

**Impact: CRITICAL (preserves the meaning of e2e by keeping the core backend, auth, and routing path real)**

E2E는 실제 로그인 또는 검증된 인증 helper, 실제 백엔드, 실제 라우팅과 번들 결과를 사용합니다. 인증 자체가 검증 대상이 아니더라도 핵심 엔드포인트를 mock하지 않고, 실제 사용자가 끝까지 완료할 수 있는 흐름을 검증합니다.

**Incorrect (핵심 엔드포인트를 mock하고 E2E라고 부름):**

```ts
test("실제 로그인 smoke", async ({page}) => {
	await page.route("**/api/login", async (route) => {
		await route.fulfill({body: JSON.stringify({token: "fake"})});
	});
});
```

**Correct (실제 인증과 백엔드 흐름을 사용):**

```ts
test("실제 로그인 성공 smoke", async ({page}) => {
	await support.auth.loginWithRealAccount(page);
	await expect(page).toHaveURL(/dashboard/);
});
```
