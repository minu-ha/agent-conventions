---
title: Replace `enum` With `as const` Objects
titleKo: enum 대신 as const 객체 사용
impact: MEDIUM-HIGH
impactDescription: enum 특유의 동작을 들이지 않고 런타임 값을 명시적으로, 타입 추출을 가볍게 유지합니다
appliesWhen:
  - `enum` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경할 때
requiresSelected: naming-use-consistent-file-and-symbol-naming, types-document-custom-types-and-shapes
tags: enum, as-const, values
---

## Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 런타임 값을 명시적으로, 타입 추출을 가볍게 유지합니다)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다.
이렇게 하면 런타임 값과 타입 추론을 함께 유지하면서도 enum 고유 문법과 번들 영향을 피할 수 있습니다.

**Incorrect (`enum`을 직접 사용):**

```ts
enum AuditStatus {
	pending = "pending",
	passed = "passed",
	failed = "failed",
}
```

**Correct (객체 리터럴과 타입 추출을 조합):**

```ts
const audit_status = {
	pending: "pending",
	passed: "passed",
	failed: "failed",
} as const;

/**
 * 감사 상태 값 집합
 */
type AuditStatus = (typeof audit_status)[keyof typeof audit_status];
```
