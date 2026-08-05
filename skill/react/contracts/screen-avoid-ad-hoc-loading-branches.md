# Avoid Ad-hoc Loading Branches in Screen Bodies

**Impact: HIGH (초기 로딩은 `Suspense` 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

`Suspense` 쿼리를 쓰는 화면은 본문에서 초기 로딩을 다시 분기하지 않습니다.
막는 로딩은 `Suspense` 경계나 상위 레이아웃이 이미 처리합니다.

- `isFetching`은 이미 그려진 화면을 보조할 때만 씁니다.
  `Suspense` 쿼리의 `isPending`은 타입이 `false`로 고정되어 분기 자체가 죽은 코드입니다.
  뮤테이션의 `isPending`은 씁니다.
  버튼 비활성화, 백그라운드 다시 불러오기 표시, 저장 중 배지가 그런 경우입니다.
- 실패도 본문에서 `isError`로 다시 분기하지 않습니다.
  받을 자리는 `screen-place-error-boundaries-by-blast-radius`가 정합니다.
- 가리는 분기는 가리지 않으면 외부 SDK나 폼이 잘못된 값으로 초기화되는 경우에만 씁니다.
  그때 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 없을 수 있다는 사실을 기본값으로 덮는 문제는 이 규칙이 아니라
`typescript/absence-expose-optional-values-instead-of-silent-fallbacks`가 판정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-06-screen-avoid-ad-hoc-loading-branches.md)을 읽습니다.
