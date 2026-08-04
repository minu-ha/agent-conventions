---
title: Name Query and Mutation Bindings Consistently
titleKo: 질의와 변경 요청 바인딩 이름 규칙을 통일합니다
impact: HIGH
impactDescription: 생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다
appliesWhen:
  - 리액트 Query 질의·변경 요청 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때
  - 역할이 드러나지 않는 별칭이 diff에 보일 때
requiresSelected: typescript/naming-use-consistent-file-and-symbol-naming, docs-require-jsdoc-on-key-declarations
reviewWith: data-preserve-origin-chaining
tags: state, query, mutation, naming
---

## Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

프로젝트가 이미 채택한 질의/변경 요청 훅 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다.
코드 생성기 여부와 무관하게 질의는 `response...`,
변경 요청은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

**Incorrect (질의와 변경 요청 바인딩 이름이 제각각임):**

```ts
const list = useEntryListSuspense();
const removeApi = useEntryRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense();

/**
 * entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();
```
