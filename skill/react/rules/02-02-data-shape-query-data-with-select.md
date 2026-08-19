---
title: Shape React Query Data in query.select
titleKo: 응답 가공은 `query.select`에서 합니다
impact: MEDIUM-HIGH
impactDescription: 변환이 통신 경계 한 곳에 모여 화면이 응답 원본 구조를 모릅니다
appliesWhen:
  - 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때
  - React Query `select`의 결과 형태를 추가·변경할 때
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
tags: data, state, react-query
---

## Shape React Query Data in query.select

**Impact: MEDIUM-HIGH (변환이 통신 경계 한 곳에 모여 화면이 응답 원본 구조를 모릅니다)**

서버 응답 가공은 화면 본문이 아니라 `query.select`에서 처리합니다.

- `data.list` 같은 응답 원본 구조를 화면 여러 군데에서 직접 해석하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
- 여러 쿼리 결과를 함께 가공하는 것은 `select`로 할 수 없습니다.
  `select`는 자기 쿼리 데이터만 받습니다.
  그 자리는 `data-combine-multiple-queries-with-combine`이 정합니다.

**`select`는 인라인으로 적습니다.**
다시 실행된다는 이유만으로 `useCallback`이나 `useMemo`로 감싸지 않습니다.
React Query의 구조 공유가 바뀌지 않은 부분의 참조를 유지합니다.
실측 병목일 때만 `perf-avoid-defensive-memoization`의 예외 기준을 따릅니다.

`select` 안 변환 함수는 이 규칙이 담당합니다.
별도 함수나 보조 모듈 경계가 없으면 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`은
적용하지 않습니다.

**Incorrect (렌더에서 응답 원본 구조를 가공):**

```tsx
<UiTable
	dataSource={responseProductListSuspense.data.list.map((product) => ({
		id: product.id,
		label: product.title,
	}))}
/>;
```

**Correct (통신 경계에서 화면이 쓸 모양으로 변환):**

```ts
/**
 * 표가 그대로 쓰는 필드 이름으로 목록을 바꿔서 화면이 응답 구조를 모르게 한다
 */
const responseProductListSuspense = useProductListSuspense(
	{},
	{query: {select: (response) => ({items: response.data.list})}},
);
```
