# Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route entry만 봐도 화면 흐름을 따라갈 수 있게 합니다)**

Route entry는 search, navigate, page query·mutation, cross-section effect와 render 조립을 보여줍니다.
async·state·interaction 경계를 가진 section을 분리해도 이 흐름 제어 자체는 route entry에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` shape, binding·alias 정리, derived-state effect를 render 계산으로 옮기는 것
- 순수 type·payload builder·preset의 sibling `.ts` 이동. support-code 규칙이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-05-screen-keep-route-flow-visible.md)을 읽습니다.
