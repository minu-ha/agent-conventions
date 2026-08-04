# Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (상태 변경이 무거운 목록이나 표를 건드릴 때도 반응이 유지됩니다)**

클릭이나 선택 이후 무거운 목록, 표, 트리 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 급한 반응까지 전환에 넣지는 않습니다.

갈림길은 `set` 함수를 내가 갖고 있는지입니다.
내가 부르는 `setState`가 무거운 렌더를 일으키면 이 규칙으로 그 호출을 감쌉니다.
`set` 함수가 내 것이 아니거나 비용이 파생 렌더 쪽에 있으면
`perf-use-usedeferredvalue-for-heavy-derived-renders`를 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/09-03-perf-use-starttransition-for-non-urgent-updates.md)을 읽습니다.
