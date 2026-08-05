# Combine Multiple Queries With `useQueries` and `combine`

**Impact: HIGH (여러 응답을 합치는 자리가 통신 경계에 남고 화면 본문에 별칭이 쌓이지 않습니다)**

쿼리 결과 둘 이상을 하나의 값으로 합쳐야 하면 `useQueries`에 `combine`을 넘깁니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 결과 둘 이상을 하나의 값으로 합친다 | `useQueries` + `combine` |
| 각각 따로 그린다 | 합치지 않고 훅을 따로 부릅니다 |
| 뒤 쿼리가 앞 결과를 입력으로 받는다 | `combine`이 아니라 `enabled`로 순서를 만듭니다 |

`select`로는 못 합니다.
`select`는 자기 쿼리 데이터만 받습니다.
한 쿼리를 가공하는 자리는 `data-shape-query-data-with-select`가 정합니다.

화면 본문에서 두 `data`를 꺼내 합치지 않습니다.
합친 값이 화면 위쪽 `const`로 남아 출처를 잃습니다.
`screen-keep-derived-values-close`가 그것을 막습니다.

**`combine` 함수는 모듈 최상위 상수로 둡니다.**
라이브러리가 이전 `combine`과 같은 함수인지로 재실행을 가르는데,
인라인 화살표는 렌더마다 새 함수라 그 비교가 늘 어긋나 매번 다시 돕니다.
`select`도 같은 이유로 같은 처방을 씁니다.

합친 결과는 구조 공유되어 참조가 안정적입니다.
그래서 `useMemo`로 다시 감싸지 않습니다.
`perf-avoid-defensive-memoization`이 그것을 막습니다.

> 예시·예외가 필요하면 [full rule](../rules/07-03-data-combine-multiple-queries-with-combine.md)을 읽습니다.
