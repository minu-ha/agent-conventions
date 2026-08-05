---
title: Name Query and Mutation Bindings Consistently
titleKo: 쿼리와 뮤테이션 바인딩 이름 규칙을 통일합니다
impact: HIGH
impactDescription: 생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다
appliesWhen:
  - 리액트 Query 쿼리·뮤테이션 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때
  - 쿼리나 뮤테이션 훅의 반환값을 새 지역 변수에 담을 때
requiresSelected: typescript/naming-use-consistent-file-and-symbol-naming, docs-require-jsdoc-on-key-declarations
reviewWith: data-preserve-origin-chaining
tags: data, state, naming
---

## Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

프로젝트가 이미 채택한 쿼리/뮤테이션 훅 이름은 유지하고, 로컬 바인딩은 `response`와 `mutation` 접두사만 씁니다.
훅 하나를 담는 바인딩 이름은 훅 이름에서 `use`를 떼고 앞에 `response` 또는 `mutation`을 붙여 만듭니다.
`useProductListSuspense`는 `responseProductListSuspense`, `useProductRemove`는 `mutationProductRemove`입니다.
여러 쿼리를 합친 결과처럼 훅 이름 하나로 정해지지 않는 값은 합친 값이 무엇인지로 이름을 짓습니다.

**Incorrect (쿼리와 뮤테이션 바인딩 이름이 제각각임):**

```ts
const list = useProductListSuspense();
const removeApi = useProductRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
/**
 * 표에 그릴 product를 읽는다. 멈추는 동안은 섹션 소유자의 경계가 받는다
 */
const responseProductListSuspense = useProductListSuspense();

/**
 * 표에서 고른 product를 지운다. 성공 뒤 무효화는 부르는 화면이 맡는다
 */
const mutationProductRemove = useProductRemove();
```
