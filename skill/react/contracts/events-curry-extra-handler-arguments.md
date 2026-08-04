# Curry Extra Arguments Into DOM Event Handlers

**Impact: MEDIUM-HIGH (JSX에 즉흥적인 래퍼 화살표가 쌓이지 않습니다)**

`onClick`, `onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면
팩토리가 인자를 받고 안쪽 함수가 이벤트를 받습니다.

반환값을 JSX에 그대로 전달합니다.
`onClick={() => handleSelectionToggle(id)}`처럼 감싸는 화살표를 만들지 않습니다.

- 팩토리 반환 타입은 `typing-take-handler-types-from-existing-contracts`를 따라 리액트 별칭으로 고정합니다.
- 이벤트 객체를 받지 않는 프롭 콜백은 대상이 아닙니다.
  `(id) => void` 계약이면 이름 붙인 핸들러를 그대로 넘깁니다.
- `useEffectEvent`로 만든 함수에는 DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다.

**Requires selected:** `typing-take-handler-types-from-existing-contracts` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/06-03-events-curry-extra-handler-arguments.md)을 읽습니다.
