---
title: Reuse Existing Contracts Before Declaring New Types
titleKo: 새 타입을 선언하기 전에 기존 계약을 먼저 씁니다
impact: MEDIUM-HIGH
impactDescription: 뜻이 그대로면 기존 타입이나 스키마에서 끌어와 같은 형태를 두 번 선언하지 않습니다
appliesWhen:
  - 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때
  - 같은 형태를 두 번 선언했다가 넣거나 뺄 때
  - 제외: 맞는 후보가 없거나 소유자만 옮긴 경우
  - 제외: 그대로인 계약을 새 자리에서 쓰는 경우
  - 제외: 고칠 수 없는 형태를 그대로 쓰는 경우
reviewWith: types-document-custom-types-and-shapes
tags: types
---

## Reuse Existing Contracts Before Declaring New Types

**Impact: MEDIUM-HIGH (뜻이 그대로면 기존 타입이나 스키마에서 끌어와 같은 형태를 두 번 선언하지 않습니다)**

필드 이름, 타입, 선택 여부가 모두 같은 선언이 이미 있으면 그대로 참조합니다.
그중 일부만 필요하면 **`interface`를 선언하고 각 필드를 `원본["필드"]` 인덱스 접근으로 가져옵니다.**
같은 이름의 필드가 타입이나 선택 여부에서 하나라도 다르면 끌어오지 않고 새로 선언합니다.
필드 구성이 부분집합인 것만으로는 다르다고 보지 않습니다.
필드 구성만 부분집합인 그 경우가 인덱스 접근을 쓰는 자리입니다.
소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

**`Pick`은 쓰지 않습니다.** 고르는 것은 언제나 닫힌 집합이라
서드파티 타입이어도 `interface`에 인덱스 접근으로 적을 수 있습니다.
**`Omit`은 원본을 따라가야 하는 자리에만 씁니다.**

가르는 질문은 하나입니다.

> 원본에 필드가 하나 늘면 이 타입도 따라 늘어야 하는가?

| 답 | 무엇인가 | 쓰는 것 |
| --- | --- | --- |
| 아니다 | 우리가 고른 닫힌 집합 | `interface` + `원본["필드"]` |
| 그렇다 | 원본을 따라가야 하는 열린 집합 | `Omit<원본, "뺄 이름">` |

`Omit`은 빼려는 이름이 원본에서 사라져도 오류가 나지 않으므로 원본이 바뀔 때 그 이름을 직접 확인합니다.

`UserPreview`는 `UserRecord`에 `ssn`이 생겨도 받으면 안 됩니다.
닫힌 집합이라 필드를 손으로 적습니다.
래퍼의 `Omit<HTMLAttributes<T>, "color">`는 리액트가 새 DOM 속성을 더하면 받아야 합니다.
열린 집합이라 뺄 이름만 적고, 남는 속성을 손으로 다 적을 수도 없습니다.

`Partial`과 `Required`도 원본을 따라가야 하는 자리에서만 씁니다.
`ReturnType`, `Parameters`, `Awaited`는 형태에서 필드를 고르는 일이 아니어서 이 규칙 대상이 아닙니다.

| 인덱스 접근 `interface` | `Pick` |
| --- | --- |
| 필드 이름이 선언에 그대로 보입니다 | 이름이 문자열 인자 안에 숨습니다 |
| 필드마다 문서 주석을 답니다. `types-document-custom-types-and-shapes` 규칙이 그렇게 요구합니다 | 필드가 없어 헤더 주석밖에 못 답니다 |
| 필드마다 출처가 따로 남아 여러 계약에서 모을 수 있습니다 | 원본 하나에서만 뽑을 수 있습니다 |

원본 필드의 타입이 바뀌면 인덱스 접근과 `Pick` 둘 다 따라가고,
원본에서 필드가 사라지면 둘 다 그 자리에서 컴파일 오류가 납니다.

**인덱스 접근은 타입만 가져오고 `?`와 `readonly`는 가져오지 않으므로 직접 적습니다.**
`nickname?: string`을 `nickname: Src["nickname"]`으로 옮기면 `string | undefined`인 **필수** 필드가 됩니다.
`readonly id: string`도 인덱스 접근으로 옮기면 쓰기가 열립니다.
원본에서 `?`나 `readonly`가 붙은 필드는 파생한 `interface`에도 같이 적습니다.

필드가 없는 별칭 하나만 필요하면 인덱스 접근을 그대로 씁니다.
`type ProductId = ProductRecord["id"];`가 그 경우입니다.

형태가 그대로인 계약을 새 자리에서 쓰는 것만으로는 이 규칙이 걸리지 않습니다.
호출 계약 역할은 `types-document-custom-types-and-shapes`가 따로 판정합니다.

위치 인자를 객체 입력으로 바꾸면서, 우리가 고칠 수 있는 기존 형태를 그대로 다시 쓰면
`types-document-custom-types-and-shapes`만 걸리고 이 규칙은 걸리지 않습니다.
외부·생성된·읽기 전용·공용 형태를 그대로 쓰면 두 타입 규칙 모두 대상이 아니고, 문서화는 문서 규칙이 따로 판정합니다.
요청에 없는 `*Params`나 `*Input`을 만들어 이 규칙을 스스로 켜지 않습니다.
맞는 형태가 없는 새 도메인 계약은 문서화 규칙만 걸립니다.

원본 입력과 정규화한 값은 필드가 같아도 뜻이 달라 입력 형태를 따로 두는 것이 맞습니다.
그때도 문서화 규칙만 걸리고 이 규칙은 걸리지 않습니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
// 이미 있는 계약
interface UserRecord {
	id: string;
	name: string;
	email: string;
}

// 필드 이름, 타입, 선택 여부가 그대로인데 새로 선언했다
interface UserPreview {
	id: string;
	name: string;
}
```

**Incorrect (`Pick`으로 골라 필드 이름과 설명이 사라짐):**

```ts
type UserPreview = Pick<UserRecord, "id" | "name">;
```

**Correct (필드마다 출처를 인덱스 접근으로 가져옴):**

```ts
/**
 * 사용자 미리보기 계약
 */
interface UserPreview {
	/**
	 * 사용자 식별자
	 */
	id: UserRecord["id"];
	/**
	 * 목록에 표시할 이름
	 */
	name: UserRecord["name"];
}
```

**Correct (여러 계약에서 필드를 모으고 `?`, `readonly`를 직접 적음):**

```ts
/**
 * product 목록 한 행의 표시 계약
 */
interface ProductListRow {
	/**
	 * product 식별자
	 */
	readonly id: ProductRecord["id"];
	/**
	 * 소속 분류 이름
	 */
	categoryName: CategoryRecord["name"];
	/**
	 * 마지막 수정자 이름. 원본에서 선택 필드라 여기서도 선택으로 둔다
	 */
	ownerName?: UserRecord["name"];
}
```
