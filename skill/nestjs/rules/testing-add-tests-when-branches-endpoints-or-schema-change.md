---
title: Add Tests When Branches, Endpoints, or Schema Behavior Change
impact: HIGH
impactDescription: keeps backend regressions from slipping through when logic branches or API/database behavior changes
tags: tests, coverage, regression
---

## Add Tests When Branches, Endpoints, or Schema Behavior Change

**Impact: HIGH (keeps backend regressions from slipping through when logic branches or API/database behavior changes)**

Service에 의미 있는 비즈니스 분기나 예외 처리가 추가되면
unit test를,
공개 API 엔드포인트가 추가되거나 변경되면
e2e test를 추가합니다.
Prisma schema 변경이 API 동작에 영향을 주면 최소 한 개 이상의 e2e test로 회귀를 막습니다.

**Incorrect (분기나 엔드포인트가 늘어도 기존 테스트만 믿고 넘어감):**

```txt
- 새 권한 분기 추가
- 새 POST /users 엔드포인트 추가
- 응답 shape 변경
- 테스트 추가 없음
```

**Correct (변경된 경계에 맞는 테스트를 함께 추가):**

```txt
- Service 분기/예외 추가 -> unit test 추가
- 공개 HTTP 엔드포인트 추가/변경 -> e2e test 추가
- Prisma schema가 API 결과에 영향 -> e2e 회귀 테스트 추가
```
