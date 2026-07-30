# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 callback으로 런타임 데이터를 내려보낼 필요가 없을 때 공용 컴포넌트 조립을 읽기 쉽게 유지합니다)**

shared component가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 render prop보다 `children`과 namespaced slot part를 우선합니다.
render prop은 parent가 child에 item, index, state 같은 runtime 데이터를 전달해야 할 때만 사용합니다.

> 예시·예외가 필요하면 [full rule](../rules/strategy-prefer-children-over-render-props.md)을 읽습니다.
