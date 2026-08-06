# Shape React Query Data in query.select

**Impact: MEDIUM-HIGH (변환이 통신 경계 한 곳에 모여 화면이 응답 원본 구조를 모릅니다)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다.

- `data.list` 같은 응답 원본 구조를 화면 여러 군데에서 직접 해석하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
- 여러 쿼리 결과를 함께 가공하는 것은 `select`로 할 수 없습니다.
  `select`는 자기 쿼리 데이터만 받습니다.
  그 자리는 `data-combine-multiple-queries-with-combine`가 정합니다.

**`select`는 인라인으로 적습니다.**
인라인이면 렌더마다 다시 도는데, 그 비용은 렌더 중에 값을 계산하는 것과 같습니다.
`state-calculate-derived-values-during-render`가 이미 허용하는 자리입니다.

변환이 무겁다는 근거가 `perf-avoid-defensive-memoization`이 요구하는 만큼 있으면
그때만 같은 파일 위쪽의 모듈 최상위 상수로 빼서 참조를 고정합니다.
결과는 구조 공유되어 참조가 안정적이므로 `useMemo`로 감싸지 않습니다.

`select` 안 변환 함수는 이 규칙이 담당합니다.
별도 함수나 보조 모듈 경계가 없으면 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`은
적용하지 않습니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-02-data-shape-query-data-with-select.md)을 읽습니다.
