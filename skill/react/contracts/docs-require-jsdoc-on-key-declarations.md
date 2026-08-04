# Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다)**

문서 주석은 경계를 설명할 때만 붙입니다. 자명한 지역 변수에는 강제하지 않습니다.

`type`과 `interface` 문서화는 `typescript/types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고, 여기서 다시 판정하지 않습니다.

필수 대상:

- 라우트·화면·레이아웃 소유자의 질의와 변경 요청 바인딩
- 분기, 비동기, 화면 이동, 무효화를 가진 이벤트 핸들러
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 내보낸 순수 보조 함수, 커스텀 훅, 스토어 선언
- 합성 컴포넌트의 공개 부품
- 예외적으로 남긴 `useMemo`/`useCallback`

합성 공개 부품의 설명을 어디 두는지는
`docs-document-compound-parts-above-props-interface`가 정합니다.

형식과 태그 기준은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정합니다.
여러 줄 블록으로 쓰고 역할 태그는 붙이지 않습니다.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/10-01-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
