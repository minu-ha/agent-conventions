---
title: Wait for State, Not Time, in Integration Tests
titleKo: 시간이 아니라 상태를 기다리기
impact: CRITICAL
impactDescription: keeps integration tests deterministic by waiting for observable state instead of arbitrary sleeps
impactDescriptionKo: 임의의 sleep 대신 관찰 가능한 상태를 기다려 integration 테스트를 결정적으로 유지함
tags: waiting, integration, stability
---

## Wait for State, Not Time, in Integration Tests

**Impact: CRITICAL (keeps integration tests deterministic by waiting for observable state instead of arbitrary sleeps)**

Integration에서는 Suspense, bootstrap query,
lazy data 주입이 있는 화면일수록 관련 응답이나 안정적인 화면 marker가 생긴 뒤 assertion을 시작합니다.
`waitForTimeout()` 대신 URL, response, locator 상태 같은 관찰 가능한 상태를 기다립니다.

**Incorrect (시간 기반 안정화):**

```ts
await page.waitForTimeout(1000);
await expect(page.getByText("완료")).toBeVisible();
```

**Correct (상태를 기다린 뒤 검증):**

```ts
await expect(page).toHaveURL(/members/);
await page.waitForResponse(/api\/members/);
await expect(page.getByRole("heading", {name: "멤버"})).toBeVisible();
```
