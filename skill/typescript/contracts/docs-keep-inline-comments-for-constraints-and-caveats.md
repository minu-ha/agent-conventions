# Keep Inline Comments for Constraints and Caveats Only

**Impact: MEDIUM (prevents inline comments from narrating obvious code while preserving notes that avoid real misunderstandings)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고, `//` 주석은 도메인 규칙, 예외 방어 의도, 외부 라이브러리 제약, 부수효과 순서처럼 없으면 오해될 수 있는 경우에만 씁니다. 변수명 그대로 반복하는 설명은 남기지 않습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/docs-keep-inline-comments-for-constraints-and-caveats.md)을 추가로 읽고 fallback 사유를 기록합니다.
