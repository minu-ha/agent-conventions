# Avoid Boolean Prop Proliferation in Shared Components

**Impact: HIGH (공용 컴포넌트가 숨은 variant 조합을 쌓지 않고 명시적인 구조를 유지하게 합니다)**

여러 파일과 레이어에서 재사용되는 shared component에 `isCompact`, `isEditing`, `showSearch` 같은
boolean prop을 계속 추가하지 않습니다.
boolean이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어납니다.

- route entry 안의 일회성 분기는 로컬에서 유지해도 됩니다.
- shared `ui`나 `widget`는 explicit variant component나 compound component로 드러냅니다.
- `.Root` 같은 namespaced part 문법은 권장 예시일 뿐입니다.
  본질은 boolean을 없애고 구조를 명시적으로 드러내는 데 있습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-strategy-avoid-boolean-prop-proliferation.md)을 읽습니다.
