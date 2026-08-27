# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 렌더 프롭보다 `children`을 우선합니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 부모가 자식 자리를 열어 주기만 함 | `children`과 네임스페이스 슬롯 부품 |
| 부모가 자식에게 항목·순번·상태 같은 실행 환경 데이터를 넘겨야 함 | `renderHeader`, `renderFooter` 같은 렌더 프롭. 이때만 씁니다 |

계약에 이름이 필요하면 다음으로 짓습니다.

| 계약 | 이름 |
| --- | --- |
| 별도 이름이 필요한 `ReactNode` 값 | `<Owner>Slot` |
| 실행 문맥을 받아 `ReactNode`를 만드는 함수 | `<Owner>Renderer` |

한 번만 쓰는 익명 형태에 접미사를 붙이려고 새 타입을 만들지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-strategy-prefer-children-over-render-props.md)을 읽습니다.
