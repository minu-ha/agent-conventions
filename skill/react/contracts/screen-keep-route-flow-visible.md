# Keep Route Entry Files Focused on Screen Flow

**Impact: MEDIUM-HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입이 소유하는 것은 다음 셋입니다.
다른 규칙이 이 목록을 가리킬 때는 여기가 정본입니다.

- 섹션 렌더 조립과 `Suspense` 경계.
  몇 겹으로 나눌지는 `runtime-place-suspense-boundaries-at-the-section-owner`가 정합니다
- 화면 전체 이펙트
- 라우트 사이의 이동 흐름 결정.
  `useNavigate` 호출 자체는 그 동작을 일으키는 컴포넌트가 갖습니다

쿼리·뮤테이션·URL 상태는 라우트 진입의 것이 아닙니다.

| 값 | 읽는 곳 |
| --- | --- |
| 서버 응답 | 그 데이터를 그리는 컴포넌트가 같은 key 로 직접 부릅니다 |
| 뮤테이션 | 그 동작을 일으키는 컴포넌트가 갖습니다 |
| 라우트 params, search 파라미터 | `useParams`와 URL 파서 묶음을 쓰는 자리에서 읽고 씁니다 |
| 여러 응답을 합친 파생값 | 그 값을 그리는 섹션이 `combine`을 인라인으로 갖습니다 |

같은 데이터가 여러 섹션에 필요해도 프롭으로 내리지 않습니다.
`@tanstack/react-query`는 key 가 같으면 요청을 한 번만 보내고 구독자 모두에게 같은 데이터를 줍니다.
어느 섹션이 어떤 데이터를 쓰는지는 그 섹션 파일의 쿼리 호출이 말합니다.
부모가 먼저 멈춰 자식의 요청이 뒤로 밀리면 부모가 같은 key 를 `usePrefetchQuery`로 먼저 띄웁니다.

비동기, 상태, 상호작용 경계가 있는 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` 형태, 바인딩·별칭 정리, 파생 상태 이펙트를 렌더 계산으로 옮기는 것
- 순수 타입, 전송 값 조립 함수, 기본 설정을 형제 `.ts` 파일로 옮기는 것
  `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-screen-keep-route-flow-visible.md)을 읽습니다.
