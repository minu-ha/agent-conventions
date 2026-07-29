# Standardize Annotation Tags by Declaration Role

**Impact: MEDIUM-HIGH (keeps mixed TypeScript and TSX files scannable by using a small fixed annotation set)**

annotation 태그는 아래 여덟 개만 사용합니다.

| 태그 | 대상 |
| --- | --- |
| `@api` | 원격 데이터, 파일, 외부 실행 경계 |
| `@event` | 이벤트 핸들러, 사용자 액션 처리 |
| `@watch` | 반응형 동기화 블록, subscription |
| `@helper` | 재사용 가능한 pure support function |
| `@summary` | type, interface, store, custom hook, schema root |
| `@field` | 계약 내부 필드 |
| `@part` | compound component public part |
| `@description` | `@part`와 함께 쓰는 part 설명 |

`@description`은 `@part`와 함께만 사용합니다.
`@schema`, `@shape`, `@contract`, `@data`, `@type`, `@property`는 쓰지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/docs-standardize-annotation-tags-by-declaration-role.md)을 읽습니다.
