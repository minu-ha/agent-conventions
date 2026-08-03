# Keep Inline Comments for Constraints and Caveats Only

**Impact: MEDIUM (자명한 코드를 설명하는 주석은 막고 오해를 막는 메모만 남깁니다)**

함수 본문 안에서는 블록 주석을 쓰지 않습니다.
`//` 주석은 도메인 규칙, 예외를 막은 의도, 외부 라이브러리 제약, 부수효과 순서처럼
없으면 오해할 자리에만 씁니다.
변수명을 그대로 되풀이하는 설명은 남기지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/05-01-docs-keep-inline-comments-for-constraints-and-caveats.md)을 읽습니다.
