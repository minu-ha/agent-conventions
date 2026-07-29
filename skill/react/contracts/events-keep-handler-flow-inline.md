# Keep Screen-specific Handler Flow Local Until a Real Utility Emerges

**Impact: MEDIUM (모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지함)**

여기서 `local`은 JSX 인라인 핸들러를 뜻하지 않고,
이미 이름 붙은 handler 본문 안에서 흐름을 계속 읽을 수 있게 유지한다는 뜻입니다.
인라인 callback을 같은 component 안의 named handler로만 옮기는 변경은 이 rule의 대상이 아닙니다.
이미 named handler인 흐름을 여러 helper·hook으로 분리하거나 다시 합칠 때 선택합니다.
핸들러가 길어져도 바로 `page.ts`나 shared support code로 쪼개지 않습니다.
먼저 early return,
단계적 지역 변수,
의미 있는 블록 구분으로 읽기 쉽게 유지하고,
`screen-extract-utilities-selectively` 규칙을 만족할 때만 분리합니다.
화면 하나에서만 쓰는 custom hook으로 우회해 흐름을 숨기는 것도 기본적으로 피합니다.

> 예시·예외가 필요하면 [full rule](../rules/events-keep-handler-flow-inline.md)을 읽습니다.
