---
title: Require Header Doc Comments on Key Declarations
titleKo: 핵심 선언에는 헤더 문서 주석을 붙입니다
impact: MEDIUM-HIGH
impactDescription: 구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다
appliesWhen:
  - 쿼리·뮤테이션, 원격 함수, 분기나 `await` 가 있는 핸들러와 이펙트, 내보낸 보조 함수와 훅, 커스텀 타입, 스토어 선언을 추가·변경할 때
  - 선언 위 주석의 형식이나 태그를 정할 때
requiresSelected: docs-write-concise-korean-comments-about-purpose-and-constraints, docs-write-doc-comments-as-multiline-blocks
tags: docs, jsdoc, declarations, boundaries
---

## Require Header Doc Comments on Key Declarations

**Impact: MEDIUM-HIGH (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

이름 붙인 쿼리와 뮤테이션, 원격 함수, 본문에 분기·`await`·두 개 이상의 동작이 있는 핸들러와 이펙트,
재사용하거나 내보낸 보조 함수,
커스텀 훅, 커스텀 `type`과 `interface`, 스토어, 포매터, 예외 메모 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

주석의 형식은 `docs-write-doc-comments-as-multiline-blocks`가,
태그를 붙일지는 `docs-avoid-role-tags-in-doc-comments`가 정합니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

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
