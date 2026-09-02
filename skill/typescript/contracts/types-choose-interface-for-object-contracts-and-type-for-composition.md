# Choose Interface for Object Contracts and Type for Type Composition

**Impact: MEDIUM (선언 형식만 보고도 필드 계약인지 타입 사이의 관계인지 구분할 수 있습니다)**

이름이 있고 필드를 직접 읽는 독립 객체 계약은 `interface`로 선언합니다.
다른 타입과의 계산이나 조합이 핵심인 선언은 `type`으로 둡니다.

| 선언 대상 | 형식 |
| --- | --- |
| 독립된 객체 필드 계약 | `interface` |
| literal union, primitive·tuple 별칭 | `type` |
| 함수 시그니처 | `type` |
| mapped·conditional type, 필드가 없는 인덱스 접근 별칭 | `type` |
| `Omit`·`Record` 같은 계산과 교차 조합 | `type` |
| 다른 타입과의 union·교차에만 등장하고 단독으로는 쓰지 않는 객체 | `type` |

객체 형태라는 이유만으로 모두 `interface`로 바꾸지는 않습니다.
`Draft`, `State` 같은 역할어가 붙었다는 이유로 선언 형식을 고르지 않습니다.
같은 역할 이름이라도 독립된 필드 계약이면 `interface`, 타입 계산 결과면 `type`입니다.

선언 형식을 맞추려고 새 별칭을 만들지 않습니다.
구현 안에서 충분히 추론되는 익명 결과와 외부·생성된 계약은 그대로 둡니다.
같은 뜻의 계약이 이미 있으면 `types-reuse-existing-contracts-before-new-types`에 따라 먼저 재사용합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-08-types-choose-interface-for-object-contracts-and-type-for-composition.md)을 읽습니다.
