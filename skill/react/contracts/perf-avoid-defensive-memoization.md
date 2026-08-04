# Do Not Memoize Without a Confirmed Reason

**Impact: MEDIUM-HIGH (효과를 확인하지 않은 방어적 `useMemo`, `useCallback` 을 막습니다)**

`useMemo`와 `useCallback`은 기본적으로 쓰지 않습니다.
쓰는 경우는 다음 넷뿐이며, 어느 경우든 바로 위에 한국어 주석으로 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 병목이 실제로 측정됐을 때
- `useDeferredValue` 기준으로 무거운 파생 계산을 늦출 때
- 리액트 컴파일러를 아직 켜지 않아 프로젝트가 수동 메모이제이션을 표준으로 쓸 때

마지막 경우에도 규칙은 같습니다. 감으로 붙이지 않고 무거운 계산인지 먼저 확인합니다.
리액트 컴파일러가 켜져 있으면 처음 셋 말고는 손대지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/09-01-perf-avoid-defensive-memoization.md)을 읽습니다.
