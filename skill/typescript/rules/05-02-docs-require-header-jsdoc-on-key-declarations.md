---
title: Require Header Doc Comments on Key Declarations
titleKo: 핵심 선언의 헤더 doc 주석 의무화
impact: MEDIUM-HIGH
impactDescription: 구현 본문을 읽기 전에 중요한 경계를 검색하고 설명할 수 있게 합니다
appliesWhen:
  - query·mutation, 원격 함수, 비자명한 handler/effect, exported helper·hook, custom type·interface, store 선언을 추가·변경할 때
  - 선언 위 주석의 형식이나 태그를 정할 때
requiresSelected: docs-write-concise-korean-comments-about-purpose-and-constraints
tags: jsdoc, declarations, boundaries
---

## Require Header Doc Comments on Key Declarations

**Impact: MEDIUM-HIGH (구현 본문을 읽기 전에 중요한 경계를 검색하고 설명할 수 있게 합니다)**

named query·mutation binding, 원격 함수, 비자명한 handler/effect, reusable/exported helper와 custom hook,
커스텀 `type`/`interface`, store, formatter, 예외 memo 선언에는 헤더 doc 주석을 작성합니다.
중요한 경계가 파일 검색에서 바로 보이게 하는 것이 목적입니다.

형식은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나누고 `/** 한 줄 */` 형태는 쓰지 않습니다.
선언 설명에 `//`를 쓰지 않습니다. `//`는 본문 안 제약 설명 몫입니다.

annotation 태그는 쓰지 않습니다.
`@api`, `@helper`, `@summary` 같은 역할 태그를 붙이지 않고 `@schema`처럼 새로 만들지도 않습니다.
선언 종류는 이름 규칙과 문법이 이미 드러냅니다.
`@deprecated`, `@example`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

헤더 doc 주석은 본문이 비어 있거나 영문 label뿐이면 요구를 충족하지 않습니다.
`requiresSelected`의 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
선택 bookkeeping이 아니라 실제 한국어 content gate입니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Incorrect (한 줄 형태와 `//` 설명을 섞어 씀):**

```ts
/** 중복 제거 후 사용자 ID 정렬 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};

// entry 목록 조회 API
const responseEntryList = useEntryList();
```

**Incorrect (역할 태그를 붙임):**

```ts
/**
 * @helper 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Correct (여러 줄 블록에 설명만 작성):**

```ts
/**
 * 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};

/**
 * entry 목록 조회 API
 */
const responseEntryList = useEntryList();
```
