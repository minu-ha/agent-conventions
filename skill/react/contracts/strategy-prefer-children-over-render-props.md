# Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (실행 문맥이 필요 없는 조립을 JSX 구조로 바로 읽을 수 있습니다)**

상태 없는 합성으로 충분한 공용 컴포넌트는 렌더 프롭보다 `children`을 우선합니다.

| 상황 | 선택 |
| --- | --- |
| 부모가 자식 자리만 열어 줌 | `children`과 네임스페이스 슬롯 부품 |
| 부모가 항목·순번·상태 같은 실행 문맥을 자식에게 전달해야 함 | 이때만 `renderHeader`, `renderFooter` 같은 렌더 프롭을 씁니다 |

| 별도 이름이 필요한 계약 | 이름 |
| --- | --- |
| `ReactNode` 값 | `<Owner>Slot` |
| 실행 문맥을 받아 `ReactNode`를 만드는 함수 | `<Owner>Renderer` |

한 번만 쓰는 익명 형태에 접미사를 붙이려고 새 타입을 만들지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-strategy-prefer-children-over-render-props.md)을 읽습니다.
