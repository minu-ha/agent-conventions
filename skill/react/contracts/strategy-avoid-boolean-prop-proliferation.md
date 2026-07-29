# Avoid Boolean Prop Proliferation in Shared Components

**Impact: HIGH (exported shared components stay explicit instead of accumulating hidden variant combinations)**

여러 파일과 레이어에서 재사용되는 shared component에 `isCompact`,
`isEditing`,
`showSearch` 같은 boolean prop을 계속 추가하지 않습니다.
boolean이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어나기 때문입니다.
이 규칙은 exported shared component에 적용합니다.
route entry 안의 일회성 분기는 로컬에서 유지할 수 있지만,
shared `ui`나 `widget`는 explicit variant component나 compound component로 드러냅니다. `.Root` 같은 namespaced part
문법은 권장 예시일 뿐이고,
이 규칙의 본질은 boolean을 없애고 구조를 명시적으로 드러내는 데 있습니다.

> 예시·예외가 필요하면 [full rule](../rules/strategy-avoid-boolean-prop-proliferation.md)을 읽습니다.
