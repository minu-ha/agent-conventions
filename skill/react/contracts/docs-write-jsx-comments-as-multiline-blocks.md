# Write JSX Comments as Multiline Blocks

**Impact: LOW (렌더 트리 안 주석이 한 모양이라 구역 표시를 훑어보며 화면 뼈대를 읽습니다)**

JSX 자식 자리에는 `//`를 쓸 수 없습니다.
달 수 있는 것이 중괄호 블록 하나라서 그 형태를 여기서 정합니다.

주석은 여러 줄 블록으로 씁니다.
`{/**`와 ` * 내용`과 ` */}`을 각각 다른 줄에 둡니다.
한 줄로 접지 않습니다.
선언 위 문서 주석과 형태가 같아 한 파일의 주석을 한 모양으로 훑습니다.

이 자리에 적는 것은 둘입니다.

- 화면 구역이 무엇을 담당하는지
- 규칙이 허용한 예외의 이유.
  내용 기준은 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정하고,
  그 규칙이 정한 `//` 한 줄을 이 자리에서는 블록이 대신합니다

마크업을 옮겨 적지 않습니다.
바로 아래 컴포넌트 이름을 되풀이하는 주석은 읽는 사람에게 아무것도 더하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/12-02-docs-write-jsx-comments-as-multiline-blocks.md)을 읽습니다.
