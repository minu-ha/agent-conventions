---
title: Replace Local `enum` With `as const` Except Prisma Enums
impact: MEDIUM-HIGH
impactDescription: >-
  keeps local runtime values lightweight while still allowing generated Prisma enums to remain the source of truth
tags: enum, as-const, prisma
---

## Replace Local `enum` With `as const` Except Prisma Enums

**Impact: MEDIUM-HIGH (keeps local runtime values lightweight while still allowing generated Prisma enums to remain the
source of truth)**

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
