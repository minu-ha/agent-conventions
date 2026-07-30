# Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (분기로 공유 지역 변수를 변형하지 않고 파일 전역 로직을 선언적으로 유지함)**

파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 하지 않습니다.
단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산하고, 분기와 보정이 결합된 계산은 `resolve*`, `build*`,
`normalize*` 형태 유틸로 분리합니다.

> 예시·예외가 필요하면 [full rule](../rules/functions-avoid-imperative-assembly-in-wide-scopes.md)을 읽습니다.
