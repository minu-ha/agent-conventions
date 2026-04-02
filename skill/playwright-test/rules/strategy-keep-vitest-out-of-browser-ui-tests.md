---
title: Keep Vitest Out of Browser UI Tests by Default
impact: MEDIUM-HIGH
impactDescription: avoids splitting browser UI coverage across tools when Playwright already owns the runtime boundary
tags: vitest, ui-tests, tooling
---

## Keep Vitest Out of Browser UI Tests by Default

**Impact: MEDIUM-HIGH (avoids splitting browser UI coverage across tools when Playwright already owns the runtime boundary)**

`vi`와 `Vitest`는 이 프로젝트의 기본 UI 테스트 도구가 아닙니다. 화면이나 라우트 기능 검증을 위해 Vitest를 기본 도입하지 않고, DOM 없이 검증하는 편이 더 싼 순수 계산 로직이 충분히 생겼을 때만 별도 합의 후 검토합니다.

**Incorrect (브라우저 UI 검증에 Vitest를 기본 도입):**

```txt
- 화면 상호작용 검증을 Vitest DOM 테스트로 기본 작성
- 같은 UI 경계를 Playwright와 Vitest가 나눠 가짐
```

**Correct (브라우저 UI는 Playwright가 기본값):**

```txt
- UI/라우트 기능 검증 -> Playwright
- 순수 계산/formatter/helper만 정말 필요할 때 별도 도구 검토
```
