---
title: Place Test Files by Runtime Scope
titleKo: 테스트 파일의 런타임 스코프별 배치
impact: HIGH
impactDescription: service 인접 단위 테스트와 최상위 HTTP e2e 테스트를 분리해 테스트 소유를 분명히 합니다
tags: test-files, placement, runtime-scope
---

## Place Test Files by Runtime Scope

**Impact: HIGH (service 인접 단위 테스트와 최상위 HTTP e2e 테스트를 분리해 테스트 소유를 분명히 합니다)**

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
