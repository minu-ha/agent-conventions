---
title: Replace `enum` With `as const` Objects
titleKo: `enum` 대신 `as const` 객체를 씁니다
impact: MEDIUM-HIGH
impactDescription: enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다
appliesWhen:
  - `enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때
  - 제외: 외부 패키지가 내보낸 `enum` 값을 그대로 읽어 쓰는 경우
requiresSelected: naming-use-consistent-file-and-symbol-naming, types-document-custom-types-and-shapes
tags: functions
---

## Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 `enum` 고유 문법을 피합니다.

`enum`은 타입 표기를 지우는 것만으로 실행 코드가 되지 않습니다.
그래서 TypeScript 5.8의 `--erasableSyntaxOnly`나 타입만 지우는 번들러와 함께 쓸 수 없습니다.
이 컨벤션의 `biome` 설정도 `style/noEnum`으로 `enum` 선언을 막습니다.

외부 패키지가 `enum`을 내보내고 그 값을 그대로 넘겨야 하면 그 `enum`을 씁니다.
우리가 새로 선언하는 값 묶음만 이 규칙 대상입니다.

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
 * product 심사 상태 타입. product_status 에 값을 더하면 따라 넓어진다
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
```
