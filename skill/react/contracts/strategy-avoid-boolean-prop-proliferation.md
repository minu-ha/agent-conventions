# Avoid Boolean Prop Proliferation in Shared Components

**Impact: MEDIUM-HIGH (모드별 분기와 조합을 컴포넌트 구조에서 확인할 수 있습니다)**

여러 파일·레이어에서 재사용하는 공용 `ui`·`widget`은 모드별 불리언 조합 대신 구조를 드러냅니다.
`isCompact`·`isEditing`·`showSearch`가 늘어나면 가능한 조합과 JSX·스타일 분기도 함께 늘어납니다.

| 조건 | 판단 |
| --- | --- |
| 모양이나 모드를 정하는 불리언이 둘 이상임 | 변형 또는 합성 컴포넌트로 구조를 다시 고릅니다 |
| 같은 불리언을 JSX 분기와 클래스 조건에 함께 사용함 | 변형 또는 합성 컴포넌트로 구조를 다시 고릅니다 |
| `disabled`, `checked`, `selected`, `open`처럼 독립 상태를 나타냄 | 유지합니다. 불리언이라는 이유만으로 없애지 않습니다 |

불리언 개수 자체보다 서로 배타적인 모드를 조합으로 표현하는지 확인합니다.
공개 부품을 `.Root`처럼 묶는 형태는 `strategy-choose-single-composition-compound-and-variants`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/04-03-strategy-avoid-boolean-prop-proliferation.md)을 읽습니다.
