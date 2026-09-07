# Derive Subsets With Indexed Access Instead of `Pick`

**Impact: MEDIUM (고른 필드의 이름과 출처를 드러내고 선택 여부와 읽기 전용 속성을 보존합니다)**

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

원본 필드를 좁히거나 필수로 바꿀 때도 원본에서 파생합니다.
원시 타입을 다시 적으면 원본과의 연결이 끊겨 외부 계약에서 온 필드인지 우리가 정한 필드인지 구분할 수 없습니다.

| 필드 값을 원본과 다르게 받을 때 | 적는 법 | 예 |
| --- | --- | --- |
| 필드 값 중 일부만 받음 | `Extract<원본["필드"], 좁힌 타입>` | `TableCellProps`의 `padding` 중 `normal`·`none`만 받습니다 |
| 원본이 비워 두는 필드를 필수로 받음 | `NonNullable<원본["필드"]>` | `align: NonNullable<TableCellProps["align"]>` |
| union 계약 중 한 갈래만 받음 | `Extract<원본, 판별 필드>` | `Extract<TextFieldProps, { variant?: "outlined" }>` |

인덱스 접근은 필드 이름과 출처를 선언에 남겨 여러 계약의 필드를 모으고 각각 문서화하기 좋습니다.
필드 주석은 `types-document-custom-types-and-shapes`를 따릅니다.
원본 필드의 타입 변경과 삭제는 인덱스 접근과 `Pick` 모두 컴파일 검사에 반영됩니다.

| 보존할 계약 | 적는 법 |
| --- | --- |
| 선택 필드의 키 생략 | `?`를 직접 붙입니다. 없으면 `string \| undefined`여도 필수 필드입니다 |
| 읽기 전용 필드 | `readonly`를 직접 붙입니다. 인덱스 접근만으로는 복사되지 않습니다 |
| `exactOptionalPropertyTypes`가 켜진 프로젝트의 선택 필드 | `name?: Required<Src>["name"]`으로 `undefined` 대입을 막습니다. 옵션이 꺼진 프로젝트는 `Src["name"]`으로 충분합니다 |

**Incorrect (`Pick`으로 골라 필드 이름과 설명이 사라집니다):**

```ts
// 원본 계약
interface UserRecord {
	readonly id: string;
	name?: string;
	email: string;
}

type UserPreview = Pick<UserRecord, "id" | "name">;
```

**Correct (필드마다 출처를 인덱스 접근으로 가져오고 `?`, `readonly`를 직접 적습니다):**

```ts
/**
 * 사용자 미리보기 계약
 */
interface UserPreview {
	/**
	 * 사용자 식별자
	 */
	readonly id: UserRecord["id"];
	/**
	 * 목록에 표시할 이름. 원본에서 선택 필드라 여기서도 선택으로 둔다
	 */
	name?: UserRecord["name"];
}
```

> 나머지 예시·예외는 [full rule](../rules/01-02-types-derive-subsets-with-indexed-access.md)에 있습니다.
