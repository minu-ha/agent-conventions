---
title: Replace `enum` With `as const` Objects
titleKo: `enum` 대신 `as const` 객체를 씁니다
impact: MEDIUM-HIGH
impactDescription: enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다
appliesWhen:
  - `enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때
requiresSelected: naming-use-consistent-file-and-symbol-naming, types-document-custom-types-and-shapes
tags: functions
---

## Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 `enum` 고유 문법과 번들 부담을 피합니다.

**Incorrect (`enum`을 직접 사용):**

```ts
enum ProductStatus {
	pending = "pending",
	passed = "passed",
	failed = "failed",
}
```

**Correct (객체 리터럴과 타입 추출을 조합):**

```ts
/**
 * product 심사 상태 값 집합
 */
const product_status = {
	pending: "pending",
	passed: "passed",
	failed: "failed",
} as const;

/**
 * product 심사 상태 타입
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
```
