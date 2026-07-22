# Prefer React Handler Type Aliases Over Inline Event Parameter Annotations

**Impact: HIGH (React handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함)**

React가 제공하는 이벤트 핸들러 타입이나 prop callback 계약이 이미 있다면, 매개변수 타입보다 함수 변수 타입 선언을 우선합니다. React alias를 쓰기 위해 type import를 추가·변경하면 `ownership-avoid-barrel-and-react-namespace-imports`를 다시 판정합니다. 일반 TypeScript 함수 타입 규칙은 companion skill인 `convention-typescript`에서 다루고, 여기서는 React handler alias를 바로 쓰는 경우를 강조합니다.

**Requires selected:** `typescript/types-reuse-callback-signatures-from-existing-contracts` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/typing-function-type-first.md)을 추가로 읽고 fallback 사유를 기록합니다.
