# Place Suspense Boundaries at the Section Owner

**Impact: HIGH (막는 로딩을 화면 본문이 아니라 정해진 한 자리에서 처리합니다)**

`Suspense` 쿼리를 쓰는 컴포넌트마다 그 **바로 위 섹션 소유자**가 경계를 갖습니다.
경계와 대체 화면은 거기 한 곳에만 둡니다.
쿼리를 부르는 컴포넌트는 자기 자신을 감쌀 수 없으므로 경계를 갖지 않습니다.

- 섹션이 따로 없으면 라우트 진입이 경계를 갖습니다.
- 라우트 진입이 직접 쿼리를 부르면 그 라우트의 레이아웃이나 상위 라우트가 경계를 갖습니다.
- 한 화면에 경계를 여러 겹 쌓지 않습니다.
  섹션이 독립적으로 채워져야 할 때만 나눕니다.

대체 화면의 컨테이너와 높이는 `css/layout-keep-layout-intent-explicit`이 정합니다.

경계가 있으므로 화면 본문에는 로딩 분기가 남지 않습니다.
그 판정은 `runtime-avoid-ad-hoc-loading-branches`가 합니다.

**Requires selected:** `runtime-avoid-ad-hoc-loading-branches` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/07-01-runtime-place-suspense-boundaries-at-the-section-owner.md)을 읽습니다.
