# Store Shared Derived Decisions Only When They Are Truly Shared

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면, 메뉴, 라우트 가드에서 반복해서 필요한 파생 판단만 스토어에 승격합니다.
단일 화면에서 한두 번 읽는 쿼리 필드까지 스토어로 복제하지 않습니다.

스토어에 올리기로 했다면 문자열 비교나 도메인 판별은 초기화나 레이아웃 같은 한 경계에만 모으고,
화면은 `accessStore.canEditRecord` 같은 결과만 참조합니다.
Suspense 쿼리처럼 `onSuccess`가 없어서 동기화가 필요하다면 소유자가 분명한 경계에서만 `useEffect` 또는
`useLayoutEffect`를 사용하고, 선택자 최적화는 실제로 필요할 때만 쓰고 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 근거를 남깁니다.

> 예시·예외가 필요하면 [full rule](../rules/08-03-state-store-derived-authority.md)을 읽습니다.
