# Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM (리액트가 아는 경계 선언을 동반 스킬 목록에 더해 빠뜨리지 않습니다)**

문서 주석은 경계를 설명할 때만 붙입니다.
코드만 봐도 아는 지역 변수에는 강제하지 않습니다.

`type`과 `interface` 문서화는 `typescript/types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고, 여기서 다시 판정하지 않습니다.

필수 대상은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정한 목록에 다음 셋을 더한 것입니다.

- 합성 컴포넌트의 공개 부품
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 화면 이동이나 쿼리 무효화를 하는 이벤트 핸들러.
  동작이 그 하나뿐이어도 대상입니다

쿼리·뮤테이션 바인딩, 핸들러, 내보낸 보조 함수와 훅, 스토어 선언의 임계값은
`typescript/docs-require-header-jsdoc-on-key-declarations`가 정한 것을 그대로 씁니다.
여기서 다시 정하지 않습니다.

합성 공개 부품의 설명을 어디 두는지는
`composition-declare-props-interface-above-the-component`가 정합니다.

규칙이 허용한 예외에 붙이는 근거 주석은
`typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

형식과 태그 기준은 `typescript/docs-write-doc-comments-as-multiline-blocks`가 정합니다.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/12-01-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
