# Use Lazy State Initializers for Expensive Defaults

**Impact: MEDIUM (초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다)**

`useState` 초기값이 무거운 계산이면 값을 바로 넣지 않고 초기화 함수로 감쌉니다.
`localStorage` 파싱, 인덱스 생성, 큰 배열 정규화가 그런 계산입니다.
숫자나 문자열 같은 단순 값이나 프롭을 그대로 넘기는 자리는 감싸지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/10-02-perf-use-lazy-state-initializers-for-expensive-defaults.md)을 읽습니다.
