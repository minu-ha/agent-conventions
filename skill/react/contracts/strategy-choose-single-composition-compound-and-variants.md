# Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
고정 UI, 공개 부품 조립, 공용 상태/동작/컨텍스트, 반복 기본 설정 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 화면 지역 JSX |
| 부품 조립만 필요함 | `stateless compound component` |
| 여러 부품이 같은 상태/동작/컨텍스트를 읽음 | `stateful compound component` |
| 같은 합성 조합이 반복됨 | `explicit variant component` |

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.

공개 부품은 소비자가 이름으로 조립해야 하거나 공용 컨텍스트/동작을 직접 쓰는 영역만 공개합니다.
단순 class 래퍼, 여백 보정 DOM, 내부 레이아웃 보조 함수는 숨깁니다.
상태 없는 합성에 상태가 필요해지면 공개 이름은 유지하고 컨텍스트만 추가합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-02-strategy-choose-single-composition-compound-and-variants.md)을 읽습니다.
