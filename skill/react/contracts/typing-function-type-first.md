# Prefer React Handler Type Aliases Over Inline Event Parameter Annotations

**Impact: HIGH (React handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함)**

React가 제공하는 이벤트 핸들러 타입이나 prop callback 계약이 이미 있다면,
매개변수 타입보다 함수 변수 타입 선언을 우선합니다.
curried handler factory가 반환하는 함수도 JSX event prop에 전달되는 React handler 선언입니다.
JSX가 나중에 contextual typing을 제공한다는 이유로 반환 함수 타입을 생략하지 않습니다.
factory 반환 타입을 `MouseEventHandler<...>` 같은 기존 alias로 고정합니다.

`query.select` 같은 hook option의 one-off contextual callback과 UI-agnostic domain function은 React event handler나 prop
callback 구현이 아닙니다.
이 경우 이 규칙은 적용하지 않습니다.

React alias를 쓰기 위해 type import를 추가·변경하면
`ownership-avoid-barrel-and-react-namespace-imports`를 다시 판정합니다.
일반 TypeScript 함수 타입 규칙은 companion skill인 `convention-typescript`에서 다루고,
여기서는 React handler alias를 바로 쓰는 경우를 강조합니다.

**Requires selected:** `typescript/types-reuse-callback-signatures-from-existing-contracts` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/typing-function-type-first.md)을 읽습니다.
