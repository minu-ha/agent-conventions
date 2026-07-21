# Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed

**Impact: HIGH (prevents missing tokens from degrading styles unpredictably when variables are absent)**

CSS 변수 `var(--*)`를 사용할 때는 토큰 존재가 보장되지 않는 경계에서 fallback 값을 함께 지정합니다. theme provider, 서드파티 wrapper, 선택적 토큰, 임시 overlay처럼 변수가 빠질 수 있는 surface에서는 안전한 기본값을 둬야 합니다.\
반대로 프로젝트 전역에서 반드시 주입되는 core design token이라면, 누락을 빨리 드러내기 위해 fallback을 생략할 수도 있습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/values-always-provide-css-variable-fallbacks.md)을 추가로 읽고 fallback 사유를 기록합니다.
