# Shape React Query Data in query.select

**Impact: MEDIUM-HIGH (응답 가공을 쿼리에 모아 화면이 원본 구조에 의존하지 않게 합니다)**

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

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-02-data-shape-query-data-with-select.md)을 읽습니다.
