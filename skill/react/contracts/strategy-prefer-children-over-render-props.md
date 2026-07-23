# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (keeps shared component composition readable when the parent does not need to push runtime data through callbacks)**

shared component가 `stateless compound component`로 충분할 때는 `renderHeader`, `renderFooter` 같은 render prop보다 `children`과 namespaced slot part를 우선합니다.\
render prop은 parent가 child에 item, index, state 같은 runtime 데이터를 전달해야 할 때만 사용합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/strategy-prefer-children-over-render-props.md)을 추가로 읽고 fallback 사유를 기록합니다.
