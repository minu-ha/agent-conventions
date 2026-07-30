# Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (중복 타입 구조가 시간이 지나며 어긋나는 것을 막습니다)**

Props 콜백 구현 시에는 Props 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다.
필요하면 `Pick`, `Omit`, indexed access 같은 파생 타입으로 좁힙니다.

> 예시·예외가 필요하면 [full rule](../rules/02-02-typing-reuse-existing-contracts.md)을 읽습니다.
