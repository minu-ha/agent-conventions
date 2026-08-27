# Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM (리액트에만 있는 경계 선언을 동반 스킬 목록에 더해 빠뜨리지 않습니다)**

문서 주석은 경계를 설명할 때만 붙입니다.
코드만 봐도 아는 지역 변수에는 강제하지 않습니다.

필수 대상은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정한 목록에 다음 셋을 더한 것입니다.

- 합성 컴포넌트의 공개 부품
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 화면 이동이나 쿼리 무효화를 하는 이벤트 핸들러.
  동작이 그 하나뿐이어도 대상입니다.

나머지는 다른 규칙이 정한 것을 그대로 쓰고 여기서 다시 판정하지 않습니다.

| 무엇 | 정하는 규칙 |
| --- | --- |
| `type`·`interface` 문서화. 내보냈는지와 무관합니다 | `typescript/types-document-custom-types-and-shapes` |
| 쿼리·뮤테이션 바인딩, 핸들러, 내보낸 보조 함수와 훅, 스토어 선언에 붙이는 기준 | `typescript/docs-require-header-jsdoc-on-key-declarations` |
| 합성 공개 부품의 설명을 두는 자리 | `composition-declare-props-interface-above-the-component` |
| 규칙이 허용한 예외에 붙이는 근거 주석 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment` |
| 형식과 태그 | `typescript/docs-write-doc-comments-as-multiline-blocks` |

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/12-01-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
