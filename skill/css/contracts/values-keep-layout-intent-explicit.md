# Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다. `position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리하며, `sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다. 같은 DOM element의 base와 modifier 사이에서 기존 `display`나 spacing 선언을 재배치하되 position, z-index, 강제 geometry, 부모·자식 책임과 실제 layout 동작이 그대로라면 이 규칙은 N/A입니다.

> 예시·예외가 필요할 때만 [full rule](../rules/values-keep-layout-intent-explicit.md)을 추가로 읽고 fallback 사유를 기록합니다.
