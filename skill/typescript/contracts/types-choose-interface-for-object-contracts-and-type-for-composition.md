# Choose Interface for Object Contracts and Type for Type Composition

**Impact: MEDIUM (선언 형식만 보고도 필드 계약인지 타입 사이의 관계인지 구분할 수 있습니다)**

독립된 객체 필드 계약은 `interface`, 타입 계산이나 조합은 `type`으로 선언합니다.
`Draft`, `State` 같은 역할어가 아니라 선언이 나타내는 계약을 기준으로 고릅니다.

| 선언 대상 | 형식 |
| --- | --- |
| 이름이 있고 필드를 직접 읽는 독립 객체 | `interface` |
| 리터럴 유니언, 기본 타입·튜플 별칭, 함수 시그니처 | `type` |
| 매핑·조건부 타입, 필드가 없는 인덱스 접근 별칭 | `type` |
| `Omit`, `Record` 같은 계산, 다른 타입과의 교차 | `type` |
| 유니언·교차 조합에서만 쓰는 객체 | `type` |

형식을 맞추려고 별칭을 만들거나 객체 형태를 전부 `interface`로 바꾸지 않습니다.
추론되는 익명 결과와 외부·생성된 계약은 그대로 둡니다.
같은 뜻의 기존 계약은 `types-reuse-existing-contracts-before-new-types`에 따라 재사용합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-08-types-choose-interface-for-object-contracts-and-type-for-composition.md)을 읽습니다.
