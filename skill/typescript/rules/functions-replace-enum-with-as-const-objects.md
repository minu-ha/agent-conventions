---
title: Replace `enum` With `as const` Objects
impact: MEDIUM-HIGH
impactDescription: keeps runtime values explicit and type extraction lightweight without introducing enum-specific behavior
tags: enum, as-const, values
---

## Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (keeps runtime values explicit and type extraction lightweight without introducing enum-specific behavior)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다. 이렇게 하면 런타임 값과 타입 추론을 함께 유지하면서도 enum 고유 문법과 번들 영향을 피할 수 있습니다.

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
 * @summary 감사 상태 값 집합
 */
type AuditStatus = (typeof audit_status)[keyof typeof audit_status];
```
