# Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM (공통 문서화 기준에 리액트 전용 선언을 추가해 누락을 막습니다)**

`typescript/docs-require-header-jsdoc-on-key-declarations`의 필수 대상에 아래 리액트 선언을 추가합니다.

| 추가 대상 | 조건 |
| --- | --- |
| 합성 컴포넌트 | 공개 부품 |
| `useEffect` | 정리 함수가 있거나 의존성이 둘 이상임 |
| 이벤트 핸들러 | 화면 이동이나 쿼리 무효화를 수행함. 동작이 하나뿐이어도 포함합니다 |

| 관련 판단 | 기준 |
| --- | --- |
| `type`, `interface` 문서화 | 내보내기 여부와 관계없이 `typescript/types-document-custom-types-and-shapes`를 따릅니다 |
| 쿼리·뮤테이션 바인딩, 핸들러, 내보낸 보조 함수·훅, 스토어 선언 | `typescript/docs-require-header-jsdoc-on-key-declarations` |
| 합성 공개 부품의 설명 위치 | `composition-declare-props-interface-above-the-component` |
| 허용된 예외의 근거 주석 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment` |
| 문서 주석 형식과 태그 | `typescript/docs-write-doc-comments-as-multiline-blocks` |

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/12-01-docs-require-jsdoc-on-key-declarations.md)을 읽습니다.
