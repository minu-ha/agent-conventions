# Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further

**Impact: HIGH (route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함)**

이 규칙은 추출하기로 결정한 화면 전용 pure support code의 목적지를 정합니다.

`page.ts`로 옮길 것:

- 화면 전용 불변 설정, 옵션 목록, preset, column meta
- React hook 없이 동작하는 pure support function
- 화면 전용 type/interface
- 여러 줄로 커진 request/response shaping

`page.tsx`에 남길 것:

- response/mutation, state, handler, effect, render flow
- 작은 1회성 guard와 사용 지점 옆이 더 빠른 계산
- query invalidation, navigation처럼 hook context가 필요한 흐름

`page.ts`는 helper 창고가 아니라 화면 전용 support module입니다. 처음부터 `*-request.ts`, `*-columns.ts`로 쪼개지 말고, `page.ts`가 여러 독립 관심사로 커졌을 때만 추가 분리를 검토합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/screen-move-pure-support-code-out-of-entry-files.md)을 추가로 읽고 fallback 사유를 기록합니다.
