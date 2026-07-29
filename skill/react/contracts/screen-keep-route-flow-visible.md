# Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

Route entry는 search, navigate, page query·mutation, cross-section effect와 render 조립을 보여줍니다.
runtime boundary section은 추출해도 주 orchestration은 route entry에 둡니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` shape, binding·alias 정리, derived-state effect를 render 계산으로 옮기는 것
- 순수 type·payload builder·preset의 sibling `.ts` 이동. support-code 규칙이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/screen-keep-route-flow-visible.md)을 읽습니다.
