---
title: Name Query and Mutation Bindings Consistently
titleKo: query·mutation 바인딩 명명 규칙 통일
impact: HIGH
impactDescription: 생성된 API hook과 로컬 바인딩을 쉽게 훑고 추적할 수 있게 합니다
appliesWhen:
  - React Query query·mutation hook의 로컬 binding을 추가하거나 이름을 바꿀 때
  - 역할이 드러나지 않는 별칭이 diff에 보일 때
requiresSelected: typescript/naming-use-consistent-file-and-symbol-naming, docs-require-jsdoc-on-key-declarations
reviewWith: data-preserve-origin-chaining
tags: state, query, mutation, naming
---

## Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API hook과 로컬 바인딩을 쉽게 훑고 추적할 수 있게 합니다)**

프로젝트가 이미 채택한 query/mutation hook 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다.
codegen 여부와 무관하게 query는 `response...`,
mutation은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

**Incorrect (query와 mutation 바인딩 이름이 제각각임):**

```ts
const list = useEntryListSuspense();
const removeApi = useEntryRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
/**
 * @api entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense();

/**
 * @api entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();
```
