# Keep Route Entry Files Focused on Screen Flow

**Impact: MEDIUM-HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입이 소유하는 것은 다음 다섯입니다.
다른 규칙이 이 목록을 가리킬 때는 여기가 정본입니다.

- search 파라미터와 화면 이동
- 화면 단위 쿼리와 뮤테이션, 그 무효화
- 화면 전체 이펙트
- 여러 섹션에 걸친 파생값
- 섹션 렌더 조립

비동기, 상태, 상호작용 경계를 가진 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` 형태, 바인딩·별칭 정리, 파생 상태 이펙트를 렌더 계산으로 옮기는 것
- 순수 타입, 전송 값 조립 함수, 기본 설정을 형제 `.ts` 파일로 옮기는 것
  `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-screen-keep-route-flow-visible.md)을 읽습니다.
