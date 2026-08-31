# Prefer Immutable Array Sorting

**Impact: HIGH (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

이 함수가 만들지 않은 배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이 그 경우입니다.

정렬은 `es-toolkit`의 `sortBy`와 `orderBy`로 합니다.
키 하나면 `sortBy`, 정렬 방향이 섞이면 `orderBy`입니다.
둘 다 새 배열을 돌려주므로 원본은 그대로 남습니다.

비교 규칙을 키로 적을 수 없을 때만 `.toSorted()`를 씁니다.
한국어 이름을 `localeCompare`로 비교하는 정렬이 여기 해당합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-values-prefer-immutable-array-sorting.md)을 읽습니다.
