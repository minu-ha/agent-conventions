# Use Functional setState Updates When Based on Previous State

**Impact: HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 바깥 변수를 직접 읽지 않고 함수형 업데이터를 씁니다.

한 이벤트 안에서 두 번 갱신하거나, `await` 뒤나 오래 사는 클로저 안에서 갱신하면 결과가 갈립니다.
한 번만 부르는 갱신은 두 형태가 같은 결과를 내지만, 형태를 하나로 고정해 자리마다 다시 판단하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/08-04-state-use-functional-setstate-updates.md)을 읽습니다.
