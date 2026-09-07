# Choose Single Components, Compound Components, and Variants Deliberately

**Impact: MEDIUM-HIGH (필요한 확장 범위에 맞춰 단순한 컴포넌트 구조를 선택합니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
표를 위에서부터 읽어 현재 필요한 단계까지만 적용합니다.

| 상황 | 선택 |
| --- | --- |
| 고정 UI | 단일 컴포넌트. 화면 지역 JSX로 둘지는 `screen-extract-local-section-components-for-runtime-boundaries`를 따릅니다 |
| 부품 조립만 필요함 | 상태 없는 합성 |
| 여러 부품이 같은 상태·동작·컨텍스트를 읽음 | 상태 있는 합성 |
| 같은 합성 조합이 반복됨 | 조합을 한 이름으로 감싼 변형 |

아래 예시는 같은 대화상자를 필요에 따라 확장합니다.
합성에 상태를 추가해도 사용처의 공개 이름은 유지하고, 반복되는 조합은 변형으로 감쌉니다.
렌더 프롭은 `strategy-prefer-children-over-render-props`를,
공개 부품의 범위는 `strategy-expose-only-assembled-compound-parts`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-strategy-choose-single-composition-compound-and-variants.md)을 읽습니다.
