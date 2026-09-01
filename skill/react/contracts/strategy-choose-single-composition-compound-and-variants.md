# Choose Single Components, Compound Components, and Variants Deliberately

**Impact: MEDIUM-HIGH (필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
표를 위에서부터 읽어 지금 필요한 것까지 내려갑니다.
마지막 줄은 앞 줄을 대체하지 않고 그 조립을 한 이름으로 감쌉니다.

| 상황 | 선택 |
| --- | --- |
| 고정 UI | 단일 컴포넌트. 화면 지역 JSX로 둘지는 `screen-extract-local-section-components-for-runtime-boundaries`가 정합니다 |
| 부품 조립만 필요함 | 상태 없는 합성 |
| 여러 부품이 같은 상태·동작·컨텍스트를 읽음 | 상태 있는 합성 |
| 같은 합성 조합이 반복됨 | 드러난 변형 |

아래 네 예시는 같은 대화상자 하나를 네 단계로 끌고 갑니다.
필요가 늘 때 앞 단계에서 다음 단계로만 넘어갑니다.
합성으로 연 뒤에는 상태를 더해도 사용처가 쓰는 이름이 그대로입니다.

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.
무엇을 공개 부품으로 열지는 `strategy-expose-only-assembled-compound-parts`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-strategy-choose-single-composition-compound-and-variants.md)을 읽습니다.
