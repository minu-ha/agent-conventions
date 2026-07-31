# Require Header Doc Comments on Key Declarations

**Impact: MEDIUM-HIGH (구현 본문을 읽기 전에 중요한 경계를 검색하고 설명할 수 있게 합니다)**

named query·mutation binding, 원격 함수, 비자명한 handler/effect, reusable/exported helper와 custom hook,
커스텀 `type`/`interface`, store, formatter, 예외 memo 선언에는 헤더 doc 주석을 작성합니다.
중요한 경계가 파일 검색에서 바로 보이게 하는 것이 목적입니다.

형식은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나누고 `/** 한 줄 */` 형태는 쓰지 않습니다.
선언 설명에 `//`를 쓰지 않습니다. `//`는 본문 안 제약 설명 몫입니다.

annotation 태그는 쓰지 않습니다.
`@api`, `@helper`, `@summary` 같은 역할 태그를 붙이지 않고 `@schema`처럼 새로 만들지도 않습니다.
선언 종류는 이름 규칙과 문법이 이미 드러냅니다.
`@deprecated`, `@example`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

헤더 doc 주석은 본문이 비어 있거나 영문 label뿐이면 요구를 충족하지 않습니다.
`requiresSelected`의 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
선택 bookkeeping이 아니라 실제 한국어 content gate입니다.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/05-02-docs-require-header-jsdoc-on-key-declarations.md)을 읽습니다.
