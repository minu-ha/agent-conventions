# Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 피함)**

이벤트 핸들러는 `handle` 접두사로 시작하고 역할이 바로 드러나게 이름 짓습니다.
DOM 이벤트처럼 target과 event가 중요하면 `handle + Target + Event` 패턴을 우선하고, submit/save/message처럼 문맥상 target이 이미 분명한 action callback은 `handle + DomainAction`처럼 더 짧게 둘 수 있습니다.
추가 인자가 필요하면 handler factory 형태의 고차 함수로 감싸고, 최종 반환값은 React handler 타입으로 고정합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/events-name-and-curry-handlers.md)을 추가로 읽고 fallback 사유를 기록합니다.
