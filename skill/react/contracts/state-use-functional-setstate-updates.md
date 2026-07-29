# Use Functional setState Updates When Based on Previous State

**Impact: MEDIUM-HIGH (prevents stale closure bugs when the next value depends on the current state)**

다음 state가 현재 state 값에 의존하면 직접 바깥 변수를 참조하지 말고 functional updater를 사용합니다.
특히 handler, async callback, 여러 번 연속 호출될 수 있는 갱신에서는 stale closure를 막는 데 중요합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/state-use-functional-setstate-updates.md)을 추가로 읽고 fallback 사유를 기록합니다.
