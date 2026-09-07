# Avoid Ad-hoc Loading and Failure Branches in Screen Bodies

**Impact: HIGH (초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

`Suspense` 쿼리의 초기 로딩은 경계나 상위 레이아웃이 처리하므로 화면 본문에서 다시 분기하지 않습니다.

| 플래그 | 사용 기준 |
| --- | --- |
| Suspense 쿼리의 `isPending` | 타입이 `false`로 고정되어 분기가 죽은 코드입니다 |
| 쿼리의 `isFetching` | 백그라운드 재조회 표시처럼 이미 그려진 화면을 보조할 때만 씁니다 |
| 쿼리의 `isError` | 초기 실패 대체 화면을 본문에 만들지 않습니다. 캐시가 있는 재조회 실패는 `runtime-place-error-boundaries-by-blast-radius`를 따릅니다 |
| 뮤테이션의 `isPending` | 버튼 비활성화·저장 중 배지 등에 씁니다 |

화면을 가리지 않으면 외부 SDK나 폼이 잘못된 값으로 초기화될 때만 본문에 가림 분기를 둡니다.
이 예외는 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다.
없는 값을 기본값으로 덮는 문제는 `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/07-02-runtime-avoid-ad-hoc-loading-branches.md)을 읽습니다.
