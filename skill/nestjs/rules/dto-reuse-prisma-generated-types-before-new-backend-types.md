---
title: Reuse Prisma Generated Types Before New Backend Types
titleKo: 새 백엔드 타입 전에 Prisma 생성 타입 재사용
impact: HIGH
impactDescription: prevents duplicate backend type declarations when Prisma already owns the same structural contract
impactDescriptionKo: Prisma 가 이미 같은 구조 계약을 소유할 때 백엔드 타입이 중복 선언되는 것을 막음
tags: prisma, types, reuse
---

## Reuse Prisma Generated Types Before New Backend Types

**Impact: HIGH (prevents duplicate backend type declarations when Prisma already owns the same structural contract)**

Prisma가 생성한 타입이 이미 존재하면 동일하거나 유사한 구조의 별도 타입 선언을 만들지 않습니다.
필요한 경우 Prisma 타입을 직접 참조하거나 `Pick`/`Omit`으로 파생하고,
구조 중복이 아니라 의미 차이가 실제로 있을 때만 신규 타입을 선언합니다.

**Incorrect (Prisma 타입과 같은 구조를 다시 선언):**

```ts
interface CreateUserParams {
	email: string;
	password: string;
	name: string;
}
```

**Correct (Prisma 생성 타입을 직접 재사용):**

```ts
import type {Prisma, User} from "@prisma/client";

type CreateUserParams = Prisma.UserCreateInput;
type UserData = User;
type SafeUser = Omit<User, "password">;
```
