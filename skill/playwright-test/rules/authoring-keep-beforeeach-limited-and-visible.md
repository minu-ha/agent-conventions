---
title: Keep `beforeEach` Limited and Visible
titleKo: beforeEach는 최소로, 보이게
impact: HIGH
impactDescription: 공용 setup 이 테스트의 실제 의존 경계나 핵심 단정을 숨기는 것을 막음
tags: beforeEach, setup, visibility
---

## Keep `beforeEach` Limited and Visible

**Impact: HIGH (공용 setup 이 테스트의 실제 의존 경계나 핵심 단정을 숨기는 것을 막음)**

`beforeEach`에는 반복되는 인증 stub, 공용 이동 경로, 공용 seed 설치처럼 진짜 반복되는 준비만 둡니다.
핵심 assertion이나 테스트마다 다른 mock/seed를 `beforeEach`에 숨기지 않고, 각 테스트 본문에서 선언합니다.

**Incorrect (`beforeEach`에 테스트 의미를 숨김):**

```ts
test.beforeEach(async ({page}) => {
	await page.route("/api/members", async (route) => {
		await route.fulfill({body: JSON.stringify({list: []})});
	});
	await expect(page.getByText("비어 있음")).toBeVisible();
});
```

**Correct (공통 준비만 `beforeEach`에 두고 목적별 설정은 test body에서 선언):**

```ts
test.beforeEach(async ({page}) => {
	await support.route.setupAuthenticatedSession(page);
});

test("검색 결과가 비어 있으면 empty 상태를 보여준다", async ({page}) => {
	await page.route("/api/members", async (route) => {
		await route.fulfill({body: JSON.stringify({list: []})});
	});
});
```
