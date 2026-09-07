# Derive Subsets With Indexed Access Instead of `Pick`

**Impact: MEDIUM-HIGH (고른 필드의 이름과 출처를 드러내고 선택 여부와 읽기 전용 속성을 보존합니다)**

기존 계약의 일부 필드는 `interface`에 `원본["필드"]`로 적고, `Pick`은 쓰지 않습니다.
계약 전체를 재사용할지는 `types-reuse-existing-contracts-before-new-types`가 정합니다.

| 원본에 필드가 추가될 때 | 선언 방식 | 예 |
| --- | --- | --- |
| 따라 늘면 안 됨 | `interface` + 인덱스 접근 | `UserPreview`에는 새 `ssn` 필드가 들어오지 않습니다 |
| 따라 늘어야 함 | `Omit<원본, "뺄 이름">` | 외부 계약의 필드 추가를 그대로 받습니다 |
| 전체 필드를 선택 또는 필수로 바꾸면서 원본의 필드 추가도 따라야 함 | `Partial`, `Required` | 열린 집합에만 씁니다 |
| 필드 하나의 타입만 필요함 | 인덱스 접근 별칭 | `type ProductId = ProductRecord["id"]` |

`Omit`은 제외한 이름이 원본에서 사라져도 오류가 나지 않으므로 원본 변경 시 이름을 확인합니다.
`ReturnType`, `Parameters`, `Awaited`는 필드를 고르는 연산이 아니므로 대상이 아닙니다.

인덱스 접근은 필드 이름과 출처를 선언에 남겨 여러 계약의 필드를 모으고 각각 문서화하기 좋습니다.
필드 주석은 `types-document-custom-types-and-shapes`를 따릅니다.
원본 필드의 타입 변경과 삭제는 인덱스 접근과 `Pick` 모두 컴파일 검사에 반영됩니다.

| 보존할 계약 | 적는 법 |
| --- | --- |
| 선택 필드의 키 생략 | `?`를 직접 붙입니다. 없으면 `string \| undefined`여도 필수 필드입니다 |
| 읽기 전용 필드 | `readonly`를 직접 붙입니다. 인덱스 접근만으로는 복사되지 않습니다 |
| `exactOptionalPropertyTypes`가 켜진 선택 필드의 쓰기 타입 | `name?: Required<Src>["name"]`으로 원본의 명시적 `undefined` 허용 여부를 보존합니다 |

선택 필드에 `name?: Src["name"]`을 쓰면 읽기 타입의 `undefined`까지 대입하도록 계약을 넓힐 수 있습니다.
이를 막는 `Required<원본>["필드"]`는 닫힌 집합에서도 허용하며, 이 처리 때문에 컴파일러 옵션을 바꾸지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/01-02-types-derive-subsets-with-indexed-access.md)을 읽습니다.
