---
title: Organize Domain Modules and Shared Backend Code by Scope
titleKo: 도메인 모듈과 공용 백엔드 코드의 스코프별 구성
impact: HIGH
impactDescription: 도메인 소유 코드와 실제 공용 백엔드 코드를 분리해 모듈이 기본적으로 지역 범위에 머물게 합니다
tags: modules, folders, shared-code
---

## Organize Domain Modules and Shared Backend Code by Scope

**Impact: HIGH (도메인 소유 코드와 실제 공용 백엔드 코드를 분리해 모듈이 기본적으로 지역 범위에 머물게 합니다)**

하나의 도메인은 하나의 모듈 폴더로 구성하고,
`_shared/` 같은 공유 디렉터리에는 2개 이상의 모듈에서 함께 쓰는 코드만 둡니다.
한 모듈에서만 쓰이는 Guard, Pipe, Decorator, 상수는 해당 모듈 폴더 안에 유지합니다.

**Incorrect (공유 여부가 불분명한 코드가 전역으로 올라감):**

```txt
<src-root>/
  shared/
    users.guard.ts
    users.constants.ts
  users.service.ts
```

**Correct (도메인과 공유 범위를 분리):**

```txt
<src-root>/
  users/
    dto/
      create-user.dto.ts
      user-response.dto.ts
    users.module.ts
    users.controller.ts
    users.service.ts
    users.constants.ts
  <shared-dir>/
    constants.ts
    dto/
  prisma/
    prisma.module.ts
    prisma.service.ts
```
