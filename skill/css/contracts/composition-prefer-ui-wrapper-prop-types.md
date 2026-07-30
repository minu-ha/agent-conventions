# Prefer `Ui*` Wrapper Prop Types

**Impact: MEDIUM-HIGH (라이브러리 원본 prop 타입이 사용처로 새지 않게 wrapper 수준의 스타일·API 계약을 지킴)**

`Ui*` 래퍼 컴포넌트를 사용할 때는 라이브러리 원본 Props 타입이 아니라 래퍼가 노출한 `Ui*Props` 타입을 우선 사용합니다.
그래야 wrapper가 의도적으로 제한하거나 보강한 스타일링 계약과 API 경계를 유지할 수 있습니다.

**Requires selected:** `typescript/types-reuse-existing-contracts-before-new-types` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-04-composition-prefer-ui-wrapper-prop-types.md)을 읽습니다.
