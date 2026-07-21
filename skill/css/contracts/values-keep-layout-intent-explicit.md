# Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다. `position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리하며, `sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다.

> 예시·예외가 필요할 때만 [full rule](../rules/values-keep-layout-intent-explicit.md)을 추가로 읽고 fallback 사유를 기록합니다.
