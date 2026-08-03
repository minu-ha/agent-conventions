# Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다)**

선택 값에 `??`나 `||`로 기본값을 채워 없음을 덮지 않습니다.
값이 없을 수 있다는 사실을 그대로 드러냅니다.
도메인상 기본값이 분명하고 코드 바로 위에 이유 주석이 있을 때만 예외로 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-absence-expose-optional-values-instead-of-silent-fallbacks.md)을 읽습니다.
