# Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

Route entry는 search, navigate, page query·mutation, cross-section effect와 render 조립을 보여줍니다.
runtime boundary section은 추출해도 주 orchestration은 route entry에 둡니다.

이 규칙은 route orchestration owner와 page-section topology가 바뀔 때 Selected입니다.
흐름을 hook·support module·section component로 이동·분리하거나 section 순서·owner를 바꾸면 적용합니다.

같은 route owner 안 `query.select` shape, binding·alias 정리, derived-state effect의 render 계산 전환은 N/A입니다.
순수 type·payload builder·preset의 sibling `.ts` 이동도 support-code 규칙이 소유하며 N/A입니다.

> 예시·예외가 필요할 때만 [full rule](../rules/screen-keep-route-flow-visible.md)을 추가로 읽고 fallback 사유를 기록합니다.
