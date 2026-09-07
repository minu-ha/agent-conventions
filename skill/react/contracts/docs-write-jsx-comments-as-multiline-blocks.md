# Write JSX Comments as Multiline Blocks

**Impact: LOW (JSX 주석 형식을 통일해 화면 구역의 역할을 쉽게 읽을 수 있습니다)**

JSX 자식 자리의 주석은 여러 줄 블록으로 씁니다.
`{/**`·` * 내용`·` */}`을 각각 다른 줄에 두고 한 줄로 접지 않습니다.
`//`를 쓸 수 없는 자리에서도 선언 위 문서 주석과 같은 형태를 유지합니다.

| 주석 내용 | 기준 |
| --- | --- |
| 화면 구역의 역할 | 해당 구역이 맡은 책임을 설명합니다 |
| 규칙이 허용한 예외의 이유 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따르되, `//` 한 줄 대신 JSX 블록을 씁니다 |
| 마크업이나 바로 아래 컴포넌트 이름 반복 | 새 정보가 없으므로 적지 않습니다 |

> 예시·예외가 필요하면 [full rule](../rules/12-02-docs-write-jsx-comments-as-multiline-blocks.md)을 읽습니다.
