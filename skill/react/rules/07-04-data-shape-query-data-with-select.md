---
title: Shape React Query Data in query.select
titleKo: 응답 가공은 질의.select 에서 합니다
impact: CRITICAL
impactDescription: 변환을 통신 경계 가까이 두고 렌더마다 다시 매핑하지 않습니다
appliesWhen:
  - 서버 응답의 list·items·meta 등을 렌더에서 가공하거나 반복 소비할 때
  - React Query `select`의 결과 shape를 추가·변경할 때
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
tags: state, react-query, select
---

## Shape React Query Data in query.select

**Impact: CRITICAL (변환을 통신 경계 가까이 두고 렌더마다 다시 매핑하지 않습니다)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다.

- `data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
- 여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 훅 경계에서 풀 수 있는지 봅니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const items = responseEntryListSuspense.data.list;
```

**Correct (fetch 시점에 필요한 모양으로 변환):**

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
