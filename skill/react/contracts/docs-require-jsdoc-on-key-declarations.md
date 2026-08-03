# Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다)**

doc 주석은 경계를 설명할 때만 붙입니다. 자명한 지역 변수에는 강제하지 않습니다.

여기서 공개 선언은 다른 모듈이 소비할 수 있도록 실제 내보낸 또는 re-exported 된 선언만 뜻합니다.
export되지 않은 file-local `type`/`interface`는 공개이라는 이유만으로 이 규칙을 선택하지 않습니다.

필수 대상:

- 라우트·화면·레이아웃 소유자의 질의와 변경 요청 바인딩
- 분기, 비동기, 화면 이동, invalidation을 가진 이벤트 핸들러
- 동기화 의도가 중요한 `useEffect`
- 내보낸 pure 보조 function, 커스텀 훅, 스토어 선언
- 내보낸 공개 `type`과 `interface`, 합성 컴포넌트의 공개 부품
- 예외적으로 남긴 `useMemo`/`useCallback`

합성 공개 부품은 props `interface` 바로 위에 설명을 두고 컴포넌트 선언을 그 `interface` 바로 아래에 둡니다.
단순 내부 래퍼에는 부품 문서를 만들지 않습니다.

형식과 태그 기준은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정합니다.
여러 줄 블록으로 쓰고 역할 태그는 붙이지 않습니다.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/10-02-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
