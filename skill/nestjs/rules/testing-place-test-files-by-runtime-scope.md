---
title: Place Test Files by Runtime Scope
impact: HIGH
impactDescription: >-
  makes backend test ownership obvious by separating service-adjacent unit tests from top-level HTTP e2e tests
tags: test-files, placement, runtime-scope
---

## Place Test Files by Runtime Scope

**Impact: HIGH (makes backend test ownership obvious by separating service-adjacent unit tests from top-level HTTP e2e tests)**

Service unit test는 대상 파일 옆의 `*.service.spec.ts`로 두고,
HTTP e2e test는 `test/` 아래 `<domain>.e2e-spec.ts`로 둡니다.
테스트 파일명은 대상과 범위가 즉시 드러나야 하며, unit과 e2e를 같은 위치나 같은 이름 패턴으로 섞지 않습니다.

**Incorrect (범위와 대상이 드러나지 않는 배치):**

```txt
src/
  auth/
    auth.test.ts
test/
  test.ts
```

**Correct (런타임 범위에 따라 배치):**

```txt
src/
  auth/
    auth.service.ts
    auth.service.spec.ts

test/
  auth.e2e-spec.ts
```
