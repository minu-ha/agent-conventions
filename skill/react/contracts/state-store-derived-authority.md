# Store Shared Derived Decisions Only When They Are Truly Shared

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면·메뉴·라우트 가드가 반복해서 쓰는 파생 판단만 스토어로 올립니다.
단일 화면에서 한두 번 읽는 쿼리 필드는 복제하지 않습니다.

| 작업 | 기준 |
| --- | --- |
| 도메인 판별 | 초기화·레이아웃 등 한 경계에 모으고 화면은 `accessStore.canEditRecord` 같은 결과만 읽습니다 |
| 스토어 채우기 | 쿼리에는 `onSuccess` 같은 성공 콜백이 없으므로 소유자가 분명한 경계의 `useEffect`에서 처리합니다 |
| 이펙트 예외 근거 | `state-calculate-derived-values-during-render`의 예외이므로 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 공유 이유를 남깁니다 |
| 이펙트의 스토어 접근 | 선택자로 `set` 함수만 꺼내고 값 의존성은 그대로 적습니다 |

같은 판별을 화면마다 반복하지 않도록 한 곳에서 스토어를 채웁니다.
이펙트가 스토어 객체 전체에 의존하면 `set`으로 참조가 바뀔 때 다시 실행되므로 피합니다.

> 예시·예외가 필요하면 [full rule](../rules/08-03-state-store-derived-authority.md)을 읽습니다.
