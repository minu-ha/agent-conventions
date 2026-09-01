# Shape React Query Data in query.select

**Impact: MEDIUM-HIGH (변환이 통신 경계 한 곳에 모여 화면이 응답 원본 구조를 모릅니다)**

서버 응답 가공은 화면 본문이 아니라 `query.select`에서 처리합니다.

- `.map`·`.filter`·필드 이름 바꾸기 같은 변환을 화면에서 하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 `select`에서 한 번 변환합니다.
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

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-02-data-shape-query-data-with-select.md)을 읽습니다.
