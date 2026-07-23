# Compose Classes With `clsx()`

**Impact: HIGH (keeps TSX class composition readable when base classes and state modifiers need to be combined)**

TSX에서 `className`은 `clsx()` 사용을 기본으로 합니다. 기본 element 클래스 하나만 넣는 경우도 같은 기준을 유지하고, 상태 modifier나 optional class가 붙어도 읽기 쉽게 확장합니다. 문자열 연결이나 중복 ternary로 `className`을 조립하지 않습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-compose-classes-with-clsx.md)을 추가로 읽고 fallback 사유를 기록합니다.
