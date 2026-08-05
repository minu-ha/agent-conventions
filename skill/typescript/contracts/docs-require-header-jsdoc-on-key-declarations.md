# Require Header Doc Comments on Key Declarations

**Impact: MEDIUM-HIGH (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

이름 붙인 쿼리와 뮤테이션, 원격 함수, 본문에 분기·`await`·두 개 이상의 동작이 있는 핸들러와 이펙트,
재사용하거나 내보낸 보조 함수,
커스텀 훅, 커스텀 `type`과 `interface`, 스토어, 포매터, 예외 메모 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

주석의 형식은 `docs-write-doc-comments-as-multiline-blocks`가,
태그를 붙일지는 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/05-02-docs-require-header-jsdoc-on-key-declarations.md)을 읽습니다.
