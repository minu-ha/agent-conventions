---
title: Document Declarative Shapes With `@summary` and `@field`
impact: MEDIUM-HIGH
impactDescription: keeps exported shape declarations and runtime maps self-describing without duplicate type-only wrappers
tags: jsdoc, shapes, summary
---

## Document Declarative Shapes With `@summary` and `@field`

**Impact: MEDIUM-HIGH (keeps exported shape declarations and runtime maps self-describing without duplicate type-only wrappers)**

shape를 설명하는 타입, 인터페이스, 객체형 상수에는 `@summary`를 작성하고, shape 내부 필드는 각 필드 바로 위 `@field` 블록 주석을 사용합니다. 필드 설명만을 위해 별도 타입을 만드는 대신, 실제 shape를 소유한 선언 위에서 직접 의미를 설명합니다.

**Incorrect (`@property`나 중복된 타입 주석으로 설명을 분산):**

```ts
/**
 * @summary 채팅 응답의 섹션 제목
 * @property selected_rules 선택된 규칙 문서 섹션 제목
 */
export const heading = {
	selected_rules: "Selected rules",
} as const;
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 채팅 응답의 섹션 제목
 */
export const heading = {
	/**
	 * @field 선택된 규칙 문서 섹션 제목
	 */
	selected_rules: "Selected rules",
	/**
	 * @field 요구사항 요약 섹션 제목
	 */
	requirement_summary: "Requirement summary",
} as const;
```
