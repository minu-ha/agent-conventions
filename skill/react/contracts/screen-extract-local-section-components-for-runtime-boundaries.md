# Extract Route-local Section Components Only for Runtime Boundaries

**Impact: HIGH (화면 흐름은 보이게 두고 실제 실행 경계가 있는 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 `runtime boundary`가 있을 때만 추출합니다.
단순 레이아웃 래퍼, className grouping, 들여쓰기 감소만으로는 추출하지 않습니다.

추출 가능한 boundary:

- 비동기: `Suspense`, skeleton, loading, error, empty 상태
- 상태, provider: 지역 상태, 이펙트 sync, form provider, 컨텍스트, scoped 스토어
- interaction: popover, modal, selection, inline edit, drag, expandable tree
- 라이브러리, 성능: dense 위젯 adapter, virtualization, 전환, deferred 값

검색 param, navigation, page-level 질의/변경 요청, cross-section 이펙트, invalidate, redirect,
여러 섹션에 걸친 파생값은 라우트 진입에 둡니다.

호출 계층은 폴더 깊이가 아니라 진입 파일의 조립이 드러냅니다.
"어느 컴포넌트가 이걸 쓰는지"를 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.
진입의 JSX와 import 목록을 위에서 아래로 읽으면 답이 나와야 하고, 그러지 않으면 섹션을 과하게 쪼갠 것입니다.

> 예시·예외가 필요하면 [full rule](../rules/05-02-screen-extract-local-section-components-for-runtime-boundaries.md)을 읽습니다.
