# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 프롭보다 `children`과 네임스페이스 슬롯 부품을 우선합니다.
렌더 프롭은 부모가 자식에게 항목, 순번, 상태 같은 실행 환경 데이터를 전달해야 할 때만 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-strategy-prefer-children-over-render-props.md)을 읽습니다.
