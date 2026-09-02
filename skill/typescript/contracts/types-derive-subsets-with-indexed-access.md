# Derive Subsets With Indexed Access Instead of `Pick`

**Impact: MEDIUM-HIGH (고른 필드의 이름과 출처가 선언에 그대로 보이고 `?`·`readonly`가 흘러나가지 않습니다)**

기존 타입의 일부만 필요하면 `interface`를 선언하고 각 필드를 `원본["필드"]` 인덱스 접근으로 가져옵니다.
어느 타입을 그대로 참조하고 어느 때 새로 선언하는지는 `types-reuse-existing-contracts-before-new-types`가 정합니다.

**`Pick`은 쓰지 않습니다.**
고르는 것은 언제나 닫힌 집합이라 서드파티 타입이어도 `interface`에 인덱스 접근으로 적을 수 있습니다.
**`Omit`은 원본을 따라가야 하는 자리에만 씁니다.**

가르는 질문은 하나입니다.

> 원본에 필드가 하나 늘면 이 타입도 따라 늘어야 하는가?

| 답 | 무엇인가 | 쓰는 것 |
| --- | --- | --- |
| 아니다 | 우리가 고른 닫힌 집합 | `interface` + `원본["필드"]` |
| 그렇다 | 원본을 따라가야 하는 열린 집합 | `Omit<원본, "뺄 이름">` |

`Omit`은 빼려는 이름이 원본에서 사라져도 오류가 나지 않으므로 원본이 바뀔 때 그 이름을 직접 확인합니다.

| 예 | 집합 | 적는 것 |
| --- | --- | --- |
| `UserPreview` | 닫힘. `UserRecord`에 `ssn`이 생겨도 받으면 안 됩니다 | 필드를 손으로 적습니다 |
| 외부 패키지가 필드를 더하면 따라 받아야 하는 `Omit<원본, "뺄 이름">` | 열림. 원본이 늘면 우리 타입도 늘어야 합니다 | 뺄 이름만 적습니다. 남는 속성을 손으로 다 적을 수도 없습니다 |

`Partial`과 `Required`도 원본을 따라가야 하는 자리에서만 씁니다.
`ReturnType`, `Parameters`, `Awaited`는 형태에서 필드를 고르는 일이 아니어서 이 규칙 대상이 아닙니다.

| 인덱스 접근 `interface` | `Pick` |
| --- | --- |
| 필드 이름이 선언에 그대로 보입니다 | 이름이 문자열 인자 안에 숨습니다 |
| 필드마다 문서 주석을 답니다. `types-document-custom-types-and-shapes` 규칙이 그렇게 요구합니다 | 필드가 없어 헤더 주석밖에 못 답니다 |
| 필드마다 출처가 따로 남아 여러 계약에서 모을 수 있습니다 | 원본 하나에서만 뽑을 수 있습니다 |

원본 필드의 타입이 바뀌면 인덱스 접근과 `Pick` 둘 다 따라갑니다.
원본에서 필드가 사라지면 둘 다 그 자리에서 컴파일 오류가 납니다.

**인덱스 접근은 타입만 가져오고 `?`와 `readonly`는 가져오지 않으므로 직접 적습니다.**
`nickname?: string`을 `nickname: Src["nickname"]`으로 옮기면 `string | undefined`인 **필수** 필드가 됩니다.
`readonly id: string`도 인덱스 접근으로 옮기면 쓰기가 열립니다.
원본에서 `?`나 `readonly`가 붙은 필드는 파생한 `interface`에도 같이 적습니다.

필드가 없는 별칭 하나만 필요하면 인덱스 접근을 그대로 씁니다.
`type ProductId = ProductRecord["id"];`가 그 경우입니다.

> 예시·예외가 필요하면 [full rule](../rules/01-02-types-derive-subsets-with-indexed-access.md)을 읽습니다.
