# Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (상태 변경이 무거운 목록이나 표를 건드릴 때도 반응이 유지됩니다)**

클릭이나 선택 이후 무거운 list, table, tree 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 urgent feedback까지 전환에 넣지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/09-03-perf-use-starttransition-for-non-urgent-updates.md)을 읽습니다.
