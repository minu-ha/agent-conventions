---
title: Name Query and Mutation Bindings Consistently
titleKo: 쿼리·뮤테이션 바인딩에 `response`·`mutation` 접두사를 붙입니다
impact: MEDIUM
impactDescription: 생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다
appliesWhen:
  - React Query 쿼리·뮤테이션 훅의 지역 바인딩을 추가하거나 이름을 바꿀 때
  - 쿼리나 뮤테이션 훅의 반환값을 새 지역 변수에 담을 때
requiresSelected: typescript/naming-use-consistent-file-and-symbol-naming, docs-require-jsdoc-on-key-declarations
reviewWith: data-preserve-origin-chaining
tags: data, state, naming
---

## Name Query and Mutation Bindings Consistently

**Impact: MEDIUM (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

Kubb가 생성한 API 훅의 지역 바인딩은 `use`와 요청 종류만 나타내는 앞부분을
`response` 또는 `mutation`으로 바꾸고 나머지 이름을 유지합니다.
`select`나 `combine`이 반환 형태를 바꿨을 때는 접두사 뒤에 결과 이름을 씁니다.

**Incorrect (쿼리와 뮤테이션 바인딩 이름이 제각각임):**

```ts
const responseGetProductListSuspense = useGetProductListSuspense();
const removeApi = useProductRemove();
```

**Correct (지역 바인딩 접두사를 통일):**

```ts
/**
 * 표에 그릴 product를 읽는다. 멈추는 동안은 섹션 소유자의 경계가 받는다
 */
const responseProductListSuspense = useGetProductListSuspense();

/**
 * 표에서 고른 product를 지운다. 성공 뒤 무효화는 부르는 화면이 맡는다
 */
const mutationProductRemove = useProductRemove();
```
