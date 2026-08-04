---
title: Name Query and Mutation Bindings Consistently
titleKo: 쿼리와 뮤테이션 바인딩 이름 규칙을 통일합니다
impact: HIGH
impactDescription: 생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다
appliesWhen:
  - 리액트 Query 쿼리·뮤테이션 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때
  - 역할이 드러나지 않는 별칭이 diff에 보일 때
requiresSelected: typescript/naming-use-consistent-file-and-symbol-naming, docs-require-jsdoc-on-key-declarations
reviewWith: data-preserve-origin-chaining
tags: data, state, naming
---

## Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

프로젝트가 이미 채택한 쿼리/뮤테이션 훅 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다.
코드 생성기 여부와 무관하게 쿼리는 `response...`,
뮤테이션은 `mutation...`으로 맞춰야 화면 파일에서 역할과 출처가 한눈에 보입니다.

**Incorrect (쿼리와 뮤테이션 바인딩 이름이 제각각임):**

```ts
const list = useProductListSuspense();
const removeApi = useProductRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
/**
 * product 목록 조회 API
 */
const responseProductListSuspense = useProductListSuspense();

/**
 * product 삭제 API
 */
const mutationProductRemove = useProductRemove();
```
