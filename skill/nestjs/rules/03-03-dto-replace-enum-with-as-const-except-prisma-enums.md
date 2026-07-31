---
title: Replace Local `enum` With `as const` Except Prisma Enums
titleKo: Prisma enum 외 로컬 enum의 as const 대체
impact: MEDIUM-HIGH
impactDescription: 생성된 Prisma enum은 정본으로 남기면서 로컬 런타임 값은 가볍게 유지합니다
tags: enum, as-const, prisma
---

## Replace Local `enum` With `as const` Except Prisma Enums

**Impact: MEDIUM-HIGH (생성된 Prisma enum은 정본으로 남기면서 로컬 런타임 값은 가볍게 유지합니다)**

로컬 TypeScript `enum` 대신 객체 리터럴과 `as const`를 사용합니다.
다만 Prisma 스키마에서 생성된 enum은 `@prisma/client`에서 그대로 import해 source of truth를 유지합니다.

**Incorrect (로컬 enum을 직접 선언):**

```ts
enum UserRole {
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}
```

**Correct (로컬 값은 `as const`, Prisma enum은 generated source 사용):**

```ts
const USER_ROLE = {
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
} as const;

type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
```

```ts
import {Role} from "@prisma/client";
```
