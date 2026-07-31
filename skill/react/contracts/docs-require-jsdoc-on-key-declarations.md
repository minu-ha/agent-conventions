# Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 합니다)**

doc 주석은 경계를 설명할 때만 붙입니다. 자명한 local 변수에는 강제하지 않습니다.

여기서 public 선언은 다른 module이 소비할 수 있도록 실제 exported 또는 re-exported 된 선언만 뜻합니다.
export되지 않은 file-local `type`/`interface`는 public이라는 이유만으로 이 규칙을 선택하지 않습니다.

필수 대상:

- route/screen/layout owner의 named query/mutation binding
- 분기, async, navigation, invalidation을 가진 event handler
- 동기화 의도가 중요한 `useEffect`
- exported pure support function, custom hook, store 선언
- exported/re-exported public `type`/`interface`, compound component public part
- 예외적으로 남긴 `useMemo`/`useCallback`

compound public part는 props `interface` 바로 위에 설명을 두고 component 선언을 그 `interface` 바로 아래에 둡니다.
단순 내부 wrapper에는 part 문서를 만들지 않습니다.

형식과 태그 기준은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정합니다.
여러 줄 블록으로 쓰고 역할 태그는 붙이지 않습니다.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/10-02-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
