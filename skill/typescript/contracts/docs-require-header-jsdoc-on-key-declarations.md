# Require Header Doc Comments on Key Declarations

**Impact: MEDIUM (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

중요한 선언에는 구현을 읽기 전에 역할과 경계를 알 수 있도록 헤더 문서 주석을 씁니다.
빈 본문이나 영문 라벨만으로는 요구를 충족하지 못하며 실제 한국어 설명이 필요합니다.

| 헤더 문서 주석 대상 | 조건 |
| --- | --- |
| 이름 붙인 쿼리·뮤테이션·원격 함수·커스텀 훅·스토어 | 모두 작성합니다 |
| 포매터 | 표시 문자열을 만들 때 작성합니다 |
| 핸들러·이펙트 | 본문에 분기·`await`·두 개 이상의 동작 중 하나라도 있으면 작성합니다 |
| 보조 함수 | 재사용하거나 내보내면 작성합니다 |
| 커스텀 `type`, `interface` | 내보내기 여부와 무관하게 `types-document-custom-types-and-shapes`를 따릅니다 |

형식은 `docs-write-doc-comments-as-multiline-blocks`,
내용과 태그는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/06-02-docs-require-header-jsdoc-on-key-declarations.md)을 읽습니다.
