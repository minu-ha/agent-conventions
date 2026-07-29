# Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다. `position`,
`width`,
`height` 강제는 최소화하고
부모와 자식의 레이아웃 책임을 분리하며,
`sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다.
같은 DOM element의 base/modifier 책임을 분리하면서 기존 `display`나 spacing property-value를 값 그대로 재배치하는 작업은
class responsibility 규칙이 소유하며
이 규칙은 N/A입니다.
position, z-index, 강제 geometry 또는 부모·자식 layout 책임이 바뀌면 다시 Selected입니다.

> 예시·예외가 필요할 때만 [full rule](../rules/values-keep-layout-intent-explicit.md)을 추가로 읽고 fallback 사유를 기록합니다.
