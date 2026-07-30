# Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 합니다)**

JSDoc은 경계를 설명할 때만 붙입니다. 자명한 local 변수에는 강제하지 않습니다.

여기서 public 선언은 다른 module이 소비할 수 있도록 실제 exported 또는 re-exported 된 선언만 뜻합니다.
export되지 않은 file-local `type`/`interface`는 public이라는 이유만으로 이 규칙을 선택하지 않습니다.

필수 대상:

- route/screen/layout owner의 named query/mutation binding
- 분기, async, navigation, invalidation을 가진 event handler
- 동기화 의도가 중요한 `useEffect`
- exported pure support function, custom hook, store 선언
- exported/re-exported public `type`/`interface`, compound component public part
- 예외적으로 남긴 `useMemo`/`useCallback`

태그는 `convention-typescript`의 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@part`, `@description`,
`@field`를 사용합니다.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/10-03-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
