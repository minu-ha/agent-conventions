# Reuse Callback Signatures From Existing Contracts

**Impact: HIGH (prevents callback signatures from drifting when an existing interface or object contract already defines them)**

콜백 구현 시 매개변수를 다시 타이핑하기보다, 이미 존재하는 인터페이스나 계약의 시그니처를 Indexed Access로 재사용합니다.
재사용한 계약에 현재 구현이 쓰지 않는 parameter가 있으면 `types-mark-unused-parameters-with-underscore`를 다시
판정합니다.
이렇게 해야 구현과 계약 사이의 타입 정의가 한곳에서 유지됩니다.

annotation 없는 one-off contextually typed inline callback은 시그니처를 재선언한 것이 아니므로 N/A입니다.
예를 들어 framework option 객체의 `select: (response) => ...`는 contextual inference를 그대로 사용합니다.
반대로 named callback과 curried factory의 최종 반환 handler를 interface·객체·framework alias로 고정하는 작업은 기존
callback 계약 재사용이므로 Selected입니다.

**Requires selected:** `types-prefer-function-variable-types-over-parameter-annotations` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/types-reuse-callback-signatures-from-existing-contracts.md)을 추가로 읽고 fallback 사유를 기록합니다.
