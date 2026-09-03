# TypeScript 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=typescript`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 TypeScript 코딩 컨벤션입니다. 명시적인 네이밍, 직접 import, 재사용 가능한 타입 계약, 절제된 helper 추출, 반복 lookup과 정렬의 불변성, 의도적인 결측값 처리, 일관된 JSDoc 경계를 강조합니다. React, CSS 같은 위 계층 skill이 공통으로 함께 따르는 규칙 세트이기도 합니다. `rules/` 아래 rule 파일이 source of truth입니다.

---

## 목차

1. [Types and Contracts](#1-types-and-contracts) — **HIGH**
    - 1.1 [Reuse Existing Contracts Before Declaring New Types](#11-reuse-existing-contracts-before-declaring-new-types)
    - 1.2 [Derive Subsets With Indexed Access Instead of `Pick`](#12-derive-subsets-with-indexed-access-instead-of-pick)
    - 1.3 [Prefer Function Variable Types Over Parameter Annotations](#13-prefer-function-variable-types-over-parameter-annotations)
    - 1.4 [Document Custom Types and Declarative Shapes](#14-document-custom-types-and-declarative-shapes)
    - 1.5 [Mark Unused Parameters With an Underscore Prefix](#15-mark-unused-parameters-with-an-underscore-prefix)
    - 1.6 [Narrow `unknown` Instead of Asserting](#16-narrow-unknown-instead-of-asserting)
    - 1.7 [Replace `enum` With `as const` Objects](#17-replace-enum-with-as-const-objects)
    - 1.8 [Choose Interface for Object Contracts and Type for Type Composition](#18-choose-interface-for-object-contracts-and-type-for-type-composition)
2. [Naming and Module Boundaries](#2-naming-and-module-boundaries) — **HIGH**
    - 2.1 [Place Project-wide Constants in the Root `constant` Folder](#21-place-project-wide-constants-in-the-root-constant-folder)
    - 2.2 [Place Owner-only Constants in the Owner `_constant` Folder](#22-place-owner-only-constants-in-the-owner-constant-folder)
    - 2.3 [Use Role-Based File, Symbol, and Constant Naming](#23-use-role-based-file-symbol-and-constant-naming)
    - 2.4 [Use Direct Imports and Dedicated Public Entry Points](#24-use-direct-imports-and-dedicated-public-entry-points)
    - 2.5 [Import by Absolute Path](#25-import-by-absolute-path)
    - 2.6 [Read Environment Values Through `config/env.ts`](#26-read-environment-values-through-config-env-ts)
    - 2.7 [Name Types by Role and Lifetime](#27-name-types-by-role-and-lifetime)
3. [Functions and Helper Boundaries](#3-functions-and-helper-boundaries) — **MEDIUM-HIGH**
    - 3.1 [Declare Functions as Arrow Consts](#31-declare-functions-as-arrow-consts)
    - 3.2 [Use Named Object Params for Complex Signatures](#32-use-named-object-params-for-complex-signatures)
    - 3.3 [Extract Support Functions Only When the Boundary Is Real](#33-extract-support-functions-only-when-the-boundary-is-real)
    - 3.4 [Give Each Support Function Its Own File](#34-give-each-support-function-its-own-file)
    - 3.5 [Order Declarations Top Down](#35-order-declarations-top-down)
    - 3.6 [Promote Owner-Free Functions to the Root util Folder](#36-promote-owner-free-functions-to-the-root-util-folder)
    - 3.7 [Avoid Imperative Assembly in Wide Scopes](#37-avoid-imperative-assembly-in-wide-scopes)
    - 3.8 [Name a Value Only to Prevent Recompute or Explain a Judgment](#38-name-a-value-only-to-prevent-recompute-or-explain-a-judgment)
    - 3.9 [Name Functions by What Comes Out](#39-name-functions-by-what-comes-out)
4. [Values and Data Structures](#4-values-and-data-structures) — **HIGH**
    - 4.1 [Prefer Immutable Array Sorting](#41-prefer-immutable-array-sorting)
    - 4.2 [Use Set and Map for Repeated Lookups](#42-use-set-and-map-for-repeated-lookups)
    - 4.3 [Read Object Fields Through Chains, Not Destructuring](#43-read-object-fields-through-chains-not-destructuring)
    - 4.4 [Declare Meaningful Numbers Instead of Writing Them Inline](#44-declare-meaningful-numbers-instead-of-writing-them-inline)
    - 4.5 [Avoid Lookup Tables for Simple Value Choices](#45-avoid-lookup-tables-for-simple-value-choices)
    - 4.6 [Use es-toolkit for Value Helpers](#46-use-es-toolkit-for-value-helpers)
    - 4.7 [Handle Dates With dayjs](#47-handle-dates-with-dayjs)
    - 4.8 [Decide Once and Carry the Result](#48-decide-once-and-carry-the-result)
5. [Absence and Fallback Handling](#5-absence-and-fallback-handling) — **HIGH**
    - 5.1 [Expose Optional Values Instead of Silent Fallbacks](#51-expose-optional-values-instead-of-silent-fallbacks)
    - 5.2 [Resolve Defaults Once at the Boundary](#52-resolve-defaults-once-at-the-boundary)
    - 5.3 [Do Not Guard What the Types Already Guarantee](#53-do-not-guard-what-the-types-already-guarantee)
    - 5.4 [Check Absence Once at the Boundary](#54-check-absence-once-at-the-boundary)
6. [JSDoc and Comment Conventions](#6-jsdoc-and-comment-conventions) — **MEDIUM**
    - 6.1 [Keep Body Comments for Intent and Steps](#61-keep-body-comments-for-intent-and-steps)
    - 6.2 [Require Header Doc Comments on Key Declarations](#62-require-header-doc-comments-on-key-declarations)
    - 6.3 [Write Concise Korean Comments About Purpose and Constraints](#63-write-concise-korean-comments-about-purpose-and-constraints)
    - 6.4 [Write Doc Comments as Multiline Blocks](#64-write-doc-comments-as-multiline-blocks)
    - 6.5 [Justify Convention Exceptions With a Checkable Reason Comment](#65-justify-convention-exceptions-with-a-checkable-reason-comment)
7. [Tooling](#7-tooling) — **MEDIUM**
    - 7.1 [Configure Biome to Enforce the Mechanical Rules](#71-configure-biome-to-enforce-the-mechanical-rules)

---

## 1. Types and Contracts

**Impact: HIGH**

함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화로 계약을 드러내고 다시 쓸 수 있게 유지해야 합니다. 독립된 객체 계약은 `interface`, 타입 계산과 조합은 `type`으로 선언합니다. 실행 값과 타입을 한 선언에서 잡는 `as const` 객체와, 단언 대신 `unknown`을 좁히는 자리도 여기서 정합니다.

### 1.1 Reuse Existing Contracts Before Declaring New Types

**Rule:** `T01-01` · `types-reuse-existing-contracts-before-new-types`

**Applies when:** 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없거나 소유자만 옮긴 경우. 제외: 그대로인 계약을 새 자리에서 쓰는 경우. 제외: 고칠 수 없는 형태를 그대로 쓰는 경우.

**Review with:** `types-derive-subsets-with-indexed-access`, `types-document-custom-types-and-shapes`

**Impact: MEDIUM-HIGH (뜻이 그대로면 기존 타입이나 스키마를 그대로 참조해 같은 형태를 두 번 선언하지 않습니다)**

필드 이름, 타입, 선택 여부가 모두 같은 선언이 이미 있으면 그대로 참조합니다.
같은 이름의 필드가 타입이나 선택 여부에서 하나라도 다르면 끌어오지 않고 새로 선언합니다.
필드 구성이 부분집합인 것만으로는 다르다고 보지 않습니다.
일부만 필요할 때 어떻게 파생하는지는 `types-derive-subsets-with-indexed-access`가 정합니다.
소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

형태가 그대로인 계약을 새 자리에서 쓰는 것만으로는 이 규칙이 걸리지 않습니다.
호출 계약 역할은 `types-document-custom-types-and-shapes`가 따로 판정합니다.

위치 인자를 객체 입력으로 바꾸면서, 우리가 고칠 수 있는 기존 형태를 그대로 다시 쓰면
`types-document-custom-types-and-shapes`만 걸리고 이 규칙은 걸리지 않습니다.
외부·생성된·읽기 전용·공용 형태를 그대로 쓰면 두 타입 규칙 모두 대상이 아니고, 문서화는 문서 규칙이 따로 판정합니다.
요청에 없는 `*Params`나 `*Input`을 만들어 이 규칙을 스스로 켜지 않습니다.
맞는 형태가 없는 새 도메인 계약은 문서화 규칙만 걸립니다.

원본 입력과 정규화한 값은 필드가 같아도 뜻이 달라 입력 형태를 따로 두는 것이 맞습니다.
그때도 문서화 규칙만 걸리고 이 규칙은 걸리지 않습니다.

**Incorrect (기존 계약과 같은 구조를 다시 선언합니다):**

```ts
// 이미 있는 계약
interface UserRecord {
	id: string;
	name: string;
	email: string;
}

// 필드 이름, 타입, 선택 여부가 그대로인데 새로 선언했다
interface InviteRecipient {
	id: string;
	name: string;
	email: string;
}

export const sendInvites = (recipients: InviteRecipient[]): Promise<void> => { /* … */ };
```

**Correct (형태가 같으면 기존 계약을 그대로 참조합니다):**

```ts
/**
 * 초대 대상은 사용자 레코드 그대로다. 필드가 같아 따로 선언하지 않는다
 */
export const sendInvites = (recipients: UserRecord[]): Promise<void> => { /* … */ };
```

**Correct (선택 여부가 하나라도 다르면 새로 선언합니다):**

```ts
/**
 * 초대 폼 입력. 이름을 비울 수 있어 UserRecord와 선택 여부가 다르다
 */
interface InviteDraft {
	/**
	 * 받는 사람 이메일
	 */
	email: string;
	/**
	 * 표시 이름. 비우면 이메일을 그대로 보여 준다
	 */
	name?: string;
}
```

### 1.2 Derive Subsets With Indexed Access Instead of `Pick`

**Rule:** `T01-02` · `types-derive-subsets-with-indexed-access`

**Applies when:** 기존 타입의 일부 필드만 담는 형태를 선언·변경할 때. `Pick`·`Omit`·`Partial`·`Required`를 추가·변경할 때. 제외: 필드 이름·타입·선택 여부가 모두 같아 기존 타입을 그대로 참조하는 경우.

**Review with:** `types-document-custom-types-and-shapes`, `types-reuse-existing-contracts-before-new-types`

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

**Incorrect (인덱스 접근으로 옮기면서 `?`와 `readonly`를 흘립니다):**

```ts
// 원본: ProductRecord.id 는 readonly, UserRecord.name 은 선택 필드다
/**
 * product 목록 한 행의 표시 계약
 */
interface ProductListRow {
	/**
	 * product 식별자
	 */
	id: ProductRecord["id"];
	/**
	 * 마지막 수정자 이름
	 */
	ownerName: UserRecord["name"];
}
```

**Correct (여러 계약에서 필드를 모으고 `?`, `readonly`를 직접 적습니다):**

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
	 * 마지막 수정자 이름. 원본에서 선택 필드라 여기서도 선택으로 둔다
	 */
	ownerName?: UserRecord["name"];
}
```

**Correct (원본을 따라가야 하는 열린 집합은 `Omit`으로 뺍니다):**

```ts
/**
 * 내보내기 요청 전송 형태. 생성된 계약이 필드를 더하면 그대로 따라가고 서버가 채우는 시각만 뺀다
 */
type ExportRequestBody = Omit<GeneratedExportRequest, "requestedAt">;
```

### 1.3 Prefer Function Variable Types Over Parameter Annotations

**Rule:** `T01-03` · `types-prefer-function-variable-types-over-parameter-annotations`

**Applies when:** 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우.

**Review with:** `types-mark-unused-parameters-with-underscore`

**Impact: MEDIUM-HIGH (계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다)**

타입을 붙일 자리가 둘 있습니다.

| 붙이는 자리 | 형태 |
| --- | --- |
| 매개변수와 반환값에 하나씩 | `const handleClick = (event: MouseEvent<HTMLButtonElement>): void => …` |
| 함수를 담는 변수에 한 번 | `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …` |

쓸 수 있는 계약이 이미 있으면 아래쪽을 씁니다.
이름 하나로 매개변수와 반환값이 함께 정해져서 계약이 한 자리에 모입니다.

| 상황 | 하는 것 |
| --- | --- |
| 인터페이스, 객체 계약, 프레임워크 별칭이 이미 있음 | 그 계약을 함수를 담는 변수에 붙입니다 |
| 인터페이스에 콜백 필드가 있음 | `Contract["onSelect"]`처럼 인덱스 접근으로 가져다 씁니다 |
| 같은 시그니처를 쓰는 구현이 이미 둘 이상 | 함수 타입 별칭을 새로 선언합니다 |
| 쓸 계약이 없고 구현도 하나뿐 | 매개변수 타입을 직접 적습니다. 지역 함수 하나 때문에 별칭을 늘리지 않습니다 |

가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore` 규칙을 다시 봅니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`useQuery`에 넘기는 `select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
커링 팩토리가 돌려주는 리액트 핸들러는 프레임워크 컨벤션이 판정합니다.

**Incorrect (계약이 있는데 시그니처를 다시 적습니다):**

```ts
// 이미 있는 계약
/**
 * 사용자 화면 표시 문자열 계약
 */
interface UserFormatters {
	/**
	 * 상태 객체를 화면 문자열로
	 */
	toStateLabel: (state: Record<string, unknown>) => string;
	/**
	 * 권한 코드를 화면 문자열로
	 */
	toRoleLabel: (role: string) => string;
}

/**
 * 상태 객체를 화면 문자열로 바꾼다
 */
const toStateLabel = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (이미 있는 계약에서 시그니처를 가져와 함수 전체에 타입을 붙입니다):**

```ts
// 이미 있는 계약
/**
 * 사용자 화면 표시 문자열 계약
 */
interface UserFormatters {
	/**
	 * 상태 객체를 화면 문자열로
	 */
	toStateLabel: (state: Record<string, unknown>) => string;
	/**
	 * 권한 코드를 화면 문자열로
	 */
	toRoleLabel: (role: string) => string;
}

/**
 * 상태 객체를 화면 문자열로 바꾼다
 */
const toStateLabel: UserFormatters["toStateLabel"] = (state) => {
	return JSON.stringify(state);
};
```

**Incorrect (같은 시그니처를 쓰는 구현마다 매개변수와 반환 타입을 다시 적습니다):**

```ts
/**
 * 앞뒤 공백을 걷어낸 request 문자열
 */
const toRequest = (request: string): string => {
	return request.trim();
};

/**
 * 검색어로 쓸 수 있게 공백을 한 칸으로 줄인 request 문자열
 */
const toSearchRequest = (request: string): string => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

**Correct (같은 시그니처를 쓰는 구현이 둘 이상이면 함수 타입 별칭을 선언합니다):**

```ts
/**
 * request 변환 계약
 */
type ToRequest = (request: string) => string;

/**
 * 앞뒤 공백을 걷어낸 request 문자열
 */
const toRequest: ToRequest = (request) => {
	return request.trim();
};

/**
 * 검색어로 쓸 수 있게 공백을 한 칸으로 줄인 request 문자열
 */
const toSearchRequest: ToRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

### 1.4 Document Custom Types and Declarative Shapes

**Rule:** `T01-04` · `types-document-custom-types-and-shapes`

**Applies when:** 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 반환 타입이 익명으로 추론되는 경우.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: MEDIUM (구현을 파헤치지 않고도 도메인 전용 계약을 이해합니다)**

선언형 형태는 헤더와 필드를 나눠 문서화합니다.

| 선언 | 헤더 문서 주석 | 필드 문서 주석 |
| --- | --- | --- |
| 커스텀 `type`, `interface`, 스키마 최상단 | 선언 위에 씁니다 | 각 필드 바로 위에 문서 주석을 씁니다. 원본에서 가져온 필드여도 답니다 |
| 객체형 상수 | 선언 위에 씁니다 | 달지 않습니다. `constant` 폴더의 상수와 `enum` 성격 상수 객체의 키도 같습니다 |
| 필드가 없는 인덱스 접근 별칭(`type ProductId = ProductRecord["id"]`), `Omit`으로 뺀 형태 | 선언 위에 씁니다 | 적을 필드가 없습니다 |

주석이 있다고 끝나지 않습니다.
각 본문이 `docs-write-concise-korean-comments-about-purpose-and-constraints` 규칙의 한국어 조건을 만족해야 합니다.

이름 붙인 형태의 필드가 한 글자도 안 바뀌었더라도 새 역할을 처음 맡으면 이 규칙을 적용합니다.
위치 인자를 대체하는 입력 계약이나 함수 결과를 고정하는 출력 계약 역할이 그 경우입니다.
새로 맡은 역할을 헤더와 각 필드 주석으로 설명합니다.
새 입력이나 출력 역할이 새 타입 선언을 요구하지는 않습니다.
맞는 형태가 이미 우리 코드에 있으면 그대로 연결하고, 그 선언의 헤더와 필드 문서를 새 역할에 맞게 보강합니다.

외부·생성된·읽기 전용·공용 형태를 그대로 쓰기만 하면 해당하지 않습니다.
그 선언을 고치지 않고, 문서를 붙이려고 지역 별칭을 새로 만들지도 않습니다.
함수 선언 자체에 헤더 주석을 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 따로 판정합니다.

이름 붙인 선언 없이 구현 안에서만 추론되는 익명 객체는 이 규칙의 선언형 형태가 아닙니다.
쿼리의 `select`가 익명으로 반환하는 객체가 그 경우입니다.
이 규칙을 억지로 켜려고 필드 주석이나 새 타입 별칭을 만들지 않습니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씁니다):**

```ts
/**
 * 게시 결과 요약
 * 게시 대상 문서 ID
 */
interface PublishResult {
	documentId: string;
	published: boolean;
}
```

**Correct (헤더와 필드별 문서 주석을 씁니다):**

```ts
/**
 * 게시 결과 요약
 */
export interface PublishResult {
	/**
	 * 게시 대상 문서 ID
	 */
	documentId: string;
	/**
	 * 게시 성공 여부
	 */
	published: boolean;
}

/**
 * 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```

**Correct (객체형 상수는 헤더만 달고 키에는 달지 않습니다):**

```ts
/**
 * product 상태 코드. 서버 enum 과 같은 값이다
 */
export const product_status = {
	draft: "draft",
	published: "published",
} as const;
```

### 1.5 Mark Unused Parameters With an Underscore Prefix

**Rule:** `T01-05` · `types-mark-unused-parameters-with-underscore`

**Applies when:** 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.

**Impact: MEDIUM (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

쓰지 않는 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
커링한 핸들러의 마지막 콜백도 예외가 아닙니다.
매개변수를 하나도 쓰지 않는 경우도 예외가 아닙니다.

`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않아도 `() =>`로 줄이지 않습니다.
`(_event) =>`로 받아 계약을 남깁니다.

**Incorrect (계약의 일부인 콜백 매개변수를 조용히 생략합니다):**

```ts
/**
 * 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// 아무 일도 하지 않는 sink
};
```

**Correct (계약은 유지하고 쓰지 않는 매개변수만 `_`로 표시합니다):**

```ts
/**
 * 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

/**
 * 아무것도 남기지 않는 로그 sink. 테스트에서 출력을 끌 때 쓴다
 */
const noopLog: LogSink = (_message, _level) => {};
```

### 1.6 Narrow `unknown` Instead of Asserting

**Rule:** `T01-06` · `types-narrow-unknown-instead-of-asserting`

**Applies when:** `as` 단언, `!` `null` 아님 단언, `any`, `@ts-expect-error`를 추가할 때. 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때.

**Review with:** `docs-justify-convention-exceptions-with-a-reason-comment`, `tooling-configure-biome-to-enforce-these-rules`

**Impact: HIGH (컴파일을 통과시키려고 타입 검사를 끄는 자리가 남지 않습니다)**

컴파일러를 통과시키려고 `as`, `!`, `any`, `@ts-expect-error`를 쓰지 않습니다.
넷 다 "여기는 검사하지 마라"는 뜻이고, 틀렸을 때 알려 줄 사람이 없습니다.

형태를 모르는 값은 `unknown`으로 받고 좁혀서 씁니다.

| 값의 출처 | 어떻게 |
| --- | --- |
| 앱 밖에서 옴 (`localStorage`, `postMessage`, URL, 검증하지 않은 응답) | 스키마로 검증하고 그 결과에서 타입을 얻습니다 |
| 우리 코드 안에서 옴 | 좁히는 분기를 씁니다. 단언이 필요하면 타입이 잘못 잡힌 것입니다 |
| 외부 패키지 타입이 실제와 다름 | 단언을 쓰되 확인할 수 있는 이유를 바로 위에 남깁니다 |

`as const`와 `satisfies`는 대상이 아닙니다.
값을 넓히지 않게 고정하거나 형태가 맞는지 검사하는 것이라 검사를 끄지 않습니다.

표 셋째 줄의 이유 주석은 `docs-justify-convention-exceptions-with-a-reason-comment` 규칙이 정한 조건을 채워야 합니다.
"타입이 이상해서" 같은 다시 확인할 수 없는 말은 근거가 아닙니다.

`any`와 `!`는 `tooling-configure-biome-to-enforce-these-rules` 규칙이 기계로 막습니다.
`as`와 `@ts-expect-error`는 리뷰가 봅니다.

**Incorrect (앱 밖에서 온 값을 단언으로 통과시킵니다):**

```ts
const storedFilter = JSON.parse(localStorage.getItem("product-filter") as string) as ProductFilter;
```

**Correct (앱 밖에서 온 값은 스키마 결과에서 타입을 얻습니다):**

```ts
const storedValue = localStorage.getItem("product-filter");

// 처음 방문이면 저장된 필터가 없다. 없다는 사실을 그대로 둔다
const storedFilter = storedValue === null ? undefined : productFilterSchema.parse(JSON.parse(storedValue));
```

**Incorrect (`!`로 없을 수 있다는 사실을 지웁니다):**

```ts
const firstProduct = products.find((product) => product.isActive)!;
```

**Correct (없을 수 있으면 그대로 드러냅니다):**

```ts
const firstProduct = products.find((product) => product.isActive);

if (!firstProduct) {
	throw new NoActiveProductError();
}
```

**Incorrect (다시 확인할 수 없는 이유로 검사를 끕니다):**

```ts
// @ts-expect-error 타입이 이상하다
renderTextField(fieldProps);
```

**Correct (외부 패키지 타입이 실제와 달라 확인할 수 있는 이유를 남깁니다):**

```ts
// package.json의 @mui/material 6.1은 TextField 의 slotProps 타입이 htmlInput 을 받지 못한다.
// @mui/material/TextField/TextField.d.ts 선언과 런타임 동작이 다르다.
renderTextField(fieldProps as TextFieldProps);
```

### 1.7 Replace `enum` With `as const` Objects

**Rule:** `T01-07` · `types-replace-enum-with-as-const-objects`

**Applies when:** `enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 집합을 추가·변경할 때. 제외: 외부 패키지가 내보낸 `enum` 값을 그대로 읽어 쓰는 경우.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

**Impact: MEDIUM-HIGH (`enum` 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 `enum` 고유 문법을 피합니다.

`enum`은 타입 표기를 지우는 것만으로 실행 코드가 되지 않습니다.
그래서 TypeScript 5.8의 `--erasableSyntaxOnly`나 타입만 지우는 번들러와 함께 쓸 수 없습니다.
이 컨벤션의 `biome` 설정도 `style/noEnum`으로 `enum` 선언을 막습니다.

외부 패키지가 `enum`을 내보내고 그 값을 그대로 넘겨야 하면 그 `enum`을 씁니다.
우리가 새로 선언하는 값 집합만 이 규칙 대상입니다.

**Incorrect (`enum`을 직접 씁니다):**

```ts
enum ProductStatus {
	pending = "pending",
	passed = "passed",
	failed = "failed",
}
```

**Correct (객체 리터럴과 타입 추출을 조합합니다):**

```ts
/**
 * product 심사 상태 값 집합
 */
const product_status = {
	pending: "pending",
	passed: "passed",
	failed: "failed",
} as const;

/**
 * product 심사 상태 타입. product_status에 값을 더하면 따라 넓어진다
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
```

### 1.8 Choose Interface for Object Contracts and Type for Type Composition

**Rule:** `T01-08` · `types-choose-interface-for-object-contracts-and-type-for-composition`

**Applies when:** `interface`와 `type` 사이에서 선언 형식을 바꿀 때. 객체 계약, union, tuple, 함수 시그니처, mapped·conditional type에 이름을 붙여 선언할 때. 제외: 외부·생성된 계약을 그대로 참조하는 경우.

**Review with:** `types-document-custom-types-and-shapes`, `types-reuse-existing-contracts-before-new-types`

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

**Incorrect (독립된 필드 계약을 객체 `type` 별칭으로 선언합니다):**

```ts
/**
 * 상품 요약
 */
type ProductSummary = {
	/**
	 * 상품 식별자
	 */
	id: string;
	/**
	 * 목록에 표시할 이름
	 */
	name: string;
};
```

**Correct (필드 계약은 `interface`, 타입 조합은 `type`으로 구분합니다):**

```ts
/**
 * 상품 요약
 */
interface ProductSummary {
	/**
	 * 상품 식별자
	 */
	id: string;
	/**
	 * 목록에 표시할 이름
	 */
	name: string;
}

/**
 * 상품 목록 표시 방식
 */
type ProductMode = "list" | "grid";

/**
 * 자식 목록을 편집할 수 있는 행
 */
type MutableRow = Omit<Row, "children"> & {
	/**
	 * 편집 중인 자식 행
	 */
	children: Row[];
};
```

## 2. Naming and Module Boundaries

**Impact: HIGH**

식별자, 가져오기, 공개 진입점, 경로 모양, 상수 위치가 소유자와 출처를 바로 드러내야 합니다. 타입 이름은 값의 역할과 수명을 드러내고 소유자 경로가 이미 말하는 문맥을 반복하지 않습니다. 여기서 **소유자**는 자기 폴더가 있는 모듈 하나입니다. 그 폴더 안 파일은 그 소유자만 씁니다.

### 2.1 Place Project-wide Constants in the Root `constant` Folder

**Rule:** `T02-01` · `naming-place-project-constants-in-the-root-constant-folder`

**Applies when:** 프로젝트 전반이 쓰는 URL 경로, 페이지 크기, 표시 문구, 기준값을 추가·이동·중복 정의할 때. 루트 `constant` 폴더의 파일이나 상수 이름을 바꿀 때.

**Review with:** `naming-place-owner-constants-in-the-owner-constant-folder`, `naming-use-direct-imports-and-public-entry-points`

**Impact: MEDIUM-HIGH (프로젝트 전반의 값이 쓰는 파일마다 흩어지지 않고 이름만으로 종류와 주제가 읽힙니다)**

상수를 어디 두는지는 그 값이 누구 것인지로 갈립니다.

| 값 | 자리 | 이름 |
| --- | --- | --- |
| 프로젝트 전반의 값 | `constant/<주제>.ts` | `<주제>_<이름>` |
| 한 소유자의 값 | `<owner>/_constant/<주제>.ts` | `<주제>_<이름>` |

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 값도 사라지면 그 소유자 것입니다.
`chart_axis_tick_count`는 화면과 함께 사라집니다.
`api_request_timeout_ms`는 화면을 지워도 서버 통신에 남습니다.
루트는 프로젝트가 소유자인 자리라 두 행의 이름 규칙이 같습니다.
한 소유자의 값을 두는 법은 `naming-place-owner-constants-in-the-owner-constant-folder` 규칙이 정합니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 값이 자리를 옮겨 다닙니다.

**파일은 주제 하나이고, 상수는 그 주제로 시작합니다.**

- 파일명과 상수 이름의 모양은 `naming-use-consistent-file-and-symbol-naming` 규칙이 정합니다.
  `constant/api.ts`에는 `api_base_path`와 `api_request_timeout_ms`만 있습니다.
- 상수는 모듈 스코프에 하나씩 이름 붙여 내보냅니다.
  `config`나 `api_config` 같은 객체 하나에 모으지 않습니다.
  객체는 손으로 유지하는 색인이 되고, 안 쓰는 값까지 번들에 남습니다.
- 값은 객체나 배열이어도 됩니다.
  `page_size_by_mode`처럼 함께 읽히는 값은 상수 하나입니다.
  한 겹으로 펴는 것은 이름이지 값이 아닙니다.
- 사용자에게 보이는 문장은 주제가 `copy`입니다.
  `copy_empty_value_text`처럼 모아 두면 번역 파일로 옮길 때 파일 하나만 바뀝니다.
- 한 단어 상수는 만들지 않습니다.
  주제 접두사가 붙어 상수는 늘 두 단어 이상이라 `snake_case` 표기가 눈에 보입니다.

이 폴더에는 코드와 함께 바뀌는 값만 둡니다.
환경마다 달라지는 값과 기능 플래그는 `config` 폴더에서 읽습니다.
그 자리는 `naming-read-environment-values-through-config-env` 규칙이 정합니다.
색상과 간격 같은 디자인 토큰은 스타일시트의 CSS 변수가 단일 출처라 여기 두지 않습니다.

**Incorrect (프로젝트 전반의 값을 쓰는 자리에서 선언합니다):**

```ts
// page/products/pg-products.tsx
const default_page_size = 20;
const request_timeout_ms = 20_000;

const productClient = createClient({timeoutMs: request_timeout_ms});
const productQuery = useProductQuery({client: productClient, pageSize: default_page_size});

// page/billing/pg-billing.tsx
const default_page_size = 20;

const invoiceQuery = useInvoiceQuery({pageSize: default_page_size});
```

**Correct (루트 `constant` 폴더에 둔 이름을 쓰는 자리에서 가져옵니다):**

```ts
// page/products/pg-products.tsx
import {api_request_timeout_ms} from "@/constant/api";
import {pagination_default_page_size} from "@/constant/pagination";

const productClient = createClient({timeoutMs: api_request_timeout_ms});
const productQuery = useProductQuery({client: productClient, pageSize: pagination_default_page_size});

// page/billing/pg-billing.tsx
import {pagination_default_page_size} from "@/constant/pagination";

const invoiceQuery = useInvoiceQuery({pageSize: pagination_default_page_size});
```

**Incorrect (객체 하나에 모아 색인을 손으로 유지합니다):**

```ts
// constant/config.ts
export const config = {
	api: {request_timeout_ms: 20_000},
	pagination: {default_page_size: 20},
} as const;
```

**Correct (주제 파일에 상수를 하나씩 이름 붙여 내보냅니다):**

```ts
// constant/api.ts
/**
 * 요청 하나를 기다리는 최대 시간. 게이트웨이가 30초에 끊어 그보다 먼저 실패를 알린다
 */
export const api_request_timeout_ms = 20_000;

// constant/pagination.ts
/**
 * 목록 화면이 처음 불러오는 개수
 */
export const pagination_default_page_size = 20;
```

### 2.2 Place Owner-only Constants in the Owner `_constant` Folder

**Rule:** `T02-02` · `naming-place-owner-constants-in-the-owner-constant-folder`

**Applies when:** 한 소유자의 상수나 선언형 계약을 추가하거나 옮길 때. 루트 상수와 소유자 전용 상수 사이에서 위치를 바꿀 때.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming` · 함께 적용

**Review with:** `naming-place-project-constants-in-the-root-constant-folder`

**Impact: MEDIUM-HIGH (한 소유자의 상수가 루트 폴더를 넓히지 않고 소유자 이름을 되풀이하지 않습니다)**

한 소유자의 상수는 루트로 올리지 않습니다.
그 소유자 아래 `_constant` 폴더에 둡니다.
루트와 소유자 중 어디에 두는지 가르는 표와 파일·이름의 모양은
`naming-place-project-constants-in-the-root-constant-folder` 규칙에 있습니다.
여기서는 소유자 아래에서만 다른 것을 봅니다.

- 파일은 `_constant/<주제>.ts`이고 상수는 `<주제>_`로 시작합니다.
  소유자 이름은 폴더가 이미 말하므로 접두사로 되풀이하지 않습니다.
  `page/detail/_constant/legend.ts`의 상수는 `legend_hit_tolerance_px`입니다.
  `detail_legend_hit_tolerance_px`처럼 소유자 이름을 앞에 붙이지 않습니다.
- 파서 묶음이나 스키마처럼 함수를 담은 계약도 같은 `_constant` 폴더에 둡니다.
  파일은 계약마다 나누고, 이름은 그 계약을 정한 규칙과 `naming-use-consistent-file-and-symbol-naming`이 정합니다.
- 소유자 아래에 `config`, `constants`, `common` 폴더는 만들지 않습니다.
- 파일이 하나뿐인 `_constant` 폴더도 그대로 둡니다.
- 그 소유자를 지워도 남을 값이면 루트 규칙을 따라 올립니다.

**Incorrect (한 소유자의 상수를 루트로 올립니다):**

```ts
// constant/chart.ts
// product 상세 화면만 쓰는 값이 루트에 있다
export const chart_axis_tick_count = 6;
```

**Correct (소유자 아래 주제 파일에 둡니다):**

```ts
// page/product-detail/_constant/chart.ts
/**
 * product 상세 차트의 축 눈금 수. 표시 폭이 좁아 여섯을 넘기면 라벨이 겹친다
 */
export const chart_axis_tick_count = 6;
```

**Incorrect (파일명에 소유자 이름을 되풀이하고 주제를 객체 하나에 모읍니다):**

```ts
// page/product-detail/_constant/product-detail.ts
export const product_detail_config = {
	chart_axis_tick_count: 6,
	table_page_size: 20,
} as const;
```

**Correct (주제마다 파일을 나누고 상수를 평평하게 내보냅니다):**

```ts
// page/product-detail/_constant/chart.ts
export const chart_axis_tick_count = 6;

// page/product-detail/_constant/table.ts
export const table_page_size = 20;
```

### 2.3 Use Role-Based File, Symbol, and Constant Naming

**Rule:** `T02-03` · `naming-use-consistent-file-and-symbol-naming`

**Applies when:** TypeScript 파일, 폴더, 변수, 함수, 타입, 객체·스키마 키의 이름을 새로 만들거나 바꿀 때. 밖으로 나가는 키를 받는 쪽 표기로 적을지 판단할 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.

**Impact: MEDIUM-HIGH (파일과 심볼의 표기가 역할을 드러내 읽는 사람이 종류를 바로 압니다)**

| 자리 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 타입, 인터페이스, 컴포넌트 | `PascalCase` |
| 모듈 스코프의 불변 데이터 상수, 상수 집합 | `snake_case` |
| 불변 데이터 상수와 상수 집합 객체가 소유한 상수 키 | `snake_case` |
| 그 외 변수, 함수, 객체 키, 스키마 키, 타입 필드 | `camelCase` |

**`const` 선언을 전부 상수로 보지 않습니다.**
함수·컴포넌트·훅, 그리고 API 호출 결과·스키마·요청 객체·지역 파생값은
`const`로 선언해도 각 역할의 표기를 유지합니다.

여기서 불변 데이터 상수는 모듈 스코프에 한 번 선언해 실행 중 같은 의미로 쓰는 리터럴, 기본값, 값 집합, 조회표입니다.
객체와 배열은 `as const`나 읽기 전용 계약을 적용하고 변경하지 않습니다.
불변 데이터 상수와 상수 집합의 하위 객체와 키도 같은 `snake_case`를 사용합니다.

- `retry_policy.max_attempts`는 불변 데이터 상수와 그 상수 키입니다.
- `product_status.waiting_review`는 값 집합과 그 상수 키입니다.
- `fetchProducts({pageSize: pagination_default_page_size})`의 `pageSize`는
  요청 계약 필드라 `camelCase`이고, 상수인 `pagination_default_page_size`만 `snake_case`입니다.
- `productSearchSchema`는 실행 중 재할당하지 않아도 스키마 역할이므로 `camelCase`입니다.

**종류는 이름이 말합니다.**
함수는 동사가, 상수는 `snake_case`와 주제 접두사가, 컴포넌트는 레이어 접두사가 종류를 말합니다.
`formatUsd`, `api_base_path`, `PgDetail`은 폴더를 보지 않아도 무엇인지 읽힙니다.
그래서 한 단어 상수는 만들지 않습니다.
`api`는 밑줄이 없어 상수인지 변수인지 보이지 않고, `api_base_path`는 보입니다.

**파일명은 안에 있는 이름이 공유하는 부분입니다.**
함수 파일은 내보낸 이름이 하나라 파일명이 곧 함수 이름입니다.
`format-usd.ts`가 `formatUsd`를 내보냅니다.
상수 파일은 이름이 공유하는 첫 마디가 파일명입니다.
`constant/api.ts`가 `api_base_path`와 `api_request_timeout_ms`를 내보냅니다.

**예외는 밖으로 나가는 키뿐입니다.**
API 요청 본문, 라이브러리 인자, DOM 속성, 환경 변수처럼 받는 쪽이 이름을 정하는 자리는 받는 쪽 표기를 그대로 씁니다.
`{user_id: 1}`을 보내야 하는 API에는 `user_id`로 적습니다.
우리가 짓는 이름이 아니라 받는 쪽 계약이라 우리 표기로 바꾸지 않습니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것도 지역 심볼을 새로 짓는 일이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

폴더명은 프레임워크가 강제하는 이름만 예외로 둡니다.

**Incorrect (역할과 맞지 않는 표기를 씁니다):**

```ts
// userSettings.ts
// 스키마와 그 필드는 일반 심볼이라 camelCase다
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});
```

**Correct (파일명은 `kebab-case`, 스키마 키는 `camelCase`로 씁니다):**

```ts
// user-settings.ts
/**
 * 사용자 프로필 스키마
 */
const userProfileSchema = z.object({
	/**
	 * 저장소 경로
	 */
	repoPath: z.string(),
});
```

**Incorrect (불변 데이터 상수와 값 집합의 이름과 키를 `camelCase`로 적습니다):**

```ts
const retryPolicy = {
	maxAttempts: 3,
} as const;

const productStatus = {
	draft: "draft",
	waitingReview: "waiting_review",
	published: "published",
} as const;
```

**Correct (불변 데이터 상수와 값 집합은 이름과 상수 키를 모두 `snake_case`로 적습니다):**

```ts
/**
 * 요청 재시도 정책. 하위 키도 상수 키다
 */
const retry_policy = {
	max_attempts: 3,
} as const;

/**
 * product 게시 상태 값 집합
 */
const product_status = {
	draft: "draft",
	waiting_review: "waiting_review",
	published: "published",
} as const;
```

**Incorrect (밖으로 나가는 키를 우리 표기로 바꿉니다):**

```ts
// 서버 계약은 {product_id, display_name} 인데 우리 표기로 바꿔 보낸다
/**
 * product 저장 요청 조립
 */
const toProductSaveBody = (values: ProductFormValues) => {
	return {
		productId: values.productId,
		displayName: values.displayName.trim(),
	};
};
```

**Correct (밖으로 나가는 키만 받는 쪽 표기를 그대로 씁니다):**

```ts
/**
 * product 저장 요청 조립. 서버 계약이 snake_case라 그 표기를 그대로 넘긴다
 */
const toProductSaveBody = (values: ProductFormValues) => {
	return {
		product_id: values.productId,
		display_name: values.displayName.trim(),
	};
};
```

### 2.4 Use Direct Imports and Dedicated Public Entry Points

**Rule:** `T02-04` · `naming-use-direct-imports-and-public-entry-points`

**Applies when:** 가져오기, 내보내기, `index.ts` 배럴, 공개 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.

**Review with:** `naming-import-by-absolute-path`

**Impact: MEDIUM-HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않고, 필요한 파일에서 바로 가져옵니다.
내보내기는 선언 앞에 `export`를 붙인 이름 붙인 내보내기만 씁니다.
파일 끝에 `export {…}` 목록을 따로 두지 않습니다.

| 형태 | 판정 |
| --- | --- |
| `index.ts`로 묶어 다시 내보내는 배럴 | 만들지 않습니다 |
| 역할 폴더를 `index.ts`로 묶는 것 | 배럴이라 만들지 않습니다 |
| 같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체 | 다시 내보내는 계층이 아니므로 배럴이 아닙니다 |
| `default` 내보내기 | 도구가 그 파일의 계약으로 요구할 때만 씁니다. `vite.config.ts` 같은 설정 진입점이 그 자리입니다 |
| 타입만 가져오기 | `import type`을 써서 계약과 실행 의존을 나눕니다 |

`default`는 이름을 사용처가 짓습니다.
같은 것이 파일마다 다른 이름으로 불립니다.
원본 이름을 바꿔도 사용처의 이름은 그대로 남아 어긋납니다.

경로 모양은 `naming-import-by-absolute-path` 규칙이 정합니다.
경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면 가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

**Incorrect (배럴과 섞인 가져오기로 경계를 흐립니다):**

```ts
import {pagination_default_page_size, toDisplayDate, UserProfile} from "./index";
```

**Correct (필요한 파일에서 이름으로 바로 가져옵니다):**

```ts
import type {UserProfile} from "@/type/user-profile";
import {pagination_default_page_size} from "@/constant/pagination";
import {toDisplayDate} from "@/util/date/to-display-date";
```

**Incorrect (`default`로 내보내 사용처마다 다른 이름이 생깁니다):**

```tsx
// component/ui/tabs/ui-tabs.tsx
const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};

export default UiTabs;

// page/settings/pg-settings.tsx
// 사용처가 이름을 지어서 같은 컴포넌트가 파일마다 다른 이름으로 불린다
import Tabs from "@/component/ui/tabs/ui-tabs";
```

**Correct (선언 앞에 `export`를 붙여 사용처가 그 이름으로 가져옵니다):**

```tsx
// component/ui/tabs/ui-tabs.tsx
export const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};

// page/settings/pg-settings.tsx
import {UiTabs} from "@/component/ui/tabs/ui-tabs";
```

### 2.5 Import by Absolute Path

**Rule:** `T02-05` · `naming-import-by-absolute-path`

**Applies when:** 다른 모듈을 가져오는 경로를 쓸 때. `./`나 `../`로 시작하는 경로를 쓰거나 별칭 경로를 상대경로로 바꾸려 할 때. `src` 바로 아래 레이어 루트 폴더나 `store` 파일을 새로 만들 때.

**Review with:** `naming-use-direct-imports-and-public-entry-points`

**Impact: MEDIUM-HIGH (경로 모양이 하나라 가져오는 줄만 보고 어디의 무엇인지 읽히고, 경계는 위치로 판정합니다)**

| 가져오는 줄 | 경로 | 이유 |
| --- | --- | --- |
| 심볼을 가져오는 줄 `import {a} from …` | `@/<src 아래 경로>` | 편집기 자동 가져오기가 만드는 모양입니다 |
| 심볼 없이 파일만 불러오는 줄 `import "….css"` | 같은 폴더면 `./<파일>`, 아니면 `@/<src 아래 경로>` | 자동 가져오기가 없어 손으로 적는 줄입니다 |

- `../`는 어느 줄에도 쓰지 않습니다.
- 폴더를 옮기거나 이름을 바꾸면 편집기의 이름 바꾸기가 경로를 따라 고칩니다.
- 경로 모양은 경계를 말하지 않습니다.
  `@/page/detail/_function/to-summary`는 `page/detail` 안에서는 정상이고 `page/index`에서는 위반이지만 문자열은
  같습니다.
  무엇을 어디서 가져올 수 있는지는 가져오는 파일의 위치로 판정합니다.
  그 표는 프레임워크 컨벤션의 가져오기 방향 규칙에 있습니다.
- 어디에 두는지는 쓰는 곳으로 정하지 않습니다.
  소유자 밖에서 가져다 쓴다고 루트로 올리지 않습니다.
  자리는 `naming-place-project-constants-in-the-root-constant-folder`와
  `functions-give-each-function-its-own-file`이 정합니다.

아래는 `src` 바로 아래에 두는 레이어 루트입니다.

| 루트 | 담는 것 |
| --- | --- |
| `component` | `component/ui`와 `component/widget` 두 컴포넌트 레이어 |
| `page` | 라우트 폴더. 라우트 안의 것은 그 라우트 안에서만 가져오고, 라우트 진입 파일은 라우터만 가져옵니다 |
| `constant` | 프로젝트 전반이 쓰는 상수 |
| `config` | 환경마다 달라지는 값 |
| `util` | 프로젝트 전반이 쓰는 함수. 값의 종류 폴더로 묶습니다 |
| `type` | 프로젝트 전반이 쓰는 계약 |
| `hook` | 여러 소유자가 쓰는 훅 |
| `store` | 여러 화면이 함께 읽는 상태. 파일명은 `use-<name>-store.ts`입니다 |
| `service` | 서버 통신 클라이언트 |
| `asset` | 아이콘 같은 정적 자원 |

루트는 프로젝트가 소유자인 자리라 `constant`·`util`·`type`·`hook`은 소유자 아래 역할 폴더와 같은 규칙을 따릅니다.

**Incorrect (상대경로로 심볼을 가져옵니다):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {PgDetectionSection} from "./_pg-detection-section";
import {toSummary} from "../_function/to-summary";
```

**Correct (심볼은 `@/`, 같은 폴더의 CSS 파일만 `./`로 씁니다):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {toSummary} from "@/page/detail/_function/to-summary";
import {PgDetectionSection} from "@/page/detail/sales-trend-panel/_pg-detection-section";

import "./pg-sales-trend-panel.css";
```

### 2.6 Read Environment Values Through `config/env.ts`

**Rule:** `T02-06` · `naming-read-environment-values-through-config-env`

**Applies when:** `import.meta.env`나 `process.env`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값이나 기능 플래그를 새로 들여올 때.

**Review with:** `absence-expose-optional-values-instead-of-silent-fallbacks`, `naming-place-project-constants-in-the-root-constant-folder`

**Impact: HIGH (환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 파일에서 읽힙니다)**

환경마다 달라지는 값은 쓰는 파일에서 직접 읽지 않습니다.
루트 `config/env.ts`가 한 번 읽어 `env_` 상수로 내보냅니다.
나머지는 그 이름을 씁니다.
`import.meta.env`와 `process.env`가 나오는 파일은 이 파일 하나입니다.

`constant` 폴더와 `config` 폴더는 값이 바뀌는 때가 다릅니다.
`constant`의 값은 코드와 함께 바뀌고, `config`의 값은 배포마다 바뀝니다.
배포 환경은 프로젝트 단위라 `config` 폴더는 루트에만 있고 소유자 아래에는 만들지 않습니다.
기능 플래그도 배포마다 바뀌는 값이라 `config/env.ts`가 읽은 `env_` 상수에서 파생해
`config/feature.ts`에 `feature_` 상수로 둡니다.
상수 파일과 이름의 모양은 `naming-place-project-constants-in-the-root-constant-folder` 규칙과 같습니다.

환경 값이라 여기서 더 요구하는 것은 셋입니다.

- 키가 없을 때 리터럴로 덮지 않습니다.
  `absence-expose-optional-values-instead-of-silent-fallbacks` 규칙을 따라 그 자리에서 드러냅니다.
- 값을 읽는 즉시 우리 이름으로 바꿔 담습니다.
  `VITE_` 같은 번들러 접두사가 앱 안으로 새지 않게 합니다.
- 비밀값은 클라이언트 번들에 들어가는 이름으로 읽지 않습니다.
  번들러가 노출하는 접두사가 붙은 값은 브라우저에서 그대로 보입니다.

**Incorrect (쓰는 파일마다 직접 읽고 없을 때 리터럴로 덮습니다):**

```ts
// service/product-client.ts
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// service/report-client.ts
const reportBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
```

**Correct (`config/env.ts`가 한 번 읽고 없으면 드러냅니다):**

```ts
// config/env.ts
if (!import.meta.env.VITE_API_BASE_URL) {
	throw new MissingEnvironmentValueError("VITE_API_BASE_URL");
}

/**
 * API 서버 주소. 배포 환경마다 다르다
 */
export const env_api_base_url = import.meta.env.VITE_API_BASE_URL;

// service/product-client.ts
import {env_api_base_url} from "@/config/env";

const productClient = createClient({baseUrl: env_api_base_url});
```

### 2.7 Name Types by Role and Lifetime

**Rule:** `T02-07` · `naming-name-types-by-role-and-lifetime`

**Applies when:** 타입·인터페이스나 그 파일의 이름을 새로 만들거나 바꿀 때. 타입을 소유자 폴더 안과 밖 사이에서 옮기며 이름을 바꿀 때. 제외: 외부·생성된 계약 이름을 그대로 쓰는 경우.

**Review with:** `naming-use-consistent-file-and-symbol-naming`

**Impact: MEDIUM-HIGH (이름만 읽고 값이 무엇이며 어느 시점에 존재하는지 구분할 수 있습니다)**

접미사부터 고르지 않습니다.
그 값이 무엇이고 언제 존재하는지 판단한 뒤, 역할어가 의미를 더할 때만 붙입니다.
도메인 명사만으로 충분하면 `ChartPoint`, `TableRow`처럼 더 붙이지 않습니다.

| 역할어 | 사용하는 때 |
| --- | --- |
| `Params` | 함수나 훅의 여러 입력을 객체 하나로 묶을 때 |
| `Options` | 호출자가 동작을 선택적으로 조절할 때 |
| `Payload` | 이벤트·적용·저장 경계를 한 번 넘어가는 메시지일 때 |
| `State` | 시간에 따라 바뀌며 소유자가 보관할 때 |
| `Draft` | 아직 적용하거나 저장하지 않은 편집 중 값일 때 |
| `Snapshot` | 한 시점의 목록·상태·메타데이터를 함께 고정할 때 |
| `Content` | 컴포넌트나 섹션이 바로 소비할 완성된 내용 묶음일 때 |
| `Config` | 동작이나 표시 정책을 선언할 때 |
| `Resolved*` | 원본·기본값·현재 조건을 합쳐 값이 확정됐을 때 |
| `Condition` | 필터나 적용 여부를 가르는 조건일 때 |
| `Criterion` | 정렬·평가 기준 한 건일 때 |
| `Setting` | 사용자가 고르거나 조절하는 설정 한 건일 때 |
| `Row`·`Column`·`Item`·`Point`·`Series` | 컬렉션 안 한 요소의 역할이 분명할 때 |
| `Result` | 더 구체적인 결과 명사가 없을 때만 |
| `Spec` | 외부 명세나 검증할 요구사항 자체를 나타낼 때만 |
| `Model` | 식별성·행동·도메인 규칙을 가진 실제 모델일 때만 |

단순 가공 결과나 화면 표시 계약에 `VM`, `ViewModel`, 막연한 `Model`을 기본 접미사로 붙이지 않습니다.

역할어는 이미 필요한 계약의 이름을 고르는 기준입니다.
`Params`, `Content`, `Snapshot`을 쓰려고 새 타입을 만들지 않습니다.
맞는 기존 계약이나 추론되는 익명 결과가 있으면 그대로 씁니다.

소유자 폴더가 이미 말하는 도메인은 타입 이름에 반복하지 않습니다.
`sales-report/_type/` 안에서는 `SalesReportSnapshot`이 아니라 `ReportSnapshot`처럼 남은 문맥만 이름에 둡니다.
소유자 밖으로 내보내 문맥이 사라지거나 다른 타입과 충돌할 때만 필요한 도메인 접두를 유지합니다.

타입 파일도 실제 명사로 짓습니다.
`report-snapshot.ts`처럼 쓰고 `report-vm.ts`, `report-view-model.ts`, 막연한 `report-model.ts`는 쓰지 않습니다.
외부·생성된 계약의 이름과 `DTO` 같은 접미사는 그 계약이 정한 그대로 둡니다.
직접 작성한 내부 계약에는 그런 접미사를 반대편 표식처럼 붙이지 않습니다.
프레임워크 전용 `Props`, `Handle`, `Slot`, `Renderer`는 해당 프레임워크 규칙이 정합니다.

**Incorrect (소유자와 막연한 화면 계약 접미사를 반복합니다):**

```ts
/**
 * 영업 보고서 화면 데이터
 */
interface SalesReportViewModel {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: ReportRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: ReportFilters;
}

const salesReportVM: SalesReportViewModel = response.data;
```

**Correct (한 조회 시점에 고정된 값이라는 역할을 이름에 표시합니다):**

```ts
// page/sales-report/_type/report-snapshot.ts: 폴더가 이미 sales-report 를 말한다
/**
 * 한 조회 시점의 보고서 목록과 조건
 */
interface ReportSnapshot {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: ReportRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: ReportFilters;
}

const reportSnapshot: ReportSnapshot = response.data;
```

## 3. Functions and Helper Boundaries

**Impact: MEDIUM-HIGH**

함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 두 자리 이상에서 부를 때만 이름을 붙여 정해진 자리에 둡니다. 이름은 무엇이 나오는지로 짓고, 변수는 재계산을 막거나 판정을 설명할 때만 만듭니다. 파일 안 선언 순서도 여기서 정합니다. 넓은 스코프에서 `let` 재할당과 `push`로 값을 쌓지 않는 것도 여기서 봅니다.

### 3.1 Declare Functions as Arrow Consts

**Rule:** `T03-01` · `functions-declare-functions-as-arrow-consts`

**Applies when:** 이름을 지어 선언하는 함수를 새로 만들거나 선언 형태나 본문 형태를 바꿀 때. 객체 프로퍼티에 함수를 담거나 그 형태를 바꿀 때. 제외: 인라인 콜백이나 커링의 바깥 화살표인 경우. 제외: 클래스 메서드, 제너레이터, 오버로드 선언인 경우.

**Review with:** `functions-use-named-object-params-for-complex-signatures`

**Impact: MEDIUM (선언과 본문 형태가 하나로 고정되어 호이스팅 순서 의존이나 형태가 갈리는 diff가 생기지 않습니다)**

함수에 이름을 지어 선언할 때는 `const`에 화살표 함수를 담습니다.
`function` 선언문은 쓰지 않습니다.

- 한 파일 안에서 두 형태를 섞으면 어느 것이 공개 계약인지 형태로 구분할 수 없습니다.
- `function` 선언문은 모듈을 불러오는 시점에도 선언보다 위에서 부를 수 있습니다.
  `const`는 그 자리에서 멈춰 순서가 어긋난 것을 바로 알려 줍니다.

**본문은 `{}` 블록으로 열고 `return`을 적습니다.**
한 줄로 줄여 쓰지 않습니다.
돌려줄 값이 없으면 `return` 없이 블록만 씁니다.

- 줄이 하나 늘어나는 순간 블록으로 다시 감싸야 합니다.
  한 줄을 더한 diff가 함수 전체를 고친 것처럼 보입니다.
- 객체를 돌려줄 때 `({...})`로 괄호를 덧대야 하는 자리가 없어집니다.
- 문서 주석과 본문이 늘 같은 형태로 이어져 선언을 훑을 때 경계가 일정합니다.

두 자리는 이 규범에서 뺍니다.

- 인라인 콜백. `rows.map((row) => row.id)`처럼 이름 없이 그 자리에서 넘기는 함수는 한 줄로 써도 됩니다.
- 커링의 바깥 화살표. 안쪽 함수를 그대로 돌려주는 자리라 블록으로 감싸면 `return`만 늘어납니다.
  `(productId) => (event) => { … }`에서 블록으로 여는 것은 안쪽 하나입니다.

`biome`의 `useConsistentArrowReturn`은 이 형태를 인라인 콜백과 커링에까지 강제해서 켜지 않습니다.
`tooling-configure-biome-to-enforce-these-rules` 규칙이 그 사실과 이유를 적어 둡니다.

**객체 프로퍼티에 담는 함수도 화살표로 씁니다.**
`text(value) { … }` 같은 메서드 축약형은 쓰지 않습니다.
축약형은 `this`가 그 객체에 묶입니다.
`const formatText = cell_formatter_by_value_type.text;`처럼 떼어 내면 `this`가 달라져 동작이 바뀝니다.
화살표 프로퍼티에는 `this`가 없어 떼어 내도 동작이 같습니다.

세 자리는 예외로 둡니다.

| 예외 | 이유 |
| --- | --- |
| 클래스 메서드 | 메서드 문법을 그대로 씁니다. 화살표 필드로 바꾸지 않습니다 |
| 제너레이터 | `function*` 없이 쓸 수 없습니다 |
| 오버로드 선언 | `function` 시그니처를 겹쳐 쓰는 선언 문법은 `const`로 옮길 수 없습니다. 호출 시그니처를 모은 타입을 `const`에 붙일 수 있으면 그쪽을 씁니다 |

**Incorrect (`function` 선언문과 한 줄 본문이 한 파일에 섞입니다):**

```ts
export function toTrimmedTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}

/**
 * URL에 쓰는 product 식별 문자열
 */
export const toProductSlug = (title: string): string => {
	return toTrimmedTitle(title).toLowerCase();
};

/**
 * 상태에 맞는 배지
 */
export const toProductBadge = (product: Product): ProductBadge => ({
	label: decorate(product.title),
	tone: product.published ? "solid" : "muted",
});

/**
 * 목록에 표시할 이름
 */
export const toProductLabel = (product: Product): string => {
	return decorate(product.title);
};

function decorate(title: string): string {
	return `# ${title}`;
}
```

**Correct (모두 `const` 화살표에 블록 본문을 씁니다):**

```ts
/**
 * 앞뒤 공백을 지운 제목
 */
export const toTrimmedTitle = (rawTitle: string): string => {
	return rawTitle.trim().replace(/\s+/g, " ");
};

/**
 * URL에 쓰는 product 식별 문자열
 */
export const toProductSlug = (title: string): string => {
	return toTrimmedTitle(title).toLowerCase();
};

/**
 * 상태에 맞는 배지
 */
export const toProductBadge = (product: Product): ProductBadge => {
	return {
		label: decorate(product.title),
		tone: product.published ? "solid" : "muted",
	};
};

/**
 * 목록에 표시할 이름
 */
export const toProductLabel = (product: Product): string => {
	return decorate(product.title);
};

const decorate = (title: string): string => {
	return `# ${title}`;
};
```

**Incorrect (객체 프로퍼티의 함수를 메서드 축약형으로 씁니다):**

```ts
export const cell_formatter_by_value_type = {
	text(value: string): string {
		return value.trim();
	},
} as const;
```

**Correct (객체 프로퍼티의 함수는 화살표, 인라인 콜백은 한 줄로 씁니다):**

```ts
export const cell_formatter_by_value_type = {
	/**
	 * 표 셀의 문자열은 앞뒤 공백을 지워 보여 준다
	 */
	text: (value: string): string => {
		return value.trim();
	},
} as const;

/**
 * product 식별자 목록
 */
export const toProductIds = (products: Product[]): string[] => {
	return products.map((product) => product.id);
};
```

**Correct (클래스 메서드와 제너레이터는 그대로 둡니다):**

```ts
export class ProductCursor {
	private buffer: Product[] = [];

	*pages(): Generator<Product[]> {
		yield this.buffer;
	}

	reset(): void {
		this.buffer = [];
	}
}
```

### 3.2 Use Named Object Params for Complex Signatures

**Rule:** `T03-02` · `functions-use-named-object-params-for-complex-signatures`

**Applies when:** 매개변수가 셋을 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수의 필드를 읽는 방식을 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받는 방식만 바꾸는 경우.

**Review with:** `types-reuse-existing-contracts-before-new-types`, `values-read-objects-through-chains`

**Impact: MEDIUM-HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 셋을 넘거나 같은 계열 값이 함께 넘어오면 위치 인자를 객체 하나로 묶습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언합니다.

받은 객체는 시그니처에서도 본문에서도 구조분해하지 않고 `target.baseUrl`처럼 체인으로 읽습니다.
그 규범은 `values-read-objects-through-chains` 규칙이 모든 객체에 정합니다.
여기서는 매개변수를 언제 객체로 묶고 그 타입을 어디에 선언할지만 봅니다.

리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다.
프롭스를 읽는 방식과 타입 선언 위치는 프레임워크 컨벤션이 담당합니다.

뜻이 같은 계약이 이미 있으면 그대로 씁니다.
그 판정은 `types-reuse-existing-contracts-before-new-types`가 합니다.
이 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.

**Incorrect (위치 인자가 넷이라 호출부에서 순서를 외워야 합니다):**

```ts
const fetchProductPage = (baseUrl: string, page: number, pageSize: number, keyword?: string): Promise<ProductPage> => {
	/* … */
};

fetchProductPage(api_base_url, urlParams.page, pagination_default_page_size, undefined);
```

**Correct (매개변수를 객체로 묶고 그 타입을 파일 위쪽에 이름 붙여 선언합니다):**

```ts
/**
 * product 목록 한 페이지 요청 조건
 */
interface ProductPageRequest {
	/**
	 * 요청 기준 주소
	 */
	baseUrl: string;
	/**
	 * 1부터 세는 페이지 번호
	 */
	page: number;
	/**
	 * 한 페이지에 담을 개수
	 */
	pageSize: number;
	/**
	 * 검색어. 비우면 전체 목록이다
	 */
	keyword?: string;
}

const fetchProductPage = (request: ProductPageRequest): Promise<ProductPage> => {
	/* … */
};

fetchProductPage({baseUrl: api_base_url, page: urlParams.page, pageSize: pagination_default_page_size});
```

### 3.3 Extract Support Functions Only When the Boundary Is Real

**Rule:** `T03-03` · `functions-extract-helpers-only-when-the-boundary-is-real`

**Applies when:** 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`, `functions-give-each-function-its-own-file`, `values-decide-once-and-carry-the-result`

**Impact: MEDIUM (흐름을 읽으려고 함수와 파일을 왕복하게 만드는 조각내기를 막습니다)**

기본은 빼지 않는 것입니다.
흐름은 함수 하나 안에서 위에서 아래로 읽히는 편이 낫습니다.
보조 함수에 이름을 붙이는 사유는 셋뿐입니다.

| 사유 | 조건 |
| --- | --- |
| 재사용 | 이 변경을 적용한 뒤의 코드에서 두 자리 이상이 실제로 부릅니다. 본문이 한 줄이어도 같습니다 |
| 렌더 파일 밖으로 | `.tsx` 안의 요청·저장 payload 조립 함수입니다. 훅·JSX·컴포넌트 상태를 쓰지 않으면 사용처가 하나여도 같은 소유자의 `.ts`로 옮깁니다 |
| 함수 형태가 필수 | 삼항 하나에 담기지 않는 판정, `value is T` 타입 가드, 재귀입니다 |

한 자리에서만 쓰는 단계는 호출부에 그대로 적습니다.
단계가 길면 `docs-keep-body-comments-for-intent-and-steps`가 정한 `// 1.` 단계 주석으로 구간을 나눕니다.
판정이 복잡하다는 이유로 이름을 붙이지 않습니다.
분기가 둘이면 삼항 하나로 호출부에 씁니다.
셋 이상이면 셋째 사유이고 분기마다 `return`으로 끝냅니다.
그 전에 값 검사를 경계로 보내면 분기가 줄어 함수가 필요 없어지는 경우가 많습니다.
검사 자리는 `absence-check-once-at-the-boundary`가 정합니다.

둘째 사유는 `.tsx`에 렌더가 아닌 코드를 남기지 않으려는 것이라 `.ts` 안에서는 해당하지 않습니다.
표시용 가공도 해당하지 않습니다.
서버로 보낼 값을 만드는 함수만 밖으로 냅니다.

어느 사유든 그 함수만 따로 읽어도 뜻이 통해야 합니다.
바깥 변수, 훅, 컴포넌트 상태에 기대면 아직 뺄 수 없습니다.

사유가 아닌 것:

- **나중에 또 쓸 것 같아서.** 그때 가서 뺍니다.
- **함수가 길어서.** 길이는 단계 주석으로 나눕니다.
- **`.map()` 콜백 하나에만 쓰이는 변환.** 그 자리에 둡니다.

같은 판정을 두 자리에서 하고 있으면 이름을 붙이기 전에 `values-decide-once-and-carry-the-result`를 먼저 봅니다.
판정을 경계에서 한 번만 하면 부르는 자리가 하나로 줄어 사유가 사라지는 경우가 많습니다.

이름 붙인 보조를 어디에 둘지는 `functions-give-each-function-its-own-file`이 정하고,
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

**Incorrect (한 자리에서만 쓰는 단계를 함수로 떼어 내 흐름이 파일 안에서 흩어집니다):**

```txt
page/report/_function/to-metrics-content.ts
  toMetricsContent       내보낸 함수. 본문은 세 줄이고 나머지는 아래 함수로 갔다
  toComparisonRows       toMetricsContent 만 부름
  toMeaningGroups        toMetricsContent 만 부름
  toValidityCard         toMetricsContent 만 부름
  formatMeaningDecimal   toComparisonRows 와 toMeaningGroups 가 부름
```

**Correct (한 자리 단계는 호출부에 단계 주석으로 남고 두 자리 이상이 부르는 것만 이름을 받습니다):**

```txt
page/report/_function/to-metrics-content/
├── to-metrics-content.ts        본문 안에 // 1. 비교 행  // 2. 의미 그룹  // 3. 유효성 카드
└── _format-meaning-decimal.ts   비교 행과 의미 그룹 두 자리가 부름
```

```ts
// page/report/_function/to-metrics-content/to-metrics-content.ts
/**
 * 상세 수치와 통계 의미 영역의 표시 데이터. 실시간 상세만 TAM 유효성 카드가 온다
 */
export const toMetricsContent = (params: ToMetricsContentParams): MetricsContent => {
	// 1. 선택 window 기준으로 갱신되는 비교 수치 행
	const metrics = [
		{id: "statCorr", label: "상관계수 평균", value: formatMeaningDecimal(params.selectionInfo.avgCorr)},
		{id: "statP", label: "통계적 유의성", value: params.selectionInfo.statP},
	];

	// 2. 통계 의미 그룹. 설명이 비면 그룹 제목만 남긴다
	const statMeaningGroups = [
		{id: "statistical-significance", title: "패턴의 통계적 의미", description: params.selectionInfo.statDesc, rows: metrics},
	];

	// 3. TAM 유효성 카드. 실시간 상세에서만 온다
	return {metrics, statMeaningGroups, tamValidity: params.tamMetrics};
};
```

**Incorrect (한 번만 쓰는 한 줄 계산을 파일로 분리합니다):**

```ts
// page/profile/_function/get-next-iteration.ts
export const getNextIteration = (previous: number, iterationCount: number): number => {
	return (previous + 1) % iterationCount;
};
```

**Correct (작은 계산은 쓰는 자리에 그대로 둡니다):**

```tsx
// page/profile/pg-profile.tsx
const handleNextClick = () => {
	setIteration((previous) => (previous + 1) % iterationCount);
};
```

**Correct (서로 다른 파일 둘이 이미 부르는 순수 함수를 뺍니다):**

```ts
// page/profile/_function/to-profile-save-request.ts
/**
 * profile 저장 payload 조립. 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (formValues: ProfileFormValues) => {
	return {
		displayName: formValues.displayName.trim(),
	};
};
```

```tsx
// page/profile/_pg-profile-form.tsx와 page/profile/_pg-profile-drawer.tsx가 함께 부른다
import {toProfileSaveRequest} from "@/page/profile/_function/to-profile-save-request";
```

**Correct (`.tsx` 안의 순수 조립 함수는 사용처가 하나여도 형제 `.ts`로 냅니다):**

```ts
// page/products/_function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 업로드가 끝난 첨부만 넘겨야 attachmentIds가 채워진다
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	return {
		title: formValues.title.trim(),
		categoryId: formValues.categoryId,
		attachmentIds: formValues.attachments.map((attachment) => attachment.id),
	};
};
```

```tsx
// page/products/pg-products.tsx 하나만 부르지만 훅도 JSX도 쓰지 않는 계산이다
import {toProductSaveRequest} from "@/page/products/_function/to-product-save-request";
```

**Correct (삼항 하나에 담기지 않는 판정은 사용처가 하나여도 이름을 받고 분기마다 `return`으로 끝냅니다):**

```ts
// page/detail/_function/to-grade-tone.ts
/**
 * 등급 문자열의 강조 tone. API가 등급을 자유 문자열로 주어 토큰 포함으로 판정한다
 */
export const toGradeTone = (grade: string): Tone => {
	const normalizedGrade = grade.trim().toLowerCase();
	if (grade_positive_tokens.some((token) => normalizedGrade.includes(token))) {
		return "positive";
	}
	if (grade_negative_tokens.some((token) => normalizedGrade.includes(token))) {
		return "negative";
	}
	return "neutral";
};
```

### 3.4 Give Each Support Function Its Own File

**Rule:** `T03-04` · `functions-give-each-function-its-own-file`

**Applies when:** 떼어 낸 보조 함수를 어느 파일이나 폴더에 둘지 정할 때. `helper.ts`, `helpers.ts`, `utils.ts` 같은 파일을 만들거나 거기에 함수를 더할 때. 대표 함수가 자기만 쓰는 보조를 처음 갖게 될 때. 보조를 부르는 대표 함수나 소유자가 늘어날 때.

**Requires selected:** `functions-extract-helpers-only-when-the-boundary-is-real` · 함께 적용

**Review with:** `functions-order-declarations-top-down`, `functions-promote-shared-functions-to-root-util`

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 보조 함수의 주인이 폴더에서 바로 보입니다)**

이름을 붙일지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 이름 붙인 보조를 어느 파일에 둘지만 봅니다.
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

| 부르는 쪽 | 자리 |
| --- | --- |
| 대표 함수 하나 | 그 대표의 자기 이름 폴더 `_function/<대표>/` 안에 `_<보조>.ts` |
| 같은 소유자의 대표 함수 둘 이상 | `_function` 바로 아래 `<보조>.ts` |
| 다른 소유자 | `functions-promote-shared-functions-to-root-util`이 정합니다 |

- 내보낸 대표 함수 하나당 파일 하나이고, 파일명은 그 함수 이름입니다.
  소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
- 자기만 쓰는 보조가 생기면 대표 함수 파일은 자기 이름 폴더로 들어가고 이름은 폴더와 같습니다.
  컴포넌트가 자기만 쓰는 파일을 갖게 되면 자기 이름 폴더가 되는 것과 같은 규칙입니다.
- 대표 함수 파일 아래에 비공개 `const`로 보조를 두지 않습니다.
  이름을 받은 보조는 파일입니다.
- 폴더 안은 평평합니다.
  보조의 보조도 같은 폴더의 `_` 파일이고 그 아래 폴더를 파지 않습니다.
- 타입과 상수는 이 폴더에 두지 않습니다.
  소유자의 역할 폴더로 가고, 그 자리는 프레임워크 컨벤션이 정합니다.

**`_` 파일은 같은 폴더의 파일만 가져옵니다.**
컴포넌트의 `_` 파일과 같은 표식입니다.
대표 함수가 자기 폴더의 `_` 파일을 부르는 것도, `_` 파일끼리 부르는 것도 사슬이 아니라 대표 함수의 내부입니다.

**승격은 부르는 쪽이 늘 때 한 번씩입니다.**
같은 소유자의 다른 대표 함수가 부르게 되면 `_function` 바로 아래로 옮기고 `_`를 뗍니다.
다른 소유자가 부르게 되면 루트 `util` 승격 규칙을 따릅니다.
루트 `util` 함수가 다른 루트 `util` 함수를 가져오는 것은 사슬이 아닙니다.
둘 다 공개 진입점이고, 가져오는 줄에서 어느 종류 폴더의 무엇인지 그대로 읽힙니다.

**Incorrect (잡동사니 파일에서 내보낸 함수가 세 단계로 이어집니다):**

```ts
// utils.ts
export const toTrimmedTitle = (title: string) => {
	return title.trim();
};

export const toProductPayload = (values: ProductFormValues) => {
	return {title: toTrimmedTitle(values.title)};
};

export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: toProductPayload(values)};
};
```

**Correct (소유자 아래 대표 함수 하나에 파일 하나를 둡니다):**

```ts
// page/product-form/_function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title을 거부한다
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Incorrect (대표 함수 하나만 부르는 보조를 대표 파일 아래 비공개 `const`로 쌓습니다):**

```txt
page/report/_function/
├── to-sales-overview.ts
│     toSalesOverview      내보낸 함수
│     toTrendChart         toSalesOverview 가 차트 둘에서 부름
│     toTrendPoints        toTrendChart 가 두 자리에서 부름
└── to-sales-filter-request.ts
```

**Correct (자기만 쓰는 보조가 생긴 대표 함수는 자기 이름 폴더를 갖고 보조는 `_` 파일입니다):**

```txt
page/report/_function/
├── to-sales-overview/           자기만 쓰는 보조가 있어 폴더
│   ├── to-sales-overview.ts     대표. 폴더와 같은 이름
│   ├── _to-trend-chart.ts       toSalesOverview 만 부름
│   └── _to-trend-points.ts      _to-trend-chart 만 부름. 폴더 안은 평평
└── to-sales-filter-request.ts   보조가 없어 파일 하나
```

**Incorrect (한 대표만 부르는 보조를 `_function` 바로 아래에 내보내 둡니다):**

```txt
page/report/_function/
├── to-sales-overview.ts
├── to-sales-digest.ts
└── to-trend-chart.ts            toSalesOverview 만 부르는데 소유자의 공개 면에 놓임
```

**Correct (두 대표가 부르게 된 뒤에 `_function` 바로 아래로 올리고 `_`를 뗍니다):**

```txt
page/report/_function/
├── to-sales-overview/
│   └── to-sales-overview.ts
├── to-sales-digest.ts           toTrendChart 를 함께 부르기 시작함
└── to-trend-chart.ts            대표 둘이 불러 공개 면으로 올라옴
```

### 3.5 Order Declarations Top Down

**Rule:** `T03-05` · `functions-order-declarations-top-down`

**Applies when:** `.ts` 파일에 선언을 추가하거나 선언 자리를 옮길 때. 내보낸 계약 타입이나 모듈 상수를 내보낸 함수보다 아래에 두려 할 때. 제외: 리액트 컴포넌트 본문 안 선언 자리를 바꾸는 경우.

**Impact: MEDIUM (파일을 열면 내보낸 함수가 먼저 보이고 부르는 쪽에서 불리는 쪽으로 이어집니다)**

파일을 여는 사람은 그 파일이 무엇을 내보내는지부터 찾습니다.
그래서 내보낸 것을 맨 위에 둡니다.
그 아래로는 부르는 차례대로 이어 놓습니다.

1. `import`
2. 내보낸 계약 타입
3. 내보낸 대표 함수
4. 모듈을 불러올 때 계산되는 선언. 부르는 쪽을 위에, 불리는 쪽을 아래에 둡니다

함수 본문 속 참조는 호출 시점에 해석되므로 불리는 쪽이 아래 있어도 됩니다.
모듈을 불러올 때 값이 계산되는 선언만 순서를 탑니다.
그런 선언은 자기가 부르는 선언 뒤에 둡니다.

컴포넌트 본문 안에서 훅, 핸들러, 이펙트를 어떤 순서로 둘지는 프레임워크 컨벤션이 정합니다.

**Incorrect (내보낸 계약 타입이 함수 아래에 있어 시그니처를 읽으려면 파일을 끝까지 내려가야 합니다):**

```ts
// page/report/_function/to-summary-rows.ts
export const toSummaryRows = (params: ToSummaryRowsParams): SummaryRow[] => {
	return params.response.items.map((item) => ({id: item.id, label: item.name.trim() || item.code}));
};

/**
 * 요약 표 행을 만들 때 필요한 입력
 */
export interface ToSummaryRowsParams {
	/**
	 * 요약 조회 응답
	 */
	response: SalesSummaryResponse;
}
```

**Correct (내보낸 계약 타입이 먼저, 그 계약을 받는 함수가 바로 아래에 옵니다):**

```ts
// page/report/_function/to-summary-rows.ts
/**
 * 요약 표 행을 만들 때 필요한 입력
 */
export interface ToSummaryRowsParams {
	/**
	 * 요약 조회 응답
	 */
	response: SalesSummaryResponse;
}

/**
 * 요약 표가 그리는 행 목록. 이름이 비면 코드로 표시한다
 */
export const toSummaryRows = (params: ToSummaryRowsParams): SummaryRow[] => {
	return params.response.items.map((item) => ({id: item.id, label: item.name.trim() || item.code}));
};
```

**Incorrect (모듈을 불러올 때 계산되는 선언이 자기가 부르는 선언보다 위에 있습니다):**

```ts
export const toCycleOffsets = (): number[] => {
	return cycle_offsets;
};

const cycle_offsets = toOffsetTable();

const toOffsetTable = (): number[] => {
	return [0, 31, 59];
};
```

**Correct (모듈을 불러올 때 계산되는 선언은 자기가 부르는 선언 뒤에 둡니다):**

```ts
/**
 * 지원하는 로케일인지 판정
 */
export const isSupportedLocale = (locale: string): boolean => {
	return supported_locale_set.has(locale);
};

const toSupportedLocaleSet = (): Set<string> => {
	return new Set(Object.keys(locale_label));
};

const supported_locale_set = toSupportedLocaleSet();
```

### 3.6 Promote Owner-Free Functions to the Root util Folder

**Rule:** `T03-06` · `functions-promote-shared-functions-to-root-util`

**Applies when:** 함수를 루트 `util` 폴더로 옮기거나 종류 폴더를 새로 만들 때. 두 소유자가 같은 함수를 쓰게 될 때. 제외: 소유자 안에서 파일 자리만 바꾸는 경우.

**Impact: MEDIUM-HIGH (루트 `util`에 한 소유자의 함수가 섞이지 않고 쓰는 곳 수에 따라 자리가 흔들리지 않습니다)**

승격은 쓰는 곳이 몇 개인지가 아니라 그 함수가 누구 것인지로 판정합니다.
가르는 법은 소유자를 지워 보는 것입니다.

- 소유자와 함께 사라지면 그 소유자 아래에 둡니다.
  profile 저장 화면이 없어지면 `toProfileSaveRequest`가 조립할 요청도 없습니다.
- 소유자를 지워도 남으면 지금 한 곳만 써도 올립니다.
  `toDisplayDate`는 소유자가 하나든 셋이든 `util/date/`에 둘 함수입니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 함수가 자리를 옮겨 다닙니다.

**루트 `util`은 프로젝트가 소유자인 함수 폴더입니다.**
파일 하나에 함수 하나, 자기만 쓰는 보조는 자기 이름 폴더의 `_` 파일이라는 규칙은 소유자 아래와 같습니다.
다른 점은 폴더 한 겹입니다.
함수가 많아 종류 폴더로 묶습니다.

| 종류 폴더 | 기준 |
| --- | --- |
| `date`, `money`, `string`, `array`, `dom`, `url` | 함수가 **받는 값의 타입**입니다 |
| `spread` 같은 도메인 이름 | 도메인 타입도 값의 타입입니다. `Spread`를 받는 함수는 `util/spread/`입니다 |
| 화면이나 기능 이름 | 짓지 않습니다. 종류를 못 지으면 그 함수는 `util`이 아니라 소유자 함수입니다 |
| 소유자 아래 `_function` | 종류 폴더를 두지 않습니다. 함수가 몇 개라 파일 목록으로 충분합니다 |

**두 소유자가 같은 함수를 써야 하면 셋 중 하나로 해소합니다.**

1. 표시까지 같으면 `widget` 컴포넌트가 소유합니다.
2. 계산만 같으면 각 소유자가 각자 갖습니다.
3. 프로젝트 전반의 계산이면 루트 `util`로 올립니다.

1번은 함수를 공유하는 것이 아니라 표시를 공유하는 것입니다.
어느 레이어인지는 프레임워크 컨벤션의 레이어 규칙이 판정합니다.

**Incorrect (소유자와 함께 사라질 함수를 루트 `util`로 올립니다):**

```ts
// util/profile/to-profile-save-request.ts
// profile은 값의 종류가 아니라 화면 이름이다. 화면이 없어지면 이 요청도 없다
/**
 * 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (values: ProfileFormValues) => {
	return {body: {displayName: values.displayName.trim()}};
};
```

**Correct (소유자와 함께 사라질 함수는 그 소유자의 `_function` 폴더에 둡니다):**

```ts
// page/profile/_function/to-profile-save-request.ts
/**
 * 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (values: ProfileFormValues) => {
	return {body: {displayName: values.displayName.trim()}};
};
```

**Incorrect (소유자를 지워도 남을 함수를 쓰는 곳이 하나라고 소유자 아래 둡니다):**

```ts
// page/orders/_function/to-display-date.ts
// 날짜 표시는 orders 화면을 지워도 남는다. 지금 이 화면만 쓴다는 이유로 여기 있다
/**
 * 형식을 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
 */
export const toDisplayDate = (value: string): string => {
	return dayjs(value).format(date_format);
};
```

**Correct (승격 판정 흐름입니다):**

```txt
이 함수는 누구 것인가?
│
└ 소유자를 지워 본다
   │
   ├ 함수도 같이 사라짐 ──→ 그 소유자 아래에 둔다
   └ 함수는 그대로 남음 ──→ util/<받는 값의 종류>/ 로 올린다
      │
      └ 종류 이름을 못 짓겠음 → util 이 아니다. 소유자 아래로 되돌린다
```

**Correct (소유자를 지워도 남는 함수는 종류 폴더에 파일 하나로 올립니다):**

```txt
util/
├── date/
│   ├── to-display-date.ts
│   └── to-display-date.test.ts
└── money/
    └── to-signed-amount.ts
```

```ts
// util/date/to-display-date.ts
/**
 * 형식을 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
 */
export const toDisplayDate = (value: string): string => {
	return dayjs(value).format(date_format);
};
```

```ts
// util/money/to-signed-amount.ts
/**
 * 금액 표시는 화면마다 다르지 않다. 소수 두 자리와 부호를 고정한다
 */
export const toSignedAmount = (amount: Amount): string => {
	return `${amount.value < 0 ? "-" : "+"}$${Math.abs(amount.value).toFixed(2)}`;
};
```

### 3.7 Avoid Imperative Assembly in Wide Scopes

**Rule:** `T03-07` · `functions-avoid-imperative-assembly-in-wide-scopes`

**Applies when:** 모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 만들 때. 삼항 안에 삼항을 넣을 때.

**Review with:** `functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.

| 상황 | 조립하는 법 |
| --- | --- |
| 쓰는 자리가 좁은 스코프 하나 | 그 안에서 바로 계산합니다 |
| 값 하나가 조건 하나로 갈림 | 삼항 하나로 씁니다 |
| 값 하나가 조건 둘 이상으로 갈림 | 분기마다 `return`으로 끝나는 함수로 뺍니다. 자리는 `functions-extract-helpers-only-when-the-boundary-is-real`이 정합니다 |
| 목록에 조건부 항목이 들어감 | 조건부 스프레드나 표를 `filter`로 걸러 한 번에 조립합니다 |

**삼항은 조건 하나까지입니다.**
삼항 안에 삼항을 넣지 않습니다.
분기가 셋 이상이면 `return`이 그 분기의 값을 끝내는 함수가 위에서 아래로 한 번에 읽힙니다.
`let`에 기본값을 두고 `if`로 덮어쓰지 않습니다.
읽는 순서가 논리와 반대이고 아래에서 다시 바뀌는지 끝까지 봐야 합니다.
함수를 만들기 전에 값 검사를 경계로 보내면 분기가 줄어 삼항 하나로 끝나는 경우가 많습니다.
검사 자리는 `absence-check-once-at-the-boundary`가 정합니다.

떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`이 정합니다.
중간값에 이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

**Incorrect (넓은 스코프에서 명령형으로 조립을 쌓습니다):**

```ts
let visibleTabs = ["overview"];

if (canManageItems) {
	visibleTabs.push("items");
}
```

**Correct (조건부 스프레드로 한 번에 계산합니다):**

```ts
const visibleTabs = ["overview", ...(canManageItems ? ["items"] : [])];
```

**Incorrect (삼항 안에 삼항을 넣어 값 하나를 고릅니다):**

```ts
const statusLabel = task.isClosed ? "마감" : task.isDueSoon ? "임박" : "진행";
```

**Correct (분기가 셋이면 `return`으로 끝나는 함수로 뺍니다):**

```ts
// page/task/_function/to-task-row/_to-status-label.ts
/**
 * 할 일 행의 상태 라벨. 마감이 임박보다 우선한다
 */
export const toStatusLabel = (task: TaskRow): StatusLabel => {
	if (task.isClosed) {
		return "마감";
	}
	if (task.isDueSoon) {
		return "임박";
	}
	return "진행";
};
```

**Incorrect (목록 조립에서 조건이 셋이 되자 삼항을 겹칩니다):**

```ts
const visibleTabs = canManageItems
	? canInviteMembers
		? ["overview", "items", "members"]
		: ["overview", "items"]
	: canInviteMembers
		? ["overview", "members"]
		: ["overview"];
```

**Correct (조건이 셋 이상인 목록은 표로 두고 걸러 냅니다):**

```ts
const visibleTabs = [
	{id: "overview", isVisible: true},
	{id: "items", isVisible: canManageItems},
	{id: "members", isVisible: canInviteMembers},
]
	.filter((tab) => tab.isVisible)
	.map((tab) => tab.id);
```

### 3.8 Name a Value Only to Prevent Recompute or Explain a Judgment

**Rule:** `T03-08` · `functions-name-a-value-only-for-recompute-or-judgment`

**Applies when:** 순수 계산의 결과를 지역 변수\(`const`\)로 받는 줄을 추가·삭제할 때. 표현식을 쓰는 자리에 그대로 적을지 변수로 뺄지 정할 때.

**Review with:** `functions-avoid-imperative-assembly-in-wide-scopes`, `values-read-objects-through-chains`

**Impact: MEDIUM (변수로 뺄지가 그 표현식 안에서 정해져 쓰는 자리가 하나 늘었다고 판정이 뒤집히지 않습니다)**

변수를 만드는 이유는 둘입니다.
둘 다 아니면 표현식을 쓰는 자리에 그대로 적습니다.
같은 표현식을 몇 번 적든 마찬가지입니다.

**1. 다시 계산하면 값이 달라지거나 비용이 듭니다.**

| 자리 | 이유 |
| --- | --- |
| 콜백이나 반복문 안으로 들어가는 값 | 코드에 한 번 적혀 있어도 실행은 원소마다 한 번씩입니다 |
| 시각·난수처럼 부를 때마다 달라지는 값 | 두 자리가 서로 다른 값을 봅니다 |
| `await`나 `yield`가 붙은 값 | 실행 순서가 뜻을 갖습니다 |
| 바깥과 주고받는 호출 (`init()`, `localStorage.getItem()`) | 옮기면 부르는 시점이 달라집니다 |
| 훅 호출과 `useState` 반환 | 부르는 자리와 횟수가 정해져 있습니다 |

함수 값은 계산 결과가 아니라 계약이라 이 규칙 대상이 아닙니다.
선언 형태는 `functions-declare-functions-as-arrow-consts`가 정합니다.

**코드에 한 번 적힌 것과 실행에서 한 번인 것은 다릅니다.**
`.map()`이나 `.filter()` 콜백 안, 반복문 안으로 옮기면 원소 수만큼 다시 계산합니다.
`values-use-set-and-map-for-repeated-lookups`가 만드는 `Set`도 같은 이유로 콜백 밖에 둡니다.

**2. 여러 항을 엮은 판정이라 이름이 결론을 대신 말해 줍니다.**

`row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId`는
읽을 때마다 세 항을 머릿속에서 합쳐야 합니다.
`isEditable`은 그 합성을 한 번만 하게 합니다.

- 항이 하나면 이름이 더해 줄 것이 없습니다.
  `row.dueDate < today`는 쓰는 자리에 그대로 적습니다.
- 부정이 겹치면 이름으로 뒤집습니다.
  `!row.deletedAt && !row.archivedAt`보다 `isVisible`이 한 번에 읽힙니다.
- 표현식에 리터럴이 보이면 변수로 뺄 자리가 아니라 그 리터럴을 선언할 자리입니다.
  `types-replace-enum-with-as-const-objects`와
  `naming-place-project-constants-in-the-root-constant-folder` 규칙이 그 자리를 정합니다.

**횟수는 기준이 아닙니다.**
몇 번 쓰이는지는 파일 전체를 봐야 알고, 쓰는 자리를 하나 더하면 어제 맞던 판정이 오늘 뒤집힙니다.
같은 코드에 다른 답이 나오는 기준은 지킬 수 없습니다.
위 둘은 그 표현식 안에서 판정됩니다.

변수로 빼면 읽는 사람은 그 값이 어디서 왔는지 확인하러 위로 올라갑니다.
그 비용을 치를 이유가 위 둘입니다.

`let` 재할당과 배열 `push` 누적은 `functions-avoid-imperative-assembly-in-wide-scopes`가 봅니다.
객체 필드를 그대로 읽는 것은 계산이 아니라 `values-read-objects-through-chains`가 봅니다.

**Incorrect (두 번 쓴다는 이유만으로 변수로 뺍니다):**

```ts
const toRowClassNames = (row: Row): string[] => {
	const isOverdue = row.dueDate < today;

	return [
		isOverdue ? "ui_row__root--overdue" : "ui_row__root",
		isOverdue ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Correct (항이 하나라 두 번 적어도 그 자리에 그대로 씁니다):**

```ts
const toRowClassNames = (row: Row): string[] => {
	return [
		row.dueDate < today ? "ui_row__root--overdue" : "ui_row__root",
		row.dueDate < today ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Incorrect (돌려주기만 할 값을 변수로 뺍니다):**

```ts
const toNextIteration = (iteration: number): number => {
	const nextIteration = iteration + 1;

	return nextIteration;
};

const toRowLabel = (row: Row): string => {
	const rowLabel = `${row.title} (${row.id})`;

	return rowLabel;
};
```

**Correct (이름을 붙이지 않고 그대로 돌려줍니다):**

```ts
const toNextIteration = (iteration: number): number => {
	return iteration + 1;
};

const toRowLabel = (row: Row): string => {
	return `${row.title} (${row.id})`;
};
```

**Incorrect (세 항을 엮은 판정을 쓰는 자리에 그대로 늘어놓습니다):**

```ts
const toRowAction = (row: Row): RowAction => {
	return row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId
		? row_action.edit
		: row_action.view;
};
```

**Correct (한 번만 써도 합성 판정이라 변수로 뺍니다):**

```ts
const toRowAction = (row: Row): RowAction => {
	const isEditable = row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId;

	return isEditable ? row_action.edit : row_action.view;
};
```

**Incorrect (콜백 안에 두어 행마다 다시 계산합니다):**

```ts
const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
	return rows.filter((row) => row.title.toLowerCase().includes(keyword.trim().toLowerCase()));
};
```

**Correct (콜백 밖으로 빼 행마다 다시 계산하지 않습니다):**

```ts
const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
	// 콜백 안으로 옮기면 행마다 다시 계산한다
	const lowerKeyword = keyword.trim().toLowerCase();

	return rows.filter((row) => row.title.toLowerCase().includes(lowerKeyword));
};
```

**Incorrect (변수를 없애느라 저장과 캐시 비우기 순서가 뒤집힙니다):**

```ts
/**
 * 초안을 저장한 뒤 목록 캐시를 비운다
 */
const submitDraft = async (draft: Draft) => {
	await queryClient.invalidateQueries({queryKey: ["records"]});

	return await saveRecord(draft);
};
```

**Correct (바깥과 주고받는 호출이라 변수로 뺍니다):**

```ts
/**
 * 초안을 저장한 뒤 목록 캐시를 비운다
 */
const submitDraft = async (draft: Draft) => {
	const savedRecord = await saveRecord(draft);

	await queryClient.invalidateQueries({queryKey: ["records"]});

	return savedRecord;
};
```

### 3.9 Name Functions by What Comes Out

**Rule:** `T03-09` · `functions-name-functions-by-what-comes-out`

**Applies when:** 이름을 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 생성기·프레임워크·외부 계약이 정한 이름을 그대로 쓰는 경우.

**Impact: MEDIUM (이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다)**

함수 이름은 입력이나 구현 동작이 아니라 호출 뒤 얻는 값이나 효과를 말합니다.
접미사를 먼저 정하지 말고 아래 구분에서 가장 구체적인 동사를 고릅니다.

| 이름 | 사용하는 때 | 예 |
| --- | --- | --- |
| `to<대상>` | 입력 형태를 다른 출력 형태로 바꿀 때 | `toDetailContent` |
| `get<대상>` | 이미 존재하는 값을 가져올 때 | `getSelectedRow` |
| `find<대상>` | 값 하나 또는 없음을 돌려줄 때 | `findUserByEmail` |
| `choose<대상>` | 같은 값의 출처가 둘 이상일 때 우선순위로 하나를 고를 때. `??`가 서로 다른 입력 사이에 섭니다 | `chooseBackSource` |
| `normalize<대상>` | 같은 개념의 값을 허용 범위나 기본 표현에 맞출 때 | `normalizePageSize` |
| `parse<대상>` | 문자열·`unknown`을 검증하며 타입이 보장된 값으로 읽을 때 | `parseSearchParams` |
| `format<대상>` | 값을 사람이 읽는 문자열로 표시할 때 | `formatCandidateDayCount` |
| `compare<대상>` | 두 값을 비교해 정렬 순서를 돌려줄 때 | `compareProductsByPrice` |
| `load<대상>`·`fetch<대상>` | 비동기 I/O를 수행하거나 여러 요청을 조율할 때 | `loadProductExport` |
| `is`·`has`·`can`·`should` | 참이나 거짓으로 질문에 답할 때 | `shouldShowSummary` |

입력이 하나면 `choose`가 아닙니다.
분류는 `to`, 검증하며 읽는 것은 `parse`입니다.
없을 수 있는 조회는 `find`, 허용 범위 보정은 `normalize`입니다.

**이름에는 출력 역할만 남깁니다.**

- 입력은 시그니처가 말하므로 이름에 반복하지 않습니다.
  `mapResponseToModel`처럼 입력과 막연한 접미사를 함께 적지 않습니다.
- 소유자 경로가 이미 말하는 도메인을 되풀이하지 않습니다.
  `sales-trend-panel/_function/` 안에서는 `toSalesTrendComparisonWindows`보다
  `toComparisonWindows`가 적절합니다.
- 반환 타입 이름을 그대로 옮기기보다 호출자가 쓰는 결과 개념을 적습니다.
  `toReportViewModel`보다 `toReportRows`가 구체적입니다.
- 서버 요청처럼 계약 자체가 출력 역할이면 `toUserSaveRequest`처럼 계약 이름을 씁니다.

**값 대신 효과를 내는 함수는 그 효과로 이름 짓습니다.**

| 효과 | 이름 | 예 |
| --- | --- | --- |
| 저장·삭제 | `save<대상>`·`remove<대상>` | `saveProduct` |
| 조건 위반 시 예외 | `assert<조건>` | `assertLoggedIn` |
| 검사 결과 또는 오류 | `validate<대상>` | `validateProductForm` |
| 도메인 동작 | 실제 업무 동사 | `submitOrder`, `cancelBooking` |

`build`, `create`, `make`, `process`, `manage`, `do`, `perform`, `execute`,
`filter`, `map`, `update`, `resolve`는 우리가 짓는 이름의 첫 동사로 쓰지 않습니다.
무엇이 나오는지 또는 어떤 효과가 생기는지 구체적으로 말하지 못하기 때문입니다.

- `filterActiveUsers`는 활성 사용자를 남기는지 제외하는지 모호합니다.
  남은 목록이 출력이면 `toActiveUsers`로 씁니다.
- `mapProductRows`는 행이 입력인지 출력인지 모호합니다.
  행이 출력이면 `toProductRows`로 씁니다.
- `updateProduct`는 저장 효과인지 새 값을 만드는 계산인지 모호합니다.
  각각 `saveProduct`나 `toUpdatedProduct`처럼 나눕니다.
- `resolveGradeTone`은 안에 조건이 있다는 것만 말합니다.
  등급을 tone으로 분류한 값이 출력이면 `toGradeTone`으로 씁니다.
- 배열의 짧은 인라인 변환에서 쓰는 `array.map(...)`은 함수 이름 규칙과 무관합니다.
- `handle`과 `use`처럼 프레임워크가 의미를 정하는 이름은 해당 프레임워크 규칙이 판정합니다.

생성기·프레임워크·외부 계약이 정한 이름은 그대로 씁니다.
`new Promise((resolve, reject) => …)`의 매개변수와 생성된 API의 `fetch` 함수처럼
우리가 소유하지 않는 이름을 이 규칙에 맞추려고 바꾸거나 감싸지 않습니다.

**Incorrect (입력·구현 동작·막연한 접미사를 이름에 씁니다):**

```ts
export const buildUserPayload = (formValues: UserFormValues) => { /* … */ };
export const mapResponseToModel = (response: UserResponse) => { /* … */ };
export const processUserRows = (rows: UserRow[]) => { /* … */ };
export const resolveGradeTone = (grade: string) => { /* … */ };
```

**Correct (출력 역할이나 효과를 이름에 씁니다):**

```ts
/**
 * 사용자 저장 요청 조립. 서버가 빈 문자열을 거부해 비운 칸은 넣지 않는다
 */
export const toUserSaveRequest = (formValues: UserFormValues) => { /* … */ };

/**
 * 응답 한 건을 표 행으로 바꾼다
 */
export const toUserRows = (response: UserResponse) => { /* … */ };

/**
 * 비활성 사용자를 제외한 목록
 */
export const toActiveUsers = (rows: UserRow[]) => { /* … */ };

/**
 * 등급 문자열을 강조 tone으로 분류한다
 */
export const toGradeTone = (grade: string) => { /* … */ };
```

**Correct (값 대신 효과를 내는 함수는 그 효과와 판정으로 이름 짓습니다):**

```ts
/**
 * 관리자 권한 판정. 역할 목록이 비어 있으면 조회 전 상태로 보고 false를 돌려준다
 */
export const isAdminUser = (user: User) => { /* … */ };

/**
 * 로그인 상태가 아니면 예외를 던진다. 화면 이동은 호출한 쪽이 정한다
 */
export const assertLoggedIn = (session: Session): void => {
	if (!session.userId) {
		throw new NotLoggedInError();
	}
};
```

## 4. Values and Data Structures

**Impact: HIGH**

값을 다루는 관용구를 한 가지로 고정합니다. 넘겨받은 배열은 제자리에서 바꾸지 않고, 반복되는 조회는 `Set`과 `Map`으로 모읍니다. 객체에서 값을 꺼낼 때는 구조분해로 끊지 않고 체인으로 읽어 출처를 남깁니다. 한 곳에서 쓸 값은 조회표로 우회하지 않고 사용처에서 직접 고릅니다. 뜻이 있는 숫자는 쓰는 자리에 적지 않고 상수로 선언합니다. 값을 다루는 보조는 직접 만들지 않고 `es-toolkit`에서 찾습니다. 날짜는 `dayjs`로 다룹니다. 같은 판정은 경계에서 한 번만 하고 결과를 데이터에 싣습니다.

### 4.1 Prefer Immutable Array Sorting

**Rule:** `T04-01` · `values-prefer-immutable-array-sorting`

**Applies when:** 프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.

**Review with:** `values-use-es-toolkit-for-value-helpers`

**Impact: HIGH (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이면 원본까지 함께 바뀝니다.

정렬은 `es-toolkit`의 `sortBy`와 `orderBy`로 합니다.
키 하나면 `sortBy`, 정렬 방향이 섞이면 `orderBy`입니다.
둘 다 새 배열을 돌려주므로 원본은 그대로 남습니다.

비교 규칙을 키로 적을 수 없을 때만 `.toSorted()`를 씁니다.
한국어 이름을 `localeCompare`로 비교하는 정렬이 여기 해당합니다.

**Incorrect (매개변수로 받은 배열을 제자리에서 바꿉니다):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.sort((left, right) => left.age - right.age);
};
```

**Correct (키 기준 정렬은 `sortBy`를 씁니다):**

```ts
import {sortBy} from "es-toolkit";

const toSortedUsers = (users: User[]): User[] => {
	return sortBy(users, ["age"]);
};
```

**Correct (방향이 섞이면 `orderBy`를 씁니다):**

```ts
import {orderBy} from "es-toolkit";

const toSortedProducts = (products: Product[]): Product[] => {
	return orderBy(products, ["category", "price"], ["asc", "desc"]);
};
```

**Correct (비교 규칙을 키로 적을 수 없으면 `.toSorted()`를 씁니다):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.toSorted((left, right) => left.name.localeCompare(right.name));
};
```

### 4.2 Use Set and Map for Repeated Lookups

**Rule:** `T04-02` · `values-use-set-and-map-for-repeated-lookups`

**Applies when:** 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때. 제외: 조회하는 목록이 짧고 길이가 정해져 있는 경우.

**Impact: MEDIUM (목록이 길어질수록 곱으로 늘어나는 비교를 한 번 만든 조회로 바꿉니다)**

`includes`와 `find`는 목록을 처음부터 훑습니다.
이 호출이 다른 목록을 도는 콜백 안에 있으면 비교 횟수가 두 목록 길이의 곱이 됩니다.
행 20개에 허용 목록 20개면 400번이라 아무 문제가 없습니다.
행 5,000개에 허용 목록 800개면 400만 번입니다.
두 코드는 모양이 같아서 데이터가 늘어난 뒤에도 눈에 띄지 않습니다.

`Set`과 `Map`은 이 곱을 없앱니다.
길이와 상관없이 한 번에 찾기 때문입니다.
목록 길이를 우리가 정하지 못할 때 차이가 벌어집니다.
서버에서 받은 행이나 사용자가 고른 항목이 그 경우입니다.

다음 중 하나면 바꿉니다.
그 밖에는 그대로 둡니다.

- 같은 목록을 뒤지는 조회가 루프나 `map`·`filter`·`some` 콜백 안에 있습니다.
- 같은 목록을 뒤지는 조회가 서로 다른 세 지점 이상에서 일어납니다.

**길이가 정해진 짧은 목록은 대상이 아닙니다.**
상태 다섯 개를 적어 둔 상수에 `includes`를 한 번 부르는 쪽이 `Set`을 만드는 것보다 읽기 쉽습니다.

**목록을 만들려고 `Set`을 쓰는 것은 이 규칙이 아닙니다.**
`[...new Set(values)]`는 `uniq`, `filter((value) => !set.has(value))`는 `difference`나 `without`입니다.
`values-use-es-toolkit-for-value-helpers`가 그 자리를 봅니다.
`Set`은 만든 뒤에 `has`를 여러 번 부를 때만 남깁니다.

`es-toolkit`의 `keyBy`가 돌려주는 평범한 객체도 조회 자체는 한 번에 합니다.
그래도 조회 자리에는 `Map`을 씁니다.
평범한 객체는 `constructor`나 `toString` 같은 프로토타입 키에 걸립니다.
`Record<string, T>`를 읽으면 없는 키도 `T`로 잡혀 빠진 값이 드러나지 않습니다.
`map.get()`은 언제나 `T | undefined`라 없다는 사실이 타입에 남습니다.
`groupBy`와 `keyBy`는 조회가 아니라 목록을 다시 짜는 자리에서 씁니다.

**Incorrect (같은 배열을 반복 순회하며 포함 여부를 확인합니다):**

```ts
const visibleProducts = products.filter((product) => allowedProductIds.includes(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIds.includes(product.id));
```

**Correct (반복 조회는 `Set`으로 승격합니다):**

```ts
const allowedProductIdSet = new Set(allowedProductIds);

const visibleProducts = products.filter((product) => allowedProductIdSet.has(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIdSet.has(product.id));
```

**Correct (반복 키 조회는 `Map`으로 승격합니다):**

```ts
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
```

**Correct (길이가 정해진 짧은 목록은 `includes`를 그대로 씁니다):**

```ts
const isEditableStatus = editable_order_statuses.includes(order.status);
```

### 4.3 Read Object Fields Through Chains, Not Destructuring

**Rule:** `T04-03` · `values-read-objects-through-chains`

**Applies when:** 구조분해로 객체에서 값을 꺼내는 줄을 추가·변경할 때. 객체 필드를 별칭 `const`에 담아 그 이름으로 쓰려 할 때. 제외: 배열이나 튜플을 자리로 푸는 경우.

**Review with:** `functions-name-a-value-only-for-recompute-or-judgment`

**Impact: MEDIUM-HIGH (값이 어느 객체에서 왔는지가 쓰는 자리마다 남아 이름만 보고 출처를 되짚지 않습니다)**

객체에서 값을 꺼낼 때 구조분해하지 않고 `product.title`처럼 체인으로 읽습니다.
같은 값에 새 이름만 붙이는 별칭 `const`도 만들지 않습니다.

구조분해와 별칭은 이름만 남기고 출처를 지웁니다.
파일이 길어지면 `title`이 매개변수인지 응답인지 지역 변수인지 읽는 쪽에서 구분할 수 없습니다.
`product.title`은 그 값이 어디서 왔는지를 쓰는 자리마다 다시 말해 줍니다.

**배열과 튜플은 대상이 아닙니다.**
`const [keyword, setKeyword] = useState("")`나
`for (const [key, value] of Object.entries(target))`처럼 자리로 값을 꺼내는 것은 지울 이름이 없습니다.
튜플에는 필드 이름이 없어서 출처가 지워지지 않습니다.

**예외를 두지 않습니다.**
`짧은 함수`나 `좁은 스코프`는 코드를 보고 판정할 수 없는 기준입니다.
줄이 몇 개 늘었다고 판정이 뒤집히는 규칙은 지킬 수 없습니다.

- 이름을 바꿔 꺼내는 것도 구조분해입니다.
  `const {status: projectStatus} = project`는 출처를 지우면서 이름까지 갈아 끼웁니다.
- 계산이 없으면 이름을 붙이지 않습니다.
  `functions-name-a-value-only-for-recompute-or-judgment`가 이름을 붙이라고 하는 것은 계산한 결과입니다.
  필드를 그대로 읽는 것은 계산이 아닙니다.
- 체인이 깊어 읽기 어려우면 꺼내는 자리가 아니라 **그 형태를 만드는 자리**를 봅니다.
  받는 쪽에서 끊는 것으로는 깊이가 줄지 않고 출처만 사라집니다.

**Incorrect (시그니처와 본문에서 구조분해해 출처가 사라집니다):**

```ts
const toInvoiceLine = ({product, quantity}: InvoiceLineInput): InvoiceLine => {
	const {title, unitPrice} = product;

	return {
		label: title,
		amount: unitPrice * quantity,
	};
};
```

**Incorrect (별칭 `const`로 끊어 이름만 남깁니다):**

```ts
const currency = pricing_default_currency;

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};
```

**Incorrect (이름을 바꿔 꺼내 출처와 원래 이름이 함께 사라집니다):**

```ts
const {status: projectStatus, owner: projectOwner} = project;

if (projectStatus === "archived") {
	notify(projectOwner);
}
```

**Correct (체인으로 읽어 출처가 쓰는 자리마다 남습니다):**

```ts
const toInvoiceLine = (input: InvoiceLineInput): InvoiceLine => {
	return {
		label: input.product.title,
		amount: input.product.unitPrice * input.quantity,
	};
};

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency: pricing_default_currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};

if (project.status === "archived") {
	notify(project.owner);
}
```

**Correct (배열과 튜플은 자리로 풀어도 됩니다):**

```ts
const [keyword, setKeyword] = useState("");

for (const [key, value] of Object.entries(target.searchParams)) {
	requestUrl.searchParams.set(key, value);
}
```

**Correct (필드 읽기가 아니라 계산한 결과라 이름을 붙입니다):**

```ts
const toOverdueLines = (invoice: Invoice): InvoiceLine[] => {
	// 콜백 안으로 옮기면 줄마다 다시 만든다
	const overdueIds = new Set(invoice.overdueLineIds);

	return invoice.lines.filter((line) => overdueIds.has(line.id));
};
```

### 4.4 Declare Meaningful Numbers Instead of Writing Them Inline

**Rule:** `T04-04` · `values-declare-meaningful-numbers`

**Applies when:** 비교, 계산, 호출 인자에 숫자 리터럴을 새로 적을 때. 제외: 관용값이나 배열 인덱스처럼 뜻이 없는 숫자를 쓰는 경우.

**Review with:** `absence-expose-optional-values-instead-of-silent-fallbacks`, `naming-place-project-constants-in-the-root-constant-folder`

**Impact: MEDIUM (숫자가 무엇을 뜻하는지 이름이 말하고 바꿀 때 고칠 자리가 한 곳입니다)**

뜻이 있는 숫자는 쓰는 자리에 적지 않고 상수로 선언한 이름을 가리킵니다.
`attempts > 42`가 아니라 `attempts > retry_max_attempts`입니다.

어디에 선언할지는 `naming-place-project-constants-in-the-root-constant-folder` 규칙이 정합니다.
소유자를 지워도 남으면 루트 `constant` 폴더, 소유자와 함께 사라지면 그 소유자의 `_constant` 폴더입니다.

**같은 파일에 지역 `const`로 옮기는 것으로는 끝나지 않습니다.**
지역 변수를 만들 이유 둘은 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.
숫자를 옮기는 것은 그 둘 중 어디에도 없어, 갈 곳은 지역 변수가 아니라 `constant` 폴더입니다.

**뜻이 없는 숫자는 그대로 적습니다.**
아래는 이름을 붙여도 읽는 사람이 얻는 것이 없습니다.

| 그대로 적는 것 | 예 |
| --- | --- |
| 관용값 | `0`, `1`, `2`, `10`, `24`, `60` |
| 배열 인덱스 | `rows[0]`, `parts[1]` |
| 선언의 초기값 | `let count = 0` |
| 상수 선언 자신의 값 | `export const retry_max_attempts = 42` |

`??`·`||` 오른쪽과 기본 매개변수는 이 규칙이 아니라
`absence-expose-optional-values-instead-of-silent-fallbacks`가 봅니다.
없는 값을 다루는 자리라 판정이 다릅니다.

**여러 숫자가 한 뜻을 이루면 배열이 아니라 객체로 둡니다.**
`{first: 0x1100, last: 0x115f}`처럼 키를 붙이면 숫자마다 이름이 생깁니다.
`[0x1100, 0x115f]`처럼 배열에 담으면 자리 번호로만 읽어야 합니다.
조회표를 둘지 자체는 `values-avoid-lookup-tables-for-simple-choices`가 정하고, 두기로 했으면 각 칸에 이름을 붙입니다.

`tooling-configure-biome-to-enforce-these-rules` 규칙이 `style/noMagicNumbers`로 이 선을 강제합니다.
그 규칙은 테스트 파일에서만 꺼집니다.
기대값은 리터럴 자체가 계약이라 상수로 빼면 검증할 것이 남지 않습니다.

**Incorrect (뜻이 있는 숫자를 쓰는 자리에 적거나 지역 `const`로 자리만 옮깁니다):**

```ts
// page/products/pg-products.tsx
const maxAttempts = 42;

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > maxAttempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, 37);
};
```

**Correct (`constant` 폴더에 선언하고 쓰는 자리에서 이름을 가리킵니다):**

```ts
// constant/retry.ts
/**
 * 이 횟수를 넘으면 사용자에게 실패를 보여 준다
 */
export const retry_max_attempts = 3;

// constant/preview.ts
/**
 * 미리보기에 그릴 행 수. 서버가 한 번에 주는 최대치와 맞춘다
 */
export const preview_row_count = 20;

// page/products/pg-products.tsx
import {preview_row_count} from "@/constant/preview";
import {retry_max_attempts} from "@/constant/retry";

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > retry_max_attempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, preview_row_count);
};
```

**Incorrect (뜻이 없는 숫자에까지 이름을 붙입니다):**

```ts
// constant/table.ts
export const table_first_row_index = 0;
export const table_page_step = 1;

// page/products/pg-products.tsx
import {table_first_row_index, table_page_step} from "@/constant/table";

const toFirstRow = (rows: Row[]): Row | undefined => {
	return rows[table_first_row_index];
};

const toNextPage = (page: number): number => {
	return page + table_page_step;
};
```

**Correct (뜻이 없는 숫자는 그대로 둡니다):**

```ts
// page/products/pg-products.tsx
const toFirstRow = (rows: Row[]): Row | undefined => {
	return rows[0];
};

const toNextPage = (page: number): number => {
	return page + 1;
};
```

### 4.5 Avoid Lookup Tables for Simple Value Choices

**Rule:** `T04-05` · `values-avoid-lookup-tables-for-simple-choices`

**Applies when:** 상태나 `variant`에 따라 쓸 값 하나를 고르는 객체·Map을 추가·변경할 때. 조회표의 키로 프롭이나 상태를 읽어 값을 넘기는 코드를 추가·변경할 때.

**Requires selected:** `docs-justify-convention-exceptions-with-a-reason-comment` · 함께 적용

**Impact: HIGH (값과 선택 조건이 사용처에 함께 남아 선택 기준을 바로 읽을 수 있습니다)**

한 곳에서 쓸 값을 고르려고 객체나 `Map`으로 조회표를 만들지 않습니다.
같은 값은 그대로 넘기고 값이 달라질 때만 사용처에서 조건으로 고릅니다.

조회표는 여러 키의 대응 관계 자체가 도메인이나 외부 계약일 때만 둡니다.
선언 바로 위에는 어떤 계약의 대응 관계인지 확인할 수 있는 근거를 적습니다.

**Incorrect (한 곳의 프롭 값을 고르려고 조회표를 만듭니다):**

```tsx
const chart_toolbar_variant_by_card_variant = {
	default: "default",
	fill: "default",
	dialog: "dialog",
} satisfies Record<UiChartCardProps["variant"], UiChartToolbarProps["variant"]>;

<UiChart.Toolbar variant={chart_toolbar_variant_by_card_variant[props.variant]} />;
```

**Correct (값이 달라지는 조건을 사용처에 적습니다):**

```tsx
<UiChart.Toolbar variant={props.variant === "fill" ? "default" : props.variant} />;
```

**Incorrect (계약 조회표를 근거 없이 둡니다):**

```ts
const order_status_by_api_code = {
	P: "pending",
	C: "completed",
	D: "cancelled",
} as const satisfies Record<OrderStatusCode, OrderStatus>;
```

**Correct (외부 코드와 화면 상태의 대응 관계가 계약이면 이유를 남기고 조회표를 둡니다):**

```ts
/**
 * GET /orders의 P·C·D 코드를 화면의 주문 상태 어휘로 바꾸는 API 경계 계약이다
 */
const order_status_by_api_code = {
	P: "pending",
	C: "completed",
	D: "cancelled",
} as const satisfies Record<OrderStatusCode, OrderStatus>;
```

### 4.6 Use es-toolkit for Value Helpers

**Rule:** `T04-06` · `values-use-es-toolkit-for-value-helpers`

**Applies when:** 배열, 객체, 문자열, 숫자를 다루는 보조 코드를 추가·변경할 때. `reduce`, `Object.entries`, `Array.from`, 정규식으로 값을 다시 짜는 코드를 쓸 때. 제외: 표준 메서드 하나로 끝나는 경우.

**Review with:** `values-handle-dates-with-dayjs`, `values-prefer-immutable-array-sorting`

**Impact: MEDIUM-HIGH (중복 제거와 표기 변환을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다)**

값을 다루는 보조 함수는 `es-toolkit`에서 먼저 찾습니다.
`clsx`와 같은 자리입니다.
쓸지 말지 고르는 라이브러리가 아니라 기본값입니다.

직접 쓴 구현은 빈 배열, 중복 키, 한 글자 문자열 같은 경계에서 저마다 다르게 틀립니다.
`Math.min(...values)`처럼 배열을 인자로 펼치는 관용구는 목록이 길어지면 호출 인자 한계에 걸립니다.
같은 일을 하는 코드가 파일마다 조금씩 다른 모양으로 남는 것이 더 큰 비용입니다.

| 갈래 | 손으로 쓰던 것 | 쓸 함수 |
| --- | --- | --- |
| 배열 | 중복 제거, 키로 묶기, 키로 색인 | `uniq`, `uniqBy`, `groupBy`, `keyBy` |
| 배열 | 차집합, 교집합, 합집합, 값 하나 빼기, 토글 | `difference`, `intersection`, `union`, `without`, `xor` |
| 배열 | 정렬, 일정 크기로 자르기, 조건으로 가르기 | `sortBy`, `orderBy`, `chunk`, `partition` |
| 배열 | 길이만큼 도는 자리 | `range` |
| 객체 | 복사, 깊은 비교 | `clone`, `cloneDeep`, `isEqual` |
| 객체 | 필드 골라내기, 빼기, 값만 바꾸기 | `pick`, `omit`, `mapValues` |
| 문자열 | 표기 바꾸기, HTML escape | `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `capitalize`, `escape` |
| 함수 | 호출 빈도 조절, 한 번만, 결과 기억 | `debounce`, `throttle`, `once`, `memoize` |
| 숫자 | 집계, 범위 제한, 최댓값과 최솟값 | `sum`, `sumBy`, `mean`, `clamp`, `maxBy`, `minBy` |
| 판정 | 빈 값과 형 검사 | `isNil`, `isNotNil`, `isEmptyObject`, `isPlainObject` |
| 비동기 | 지연, 시간 제한, 재시도 | `delay`, `withTimeout`, `retry` |

표에 없어도 `es-toolkit` 문서에 같은 뜻의 함수가 있으면 그 함수를 씁니다.
`lodash`는 새로 들이지 않습니다.
날짜는 `values-handle-dates-with-dayjs`가 보고, 정렬은 `values-prefer-immutable-array-sorting`이 봅니다.

**표준 메서드 하나로 끝나는 것은 그대로 둡니다.**
`map`, `filter`, `find`, `flat`, `at`, `Object.keys`를 감싸지 않습니다.
공백만 떼는 것도 표준 `value.trim()`입니다.
`es-toolkit`은 표준 메서드가 없거나 여러 줄로 흩어질 때 씁니다.
자를 문자를 지정하는 `trim(value, "_")`가 그 자리입니다.

**이름이 같아도 뜻이 다르면 갈아타지 않습니다.**
`es-toolkit`의 `compact`는 falsy를 모두 버리고, 프로젝트가 쓰던 `compact`는 `null`과 `undefined`만 버립니다.
뜻이 다르면 프로젝트 래퍼를 남기고 안을 `es-toolkit`으로 채웁니다.
이때 두 뜻의 차이를 고정하는 테스트를 함께 남깁니다.

**갈아탈 때 어느 항목이 남는지 확인합니다.**
`new Map(items.map(…)).values()`로 중복을 지우면 뒤에 온 항목이 남고, `uniqBy`는 앞에 온 항목이 남습니다.
남길 쪽을 앞으로 옮기지 않으면 결과가 조용히 뒤집힙니다.

**빈 목록 가드는 결과 가드로 합칩니다.**
`minBy`와 `maxBy`는 빈 배열에서 `undefined`를 돌려줍니다.
`length === 0`을 먼저 보고 다시 `Math.min`을 부르지 않고, 결과가 `undefined`인지만 봅니다.
값을 뽑으려고 만들던 중간 `map` 배열도 같이 사라집니다.

**반복 조회는 `Set`과 `Map`이 맡습니다.**
`groupBy`와 `keyBy`는 목록을 다시 짜는 함수입니다.
조회 자리를 `Map`으로 정리하는 것은 `values-use-set-and-map-for-repeated-lookups`가 봅니다.

**Incorrect (`es-toolkit`에 있는 함수를 손으로 다시 씁니다):**

```ts
const uniqueOwnerIds = ownerIds.filter((ownerId, index) => ownerIds.indexOf(ownerId) === index);
const uniqueCategories = [...new Set(points.map((point) => point.x))];
const productsByCategory = products.reduce<Record<string, Product[]>>((grouped, product) => {
	grouped[product.category] = [...(grouped[product.category] ?? []), product];
	return grouped;
}, {});
const draftFilter = JSON.parse(JSON.stringify(savedFilter)) as ProductFilter;
const searchKey = rawKey.replace(/([A-Z])/g, "_$1").toLowerCase();
const tickTimes = Array.from({length: tick_count}, (_unused, tickIndex) => toTickTime(tickIndex));
```

**Correct (`es-toolkit` 함수를 그대로 부릅니다):**

```ts
import {cloneDeep, groupBy, range, snakeCase, uniq} from "es-toolkit";

const uniqueOwnerIds = uniq(ownerIds);
const uniqueCategories = uniq(points.map((point) => point.x));
const productsByCategory = groupBy(products, (product) => product.category);
const draftFilter = cloneDeep(savedFilter);
const searchKey = snakeCase(rawKey);
const tickTimes = range(tick_count).map((tickIndex) => toTickTime(tickIndex));
```

**Incorrect (빈 목록을 먼저 가드하고 중간 배열을 만들어 양 끝을 읽습니다):**

```ts
const toChartBounds = (points: readonly ChartPoint[]) => {
	const yValues = points.map((point) => point.y);

	if (yValues.length === 0) {
		return undefined;
	}

	return {min: Math.min(...yValues), max: Math.max(...yValues)};
};
```

**Correct (빈 목록 판정을 `minBy`·`maxBy`의 결과로 합칩니다):**

```ts
import {maxBy, minBy} from "es-toolkit";

const toChartBounds = (points: readonly ChartPoint[]) => {
	const lowestPoint = minBy(points, (point) => point.y);
	const highestPoint = maxBy(points, (point) => point.y);

	if (lowestPoint === undefined || highestPoint === undefined) {
		return undefined;
	}

	return {min: lowestPoint.y, max: highestPoint.y};
};
```

**Correct (표준 메서드 하나로 끝나면 감싸지 않습니다):**

```ts
const activeProducts = products.filter((product) => product.isActive);
const trimmedKeyword = keyword.trim();
```

### 4.7 Handle Dates With dayjs

**Rule:** `T04-07` · `values-handle-dates-with-dayjs`

**Applies when:** 날짜를 파싱하거나 형식을 맞추거나 더하고 뺄 때. `new Date`, `getTime()`, `setDate()`, `toLocaleDateString()`을 쓸 때. 제외: 서버가 준 시각 문자열을 파싱 없이 그대로 보여주는 경우.

**Review with:** `naming-place-project-constants-in-the-root-constant-folder`, `values-use-es-toolkit-for-value-helpers`

**Impact: MEDIUM-HIGH (월말과 서머타임에서 어긋나는 날짜 산술을 없애고 표시 형식을 한 상수로 모읍니다)**

날짜는 `dayjs`로 다룹니다.
`es-toolkit`이나 `clsx`와 같은 자리입니다.
쓸지 말지 고르는 라이브러리가 아니라 기본값입니다.
`moment`는 새로 들이지 않습니다.

밀리초를 더하는 산술은 월말과 서머타임에서 틀립니다.
`getTime() + 7 * 24 * 60 * 60 * 1000`은 하루가 23시간이거나 25시간인 날을 모릅니다.

| 손으로 쓰던 것 | `dayjs` |
| --- | --- |
| `new Date(text)` 파싱과 유효성 검사 | `dayjs(text)`와 라운드트립 비교 |
| `getTime()` 밀리초 더하기, `setDate()` | `add()`, `subtract()` |
| `toLocaleDateString()`, 자릿수 채워 이어 붙이기 | `format()` |
| `getTime()` 대소 비교 | `isBefore()`, `isAfter()`, `isSame()` |

**형식 문자열은 상수로 둡니다.**
`format("YYYY.MM.DD")`를 파일마다 적으면 화면끼리 표기가 갈립니다.
자리는 `naming-place-project-constants-in-the-root-constant-folder`가 정합니다.

**형식은 맞지만 없는 날짜는 라운드트립으로 거릅니다.**
`dayjs("2026-02-30")`은 실패하지 않고 3월 2일로 넘어갑니다.
되돌린 문자열이 원래 문자열과 같은지 보아야 걸립니다.
이때 쓰는 형식은 입력이 들어온 형식이고, 화면 표시 형식과 같은 상수를 쓰지 않습니다.

**서버가 준 시각 문자열을 그대로 보여줄 때는 파싱하지 않습니다.**
파싱하면 타임존 변환이 붙어 표시 시각이 밀립니다.
문자열을 자르는 것이 표시 규칙이면 자르는 코드를 그대로 둡니다.

**Incorrect (밀리초를 더하고 자릿수를 손으로 채웁니다):**

```ts
const expiresAt = new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
const expiresLabel = `${expiresAt.getFullYear()}.${toPaddedDatePart(expiresAt.getMonth() + 1)}`;
```

**Correct (더하기와 형식은 `dayjs`, 형식 문자열은 상수로 둡니다):**

```ts
import dayjs from "dayjs";

import {date_format} from "@/constant/date";

const expiresAt = dayjs(issuedAt).add(token_expiry_days, "day");
const expiresLabel = expiresAt.format(date_format);
```

**Incorrect (형식만 보고 없는 날짜를 통과시킵니다):**

```ts
const isValidDateText = /^\d{4}-\d{2}-\d{2}$/.test(dateText);
```

**Correct (날짜를 다루는 갈림길입니다):**

```txt
날짜 문자열이 들어왔다
│
├ 서버가 준 시각을 그대로 보여주기만 함 ─→ 파싱하지 않는다. 문자열을 자른다
└ 계산하거나 형식을 바꿔야 함
   │
   ├ 형식만 바꿈 ──────→ dayjs(value).format(date_format)
   ├ 더하거나 뺌 ──────→ dayjs(value).add(token_expiry_days, "day")
   └ 값이 유효한지 봄 ─→ format 한 결과가 원래 문자열과 같은지 본다
```

**Correct (라운드트립으로 없는 날짜를 거릅니다):**

```ts
import dayjs from "dayjs";

import {date_input_format} from "@/constant/date";

/**
 * 형식은 맞지만 존재하지 않는 2026-02-30 같은 날짜를 거른다
 */
export const parseEntryDateText = (dateText: string): string | undefined => {
	return dayjs(dateText).format(date_input_format) === dateText ? dateText : undefined;
};
```

**Correct (서버 시각 문자열은 파싱하지 않고 자릅니다):**

```ts
// 서버가 이미 표시 타임존으로 준 문자열이다. dayjs 로 파싱하면 변환이 붙어 시각이 밀린다
const compactDateTime = responseDateTime.slice(0, 16).replace("T", " ");
```

### 4.8 Decide Once and Carry the Result

**Rule:** `T04-08` · `values-decide-once-and-carry-the-result`

**Applies when:** 같은 입력에 같은 판정·정규화·포맷을 두 자리 이상에서 할 때. 포맷하거나 정리한 값을 소비처에서 다시 파싱하거나 정리할 때. 두 함수가 같은 판정 함수를 부르게 되어 공유 보조를 만들려 할 때.

**Review with:** `absence-resolve-defaults-at-the-boundary`, `functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM-HIGH (같은 판정이 두 자리에서 어긋나지 않고 판정 함수를 나눠 쓰는 보조가 늘지 않습니다)**

값이 들어오는 경계에서 판정을 한 번 하고 그 결과를 데이터에 실어 아래로 내립니다.
소비처는 판정하지 않고 실린 필드를 읽습니다.

| 신호 | 대신 |
| --- | --- |
| 경계에서 포맷한 문자열을 소비처가 다시 파싱해 포맷함 | 경계에서 한 번 포맷하고 소비처는 그대로 씁니다 |
| 경계에서 `trim`한 값을 소비처가 다시 `trim`함 | 경계에서 한 번 정리합니다 |
| 판정 함수를 두 함수가 함께 부름 | 판정 결과를 항목의 필드로 싣고 두 함수는 그 필드를 읽습니다 |
| 실린 결과 옆에 `?? 다시 판정` 폴백 | 폴백을 지우고 실린 값만 읽습니다 |

실을 필드가 없으면 판정 결과를 담을 자리가 항목 형태에 빠진 것입니다.
그때는 소비처에서 다시 판정하지 않고 항목 형태에 필드를 더합니다.
어디를 경계로 잡는지는 `absence-resolve-defaults-at-the-boundary`의 순서와 같습니다.

두 곳이 같은 판정을 하고 있으면 그 판정 함수를 공유 보조로 빼는 것이 답이 아닙니다.
판정을 한 곳으로 모으면 부르는 자리가 하나가 되어 함수를 뺄 사유가 사라지는 경우가 많습니다.

**Incorrect (경계에서 포맷한 값을 소비처가 다시 파싱해 포맷합니다):**

```ts
// page/pattern/pg-pattern.tsx: SelectionInfo 를 만들며 이미 포맷한다
const selectionInfo = {avgCorr: formatStatDecimal(responseSelectionInfoSuspense.data.statCorr)};

// page/pattern/_function/to-metrics-content.ts: 문자열을 다시 숫자로 읽어 다시 포맷한다
const rows = [{id: "statCorr", value: formatStatDecimal(selectionInfo.avgCorr)}];
```

**Correct (경계에서 한 번 포맷하고 소비처는 실린 값을 그대로 씁니다):**

```ts
// page/pattern/_function/to-metrics-content.ts
const rows = [{id: "statCorr", value: selectionInfo.avgCorr}];
```

**Incorrect (같은 색 판정을 범례와 차트 둘에서 하고 폴백으로 한 번 더 합니다):**

```ts
// 범례
const colorToken = toCurveColorToken(curveItem.role, historicalIndex);

// 차트 둘. 범례 팔레트를 읽고도 같은 판정을 다시 한다
colorToken: colorTokenById.get(curveItem.id) ?? toCurveColorToken(curveItem.role, index),
```

**Correct (경계에서 한 번 정해 항목에 싣고 차트는 읽기만 합니다):**

```ts
// 범례를 만드는 자리에서 색을 정해 항목에 싣는다
const comparisonCurves = curveItems.map((curveItem, historicalIndex) => ({
	...curveItem,
	colorToken: toCurveColorToken(curveItem.role, historicalIndex),
}));

// 차트 둘
colorToken: curve.colorToken,
```

## 5. Absence and Fallback Handling

**Impact: HIGH**

값이 없을 수 있는 상태를 다루는 규칙을 모읍니다. 기본값으로 덮어 감추지 않고 없다는 사실을 사용처까지 남깁니다. 타입이 이미 보장하는 것은 다시 검사하지 않습니다. 검사는 값이 들어오는 경계에서 한 번만 하고 중간 함수는 타입을 믿고 지나갑니다.

### 5.1 Expose Optional Values Instead of Silent Fallbacks

**Rule:** `T05-01` · `absence-expose-optional-values-instead-of-silent-fallbacks`

**Applies when:** 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.

**Review with:** `absence-resolve-defaults-at-the-boundary`, `naming-place-owner-constants-in-the-owner-constant-folder`, `naming-place-project-constants-in-the-root-constant-folder`

**Impact: HIGH (그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다)**

**`??`와 `||` 오른쪽에 리터럴을 적지 않고 이미 선언된 이름만 가리킵니다.**

| 형태 | 판정 |
| --- | --- |
| `?? "help@example.com"`, `?? 0`, `?? []`, `\|\| "-"` 같은 리터럴 | 위반 |
| `?? pagination_default_page_size`처럼 상수로 선언된 이름 | 통과 |
| 같은 파일 지역 `const`로 리터럴만 옮긴 것. `const fallback = "-";` | 위반. 자리만 바꾼 것입니다 |
| 선언된 이름 둘을 합성한 결과에 이름을 붙인 것 | 통과. 리터럴이 없습니다 |
| 기본 매개변수나 구조분해 기본값에 **리터럴**을 적은 것. `(size = 10) =>`, `{size = 10}` | 위반 |
| 기본 매개변수가 선언된 이름을 가리키는 것. `(size = pagination_default_page_size) =>` | 통과 |
| 삼항 `value ? value : "-"`, `String(value ?? "")` | 위반 |

숫자 리터럴을 쓰는 자리에 적지 않는 일반 규범은 `values-declare-meaningful-numbers`가 정합니다.
여기서는 없는 값을 덮는 자리만 봅니다.

기본값이 정말 필요하면 그 기본값에 이름을 붙여 선언하고 그 이름을 가리킵니다.
소유자를 지워도 남으면 `naming-place-project-constants-in-the-root-constant-folder` 규칙이,
소유자와 함께 사라지면 `naming-place-owner-constants-in-the-owner-constant-folder` 규칙이 자리를 정합니다.
그 기본값을 어디서 채울지는 `absence-resolve-defaults-at-the-boundary`가 정합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

**Incorrect (`??`, `||`, 기본 매개변수 자리에 리터럴을 적습니다):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
const displayName = user.nickname || "-";
const toPageRequest = (size = 10): PageRequest => { /* … */ };
```

**Correct (이미 선언된 이름만 가리킵니다):**

```ts
const supportEmail = settings.supportEmail ?? support_email_default;
const displayName = user.nickname || empty_display_text;
const toPageRequest = (size = pagination_default_page_size): PageRequest => { /* … */ };
```

### 5.2 Resolve Defaults Once at the Boundary

**Rule:** `T05-02` · `absence-resolve-defaults-at-the-boundary`

**Applies when:** 선택 값의 기본값을 어디서 채울지 정할 때. 같은 선택 값에 `??` 기본값 해소가 둘 이상의 사용처에 흩어질 때. search 스키마, 응답 매핑, 쿼리 `select`에 기본값 채움을 추가·변경할 때.

**Review with:** `absence-expose-optional-values-instead-of-silent-fallbacks`, `functions-name-a-value-only-for-recompute-or-judgment`, `values-read-objects-through-chains`

**Impact: HIGH (기본값이 선언 한 곳에 남아 아래쪽 코드에서 `??`가 되풀이되지 않습니다)**

기본값 자리에 무엇을 적는지는 `absence-expose-optional-values-instead-of-silent-fallbacks`가 정합니다.
여기서는 그 기본값을 어디서 채우는지를 순서로 정합니다.

1. **없어도 되는지 먼저 봅니다.**
   빈 배열도 리터럴이라 `items ?? []` 대신 `items?.map(…)`으로 값이 없는 상태를 그대로 다룹니다.
   `(variant ?? "default") === "compact"`도 `variant === "compact"`로 쓰면 끝납니다.
   선택 값을 그대로 비교하면 기본값이 아예 필요 없는 경우가 가장 많습니다.
2. **필요하면 값이 들어오는 경계에서 한 번만 해소합니다.**
   라우트 search 스키마의 `.default(pagination_default_page_size)`, 응답 매핑, 쿼리의 `select`가 그 자리입니다.
   기본값이 선언 안에 들어가므로 그 선언이 곧 출처가 됩니다.
   아래쪽 코드에서는 그 값이 더는 선택 값이 아니어서 `??`가 나올 일이 없습니다.
3. **경계에서 못 하면 쓰는 자리에 그대로 적습니다.**
   `fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size})`처럼 씁니다.
4. **이름을 붙인다면 파생값임이 드러나는 이름으로 씁니다.**
   `pageSize`가 아니라 `effectivePageSize`입니다.
   붙일지 말지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정하고,
   횟수가 아니라 그 표현식이 무엇을 고른 값인지가 기준입니다.

**`??` 합성은 별칭이 아닙니다.**
`values-read-objects-through-chains`가 막는 것은 같은 값에 새 이름만 붙이는 별칭입니다.
`a ?? b`는 출처 둘을 놓고 하나를 고르는 계산이고, 그 결과는 어느 쪽에서 왔는지가 실행할 때 정해지는 파생값입니다.
그래서 이름을 붙일지는 별칭 규칙이 아니라 `functions-name-a-value-only-for-recompute-or-judgment`가 판정합니다.

**Incorrect (없어도 되는 값에 기본값을 채웁니다):**

```ts
const productIds = (response.data.rows ?? []).map((row) => row.id);
const isCompact = (variant ?? "default") === "compact";
```

**Correct (그대로 비교하면 기본값이 필요 없습니다):**

```ts
const productIds = response.data.rows?.map((row) => row.id);
const isCompact = variant === "compact";
```

**Incorrect (같은 기본값을 사용처마다 다시 채웁니다):**

```ts
fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size});
setVisibleRowCount(query.pageSize ?? pagination_default_page_size);
```

**Correct (값이 들어오는 경계에서 한 번 해소해 아래쪽에는 선택 값이 오지 않습니다):**

```ts
/**
 * product 목록 검색 조건. pageSize는 여기서 채워져 화면에서는 선택 값이 아니다
 */
const productSearchSchema = z.object({
	/**
	 * 한 번에 불러올 개수
	 */
	pageSize: z.number().default(pagination_default_page_size),
});

fetchProducts({pageSize: query.pageSize});
setVisibleRowCount(query.pageSize);
```

**Correct (경계에서 못 하면 쓰는 자리에 그대로 적습니다):**

```ts
fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size});
```

**Correct (이름을 붙인다면 파생값임이 드러나게 짓습니다):**

```ts
const effectivePageSize = query.pageSize ?? pagination_default_page_size;

fetchProducts({pageSize: effectivePageSize});
setVisibleRowCount(effectivePageSize);
```

### 5.3 Do Not Guard What the Types Already Guarantee

**Rule:** `T05-03` · `absence-do-not-guard-what-types-guarantee`

**Applies when:** `isNil`, `typeof`, 옵셔널 체이닝으로 값을 검사하는 분기를 추가·변경할 때. 선택 필드에 값을 넣으면서 `undefined`를 피하려고 조건부 스프레드를 쓸 때. 제외: `unknown`이나 앱 밖에서 온 값을 좁히는 경우.

**Review with:** `absence-check-once-at-the-boundary`, `absence-expose-optional-values-instead-of-silent-fallbacks`, `types-narrow-unknown-instead-of-asserting`

**Impact: MEDIUM (쓸모없는 방어 분기가 사라져 실제로 없을 수 있는 자리만 코드에 남습니다)**

검사는 타입이 못 막는 것에만 씁니다.
`string` 타입에 `isNil`, `number` 타입에 `typeof value === "number"`, 필수 필드에 `?.`는 타입이 이미 답한 질문입니다.
그런 분기는 읽는 사람에게 "여기서 값이 없을 수 있다"는 거짓 신호를 주고, 정말 없을 수 있는 자리를 묻어 버립니다.

| 형태 | 판정 |
| --- | --- |
| `string` 값에 `?.trim()` | 위반 |
| `number` 필드에 `typeof value === "number"` | 위반 |
| 필수 필드에 `isNil(value)` 분기 | 위반 |
| `string \| null` 값에 `isNil(value)` | 통과. 타입이 없을 수 있다고 말합니다 |
| `unknown`이나 앱 밖에서 온 값을 좁힘 | 대상이 아닙니다. `types-narrow-unknown-instead-of-asserting`이 정합니다 |

**선택 필드에는 `undefined`를 그대로 넣습니다.**
`...(isNil(value) ? {} : {value})`로 키를 숨기지 않습니다.
소비처는 선택 필드를 `?.`로 읽으므로 키가 있든 없든 같습니다.
`exactOptionalPropertyTypes`를 켠 프로젝트만 예외입니다.
그때는 `docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 정말 없을 수 있을 때 무엇을 넣는지는 `absence-expose-optional-values-instead-of-silent-fallbacks`가 정합니다.

**Incorrect (타입이 `string`으로 보장한 값을 다시 검사합니다):**

```ts
const toRowLabel = (row: ProductRow): string => {
	if (isNil(row.name)) {
		return row.code;
	}

	return row.name.trim();
};
```

**Correct (타입이 답한 질문은 다시 묻지 않습니다):**

```ts
const toRowLabel = (row: ProductRow): string => {
	return row.name.trim();
};
```

**Incorrect (선택 필드의 `undefined`를 조건부 스프레드로 숨깁니다):**

```ts
return {
	metrics,
	...(isNil(tamValidity) ? {} : {tamValidity}),
};
```

**Correct (선택 필드에는 `undefined`를 그대로 넣습니다):**

```ts
return {
	metrics,
	tamValidity: isNil(params.tamMetrics) ? undefined : toTamValidity(params.tamMetrics),
};
```

### 5.4 Check Absence Once at the Boundary

**Rule:** `T05-04` · `absence-check-once-at-the-boundary`

**Applies when:** `isNil`, `Number.isFinite` 같은 값 검사를 함수 본문에 넣을 때. 매개변수나 반환 타입에 `| null`, `| undefined`, `unknown`을 넣거나 뺄 때. 응답 매핑, `select`·`combine`, search 스키마에서 타입을 좁힐 때.

**Review with:** `absence-do-not-guard-what-types-guarantee`, `absence-resolve-defaults-at-the-boundary`, `values-decide-once-and-carry-the-result`

**Impact: HIGH (검사가 값이 들어오는 자리 하나에만 남아 중간 함수가 값을 검사하느라 늘어나지 않습니다)**

값이 없을 수 있는지는 값이 소유자 안으로 들어오는 경계에서 한 번만 검사합니다.
화면이면 응답 매핑, `select`, `combine`, search 스키마이고 컴포넌트면 프롭을 받는 자리입니다.
경계가 답을 정하면 아래 함수는 그 답을 타입으로 받습니다.

| 경계가 정한 답 | 아래로 내려가는 타입 | 아래에서 하는 일 |
| --- | --- | --- |
| 기본값이 있다 | `number` | 없습니다. `absence-resolve-defaults-at-the-boundary`대로 경계에서 채웠습니다 |
| 없음을 화면이 보여 준다 | `number \| undefined` | 함수는 그대로 넘기고 그리는 자리의 분기 하나만 읽습니다 |

그리는 자리의 분기는 검사가 아니라 화면의 두 번째 상태입니다.
값이 있을 때와 없을 때 그리는 것이 다르므로 그 분기는 어디로도 옮길 수 없습니다.
그 분기 말고 `undefined`를 읽는 코드가 경계 아래에 있으면 경계가 일을 안 한 것입니다.

중간 함수는 검사하지 않습니다.
받은 타입이 `number`면 `absence-do-not-guard-what-types-guarantee`대로 검사가 위반입니다.
받은 타입이 `number | undefined`면 그대로 넘깁니다.
그 값으로 판정을 해야 하면 경계에서 한 번 판정해 결과를 싣습니다.
그 방법은 `values-decide-once-and-carry-the-result`가 정합니다.

**시그니처가 경계를 말합니다.**
`number | null | undefined`나 `unknown`을 받는 함수가 경계 아래에 여럿 있으면 경계가 일을 안 한 것입니다.
`unknown`은 앱 밖에서 값이 들어오는 자리 하나만 받습니다.
그 좁힘은 `types-narrow-unknown-instead-of-asserting`이 정합니다.

**Incorrect (경계가 타입을 좁히지 않아 아래 함수마다 같은 값을 다시 검사합니다):**

```ts
// page/detail/_function/to-badge/_to-signed-tone.ts
export const toSignedTone = (value: number | null | undefined): Tone => {
	if (isNil(value) || !Number.isFinite(value) || value === 0) {
		return "neutral";
	}
	return value > 0 ? "positive" : "negative";
};

// page/detail/_function/format-signed-percent.ts
export const formatSignedPercent = (value: number | null | undefined) => {
	if (isNil(value) || !Number.isFinite(value)) {
		return copy_empty_value_text;
	}
	return `${value > 0 ? "+" : ""}${value}%`;
};
```

**Correct (경계에서 한 번 좁히고 아래 함수는 `number`만 받으며 없음은 그리는 분기 하나만 읽습니다):**

```tsx
// page/detail/pg-detail.tsx: 서버는 계산 전이면 null을 준다. 여기서 한 번 좁힌다
const responseSummarySuspense = useSuspenseQuery({
	...detailSummaryQueryOptions(patternId),
	select: (response) => ({
		...response,
		changeRate:
			isNotNil(response.changeRate) && Number.isFinite(response.changeRate) ? response.changeRate : undefined,
	}),
});
```

```ts
// page/detail/_function/to-badge/_to-signed-tone.ts
/**
 * 부호 있는 변화율의 강조 tone. 0은 어느 쪽도 아니라 중립이다
 */
export const toSignedTone = (value: number): Tone => {
	if (value === 0) {
		return "neutral";
	}
	return value > 0 ? "positive" : "negative";
};
```

```tsx
// page/detail/_pg-detail-summary.tsx: 없음을 읽는 곳은 그리는 분기 하나다
{isNotNil(summary.changeRate) && (
	<UiBadge tone={toSignedTone(summary.changeRate)}>{formatSignedPercent(summary.changeRate)}</UiBadge>
)}
```

## 6. JSDoc and Comment Conventions

**Impact: MEDIUM**

함수 본문 안 주석은 의도와 긴 절차의 단계를 적고 코드를 옮겨 적지 않습니다. 선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 따로 정해져 있습니다. 본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

### 6.1 Keep Body Comments for Intent and Steps

**Rule:** `T06-01` · `docs-keep-body-comments-for-intent-and-steps`

**Applies when:** 함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때.

**Review with:** `docs-justify-convention-exceptions-with-a-reason-comment`, `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

본문 안에서 코드 한 줄이나 절차의 단계를 설명할 때는 `//`만 쓰고 블록 주석을 쓰지 않습니다.

| 자리 | 주석 형태 |
| --- | --- |
| 코드 한 줄이나 절차의 단계 | `//` |
| `docs-require-header-jsdoc-on-key-declarations`가 지목한 선언 | 블록. 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다 |
| 그 밖의 지역 선언 | 주석을 달지 않습니다. 설명이 필요하면 그 줄의 의도를 `//`로 적습니다 |
| JSX 자식 자리 | `//`를 쓸 수 없어 이 규칙이 닿지 않습니다. 프레임워크 규칙이 정합니다 |

본문 주석은 이런 자리에 답니다.

- 도메인 규칙
- 예외를 막은 의도
- 외부 라이브러리나 API의 제약
- 부수효과의 순서
- **긴 절차의 단계 구분.** 흐름을 쪼개지 않고 한 자리에 두기로 한 함수일수록 단계 표시가 필요합니다.

주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
규칙이 허용한 예외의 이유를 남기는 주석은
`docs-justify-convention-exceptions-with-a-reason-comment`가 따로 정합니다.
이 규칙은 본문 안 어디에 어떤 형태로 다는지를 봅니다.

**Incorrect (지역 선언에 코드를 옮겨 적은 주석을 답니다):**

```ts
const toMatchedProducts = (products: Product[], keyword: string) => {
	// keyword를 소문자로 바꾼다.
	const lowerKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(lowerKeyword));
};
```

**Correct (선언 이름이 이미 말하는 주석은 지웁니다):**

```ts
const toMatchedProducts = (products: Product[], keyword: string) => {
	const lowerKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(lowerKeyword));
};
```

**Incorrect (지켜야 할 순서와 제약을 주석 없이 코드에만 둡니다):**

```ts
const submitProductDraft = async (draft: ProductDraft) => {
	if (!draft.title.trim()) {
		return;
	}

	const uploadedAttachments = await uploadAttachments(draft.attachments);
	const savedProduct = await saveProduct({title: draft.title, attachments: uploadedAttachments});

	await queryClient.invalidateQueries({queryKey: ["products"]});

	return savedProduct;
};
```

**Correct (`//`로 제약과 단계를 적습니다):**

```ts
const submitProductDraft = async (draft: ProductDraft) => {
	// SDK가 빈 문자열을 허용하지 않아 trim 이후 값이 없으면 호출하지 않는다.
	if (!draft.title.trim()) {
		return;
	}

	// 1. 첨부를 먼저 올려야 본문 저장에서 참조 ID를 쓸 수 있다.
	const uploadedAttachments = await uploadAttachments(draft.attachments);

	// 2. 본문 저장
	const savedProduct = await saveProduct({title: draft.title, attachments: uploadedAttachments});

	// 3. 목록 캐시 무효화는 저장이 끝난 뒤에만 한다. 순서가 바뀌면 옛 목록이 다시 채워진다.
	await queryClient.invalidateQueries({queryKey: ["products"]});

	return savedProduct;
};
```

### 6.2 Require Header Doc Comments on Key Declarations

**Rule:** `T06-02` · `docs-require-header-jsdoc-on-key-declarations`

**Applies when:** 쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 스토어, 포매터 선언을 추가·변경할 때. 분기나 `await`나 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때. 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: MEDIUM (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

아래 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

- 이름 붙인 쿼리와 뮤테이션, 원격 함수, 커스텀 훅, 스토어
- 표시 문자열을 만드는 포매터
- 본문에 분기나 `await`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트
- 다시 쓰거나 내보낸 보조 함수

커스텀 `type`과 `interface` 문서화는 `types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고 여기서 다시 판정하지 않습니다.

주석의 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.
태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

**Incorrect (주요 선언에 헤더 설명이 없습니다):**

```ts
export const toSortedUserIds = (userIds: string[]): string[] => {
	return uniq(userIds).toSorted();
};
```

**Correct (여러 줄 블록에 설명만 적습니다):**

```ts
/**
 * 중복 제거 후 사용자 ID 정렬
 */
export const toSortedUserIds = (userIds: string[]): string[] => {
	return uniq(userIds).toSorted();
};

/**
 * product 목록 조회. 로딩과 오류는 이 응답 객체로만 판단한다
 */
const responseProductList = useProductList();
```

### 6.3 Write Concise Korean Comments About Purpose and Constraints

**Rule:** `T06-03` · `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Applies when:** TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때. 문서 주석에 태그를 붙이거나 뺄 때.

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 쓰고 목적, 제약, 부수효과를 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

글자 수 제한은 두지 않습니다.
선언 이름과 시그니처에 없는 정보가 한 조각도 없으면 그 문장은 지웁니다.
한 문장으로 통하면 한 문장, 배경을 알아야 하면 여러 문장으로 씁니다.
문장이 몇 개든 형식은 여러 줄 블록이고, 그 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.

쓰지 않는 것:

- 선언 이름의 낱말을 한국어로 바꿔 적기만 하고 새 정보가 없는 문장.
  `sortRuleRefs`에 `/** 규칙 참조를 정렬 */`을 다는 것이 그 경우입니다.
- 코드를 한 줄씩 따라 읽으며 옮겨 적은 문장
- 설명 없이 `@param`·`@returns`만 나열한 주석

태그를 붙일지도 내용 판단이라 여기서 정합니다.
선언이 무엇인지는 이름과 문법이 이미 드러내므로 태그로 다시 적지 않습니다.

| 태그 | 판정 |
| --- | --- |
| `@api`·`@helper`·`@field` | 역할 태그를 붙이지 않습니다. 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다 |
| `@schema`처럼 규격에 없는 태그 | 새로 만들지 않습니다 |
| `@summary` | 쓰지 않습니다. 헤더 첫 줄이 이미 하는 일입니다 |
| `@deprecated`·`@example`·`@param`·`@returns` 같은 TSDoc 규격 태그 | 필요할 때만 씁니다 |

기술 용어와 식별자는 영어를 섞어 써도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
헤더 주석이 영어뿐이면 필드 주석이 한국어여도 통과하지 못합니다.

**Incorrect (영문이거나 선언 이름을 옮겨 적기만 합니다):**

```ts
/**
 * This function sorts rule refs and returns the result.
 */
export const toSortedRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return uniq(refs).toSorted();
};

/**
 * 규칙 참조를 정렬하는 함수
 */
export const toSortedRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return uniq(refs).toSorted();
};

/**
 * route-local product tree props
 */
export interface PgProductTreeProps {
	categoryNodes: ProductCategoryNode[];
}
```

**Correct (이름에 없는 정보를 더합니다):**

```ts
/**
 * 중복을 제거한 뒤 정렬한다. 호출부가 목록을 다시 정렬하지 않아도 되게 하려는 것이다.
 */
export const toSortedRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return uniq(refs).toSorted();
};

/**
 * 저장 응답의 정렬 순서를 그대로 믿지 않고 다시 정렬한다.
 *
 * 서버가 같은 updatedAt 인 항목의 순서를 보장하지 않아
 * 목록이 새로고침할 때마다 흔들리는 문제가 있었다.
 */
export const toProductsNewestFirst = (products: Product[]): Product[] => {
	return orderBy(products, ["updatedAt"], ["desc"]);
};

/**
 * route-local product 트리 입력 계약
 */
export interface PgProductTreeProps {
	/**
	 * 사이드바에 그릴 분류 노드 목록
	 */
	categoryNodes: ProductCategoryNode[];
}
```

**Incorrect (역할 태그로 선언의 성격을 다시 적습니다):**

```ts
/**
 * @api product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
```

**Correct (태그를 지우고 헤더 첫 줄이 하는 일을 말합니다):**

```ts
/**
 * product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
```

### 6.4 Write Doc Comments as Multiline Blocks

**Rule:** `T06-04` · `docs-write-doc-comments-as-multiline-blocks`

**Applies when:** 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 `/** … */`이나 `//`로 선언을 설명하려 할 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`

**Impact: LOW (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 다른 줄에 둡니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  `//`는 `docs-justify-convention-exceptions-with-a-reason-comment`가 정한 예외 이유 주석 자리입니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.
- 어떤 태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

**Incorrect (한 줄 블록과 `//`로 선언을 설명합니다):**

```ts
/** product 목록. 조회 실패는 호출부가 처리한다 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};

// product 저장 요청. 응답 본문이 없어 성공은 상태 코드로만 확인한다
export const saveProduct = async (product: Product): Promise<void> => {
	await client.post("/products", product);
};
```

**Correct (같은 내용을 여러 줄 블록으로 고정합니다):**

```ts
/**
 * product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};

/**
 * product 저장 요청. 응답 본문이 없어 성공은 상태 코드로만 확인한다
 */
export const saveProduct = async (product: Product): Promise<void> => {
	await client.post("/products", product);
};
```

### 6.5 Justify Convention Exceptions With a Checkable Reason Comment

**Rule:** `T06-05` · `docs-justify-convention-exceptions-with-a-reason-comment`

**Applies when:** 규칙이 허용한 예외를 코드에 남길 때. 이미 있는 예외 주석의 내용을 바꿀 때. 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우.

**Review with:** `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Impact: MEDIUM (예외가 취향인지 근거가 있는지 코드에서 바로 드러납니다)**

여러 규칙이 예외를 허용하면서 "이유를 주석으로 남긴다"를 조건으로 답니다.
그 주석의 기준을 여기서 한 번만 정합니다.

이유 주석은 **다른 사람이 확인할 수 있는 것**을 가리켜야 합니다.

| 확인할 수 있는 근거 | 예 |
| --- | --- |
| 외부 패키지와 그 제약 | 어떤 라이브러리의 어떤 API가 무엇을 요구하는지 |
| 측정 결과 | 무엇을 재서 얼마가 나왔는지 |
| 제품 명세나 티켓 | 결정이 적힌 곳 |
| 상수 | `constant` 폴더에 선언된 이름 |

"성능을 위해", "안전하게", "필요해서"처럼 다시 확인할 수 없는 말은 근거가 아닙니다.
그런 주석은 예외 조건을 채우지 못합니다.

주석은 예외가 일어나는 줄 바로 위에 `//`로 씁니다.
헤더 문서 주석이 있는 선언의 예외 이유는 그 헤더 블록 안에 적습니다.
JSX 자식 자리에는 `//`가 없어 프레임워크 규칙이 정한 형태로 씁니다.
어투와 내용은 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

**Incorrect (확인할 수 없는 말로 예외를 정당화합니다):**

```ts
// 성능을 위해 메모이제이션
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);
```

**Correct (외부 패키지의 제약을 가리킵니다):**

```ts
// 외부 표 라이브러리는 columns 참조가 바뀌면 컬럼 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);
```

**Incorrect (막연한 말이라 무엇을 재서 넣었는지 알 수 없습니다):**

```ts
// 안전하게 다시 계산하지 않도록
const filteredRows = useMemo(() => {
	return rows.filter((row) => matchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

**Correct (측정 결과를 가리킵니다):**

```ts
// 행 5,000개에서 매 렌더 필터링이 120ms로 측정됐다. 지연한 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => matchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

## 7. Tooling

**Impact: MEDIUM**

이 컨벤션 중 기계가 잡을 수 있는 항목은 biome 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가 담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.

### 7.1 Configure Biome to Enforce the Mechanical Rules

**Rule:** `T07-01` · `tooling-configure-biome-to-enforce-these-rules`

**Applies when:** 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json`의 `linter.rules`에 항목을 추가·삭제할 때.

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다.
`biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/useImportType` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `style/noDefaultExport` | `typescript/naming-use-direct-imports-and-public-entry-points`의 이름 붙인 내보내기 |
| `style/noRestrictedImports`의 경로 패턴 | `typescript/naming-import-by-absolute-path`의 상대경로 금지. 심볼 없는 줄은 `./*.css`로 근사합니다 |
| `style/useNamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 심볼 표기 |
| `style/useFilenamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 파일명 |
| `style/noParameterAssign` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| `style/useConst` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| `correctness/noUnusedFunctionParameters` | `typescript/types-mark-unused-parameters-with-underscore` |
| `performance/noNamespaceImport` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `performance/noBarrelFile` · `performance/noReExportAll` | `typescript/naming-use-direct-imports-and-public-entry-points`의 배럴 |
| `complexity/useMaxParams` | `typescript/functions-use-named-object-params-for-complex-signatures`의 셋 |
| `style/noNestedTernary` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes`의 삼항 겹치기 |
| `style/useAsConstAssertion` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/noMagicNumbers` | `typescript/values-declare-meaningful-numbers` |
| `suspicious/noExplicitAny` | `typescript/types-narrow-unknown-instead-of-asserting` |
| `style/noNonNullAssertion` | `typescript/types-narrow-unknown-instead-of-asserting` |

`style/useConst`·`style/useImportType`·`style/noNonNullAssertion`·
`correctness/noUnusedFunctionParameters`·`suspicious/noExplicitAny`는
`biome` 2.5.7의 `recommended`에 이미 있어 설정에 다시 적어도 동작이 달라지지 않습니다.
어느 컨벤션을 대신하는지 보이게 하려고 표와 설정에 남겨 둡니다.

기계가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- 한 줄 `/** … */` 블록을 막는 `biome` 규칙은 없습니다.
  `typescript/docs-write-doc-comments-as-multiline-blocks`는 리뷰가 봅니다.

- 모듈 스코프 `const`와 객체 리터럴 키에는 `snake_case`를 허용합니다.
  `biome`은 불변 데이터 상수와 함수, 스키마, 요청 객체를 구분하지 못하고,
  어떤 객체 키가 불변 데이터 상수나 상수 집합에 속하는지도 구분하지 못합니다.
  `snake_case`를 쓸 자리는 `typescript/naming-use-consistent-file-and-symbol-naming` 규칙에 따라 리뷰가 판정합니다.
  합성 컴포넌트의 `{Root, Header, Footer}` 때문에 `objectLiteralProperty`에 `PascalCase`를 남깁니다.
  `typescript/functions-declare-functions-as-arrow-consts` 때문에 이름 붙인 함수도 `const` 항목에 들어가는데,
  그 항목은 컴포넌트 이름 때문에 `PascalCase`도 열려 있어 함수 이름의 `camelCase`는 리뷰가 봅니다.
- 이름 붙인 함수의 본문을 `{}` 블록으로 고정하는 것은 `biome` 2.5.7이 반만 합니다.
  `style/useConsistentArrowReturn`에 `style: "always"`가 있지만 인라인 콜백과 커링 바깥 화살표까지 잡습니다.
  `typescript/functions-declare-functions-as-arrow-consts`가 그 둘을 예외로 두므로 켜지 않고 리뷰가 봅니다.
- 폴더명 `kebab-case` 단수는 어떤 `biome` 규칙도 보지 않습니다.
  `useFilenamingConvention`도 파일명만 보고 폴더명은 보지 않습니다.
  리뷰가 봅니다.
- 지역 변수의 `camelCase`도 끝까지 못 갑니다.
  `variable` 선택자에 `PascalCase`를 함께 허용해 컴포넌트 지역 선언을 통과시키기 때문입니다.
- `as` 단언과 `@ts-expect-error`는 `biome`이 막지 않습니다.
  `typescript/types-narrow-unknown-instead-of-asserting` 중 그 둘은 리뷰가 봅니다.
- `typescript/functions-declare-functions-as-arrow-consts`의 `const` 화살표 선언 자체도 `biome`이 보지 않습니다.
- `typescript/functions-avoid-imperative-assembly-in-wide-scopes`는 `useConst`로 다 잡히지 않습니다.
  `let`을 `const`로 바꿔 주기만 하고 `push` 누적은 그대로 남습니다.
- `typescript/types-mark-unused-parameters-with-underscore` 중 **매개변수를 아예 생략한 경우**는 기계가 못 봅니다.
  `noUnusedFunctionParameters`는 남겨 둔 매개변수만 봅니다.
- `import.meta.env`와 `process.env`를 `config/env.ts` 밖에서 읽는 것을 막는 `biome` 규칙은 없습니다.
  `typescript/naming-read-environment-values-through-config-env`는 리뷰가 보거나 CI가 문자열 검색으로 잡습니다.

**테스트 파일에서는 `noMagicNumbers`를 끕니다.**
`assert.equal(rules.length, 123)`의 `123`은 설정으로 뺄 값이 아니라 그 테스트가 고정하는 계약입니다.
설정에서 읽어 오면 설정과 설정을 비교하는 셈이라 테스트가 아무것도 검증하지 않게 됩니다.
소스가 이미 이름을 붙여 둔 값은 테스트도 그 이름을 가져다 씁니다.
끄는 것은 리터럴을 그대로 적어야 하는 기대값뿐입니다.

**도구 설정 파일에서는 `noDefaultExport`를 끕니다.**
`vite.config.ts` 같은 진입점은 도구가 `default`를 계약으로 요구합니다.
언제 `default`를 쓰는지는 `typescript/naming-use-direct-imports-and-public-entry-points`가 정하고
여기서는 그 예외를 설정으로 옮기기만 합니다.

따로 켜지 않는 규칙이 하나 있습니다.
`style/useFragmentSyntax`는 JSX 조각을 `<>`로 바꾸라고 합니다.
`recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
프레임워크 컨벤션이 `<Fragment>`를 쓰라고 정하기 때문입니다.

**Incorrect (`recommended`만 켜고 컨벤션 항목을 리뷰에 맡깁니다):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"preset": "recommended"}
	}
}
```

**Correct (컨벤션 항목을 설정으로 고정합니다):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {
			"preset": "recommended",
			"complexity": {"useMaxParams": {"level": "error", "options": {"max": 3}}},
			"correctness": {"noUnusedFunctionParameters": "error"},
			"suspicious": {"noExplicitAny": "error"},
			"performance": {"noNamespaceImport": "error", "noBarrelFile": "error", "noReExportAll": "error"},
			"style": {
				"noDefaultExport": "error",
				"noEnum": "error",
				"noMagicNumbers": "error",
				"noNestedTernary": "error",
				"useAsConstAssertion": "error",
				"noNonNullAssertion": "error",
				"noParameterAssign": "error",
				"useConst": "error",
				"useImportType": "error",
				"useFilenamingConvention": {
					"level": "error",
					"options": {"filenameCases": ["kebab-case"]}
				},
				"noRestrictedImports": {
					"level": "error",
					"options": {
						"patterns": [
							{"group": ["../**", "./**", "!./*.css"], "message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."}
						]
					}
				},
				"useNamingConvention": {
					"level": "error",
					"options": {
						"strictCase": false,
						"conventions": [
							{"selector": {"kind": "typeLike"}, "formats": ["PascalCase"]},
							{"selector": {"kind": "const", "scope": "global"}, "formats": ["camelCase", "PascalCase", "snake_case"]},
							{"selector": {"kind": "objectLiteralProperty"}, "formats": ["camelCase", "PascalCase", "snake_case"]},
							{"selector": {"kind": "typeProperty"}, "formats": ["camelCase"]},
							{"selector": {"kind": "variable"}, "formats": ["camelCase", "PascalCase"]}
						]
					}
				}
			}
		}
	},
	"overrides": [
		{
			"includes": ["**/*.test.ts"],
			"linter": {"rules": {"style": {"noMagicNumbers": "off"}}}
		},
		{
			"includes": ["**/*.config.ts", "**/*.config.js"],
			"linter": {"rules": {"style": {"noDefaultExport": "off"}}}
		}
	]
}
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
