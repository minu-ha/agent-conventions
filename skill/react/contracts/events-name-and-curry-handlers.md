# Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 피함)**

이벤트 핸들러는 `handle` 접두사와 역할명을 사용합니다.
DOM event면 `handle + Target + Event`, action 문맥이 분명하면 `handle + DomainAction`을 사용합니다.
DOM React event prop의 인라인 callback을 새 `handle*`로 추출하며
event 외 추가 인자가 필요하면
factory가 event boundary를 소유합니다. `onClick={() => handleSelectionToggle(id)}` wrapper는 완료가 아닙니다.
`(id): MouseEventHandler<Element> => (_event) => ...` 반환값을 JSX에 직접 전달합니다.

최종 반환 React handler는 `typing-function-type-first`를 재판정합니다.
alias나 prop callback 계약을 쓸 수 있으면 그 규칙은 Selected이며 contextual typing으로 숨기지 않습니다.

기존 UI-agnostic domain command나 custom component prop callback이 `(id) => void`이면 direct callback이나 최소 adapter를
유지합니다. `useEffectEvent`에도 계약에 없는 DOM event 또는 curry를 만들지 않으며 이 경우 React DOM handler typing은
N/A입니다.

> 예시·예외가 필요할 때만 [full rule](../rules/events-name-and-curry-handlers.md)을 추가로 읽고 fallback 사유를 기록합니다.
