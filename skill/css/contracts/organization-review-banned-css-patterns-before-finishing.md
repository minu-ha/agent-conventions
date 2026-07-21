# Review Banned CSS Patterns Before Finishing

**Impact: MEDIUM (catches unsafe selector, modifier, and library-targeting shortcuts before they become part of the shared style system)**

작업을 마치기 전에 금지 패턴을 다시 확인합니다.

금지:

- 요소 선택자 중심 스타일링
- 깊은 project-owned descendant chain
- 재사용 근거 없는 structural modifier
- root 없는 library class targeting
- top-level pseudo selector 재오픈
- project-owned parent state descendant coupling
- `!important` 남용

허용 가능한 예외:

- 반복되는 명시적 variant modifier
- owner block 안 rich text wrapper의 nested raw element selector
- owned root 아래의 최소 third-party selector chain

예외는 관련 rule에서 허용한 범위 안에서만 사용합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/organization-review-banned-css-patterns-before-finishing.md)을 추가로 읽고 fallback 사유를 기록합니다.
