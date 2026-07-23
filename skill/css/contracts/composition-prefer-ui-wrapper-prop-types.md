# Prefer `Ui*` Wrapper Prop Types

**Impact: MEDIUM-HIGH (preserves wrapper-level styling and API contracts instead of leaking raw library prop types into usage sites)**

`Ui*` 래퍼 컴포넌트를 사용할 때는 라이브러리 원본 Props 타입이 아니라 래퍼가 노출한 `Ui*Props` 타입을 우선 사용합니다. 그래야 wrapper가 의도적으로 제한하거나 보강한 스타일링 계약과 API 경계를 유지할 수 있습니다.

**Requires selected:** `typescript/types-reuse-existing-contracts-before-new-types` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/composition-prefer-ui-wrapper-prop-types.md)을 추가로 읽고 fallback 사유를 기록합니다.
