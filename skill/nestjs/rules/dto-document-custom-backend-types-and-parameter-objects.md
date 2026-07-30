---
title: Document Custom Backend Types and Parameter Objects
titleKo: 커스텀 백엔드 타입과 매개변수 객체 문서화
impact: MEDIUM-HIGH
impactDescription: keeps backend-only contracts and parameter objects understandable without scanning method bodies
tags: types, jsdoc, params
---

## Document Custom Backend Types and Parameter Objects

**Impact: MEDIUM-HIGH (keeps backend-only contracts and parameter objects understandable without scanning method
bodies)**

Prisma 생성 타입이 아닌 커스텀 `type`, `interface`, 파라미터 객체에는 JSDoc을 작성합니다.
객체형 계약은 헤더에 `@summary`, 각 필드 바로 위 `@field`를 사용하고, 관련 파일 최상단에 모아 배치합니다.

**Incorrect (커스텀 계약 설명이 없거나 헤더에 `@property`를 몰아씀):**

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 * @property page 페이지 번호
 */
interface PaginationParams {
	page: number;
	limit: number;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 */
interface PaginationParams {
	/**
	 * @field 1부터 시작하는 페이지 번호
	 */
	page: number;
	/**
	 * @field 페이지당 항목 수
	 */
	limit: number;
}
```
