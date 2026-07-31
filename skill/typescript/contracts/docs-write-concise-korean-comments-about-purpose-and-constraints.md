# Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (코드 동작을 서술하지 않고 의도와 제약에 주석을 집중시킵니다)**

주석은 한글로 작성하고, 목적, 제약, 부작용 중심으로 간결하게 적습니다.
헤더와 필드 doc 주석 문장은 명사형 종결이나 개조식 표현을 기본으로 하며,
코드 동작 설명보다 도입 이유와 제약 설명을 우선합니다.

기술 용어와 identifier는 영문으로 섞을 수 있지만
주석 본문 전체가 ASCII 또는 영문 label이면 한글 주석으로 인정하지 않습니다.
새로 추가하거나 바꾼 각 doc 주석 본문에는 그 선언의 목적이나 제약을 설명하는 한글 구절이 있어야 합니다.
다른 필드 주석이 한글이어도 영문-only 헤더 주석을 대신 통과시키지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/05-03-docs-write-concise-korean-comments-about-purpose-and-constraints.md)을 읽습니다.
