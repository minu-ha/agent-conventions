---
title: Prefer Accessible Playwright Locators
impact: HIGH
impactDescription: keeps selectors resilient and user-oriented by favoring accessible names over DOM structure
tags: locators, accessibility, selectors
---

## Prefer Accessible Playwright Locators

**Impact: HIGH (keeps selectors resilient and user-oriented by favoring accessible names over DOM structure)**

locator 우선순위는 `getByRole`, `getByLabel`/`getByPlaceholder`, `getByText`, `getByTestId`, 최후수단 CSS/XPath 순서입니다. 접근 가능한 이름과 실제 사용자 표현을 우선 사용하고, CSS class, DOM 구조, `nth-child` 의존 locator는 피합니다.

**Incorrect (DOM 구조와 class에 과도하게 의존):**

```ts
await page.locator(".members-form > div:nth-child(3) button.save").click();
```

**Correct (접근 가능한 locator를 우선 사용):**

```ts
await page.getByRole("button", {name: "저장"}).click();
await page.getByLabel("이메일").fill("user@example.com");
```
