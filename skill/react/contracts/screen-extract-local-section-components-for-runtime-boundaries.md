# Extract Route-local Section Components Only for Runtime Boundaries

**Impact: HIGH (route entry의 orchestration은 보이게 유지하면서도 async, state, interaction처럼 실제 경계가 있는 subtree는 안전하게 분리할 수 있게 함)**

route entry의 local component는 `runtime boundary`가 있을 때만 추출합니다.
단순 layout wrapper, className grouping, 들여쓰기 감소만으로는 추출하지 않습니다.

추출 가능한 boundary:

- async: `Suspense`, skeleton, loading, error, empty state
- state/provider: local state, effect sync, form provider, context, scoped store
- interaction: popover, modal, selection, inline edit, drag, expandable tree
- library/performance: dense widget adapter, virtualization, transition, deferred value

search param, navigation, page-level query/mutation, cross-section effect, invalidate, redirect,
여러 section에 걸친 파생값은 route entry에 둡니다.

> 예시·예외가 필요하면 [full rule](../rules/screen-extract-local-section-components-for-runtime-boundaries.md)을 읽습니다.
