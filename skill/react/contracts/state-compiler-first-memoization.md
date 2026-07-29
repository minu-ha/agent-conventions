# Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (검증되지 않은 값어치 없이 노이즈만 늘리는 방어적 useMemo/useCallback을 피함)**

React 19 컴파일러가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 쓰지 않습니다.

허용하는 경우는 셋뿐이고, 어느 쪽이든 바로 위에 한글 주석으로 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 병목이 실제로 확인됐을 때
- `useDeferredValue` 기준으로 무거운 파생 계산을 늦출 때

마지막 경우에도 정말 무거운 계산인지를 먼저 확인합니다.

> 예시·예외가 필요하면 [full rule](../rules/state-compiler-first-memoization.md)을 읽습니다.
