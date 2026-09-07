# Name Handlers Predictably

**Impact: MEDIUM (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사에 대상과 역할을 붙입니다.
표를 위에서부터 읽어 처음 해당하는 형태를 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 객체를 받음 | `handle + Target + Event` |
| 이벤트 객체를 받지 않는 도메인 콜백 | `handle + DomainAction` |

`on*`은 프롭 이름에만 씁니다. `onClick`을 처리하는 구현은 `handleRowClick`처럼 이름 짓습니다.
같은 컴포넌트에서 이름이 겹치지 않도록 대상이 다르면 대상 이름을 넣습니다.
추가 인자 전달은 `events-curry-extra-handler-arguments`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/09-01-events-name-handlers-predictably.md)을 읽습니다.
