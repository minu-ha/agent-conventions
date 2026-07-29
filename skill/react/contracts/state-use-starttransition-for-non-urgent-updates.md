# Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (keeps interactions responsive when a state change triggers a heavy list, table, or tree update)**

클릭이나 선택 이후 무거운 list, table, tree 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 urgent feedback까지 transition에 넣지는 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/state-use-starttransition-for-non-urgent-updates.md)을 읽습니다.
