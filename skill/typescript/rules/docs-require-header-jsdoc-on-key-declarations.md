---
title: Require Header JSDoc on Key Declarations
impact: MEDIUM-HIGH
impactDescription: makes important boundaries searchable and explainable before readers inspect the implementation body
appliesWhen: named query·mutation, 원격 함수, 비자명한 handler/effect, reusable/exported helper·custom hook, custom type·interface, store, formatter 또는 예외 memo 선언을 추가·변경한다.
requiresSelected: docs-standardize-annotation-tags-by-declaration-role, docs-write-concise-korean-comments-about-purpose-and-constraints
tags: jsdoc, declarations, boundaries
---

## Require Header JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (makes important boundaries searchable and explainable before readers inspect the implementation body)**

named query·mutation binding과 원격 함수에는 `@api` 헤더 JSDoc을 작성하고, 비자명한 handler/effect, reusable/exported helper·custom hook, 커스텀 `type`/`interface`, store, formatter와 예외 memo 선언에도 헤더 JSDoc을 작성합니다.
중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다.
annotation 종류는 선언 역할에 따라 `@api`, `@event`, `@watch`, `@helper`, `@summary` 중 하나를 고릅니다.
header tag가 있어도 body가 비어 있거나 영문 label뿐이면 header 요구를 충족하지 않습니다. `requiresSelected`의 `docs-write-concise-korean-comments-about-purpose-and-constraints`는 선택 bookkeeping이 아니라 실제 한국어 content gate입니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Correct (핵심 선언의 헤더 JSDoc과 역할 태그를 명시):**

```ts
/**
 * @helper 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```
