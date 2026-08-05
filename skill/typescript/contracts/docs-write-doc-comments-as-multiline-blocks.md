# Write Doc Comments as Multiline Blocks

**Impact: MEDIUM (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나눕니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  규칙이 허용한 예외의 이유를 적을 때는 `//` 한 줄을 씁니다.
  그 형식은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.
- 선언이 무엇인지는 이름과 문법이 이미 드러냅니다.
  그것을 태그로 다시 적지 않습니다.
  `@api`·`@helper`·`@field` 같은 역할 태그를 붙이지 않고 `@schema`처럼 새 태그를 만들지도 않습니다.
  `@summary`는 헤더 첫 줄이 이미 하는 일이라 쓰지 않습니다.
  `@deprecated`·`@example`·`@param`·`@returns`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.
  역할 태그는 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-docs-write-doc-comments-as-multiline-blocks.md)을 읽습니다.
