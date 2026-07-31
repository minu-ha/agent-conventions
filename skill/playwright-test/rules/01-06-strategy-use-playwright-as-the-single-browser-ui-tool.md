---
title: Use Playwright as the Single Browser UI Tool
titleKo: 브라우저 UI 테스트 도구의 Playwright 단일화
impact: CRITICAL
impactDescription: 테스트 층위 전체에서 도구 하나와 상호작용 모델 하나를 써서 브라우저 UI 테스트를 일관되게 유지합니다
tags: playwright, tool-choice, consistency
---

## Use Playwright as the Single Browser UI Tool

**Impact: CRITICAL (테스트 층위 전체에서 도구 하나와 상호작용 모델 하나를 써서 브라우저 UI 테스트를 일관되게 유지합니다)**

브라우저 UI 테스트의 기본 도구는 `Playwright` 하나로 통일합니다.
같은 도구를 쓰더라도 Integration과 E2E 경계는 별도로 나누고, locator, assertion,
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
