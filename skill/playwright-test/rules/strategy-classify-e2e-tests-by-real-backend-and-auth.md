---
title: Classify E2E Tests by Real Backend and Auth Dependence
titleKo: e2e는 실제 백엔드·인증 의존으로 분류
impact: CRITICAL
impactDescription: >-
  keeps e2e meaning strict by requiring the real backend, real auth, and real routing to remain part of the test
tags: e2e, real-backend, auth
---

## Classify E2E Tests by Real Backend and Auth Dependence

**Impact: CRITICAL (keeps e2e meaning strict by requiring the real backend, real auth, and real routing to remain part
of the test)**

실제 로그인, 실제 저장, 실제 권한 연결이 끊기면 테스트 의미가 사라지면 E2E입니다.
E2E는 실제 백엔드, 실제 인증 플로우, 실제 라우팅과 번들 결과를 사용하고,
핵심 엔드포인트를 `page.route()`로 가로채면서 E2E라고 부르지 않습니다.

**Incorrect (실제 시스템 경계를 우회하면서 E2E라고 분류):**

```txt
- 로그인 성공 응답을 route mocking
- 저장 API도 route mocking
- 파일명은 *.e2e.spec.ts
```

**Correct (실제 백엔드와 인증이 의미의 일부일 때만 E2E):**

```txt
- 파일 기준: <test-root>/**/*.e2e.spec.ts
- 실제 백엔드 사용
- 실제 인증 사용
- 실제 저장/권한/라우팅 보증
```
