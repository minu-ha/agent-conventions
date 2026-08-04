# Use useDeferredValue for Heavy Derived Renders

**Impact: MEDIUM (무거운 화면이 따라오는 동안에도 입력과 작은 조작이 반응합니다)**

검색어, 필터, 정렬 입력이 무거운 파생 렌더를 유발하면 원본 입력값을 그대로 무거운 화면에 연결하지 않습니다.
`useDeferredValue`로 한 박자 늦춘 값을 만들고, 필요하면 그 값을 기준으로 필터링이나 정렬을 계산합니다.

- 작은 배열이나 단순 문자열 가공까지 습관적으로 지연하지 않습니다.
- 이 경우의 `useMemo`는 `perf-avoid-defensive-memoization`의 예외적 허용 사례입니다.
  지연 값 기준 재계산 비용이 실제로 크고,
  렌더마다 같은 작업을 반복하지 않으려는 목적이 분명할 때만 함께 씁니다.

내가 부르는 `setState`가 원인이면 이 규칙이 아니라
`perf-use-starttransition-for-non-urgent-updates`로 그 호출을 감쌉니다.
입력은 즉시 반응해야 하고 비용이 그 값에서 파생되는 렌더에 있을 때 이 규칙을 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/09-04-perf-use-usedeferredvalue-for-heavy-derived-renders.md)을 읽습니다.
