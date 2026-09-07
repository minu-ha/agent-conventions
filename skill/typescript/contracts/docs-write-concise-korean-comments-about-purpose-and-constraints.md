# Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 목적·제약·부수효과를 설명합니다.
이름과 시그니처에 없는 정보가 없으면 지우고, 필요한 배경에 따라 한 문장이나 여러 문장으로 씁니다.

| 내용·태그 | 판단 |
| --- | --- |
| 선언 이름만 번역하거나 코드를 한 줄씩 옮긴 설명 | 쓰지 않습니다 |
| 설명 없이 `@param`, `@returns`만 나열 | 쓰지 않습니다 |
| `@api`, `@helper`, `@field` | 이름과 문법이 드러내는 역할을 태그로 반복하지 않습니다 |
| `@schema` 같은 비표준 태그 | 새로 만들지 않습니다 |
| `@summary` | 헤더 첫 줄과 겹치므로 쓰지 않습니다 |
| `@deprecated`, `@example`, `@param`, `@returns` 등 TSDoc 태그 | 필요할 때만 씁니다 |
| 영어 기술 용어·식별자 | 섞어 써도 됩니다. 본문 전체가 영어인 주석은 허용하지 않습니다 |

글자 수 제한은 두지 않습니다. 헤더가 영어뿐이면 필드 주석이 한국어여도 요구를 충족하지 못합니다.
선언 위 문서 주석은 `docs-write-doc-comments-as-multiline-blocks`,
본문 설명은 `docs-keep-body-comments-for-intent-and-steps`에 따라 `//`로 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/06-03-docs-write-concise-korean-comments-about-purpose-and-constraints.md)을 읽습니다.
