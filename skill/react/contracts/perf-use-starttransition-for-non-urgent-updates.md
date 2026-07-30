# Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (state 변경이 무거운 목록·표·트리 갱신을 유발할 때 상호작용 반응성을 유지합니다)**

클릭이나 선택 이후 무거운 list, table, tree 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 urgent feedback까지 transition에 넣지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/09-03-perf-use-starttransition-for-non-urgent-updates.md)을 읽습니다.
