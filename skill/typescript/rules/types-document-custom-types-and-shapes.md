---
title: Document Custom Types and Declarative Shapes
impact: CRITICAL
impactDescription: keeps domain-specific contracts understandable without digging through implementation details
tags: types, jsdoc, shapes
---

## Document Custom Types and Declarative Shapes

**Impact: CRITICAL (keeps domain-specific contracts understandable without digging through implementation details)**

선언형 shape는 헤더와 필드를 나눠 문서화합니다.

- custom `type`, `interface`, schema root, 객체형 상수: 헤더 `@summary`
- 객체형 계약과 schema field: 각 필드 바로 위 `@field`
- `Pick`/`Omit`/Indexed Access alias: 필드가 없으므로 헤더 `@summary`만 사용
- compound component public part props: React rule에 따라 `@part` + `@description` 허용

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
