# Prefer Immutable Array Sorting

**Impact: MEDIUM (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

이 함수가 만들지 않은 배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이 그 경우입니다.

`.toSorted()`를 먼저 씁니다.
쓰려면 `tsconfig`의 `lib`에 `ES2023` 이상이 있어야 하고, **실행 환경도 지원해야 합니다.**
`lib`는 타입 검사만 열어 주고 폴리필하지 않습니다.
둘 중 하나라도 안 되면 `[...list].sort()`로 복사한 뒤 정렬합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-functions-prefer-immutable-array-sorting.md)을 읽습니다.
