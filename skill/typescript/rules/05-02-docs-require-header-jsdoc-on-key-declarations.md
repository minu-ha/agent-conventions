---
title: Require Header Doc Comments on Key Declarations
titleKo: 핵심 선언에는 헤더 문서 주석을 붙입니다
impact: MEDIUM-HIGH
impactDescription: 구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다
appliesWhen:
  - 질의·변경 요청, 원격 함수, 뻔하지 않은 핸들러와 이펙트, 내보낸 보조 함수와 훅, 커스텀 타입, 스토어 선언을 추가·변경할 때
  - 선언 위 주석의 형식이나 태그를 정할 때
requiresSelected: docs-write-concise-korean-comments-about-purpose-and-constraints
tags: docs, jsdoc, declarations, boundaries
---

## Require Header Doc Comments on Key Declarations

**Impact: MEDIUM-HIGH (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

이름 붙인 질의와 변경 요청, 원격 함수, 뻔하지 않은 핸들러와 이펙트, 재사용하거나 내보낸 보조 함수,
커스텀 훅, 커스텀 `type`과 `interface`, 스토어, 포매터, 예외 메모 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

형식은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나누고 `/** 한 줄 */`은 쓰지 않습니다.
선언 설명에 `//`를 쓰지 않습니다. `//`는 본문 안 제약 설명 몫입니다.

역할 태그는 쓰지 않습니다.
`@api`, `@helper`, `@summary` 같은 태그를 붙이지 않고 `@schema`처럼 새로 만들지도 않습니다.
선언이 무엇인지는 이름 규칙과 문법이 이미 드러냅니다.
`@deprecated`, `@example`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

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
