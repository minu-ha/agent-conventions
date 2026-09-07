---
title: Shape React Query Data in query.select
titleKo: 응답 가공은 `query.select`에서 합니다
impact: HIGH
impactDescription: 응답 가공을 쿼리에 모아 화면이 원본 구조에 의존하지 않게 합니다
appliesWhen:
  - 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때
  - React Query `select`의 결과 형태를 추가·변경할 때
  - 제외: 이미 가공한 항목을 `.map`으로 JSX 요소에 대응시키기만 하는 경우
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
tags: data, state, react-query
---

## Shape React Query Data in query.select

**Impact: HIGH (응답 가공을 쿼리에 모아 화면이 원본 구조에 의존하지 않게 합니다)**

서버 응답은 `query.select`에서 도메인 필드로 가공하고, 화면에서는 그 결과를 렌더합니다.

| 작업 | 처리 위치 |
| --- | --- |
| `.map`, `.filter`·필드 이름 변경 등 응답 가공 | `query.select` |
| 가공한 항목을 `.map`으로 JSX에 대응시키기 | 화면 렌더. JSX 요소와 클릭 핸들러를 `select` 결과에 넣지 않습니다 |
| 여러 쿼리 결과를 함께 가공 | `data-combine-multiple-queries-with-combine`. `select`는 자기 쿼리 데이터만 받습니다 |

`select`는 인라인으로 적습니다. 해당 구독자가 읽는 결과만 바꾸며 쿼리 캐시의 원본을 덮어쓰지 않습니다.
기본 구조 공유는 JSON으로 표현할 수 있는 데이터에서 바뀌지 않은 부분의 참조를 유지합니다.
인라인 함수는 참조가 달라져 다시 실행될 수 있으며, 구조 공유가 계산 자체를 생략하지는 않습니다.
재실행만을 이유로 `useCallback`·`useMemo`를 더하지 않고,
실측 병목이 있을 때만 `perf-avoid-defensive-memoization`의 예외 기준을 따릅니다.

`select` 내부 변환은 이 규칙이 담당합니다. 별도 함수나 보조 모듈 경계가 없으면
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`은 적용하지 않습니다.

**Incorrect (렌더에서 응답 원본 구조를 가공합니다):**

```tsx
const responseProductListSuspense = useProductListSuspense();

<UiTable
	rows={responseProductListSuspense.data.list.map((product) => ({
		id: product.id,
		label: product.title,
	}))}
/>;
```

**Correct (`query.select`에서 화면에 필요한 형태로 가공합니다):**

```tsx
/**
 * 표가 그대로 쓰는 필드 이름으로 목록을 바꿔서 화면이 응답 구조를 모르게 한다
 */
const responseProductListSuspense = useProductListSuspense(
	{},
	{
		query: {
			select: (response) => ({
				items: response.data.list.map((product) => ({id: product.id, label: product.title})),
			}),
		},
	},
);

<UiTable rows={responseProductListSuspense.data.items} />;
```
