---
title: Require Header Doc Comments on Key Declarations
titleKo: 경계가 되는 선언에는 JSDoc 헤더를 붙입니다
impact: MEDIUM
impactDescription: 구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다
appliesWhen:
  - 쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 스토어, 포매터 선언을 추가·변경할 때
  - 분기나 `await`나 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때
  - 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때
requiresSelected: >-
  docs-write-concise-korean-comments-about-purpose-and-constraints,
  docs-write-doc-comments-as-multiline-blocks
tags: docs, jsdoc, declarations, boundaries
---

## Require Header Doc Comments on Key Declarations

**Impact: MEDIUM (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

아래 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

- 이름 붙인 쿼리와 뮤테이션, 원격 함수, 커스텀 훅, 스토어
- 표시 문자열을 만드는 포매터
- 본문에 분기나 `await`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트
- 다시 쓰거나 내보낸 보조 함수

커스텀 `type`과 `interface` 문서화는 `types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고 여기서 다시 판정하지 않습니다.

주석의 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.
태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

**Incorrect (주요 선언에 헤더 설명이 없습니다):**

```ts
export const toSortedUserIds = (userIds: string[]): string[] => {
	return uniq(userIds).toSorted();
};
```

**Correct (여러 줄 블록에 설명만 적습니다):**

```ts
/**
 * 중복 제거 후 사용자 ID 정렬
 */
export const toSortedUserIds = (userIds: string[]): string[] => {
	return uniq(userIds).toSorted();
};

/**
 * product 목록 조회. 로딩과 오류는 이 응답 객체로만 판단한다
 */
const responseProductList = useProductList();
```
