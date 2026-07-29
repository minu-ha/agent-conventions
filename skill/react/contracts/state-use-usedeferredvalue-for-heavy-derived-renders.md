# Use useDeferredValue for Heavy Derived Renders

**Impact: MEDIUM (keeps typing and small interactions responsive while expensive derived views catch up)**

검색어, 필터, 정렬 입력이 무거운 파생 렌더를 유발하면 원본 입력값을 그대로 expensive view에 연결하지 않습니다.
`useDeferredValue`로 한 박자 늦춘 값을 만들고, 필요한 경우 그 값을 기준으로 필터링이나 정렬을 계산합니다.
이 규칙은 실제로 렌더 지연이 느껴질 때 적용합니다.
작은 배열이나 단순 문자열 가공까지 습관적으로 defer하지는 않습니다.
또한 이 경우의 `useMemo`는 `state-compiler-first-memoization` 규칙의 예외적인 허용 사례입니다.
deferred value를 기준으로 expensive 계산을 다시 돌리는 비용이 실제로 크고,
render마다 같은 작업을 반복하지 않으려는 목적이 분명할 때만 함께 사용합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/state-use-usedeferredvalue-for-heavy-derived-renders.md)을 추가로 읽고 fallback 사유를 기록합니다.
