---
title: Document Custom Types and Declarative Shapes
impact: CRITICAL
impactDescription: keeps domain-specific contracts understandable without digging through implementation details
tags: types, jsdoc, shapes
---

## Document Custom Types and Declarative Shapes

**Impact: CRITICAL (keeps domain-specific contracts understandable without digging through implementation details)**

커스텀 `type`, `interface`, `z.object(...)`, 객체형 상수 같은 선언형 shape에는 JSDoc을 작성합니다. 객체형 계약과 schema root는 헤더에 `@summary`, 각 필드 바로 위에는 `@field`를 씁니다. `Pick`/`Omit`/Indexed Access처럼 로컬 필드 선언이 없는 alias는 헤더 `@summary`만 둡니다.  
예외적으로 React의 compound component public part props `interface`처럼 component part 경계와 함께 읽혀야 하는 경우에는 `@summary` 대신 `@part`와 `@description`을 사용해도 됩니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씀):**

```ts
/**
 * @summary 게시 결과 요약
 * @field 게시 대상 문서 ID
 */
interface PublishResult {
	documentId: string;
	published: boolean;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 게시 결과 요약
 */
export interface PublishResult {
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: string;
	/**
	 * @field 게시 성공 여부
	 */
	published: boolean;
}

/**
 * @summary 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```
