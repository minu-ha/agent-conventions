# Use Functional setState Updates When Based on Previous State

**Impact: MEDIUM-HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 바깥 변수를 직접 읽지 않고 함수형 갱신자를 씁니다.

실제로 결과가 갈리는 자리는 셋입니다.

- 한 이벤트 안에서 같은 상태를 두 번 이상 갱신할 때
- `await` 뒤에 갱신할 때
- 구독이나 타이머처럼 오래 사는 클로저 안에서 갱신할 때

클릭 핸들러에서 한 번만 부르는 갱신은 두 형태가 같은 결과를 냅니다.
리액트가 그 사이에 상태를 갱신해 두기 때문입니다.
그래도 형태를 하나로 고정해 자리마다 다시 판단하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/08-04-state-use-functional-setstate-updates.md)을 읽습니다.
