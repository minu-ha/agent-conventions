---
title: Document Custom Types and Declarative Shapes
impact: CRITICAL
impactDescription: keeps domain-specific contracts understandable without digging through implementation details
tags: types, jsdoc, shapes
---

## Document Custom Types and Declarative Shapes

**Impact: CRITICAL (keeps domain-specific contracts understandable without digging through implementation details)**

커스텀 `type`, `interface`, `z.object(...)`, `StateSchema(...)`, 객체형 상수 같은 선언형 shape에는 JSDoc을 작성합니다. 객체형 계약은 헤더에 `@summary`, 각 필드 바로 위 `@field`를 쓰고, `Pick`/`Omit`/Indexed Access처럼 로컬 필드 선언이 없는 alias는 헤더 `@summary`만 둡니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씀):**

```ts
/**
 * @summary 오케스트레이션 검증 결과
 * @field ruleRef 검증 대상 규칙 문서 경로
 */
interface OrchestrationAuditResult {
	ruleRef: string;
	passed: boolean;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 오케스트레이션 검증 결과
 */
export interface OrchestrationAuditResult {
	/**
	 * @field 검증 대상 규칙 문서 경로
	 */
	ruleRef: string;
	/**
	 * @field 검증 통과 여부
	 */
	passed: boolean;
}

/**
 * @schema 모델 구조화 출력 스키마
 */
const auditResultSchema = z.object({
	/**
	 * @field 검증 대상 규칙 문서 경로
	 */
	ruleRef: z.string(),
});
```
