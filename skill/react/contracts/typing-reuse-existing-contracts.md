# Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (같은 구조를 두 번 선언해 시간이 지나며 어긋나는 것을 막습니다)**

프롭스 콜백 구현 시에는 프롭스 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다.
필요하면 `Pick`, `Omit`, 인덱스 접근 같은 파생 타입으로 좁힙니다.
`Ui*` 래퍼를 쓸 때는 라이브러리 원본 프롭스가 아니라 래퍼가 노출한 `Ui*Props`를 참조합니다.
래퍼가 의도적으로 좁히거나 보강한 계약이 사용처로 새지 않게 하려는 것입니다.

> 예시·예외가 필요하면 [full rule](../rules/02-02-typing-reuse-existing-contracts.md)을 읽습니다.
