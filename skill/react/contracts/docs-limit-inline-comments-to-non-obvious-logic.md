# Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (코드를 해설하기보다 주석을 caveat, 제약, 부수효과 설명에 집중시킵니다)**

함수 본문 안에서는 `//` 라인 주석을 씁니다.
코드만 읽어서는 놓치기 쉬운 경우에만 남깁니다.

- 남기는 경우: 도메인 규칙, 예외 방어, 라이브러리 제약, 부수효과 순서
- 남기지 않는 경우: 변수명 반복, 단순 매핑 설명

헤더 JSDoc과 annotation 태그 선택은 `docs-require-jsdoc-on-key-declarations`와
companion skill인 `convention-typescript`의 표준을 따릅니다.

**Requires selected:** `typescript/docs-keep-inline-comments-for-constraints-and-caveats` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/10-02-docs-limit-inline-comments-to-non-obvious-logic.md)을 읽습니다.
