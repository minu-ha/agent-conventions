---
title: Use Playwright as the Single Browser UI Tool
impact: CRITICAL
impactDescription: keeps browser UI testing consistent by using one toolchain and one interaction model across test levels
tags: playwright, tool-choice, consistency
---

## Use Playwright as the Single Browser UI Tool

**Impact: CRITICAL (keeps browser UI testing consistent by using one toolchain and one interaction model across test levels)**

브라우저 UI 테스트의 기본 도구는 `Playwright` 하나로 통일합니다.
같은 도구를 쓰더라도 Integration과 E2E 경계는 별도로 나누고,
locator,
assertion,
waiting 방식도 Playwright의 web-first 문법으로 통일합니다.

**Incorrect (브라우저 UI 테스트 도구가 섞임):**

```txt
- 일부 화면은 Playwright
- 일부 화면은 다른 브라우저 테스트 도구
- 수준별 문법과 waiting 방식이 제각각
```

**Correct (브라우저 테스트는 Playwright 하나로 통일):**

```txt
- Playwright Integration
- Playwright E2E
- locator / assertion / waiting 모두 Playwright web-first 패턴 사용
```
