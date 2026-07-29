# Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (makes missing data visible instead of quietly masking absence with generic defaults)**

옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다.
값이 없을 수 있음을 명확히 드러내고,
꼭 필요할 때만 도메인상 기본값이 명확하며
코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/absence-expose-optional-values-instead-of-silent-fallbacks.md)을 추가로 읽고 fallback 사유를 기록합니다.
