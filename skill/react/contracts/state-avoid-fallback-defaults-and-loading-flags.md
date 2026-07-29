# Avoid Silent Fallback Defaults and Ad-hoc Loading Branches

**Impact: HIGH (결측 데이터를 숨기지 않고 로딩 UX를 Suspense 또는 명시적 예외 처리 쪽으로 유도함)**

옵셔널 값에 `??`,
`||`로 습관적인 기본값을 넣지 않고,
Suspense query의 초기 blocking 로딩을 화면 본문에서 즉석 분기하지 않습니다.
결측값은 드러내고, 초기 로딩은 기본적으로 Suspense 경계나 상위 레이아웃에서 처리합니다.
대신 `isPending`,
`isFetching` 같은 상태는 버튼 비활성화,
background refetch indicator,
저장 중 배지처럼 기존 UI를 보조하는 좁은 용도로만 사용합니다.
화면 전체를 가리는 로컬 loading 분기가 꼭 필요하면 가까운 한글 주석으로 이유를 남깁니다.

> 예시·예외가 필요할 때만 [full rule](../rules/state-avoid-fallback-defaults-and-loading-flags.md)을 추가로 읽고 fallback 사유를 기록합니다.
