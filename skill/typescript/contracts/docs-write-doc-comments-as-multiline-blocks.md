# Write Doc Comments as Multiline Blocks

**Impact: LOW (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 다른 줄에 둡니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  그 형식은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.
- 어떤 태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-04-docs-write-doc-comments-as-multiline-blocks.md)을 읽습니다.
