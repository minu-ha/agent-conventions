# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 prop보다 `children`과 namespaced 슬롯 부품을 우선합니다.
렌더 prop은 parent가 child에 item, index, 상태 같은 실행 환경 데이터를 전달해야 할 때만 사용합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-strategy-prefer-children-over-render-props.md)을 읽습니다.
