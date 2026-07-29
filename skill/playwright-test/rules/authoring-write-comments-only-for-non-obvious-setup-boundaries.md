---
title: Write Comments Only for Non-obvious Setup Boundaries
impact: MEDIUM
impactDescription: >-
  keeps test comments focused on why a setup exists instead of narrating obvious Arrange/Act/Assert steps
tags: comments, setup, helpers
---

## Write Comments Only for Non-obvious Setup Boundaries

**Impact: MEDIUM (keeps test comments focused on why a setup exists instead of narrating obvious Arrange/Act/Assert steps)**

테스트 주석은 한글로 작성하고, helper, seed/cleanup,
bootstrap wait처럼 목적이 바로 드러나지 않는 setup에만 왜 필요한지 짧게 남깁니다.
코드 그대로를 반복 설명하거나 Arrange/Act/Assert를 줄마다 해설하는 과한 단계 주석은 기본값으로 쓰지 않습니다.

**Incorrect (코드 그대로를 반복 설명):**

```ts
// 저장 버튼을 클릭한다.
await page.getByRole("button", {name: "저장"}).click();
```

**Correct (비자명한 경계에만 이유를 설명):**

```ts
// bootstrap query가 끝나기 전에는 폼 필드가 비활성이라 안정적인 marker를 먼저 기다린다.
await expect(page.getByRole("heading", {name: "멤버 생성"})).toBeVisible();
```
