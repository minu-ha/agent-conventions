# Keep Route Entry Files Focused on Screen Flow

**Impact: MEDIUM-HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입은 화면 흐름을 조립하고, 데이터와 동작은 사용하는 컴포넌트가 소유합니다.
다른 규칙이 참조하는 라우트 진입의 책임은 아래 표를 기준으로 합니다.

| 라우트 진입의 책임 | 범위 |
| --- | --- |
| 섹션 조립과 `Suspense` 경계 | 경계 수는 `runtime-place-suspense-boundaries-at-the-section-owner`를 따릅니다 |
| 화면 전체 이펙트 | 화면 전체에 걸친 동기화를 소유합니다 |
| 라우트 사이의 이동 흐름 결정 | `useNavigate` 호출은 실제 동작을 일으키는 컴포넌트가 맡습니다 |

| 데이터·동작 | 소유 위치 |
| --- | --- |
| 서버 응답 | 데이터를 그리는 컴포넌트가 같은 `key`로 직접 읽습니다 |
| 뮤테이션 | 동작을 일으키는 컴포넌트가 소유합니다 |
| 라우트 params·search 파라미터 | 사용하는 곳에서 `useParams`와 URL 파서 묶음으로 읽고 씁니다 |
| 여러 응답을 합친 파생값 | 값을 그리는 섹션이 인라인 `combine`을 소유합니다 |

독립 섹션이 없는 작은 화면은 진입 컴포넌트가 데이터 소유자를 겸할 수 있습니다.
이때만 쿼리를 직접 호출하고 경계는 상위 레이아웃에 둡니다. 경계만을 위한 빈 섹션은 만들지 않습니다.
비동기·상태·상호작용 경계로 섹션을 분리해도 위 표의 화면 흐름 제어는 라우트 진입에 남깁니다.

같은 데이터가 여러 섹션에 필요해도 프롭으로 내리지 않습니다.
같은 `QueryClient`와 `key`는 캐시·진행 중인 요청을 공유하지만,
마운트·포커스 복귀·무효화 시에는 stale 상태와 옵션에 따라 다시 요청할 수 있습니다.
요청이 늘면 `staleTime`·`refetchOnMount`·실제 키를 먼저 확인합니다.
부모의 대기로 자식 요청이 늦어지면 대기 전에 실행되는 소유자에서 같은 `key`를 `usePrefetchQuery`로 먼저 요청합니다.

소유자가 바뀌지 않는 `query.select`·바인딩·별칭 정리와 파생 상태 이펙트의 렌더 계산 전환은 대상이 아닙니다.
순수 타입·전송 값 조립 함수·기본 설정의 형제 `.ts` 추출은
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`을 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-screen-keep-route-flow-visible.md)을 읽습니다.
