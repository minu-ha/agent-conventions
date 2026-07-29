---
title: Separate Service Unit Tests From HTTP E2E Tests
impact: CRITICAL
impactDescription: >-
  keeps backend failures diagnosable by assigning business logic and full-stack wiring to different test levels
tags: unit-tests, e2e, levels
---

## Separate Service Unit Tests From HTTP E2E Tests

**Impact: CRITICAL (keeps backend failures diagnosable by assigning business logic and full-stack wiring to different test levels)**

테스트는 `unit test`와 `e2e test`를 기본 축으로 구분합니다.
unit test는 Service 단위의 비즈니스 로직 검증을 담당하고, e2e test는 HTTP 요청부터 ValidationPipe, Filter, Service,
Prisma, DB까지의 연결을 검증합니다.
특별한 이유가 없으면 controller 전용 spec보다 service unit test와 HTTP e2e test를 우선합니다.

**Incorrect (controller spec과 service logic test가 뒤섞임):**

```txt
- Controller 전용 spec을 기본값으로 만들고
- Service 분기 테스트는 생략
- HTTP e2e는 없음
```

**Correct (레벨별 목적을 분명히 분리):**

```txt
- Service 비즈니스 분기/예외 -> unit test
- HTTP 엔드포인트와 wiring -> e2e test
- 단순 DTO/상수 파일 -> 테스트 강제 없음
```
