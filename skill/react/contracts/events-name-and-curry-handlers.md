# Name Handlers Predictably

**Impact: MEDIUM-HIGH (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 | `handle + Target + Event` |
| 동작 문맥이 분명할 때 | `handle + DomainAction` |

- `on*`은 프롭 이름입니다. 구현에는 쓰지 않습니다.
  `onClick`을 받아 처리하는 함수는 `handleRowClick`입니다.
- 같은 컴포넌트에 같은 이름의 핸들러를 두지 않습니다. 대상이 다르면 대상 이름을 넣습니다.
- 추가 인자를 어떻게 넘길지는 `events-curry-extra-handler-arguments`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-02-events-name-and-curry-handlers.md)을 읽습니다.
