# Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 막습니다)**

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM event | `handle + Target + Event` |
| action 문맥이 분명할 때 | `handle + DomainAction` |

인라인 callback을 `handle*`로 추출할 때 event 외 추가 인자가 필요하면 factory가 event boundary를 소유합니다.
`(id): MouseEventHandler<Element> => (_event) => ...` 반환값을 JSX에 직접 전달합니다.
`onClick={() => handleSelectionToggle(id)}` 같은 wrapper로 우회한 상태는 이 규칙을 만족하지 않습니다.

- 최종 반환 React handler는 `typing-function-type-first`를 다시 판단합니다.
  alias나 prop callback 계약을 쓸 수 있으면 그 규칙도 함께 적용하고 contextual typing으로 숨기지 않습니다.
- 기존 UI-agnostic domain command나 custom component prop callback이 `(id) => void`이면
  direct callback이나 최소 adapter를 유지합니다.
- `useEffectEvent`에도 계약에 없는 DOM event나 curry를 만들지 않습니다.
  이 경우 React DOM handler typing 규칙은 적용하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/06-02-events-name-and-curry-handlers.md)을 읽습니다.
