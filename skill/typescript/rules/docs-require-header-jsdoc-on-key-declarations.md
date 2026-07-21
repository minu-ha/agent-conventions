---
title: Require Header JSDoc on Key Declarations
impact: MEDIUM-HIGH
impactDescription: makes important boundaries searchable and explainable before readers inspect the implementation body
appliesWhen: named query·mutation binding, 원격 연동 함수, 이벤트 handler, reactive sync block, reusable helper, custom type·interface, store 또는 formatter 예외 선언을 추가·변경한다.
reviewWith: docs-standardize-annotation-tags-by-declaration-role, docs-write-concise-korean-comments-about-purpose-and-constraints
tags: jsdoc, declarations, boundaries
---

## Require Header JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (makes important boundaries searchable and explainable before readers inspect the implementation body)**

named query·mutation binding과 원격 연동 함수에는 `@api` 헤더 JSDoc을 작성하고, 이벤트 핸들러, 반응형 동기화 블록, 재사용 helper, 커스텀 `type`/`interface`, store 선언, 포맷 예외를 둔 함수 선언에도 예외 없이 선언 헤더 JSDoc을 작성합니다.
이 규칙을 선택하면 역할 태그와 한국어 JSDoc을 추가·유지하므로 두 `reviewWith` target의 `appliesWhen`도 충족되어 Selected이며 N/A가 아닙니다.
중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다. annotation 종류는 선언 역할에 따라 `@api`, `@event`, `@watch`, `@helper`, `@summary` 중 하나를 고릅니다.

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
