# Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (일반 기본값으로 부재를 조용히 덮지 않고 결측 데이터가 드러나게 합니다)**

optional 값에 대해 `??`, `||`로 기본값을 넣는 fallback 처리를 기본적으로 금지합니다.
값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며
코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-absence-expose-optional-values-instead-of-silent-fallbacks.md)을 읽습니다.
