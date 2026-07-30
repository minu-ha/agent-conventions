---
title: Use Web-first Assertions for UI Results
titleKo: UI 결과는 web-first 단정으로
impact: HIGH
impactDescription: >-
  aligns assertions with the browser's async rendering model instead of relying on immediate checks of transient UI
  state
tags: assertions, web-first, ui
---

## Use Web-first Assertions for UI Results

**Impact: HIGH (aligns assertions with the browser's async rendering model instead of relying on immediate checks of
transient UI state)**

UI 결과는 `toBeVisible`, `toHaveText`, `toHaveValue`, `toHaveURL` 같은 web-first assertion을 기본으로 씁니다.
즉시 평가되는 generic assertion은 non-UI 값에만 쓰고, 내부 state나 cache,
hook return 값 같은 구현 디테일 assertion은 하지 않습니다.

**Incorrect (즉시 평가와 구현 디테일에 의존):**

```ts
expect(await page.locator(".toast").textContent()).toBe("저장 완료");
expect(queryClient.getQueryData(["members"])).toBeDefined();
```

**Correct (브라우저 UI 결과를 web-first assertion으로 검증):**

```ts
await expect(page.getByText("저장 완료")).toBeVisible();
await expect(page).toHaveURL(/members/);
```
