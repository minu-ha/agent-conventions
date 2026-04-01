---
title: Prefer Object Literals with as const Over enum
impact: MEDIUM
impactDescription: keeps runtime output simple and type derivation explicit
tags: composition, types, enum
---

## Prefer Object Literals with as const Over enum

**Impact: MEDIUM (keeps runtime output simple and type derivation explicit)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다. 이렇게 하면 런타임 형태가 단순하고, 값 유니온 타입을 직접 파생하기 쉬워집니다.

**Incorrect (enum 사용):**

```ts
enum Status {
  Pending = "pending",
  Success = "success",
}
```

**Correct (object literal + as const 사용):**

```ts
const STATUS = {
  Pending: "pending",
  Success: "success",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
```
