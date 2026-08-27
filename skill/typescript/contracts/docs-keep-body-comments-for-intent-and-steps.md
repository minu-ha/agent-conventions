# Keep Body Comments for Intent and Steps

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

본문 안에서 코드 한 줄이나 절차의 단계를 설명할 때는 `//`만 쓰고 블록 주석을 쓰지 않습니다.

| 자리 | 주석 형태 |
| --- | --- |
| 코드 한 줄이나 절차의 단계 | `//` |
| `docs-require-header-jsdoc-on-key-declarations`가 지목한 선언. 컴포넌트 본문의 핸들러, 이펙트, 쿼리 바인딩 | 블록. 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다 |
| 그 밖의 지역 선언 | 블록을 쓰지 않습니다 |
| JSX 자식 자리 | `//`를 쓸 수 없어 이 규칙이 닿지 않습니다. 프레임워크 규칙이 정합니다 |

본문 주석은 이런 자리에 답니다.

- 도메인 규칙
- 예외를 막은 의도
- 외부 라이브러리나 API의 제약
- 부수효과의 순서
- **긴 절차의 단계 구분.** 흐름을 쪼개지 않고 한 자리에 두기로 한 함수일수록 단계 표시가 필요합니다.

주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
규칙이 허용한 예외의 이유를 남기는 주석은
`docs-justify-convention-exceptions-with-a-reason-comment`가 따로 정합니다.
이 규칙은 본문 안 어디에 다는지만 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-docs-keep-body-comments-for-intent-and-steps.md)을 읽습니다.
