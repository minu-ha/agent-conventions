# Keep Page Slugs Traceable to Their Screen

**Impact: HIGH (클래스명만 보고 어느 화면 것인지 거슬러 찾습니다)**

`pg_*` slug만 보고 어느 화면의 것인지 알 수 있어야 합니다.
어떤 파일이 화면 소유인지는 프레임워크 규약이 정하고, CSS는 그 소유가 slug에서 흐려지지 않게 지킵니다.

- 화면 shell은 page 이름을 slug로 씁니다. `pg_postsDetail`처럼 화면 계열과 역할이 읽혀야 합니다.
- 화면 안의 컴포넌트는 자기 이름만 slug로 씁니다.
- 팀이 공유하는 화면 목록에 없는 줄임말은 쓰지 않습니다.
- `wg_*`, `ui_*`는 각자의 slug 규칙을 따릅니다.

부모 slug를 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소 범위로 덧붙입니다.
미리 붙이면 깊이에 따라 slug가 계속 자라서 충돌을 걱정하기 전에 읽기가 무너집니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-naming-keep-page-slug-traceable.md)을 읽습니다.
