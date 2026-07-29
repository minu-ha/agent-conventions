---
title: Shape React Query Data in query.select
impact: CRITICAL
impactDescription: 응답 변환을 fetch 경계 가까이에 두고 렌더 타임의 반복 매핑을 피함
appliesWhen: >-
  서버 응답의 list·items·meta 등을 렌더에서 가공·반복 소비하거나 React Query `select`의 결과 shape를 추가·변경한다.
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: state-name-query-and-mutation-bindings-consistently, state-preserve-origin-chaining
tags: state, react-query, select
---

## Shape React Query Data in query.select

**Impact: CRITICAL (응답 변환을 fetch 경계 가까이에 두고 렌더 타임의 반복 매핑을 피함)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다.
`data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 말고,
도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 hook 경계에서 풀 수 있는지 검토합니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const items = responseEntryListSuspense.data.list;
```

**Correct (패칭 시점에 필요한 모양으로 변환):**

```ts
/**
 * @api entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  query: {
    select: (response) => ({
      items: response.data.list,
    }),
  },
});
```
