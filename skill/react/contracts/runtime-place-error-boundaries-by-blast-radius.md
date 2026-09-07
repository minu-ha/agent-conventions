# Place Error Boundaries by How Much Should Survive

**Impact: HIGH (쿼리 실패를 정해진 경계에서 처리하고 필요한 화면을 유지합니다)**

오류 경계는 실패 후에도 남겨야 할 화면 범위로 정합니다.
초기 실패를 받을 경계가 없으면 화면 전체가 빈 채로 남을 수 있으므로 앱 경계는 반드시 둡니다.

| 층 | 위치 | 오류 뒤 남는 화면 |
| --- | --- | --- |
| 앱 | 루트에 한 번 | 없음. 마지막 안전망입니다 |
| 화면 | 라우트 진입 | 내비게이션과 레이아웃 셸 |
| 섹션 | `Suspense` 경계와 같은 소유자 | 같은 화면의 다른 섹션 |

섹션 경계는 나머지 섹션만으로도 쓸모가 있을 때만 둡니다.
목록 실패 후 옆 필터로 할 수 있는 일이 없다면 화면 경계로 충분합니다.
로딩·오류 경계는 같은 소유자가 조립하며, 위치는 `runtime-place-suspense-boundaries-at-the-section-owner`를 따릅니다.

| 실패 상황 | 처리 |
| --- | --- |
| Suspense 쿼리에 표시할 캐시 데이터가 없음 | 렌더 중 던진 오류를 경계가 받습니다 |
| 기존 데이터가 있는 재조회 실패 | 기본적으로 데이터를 계속 보여 줍니다. 모든 실패를 경계로 보내야 할 때만 재조회가 끝난 뒤 명시적으로 던집니다 |
| 일반 이벤트 핸들러·비동기 콜백 오류 | 경계가 자동으로 받지 않습니다. 사용자 액션은 `data-handle-mutation-failure-where-it-is-called`를 따릅니다 |
| 트랜지션 Action 오류·라이브러리가 렌더에서 다시 던진 오류 | 일반 핸들러 오류와 구분합니다 |

본문의 실패 분기는 `runtime-avoid-ad-hoc-loading-branches`를 따릅니다.
오류 경계 클래스는 `ui`의 `UiErrorBoundary` 하나에 둡니다. 리액트 오류 경계 구현에는 클래스가 필요합니다.
화면 경계는 `react-router` 라우트 설정의 `errorElement`로 두고,
라우트 밖에서 감싸야 하면 `UiErrorBoundary`로 진입 컴포넌트를 감쌉니다.

재시도 버튼은 대체 화면에서 오류 경계의 재시도 함수를 호출합니다.
경계의 `onReset`에는 `@tanstack/react-query`의 `useQueryErrorResetBoundary`가 주는 `reset`을 연결합니다.
쿼리 오류만 초기화하면 대체 화면을 벗어나지 못합니다. 재시도는 하위 트리를 새로 마운트하므로 상태도 되살리지 못합니다.

**Requires selected:** `runtime-place-suspense-boundaries-at-the-section-owner` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/07-03-runtime-place-error-boundaries-by-blast-radius.md)을 읽습니다.
