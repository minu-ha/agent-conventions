# Use Lazy State Initializers for Expensive Defaults

**Impact: MEDIUM (prevents repeated setup work when the initial state is expensive to compute)**

`useState` 초기값이 localStorage 파싱, 인덱스 생성,
큰 배열 정규화처럼 무거운 계산이라면 값을 바로 넣지 말고 initializer 함수로 감쌉니다.
싼 literal이나 단순 prop passthrough까지 전부 함수형으로 감쌀 필요는 없습니다.

> 예시·예외가 필요하면 [full rule](../rules/state-use-lazy-state-initializers-for-expensive-defaults.md)을 읽습니다.
