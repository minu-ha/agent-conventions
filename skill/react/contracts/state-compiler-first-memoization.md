# Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (검증되지 않은 값어치 없이 노이즈만 늘리는 방어적 useMemo/useCallback을 피함)**

React 19 컴파일러가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 사용하지 않습니다.
외부 라이브러리가 참조 동일성에 민감하거나, 병목이 실제로 확인된 경우에만 허용하고
바로 위에 한글 주석으로 이유를 남깁니다.
`useDeferredValue`를 기준으로 무거운 파생 계산을 늦추는 경우처럼 render 비용 절감 목적이 분명한 예외는 허용할 수 있지만,
그때도 "정말 무거운 계산인지"가 먼저 확인되어야 합니다.

> 예시·예외가 필요하면 [full rule](../rules/state-compiler-first-memoization.md)을 읽습니다.
