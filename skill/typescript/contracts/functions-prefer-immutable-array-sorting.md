# Prefer Immutable Array Sorting

**Impact: MEDIUM (props·state·공유 입력에서 온 배열을 정렬할 때 변형 버그를 피합니다)**

정렬이 필요한데 원본 배열을 계속 써야 한다면 `.sort()`로 제자리 mutation을 하지 않습니다.
프로젝트 런타임이 ES2023 이상이거나 `toSorted()` 지원이 보장되면 `.toSorted()`를 우선하고,
그렇지 않으면 복사 후 정렬합니다.
companion skill이므로 지원 여부가 불분명한 환경에 무조건 `toSorted()`를 강제하지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-functions-prefer-immutable-array-sorting.md)을 읽습니다.
