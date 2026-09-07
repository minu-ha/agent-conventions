# Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (콜백은 최신 값을 읽고 이펙트는 구독 조건의 변화에만 반응합니다)**

구독 이펙트의 콜백이 최신 프롭스·상태를 읽되 그 값 때문에 재구독할 필요가 없다면 `useEffectEvent`를 씁니다.
연결 대상·구독 조건처럼 바뀌면 재설치해야 하는 값은 이펙트 의존성에 남깁니다.

| 조건 | 처리 |
| --- | --- |
| 리액트 19.2 이상 | 비반응형 콜백에 `ref` 우회 대신 `useEffectEvent`를 씁니다 |
| 리액트 19.2 미만 | 의존성에 따른 재구독을 먼저 검토하고, 최신 콜백만 바꿔야 할 때 `ref` 동기화를 검토합니다 |
| 클릭·제출 등 사용자 액션 | 이름 붙인 핸들러에 둡니다. 이펙트로 옮기지 않습니다 |
| Effect Event 호출 | 같은 컴포넌트의 이펙트나 다른 Effect Event 안에서만 호출합니다 |
| Effect Event 전달 | 다른 컴포넌트·훅·JSX 이벤트 프롭에 넘기지 않습니다 |

반환 함수는 참조 동일성을 보장하지 않으며 이펙트 의존성에 넣지 않습니다.
DOM 이벤트 매개변수나 커링을 덧붙이지 않고,
`typing-take-handler-types-from-existing-contracts`의 리액트 핸들러 타입 규칙도 적용하지 않습니다.
의존성 경고를 없애려고 반응해야 할 값까지 감싸지 않습니다.

린터의 인식 여부도 확인합니다. 리액트 19.2 문서가 요구하는 최신 `eslint-plugin-react-hooks`를 사용하고,
`biome`도 `useEffectEvent`를 인식하는 최근 버전을 씁니다. 이전 버전은 아래 Correct 예제를 훅 규칙 위반으로 표시합니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/08-05-state-use-effectevent-for-non-reactive-effect-callbacks.md)을 읽습니다.
