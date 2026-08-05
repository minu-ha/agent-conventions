# Justify Convention Exceptions With a Checkable Reason Comment

**Impact: MEDIUM-HIGH (예외가 취향인지 근거가 있는 것인지 코드에서 바로 갈립니다)**

여러 규칙이 예외를 허용하면서 "이유를 주석으로 남긴다"를 조건으로 답니다.
그 주석의 기준을 여기서 한 번만 정합니다.

이유 주석은 **다른 사람이 확인할 수 있는 것**을 가리켜야 합니다.

| 확인할 수 있는 근거 | 예 |
| --- | --- |
| 외부 패키지와 그 제약 | 어떤 라이브러리의 어떤 API가 무엇을 요구하는지 |
| 측정 결과 | 무엇을 재서 얼마가 나왔는지 |
| 제품 명세나 티켓 | 결정이 적힌 곳 |
| 설정 키 | `config.*` 경로 |

"성능을 위해", "안전하게", "필요해서"처럼 다시 확인할 수 없는 말은 근거가 아닙니다.
그런 주석은 예외 조건을 채우지 못합니다.

주석은 예외가 일어나는 줄 바로 위에 `//`로 씁니다.
형식과 어투는 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/05-05-docs-justify-convention-exceptions-with-a-reason-comment.md)을 읽습니다.
