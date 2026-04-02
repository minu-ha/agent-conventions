---
title: Require Header JSDoc on Key Declarations
impact: MEDIUM-HIGH
impactDescription: makes important boundaries searchable and explainable before readers inspect the implementation body
tags: jsdoc, declarations, boundaries
---

## Require Header JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (makes important boundaries searchable and explainable before readers inspect the implementation body)**

외부 연동 함수, 주요 순수 함수, 재사용 함수, 도메인 규칙 함수, 커스텀 `type`/`interface`, 포맷 예외를 둔 함수 선언에는 예외 없이 선언 헤더 JSDoc을 작성합니다. 중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다. annotation 종류는 더 구체적인 규칙을 따라 `@summary`, `@description`, `@helper`, `@tool` 중 하나를 고릅니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const normalizeRuleRefs = (ruleRefs: string[]): string[] => {
	return Array.from(new Set(ruleRefs)).sort();
};
```

**Correct (핵심 선언의 헤더 JSDoc을 명시):**

```ts
/**
 * @summary 중복 제거 후 규칙 경로 정렬
 */
export const normalizeRuleRefs = (ruleRefs: string[]): string[] => {
	return Array.from(new Set(ruleRefs)).sort();
};
```
