# Store Shared Derived Decisions Only When They Are Truly Shared

**Impact: HIGH (중복된 도메인 판별 휴리스틱이 여러 화면에 퍼지는 것을 막습니다)**

여러 화면, 메뉴, route guard에서 반복해서 필요한 derived decision만 store에 승격합니다.
단일 화면에서 한두 번 읽는 query 필드까지 store로 복제하지 않습니다.

store에 올리기로 했다면 문자열 비교나 도메인 판별은 bootstrap/layout 같은 한 경계에만 모으고,
화면은 `accessStore.canEditRecord` 같은 결과만 참조합니다.
Suspense query처럼 `onSuccess`가 없어서 동기화가 필요하다면 owner가 분명한 경계에서만 `useEffect` 또는
`useLayoutEffect`를 사용하고, selector 최적화는 실제로 필요한 경우에만 근거 주석과 함께 예외적으로 사용합니다.

> 예시·예외가 필요하면 [full rule](../rules/08-03-state-store-derived-authority.md)을 읽습니다.
