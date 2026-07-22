# Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다. runtime boundary를 소유하는 route-local section component는 추출할 수 있지만, route entry는 여전히 search param, navigate, page-level query/mutation, cross-section effect 같은 orchestration을 보여줘야 합니다. 이 orchestration은 건드리지 않고 순수 type, payload builder, preset만 sibling support `.ts`로 옮기는 작업은 `screen-extract-utilities-selectively`와 `screen-move-pure-support-code-out-of-entry-files`가 소유하며 이 규칙은 N/A입니다.

> 예시·예외가 필요할 때만 [full rule](../rules/screen-keep-route-flow-visible.md)을 추가로 읽고 fallback 사유를 기록합니다.
