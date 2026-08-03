# Reuse Callback Signatures From Existing Contracts

**Impact: HIGH (기존 인터페이스나 객체 계약이 이미 정한 콜백 시그니처가 어긋나지 않습니다)**

콜백을 구현할 때 매개변수 타입을 다시 적지 않습니다. 이미 있는 인터페이스나 계약의 시그니처를 Indexed Access로 가져다 씁니다.
가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore`를 다시 봅니다.
그래야 구현과 계약의 타입 정의가 한곳에 남습니다.

타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백은 시그니처를 다시 선언한 것이 아니라 대상이 아닙니다.
프레임워크 옵션 객체의 `select: (response) => ...`는 문맥 추론을 그대로 씁니다.
반대로 이름 붙인 콜백이나 커링 팩토리의 마지막 핸들러를 인터페이스·객체·프레임워크 별칭으로 고정하면
기존 콜백 계약을 다시 쓰는 것이라 이 규칙을 적용합니다.

**Requires selected:** `types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-04-types-reuse-callback-signatures-from-existing-contracts.md)을 읽습니다.
