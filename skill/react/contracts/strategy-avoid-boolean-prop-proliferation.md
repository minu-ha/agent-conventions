# Avoid Boolean Prop Proliferation in Shared Components

**Impact: MEDIUM-HIGH (공용 컴포넌트가 숨은 조합을 쌓지 않고 구조를 드러냅니다)**

여러 파일과 레이어에서 재사용되는 공용 컴포넌트에 불리언 프롭을 늘리지 않습니다.
`isCompact`, `isEditing`, `showSearch`처럼 모양이나 모드를 정하는 프롭이 그것입니다.
불리언이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어납니다.

두 신호 중 하나라도 보이면 구조를 다시 고릅니다.

- 모양이나 모드를 정하는 불리언 프롭이 둘 이상입니다.
- 같은 불리언이 JSX 분기와 클래스 조건에 동시에 쓰입니다.

| 자리 | 판정 |
| --- | --- |
| 라우트 진입 안의 일회성 분기 | 로컬 불리언으로 유지해도 됩니다 |
| 공용 `ui`·`widget` | 변형 컴포넌트나 합성 컴포넌트로 구조를 드러냅니다 |

`.Root` 같은 네임스페이스 부품 문법은 권장 예시일 뿐입니다.
본질은 불리언을 없애고 구조를 명시적으로 드러내는 데 있습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-03-strategy-avoid-boolean-prop-proliferation.md)을 읽습니다.
