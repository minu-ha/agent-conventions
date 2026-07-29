# Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

Route entry는 search, navigate, page query·mutation, cross-section effect와 render 조립을 보여줍니다.
runtime boundary section은 추출해도 주 orchestration은 route entry에 둡니다.

route 흐름의 소유자나 섹션 구성이 바뀔 때 적용합니다.
흐름을 hook·support module·section component로 옮기거나, 섹션의 순서와 소유자를 바꾸는 경우입니다.

소유자가 그대로인 변경은 대상이 아닙니다.
`query.select` shape, binding·alias 정리, derived-state effect 를 render 계산으로 옮기는 것이 여기에 해당합니다.
순수 type·payload builder·preset 의 sibling `.ts` 이동은 support-code 규칙이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/screen-keep-route-flow-visible.md)을 읽습니다.
