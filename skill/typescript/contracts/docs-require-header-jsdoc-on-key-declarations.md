# Require Header JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (makes important boundaries searchable and explainable before readers inspect the implementation body)**

named query·mutation binding과 원격 함수에는 `@api` 헤더 JSDoc을 작성하고,
비자명한 handler/effect,
reusable/exported helper·custom hook,
커스텀 `type`/`interface`,
store,
formatter와 예외 memo 선언에도 헤더 JSDoc을 작성합니다.
중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다.
annotation 종류는 선언 역할에 따라 `@api`, `@event`, `@watch`, `@helper`, `@summary` 중 하나를 고릅니다.
header tag가 있어도 body가 비어 있거나 영문 label뿐이면 header 요구를 충족하지 않습니다. `requiresSelected`의
`docs-write-concise-korean-comments-about-purpose-and-constraints`는 선택 bookkeeping이 아니라 실제 한국어 content
gate입니다.

**Requires selected:** `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/docs-require-header-jsdoc-on-key-declarations.md)을 읽습니다.
