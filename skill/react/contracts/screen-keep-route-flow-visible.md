# Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

Route 진입은 검색, navigate, page 질의·변경 요청, 화면 전체 이펙트와 렌더 조립을 보여줍니다.
비동기·상태·상호작용 경계를 가진 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` 형태, 바인딩·별칭 정리, derived-state 이펙트를 렌더 계산으로 옮기는 것
- 순수 type·전송 값 builder·기본 설정의 형제 `.ts` 이동. support-code 규칙이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-05-screen-keep-route-flow-visible.md)을 읽습니다.
