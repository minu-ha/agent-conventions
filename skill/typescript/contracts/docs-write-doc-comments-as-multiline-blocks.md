# Write Doc Comments as Multiline Blocks

**Impact: MEDIUM (선언 위 주석 형태가 파일마다 같아 검색과 훑어보기가 됩니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나눕니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언 설명에 `//`를 쓰지 않습니다. `//`는 함수 본문 안 제약 설명 몫입니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-docs-write-doc-comments-as-multiline-blocks.md)을 읽습니다.
