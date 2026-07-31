# Preserve Route Slug Traceability

**Impact: HIGH (화면 범위 class namespace를 소속 화면으로 거슬러 읽을 수 있게 유지합니다)**

`pg_*` slug는 소속 화면까지 다시 추적할 수 있어야 합니다.
CSS skill은 어떤 파일이 화면 소유인지 결정하지 않고, 이미 선택된 owner가 클래스명에서 흐려지지 않게 지킵니다.

기본 판단:

- 화면 shell slug는 route 이름을 씁니다. route family와 screen role이 읽혀야 합니다.
- 화면 내부 component slug는 자기 component 이름만 씁니다.
- 팀이 공유하는 route map이 없는 opaque acronym은 피합니다.
- `wg_*`, `ui_*`는 각 owner scope의 naming style을 따릅니다.

부모 이름을 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소 범위로 덧붙입니다.
미리 붙이면 깊이에 따라 slug가 계속 자라서 충돌을 걱정하기 전에 읽기가 무너집니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-naming-preserve-route-slug-traceability.md)을 읽습니다.
