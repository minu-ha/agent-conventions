# Justify Convention Exceptions With a Checkable Reason Comment

**Impact: MEDIUM (예외가 취향인지 근거가 있는지 코드에서 바로 드러납니다)**

규칙이 허용한 예외에는 다른 사람이 확인할 수 있는 근거를 주석으로 남깁니다.
“성능을 위해”, “안전하게”, “필요해서”처럼 확인할 수 없는 말은 예외의 근거가 되지 않습니다.

| 근거 | 적을 내용 |
| --- | --- |
| 외부 패키지·API 제약 | 어떤 API가 무엇을 요구하는지 |
| 측정 결과 | 측정 대상과 수치 |
| 제품 명세·티켓 | 결정이 기록된 위치 |
| 상수 | `constant` 폴더에 선언된 이름 |

| 예외 위치 | 주석 위치·형태 |
| --- | --- |
| 일반 코드 | 해당 줄 바로 위에 `//` |
| 헤더 문서 주석이 있는 선언 | 헤더 블록 안에 이유 작성 |
| JSX 자식 | 프레임워크 규칙이 정한 형태 |

어투와 내용은 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/06-05-docs-justify-convention-exceptions-with-a-reason-comment.md)을 읽습니다.
