---
title: Shape React Query Data in query.select
titleKo: 응답 가공은 `query.select` 에서 합니다
impact: CRITICAL
impactDescription: 변환이 통신 경계 한 곳에 모여 화면이 응답 원형을 모릅니다
appliesWhen:
  - 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때
  - 리액트 Query `select`의 결과 형태를 추가·변경할 때
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
tags: state, react-query, select
---

## Shape React Query Data in query.select

**Impact: CRITICAL (변환이 통신 경계 한 곳에 모여 화면이 응답 원형을 모릅니다)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다.

- `data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
- 여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 훅 경계에서 풀 수 있는지 봅니다.

`select` 안 변환 함수는 이 규칙이 담당합니다.
별도 함수나 보조 모듈 경계가 없으면 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`은
적용하지 않습니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const items = responseEntryListSuspense.data.list;
```

**Correct (통신 경계에서 화면이 쓸 모양으로 변환):**

```ts
/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  query: {
    select: (response) => ({
      items: response.data.list,
    }),
  },
});
```
