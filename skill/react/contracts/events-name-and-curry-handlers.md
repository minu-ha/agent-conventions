# Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색할 수 있고 즉흥적인 시그니처가 생기지 않습니다)**

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 | `handle + Target + Event` |
| 동작 문맥이 분명할 때 | `handle + DomainAction` |

커링은 DOM 이벤트 프롭에만 요구합니다.
`onClick`, `onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면 팩토리가 이벤트 경계를 소유합니다.
`(id): MouseEventHandler<Element> => (_event) => ...` 반환값을 JSX에 직접 전달합니다.
`onClick={() => handleSelectionToggle(id)}` 같은 래퍼로 우회한 상태는 이 규칙을 만족하지 않습니다.

- 최종 반환 리액트 핸들러는 `typing-function-type-first`를 다시 판단합니다.
  별칭이나 프롭 콜백 계약을 쓸 수 있으면 그 규칙도 함께 적용하고 문맥 타입 지정으로 숨기지 않습니다.
- 이벤트 객체를 받지 않는 프롭 콜백은 커링 대상이 아닙니다.
  `(id) => void` 계약이면 이름 붙인 핸들러를 그대로 넘깁니다. 감싸는 화살표를 새로 만들지 않습니다.
- `useEffectEvent`에도 계약에 없는 DOM 이벤트나 커링를 만들지 않습니다.
  이 경우 리액트 DOM 핸들러 타입 지정 규칙은 적용하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/06-02-events-name-and-curry-handlers.md)을 읽습니다.
