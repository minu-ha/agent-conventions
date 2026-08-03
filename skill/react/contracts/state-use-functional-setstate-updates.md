# Use Functional setState Updates When Based on Previous State

**Impact: MEDIUM-HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 직접 바깥 변수를 참조하지 말고 함수형 갱신자를 사용합니다.
특히 핸들러, 비동기 콜백, 여러 번 연속 호출될 수 있는 갱신에서는 낡은 값 붙잡기를 막는 데 중요합니다.

> 예시·예외가 필요하면 [full rule](../rules/08-04-state-use-functional-setstate-updates.md)을 읽습니다.
