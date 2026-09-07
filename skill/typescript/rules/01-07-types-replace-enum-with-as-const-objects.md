---
title: Replace `enum` With `as const` Objects
titleKo: `enum` 대신 `as const` 객체를 씁니다
impact: MEDIUM-HIGH
impactDescription: 객체로 실행 값을 선언하고 같은 값에서 타입을 추출합니다
appliesWhen:
  - `enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 집합을 추가·변경할 때
  - 제외: 외부 패키지가 내보낸 `enum` 값을 그대로 읽어 쓰는 경우
requiresSelected: naming-use-consistent-file-and-symbol-naming, types-document-custom-types-and-shapes
tags: types
---

## Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (객체로 실행 값을 선언하고 같은 값에서 타입을 추출합니다)**

직접 선언하는 값 집합은 `enum` 대신 객체와 `as const`로 실행 값과 타입을 함께 둡니다.
`enum`은 타입만 지우는 번들러나 TypeScript 5.8의 `--erasableSyntaxOnly`와 호환되지 않으며,
이 컨벤션의 `biome` 설정도 `style/noEnum`으로 선언을 막습니다.

| 상황 | 처리 |
| --- | --- |
| 외부 패키지의 `enum`을 그대로 전달함 | 외부 계약을 유지합니다 |
| 기존 `enum`을 객체로 옮김 | 직렬화 값과 공개 타입을 보존하고 숫자 `enum`의 역방향 조회 소비처를 확인합니다 |
| 기존 계약에 맞는 값 집합인지도 검사함 | `as const satisfies 기존계약`을 씁니다 |
| 리터럴 추론·읽기 전용 속성이 필요 없음 | `as const`를 불필요하게 붙이지 않습니다 |

객체에는 `Enum[value]` 역방향 조회가 자동으로 생기지 않습니다.
`as const`는 실행 중 동결이나 다른 변수에서 가져온 배열의 변경까지 보장하지 않습니다.

**Incorrect (`enum`을 직접 씁니다):**

```ts
enum ProductStatus {
	pending = "pending",
	passed = "passed",
	failed = "failed",
}
```

**Correct (객체 리터럴과 타입 추출을 조합합니다):**

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
 * product 심사 상태 타입. product_status에 값을 더하면 따라 넓어진다
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
```
