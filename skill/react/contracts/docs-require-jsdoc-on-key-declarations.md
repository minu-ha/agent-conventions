# Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

JSDoc은 경계를 설명할 때만 붙입니다. 자명한 local 변수에는 강제하지 않습니다.

필수 대상:

- route/screen/layout owner의 named query/mutation binding
- 분기, async, navigation, invalidation을 가진 event handler
- 동기화 의도가 중요한 `useEffect`
- exported pure support function, custom hook, store 선언
- public `type`/`interface`, compound component public part
- 예외적으로 남긴 `useMemo`/`useCallback`

태그는 `convention-typescript`의 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@part`, `@description`, `@field`를 사용합니다.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/docs-require-jsdoc-on-key-declarations.md)을 추가로 읽고 fallback 사유를 기록합니다.
