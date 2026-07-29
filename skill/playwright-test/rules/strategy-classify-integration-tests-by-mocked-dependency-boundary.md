---
title: Classify Integration Tests by Mocked Dependency Boundary
impact: CRITICAL
impactDescription: makes it clear that integration tests exercise UI and route behavior with mocked backend or auth boundaries
tags: integration, mocking, boundaries
---

## Classify Integration Tests by Mocked Dependency Boundary

**Impact: CRITICAL (makes it clear that integration tests exercise UI and route behavior with mocked backend or auth boundaries)**

주요 API를 mock해도 테스트 목적이 유지되면 Integration입니다.
Integration은 `page.route()` 기반 API mocking, 인증 상태 mocking, 초기 데이터 강제 주입을 허용하고, 폼 검증, 로딩/에러/빈 상태, 권한 redirect, search/pagination 동기화 같은 화면 조합 책임을 검증합니다.

**Incorrect (mock을 적극적으로 쓰면서도 E2E라고 부름):**

```txt
- page.route()로 핵심 API 응답을 모두 가로채고
- 권한 상태도 강제 주입하지만
- 파일명은 *.e2e.spec.ts
```

**Correct (의존 경계가 mock이면 Integration으로 분류):**

```txt
- 파일 기준: <test-root>/**/*.spec.ts
- API mocking, auth mocking 허용
- 목적: 상태 분기와 사용자 반응 검증
```
