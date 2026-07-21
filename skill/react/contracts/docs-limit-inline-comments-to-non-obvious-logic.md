# Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (코드를 해설하기보다 주석을 caveat, 제약, 부수효과 설명에 집중시킴)**

함수 본문 안에서는 `//` 라인 주석을 사용하고, 도메인 규칙, 예외 방어, 라이브러리 제약, 부수효과 순서처럼 코드만 읽어서는 놓치기 쉬운 경우에만 남깁니다. 변수명 반복이나 단순 매핑 설명은 주석으로 적지 않습니다. 헤더 JSDoc과 annotation 태그 선택은 `docs-require-jsdoc-on-key-declarations`와 companion skill인 `convention-typescript`의 표준을 따릅니다.

**Requires selected:** `typescript/docs-keep-inline-comments-for-constraints-and-caveats` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/docs-limit-inline-comments-to-non-obvious-logic.md)을 추가로 읽고 fallback 사유를 기록합니다.
