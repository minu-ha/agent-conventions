# Document Compound Parts Above the Props Interface

**Impact: MEDIUM (부품을 열면 계약과 설명이 붙어 있어 한 번에 읽힙니다)**

합성 공개 부품은 설명, 프롭스 `interface`, 컴포넌트 선언을 이 순서로 붙여 둡니다.

1. 부품이 무엇인지 설명하는 문서 주석
2. 프롭스 `interface`
3. 컴포넌트 선언

단순 내부 래퍼에는 부품 문서를 만들지 않습니다.
공개하지 않는 것은 `strategy-expose-only-assembled-compound-parts`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/10-02-docs-document-compound-parts-above-props-interface.md)을 읽습니다.
