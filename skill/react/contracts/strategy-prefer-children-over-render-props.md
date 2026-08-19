# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 프롭보다 `children`과 네임스페이스 슬롯 부품을 우선합니다.
렌더 프롭은 부모가 자식에게 항목, 순번, 상태 같은 실행 환경 데이터를 전달해야 할 때만 씁니다.

별도 이름이 필요한 `ReactNode` 값 계약은 `<Owner>Slot`, 실행 문맥을 받아
`ReactNode`를 만드는 함수 계약은 `<Owner>Renderer`로 짓습니다.
한 번만 쓰는 익명 형태에 접미사를 붙이려고 새 타입을 만들지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-strategy-prefer-children-over-render-props.md)을 읽습니다.
