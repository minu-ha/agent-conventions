# Store Shared Derived Decisions Only When They Are Truly Shared

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면, 메뉴, 라우트 가드에서 반복해서 필요한 파생 판단만 스토어로 올립니다.
단일 화면에서 한두 번 읽는 쿼리 필드까지 스토어로 복제하지 않습니다.

스토어에 올리기로 했다면 문자열 비교나 도메인 판별은 초기화나 레이아웃 같은 한 경계에만 모으고,
화면은 `accessStore.canEditRecord` 같은 결과만 참조합니다.
쿼리에는 `onSuccess` 같은 성공 콜백이 없어서 적재는 이펙트가 맡습니다.
소유자가 분명한 경계에서만 `useEffect`로 적재하고, 그 근거는
`typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 주석으로 남깁니다.

여러 소유자가 읽는 판단을 한 경계에 적재하는 것은 `state-calculate-derived-values-during-render`의 예외입니다.
같은 판별을 화면마다 되풀이하지 않으려면 한 곳에서 한 번은 적재해야 합니다.

적재 이펙트의 의존성에는 스토어 객체가 아니라 쓰는 `set` 함수만 선택자로 꺼내 넣습니다.
스토어 전체를 넣으면 `set`이 상태를 바꿀 때 참조가 달라져 갱신이 자기를 다시 부릅니다.

> 예시·예외가 필요하면 [full rule](../rules/08-03-state-store-derived-authority.md)을 읽습니다.
