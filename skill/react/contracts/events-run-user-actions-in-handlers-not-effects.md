# Run User Actions in Handlers, Not Effects

**Impact: HIGH (한 번뿐인 동작을 상태와 이펙트 재실행으로 대신하지 않습니다)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 핸들러 안에서 바로 실행합니다.
액션 자체를 상태로 올린 뒤 `useEffect`가 나중에 실행하게 만들면 무관한 의존성 변화에도 재실행되기 쉽고,
흐름도 읽기 어려워집니다.

> 예시·예외가 필요하면 [full rule](../rules/09-03-events-run-user-actions-in-handlers-not-effects.md)을 읽습니다.
