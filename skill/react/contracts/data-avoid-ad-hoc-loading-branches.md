# Avoid Ad-hoc Loading Branches in Screen Bodies

**Impact: HIGH (초기 로딩은 Suspense 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

Suspense 질의를 쓰는 화면은 본문에서 초기 로딩을 다시 분기하지 않습니다.
막는 로딩은 Suspense 경계나 상위 레이아웃이 이미 처리합니다.

- `isPending`, `isFetching`은 이미 그려진 화면을 보조할 때만 씁니다.
  버튼 비활성화, 백그라운드 다시 불러오기 표시, 저장 중 배지가 그런 경우입니다.
- 화면 전체를 가리는 지역 로딩 분기가 꼭 필요하면 바로 위에 한국어 주석으로 이유를 남깁니다.

값이 없을 수 있다는 사실을 기본값으로 덮는 문제는 이 규칙이 아니라
`typescript/absence-expose-optional-values-instead-of-silent-fallbacks`가 판정합니다.
로딩 분기를 고치면서 `??`나 `||`도 함께 손대면 두 규칙이 같이 걸립니다.

**Requires selected:** `typescript/absence-expose-optional-values-instead-of-silent-fallbacks` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/07-01-data-avoid-ad-hoc-loading-branches.md)을 읽습니다.
