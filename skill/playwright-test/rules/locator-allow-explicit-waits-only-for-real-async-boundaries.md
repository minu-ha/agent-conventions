---
title: Allow Explicit Waits Only for Real Async Boundaries
titleKo: 명시적 대기는 진짜 비동기 경계에만
impact: HIGH
impactDescription: >-
  keeps explicit waits intentional by limiting them to navigation, known responses, bootstrap, or real background
  polling
tags: waits, async-boundaries, polling
---

## Allow Explicit Waits Only for Real Async Boundaries

**Impact: HIGH (keeps explicit waits intentional by limiting them to navigation, known responses, bootstrap, or real
background polling)**

명시적 wait는 navigation 완료, 특정 API 응답, suspense bootstrap,
비동기 background job polling 같은 실제 비동기 경계에만 허용합니다.
`expect.poll()`은 UI assertion으로 표현할 수 없는 서버 상태 polling에만 제한적으로 쓰고,
`waitForTimeout()`이나 “느리니까 1초 더 기다리기” 식 sleep은 금지합니다.

**Incorrect (시간 기반 sleep 사용):**

```ts
await page.waitForTimeout(1000);
```

**Correct (실제 비동기 경계만 명시적으로 기다림):**

```ts
await page.waitForResponse(/api\/members/);
await expect(page).toHaveURL(/members/);
await expect.poll(async () => await support.jobs.readStatus(jobId)).toBe("done");
```
