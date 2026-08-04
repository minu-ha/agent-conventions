# Prefer Immutable Array Sorting

**Impact: MEDIUM (프롭스, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

원본 배열을 계속 써야 하면 `.sort()`로 제자리에서 바꾸지 않습니다.
실행 환경이 ES2023 이상이거나 `toSorted()`를 쓸 수 있으면 `.toSorted()`를 먼저 씁니다.
아니면 복사한 뒤 정렬합니다.
`toSorted()`는 ES2023이라 `tsconfig`의 `lib`에 `ES2023` 이상이 있어야 씁니다.
없으면 복사 후 정렬을 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-functions-prefer-immutable-array-sorting.md)을 읽습니다.
