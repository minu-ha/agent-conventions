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
    - 1.2 [Prefer Function Variable Types Over Parameter Annotations](#12-prefer-function-variable-types-over-parameter-annotations)
    - 1.3 [Document Custom Types and Declarative Shapes](#13-document-custom-types-and-declarative-shapes)
    - 1.4 [Mark Unused Parameters With an Underscore Prefix](#14-mark-unused-parameters-with-an-underscore-prefix)
    - 1.5 [Narrow `unknown` Instead of Asserting](#15-narrow-unknown-instead-of-asserting)
    - 1.6 [Replace `enum` With `as const` Objects](#16-replace-enum-with-as-const-objects)
    - 1.7 [Choose Interface for Object Contracts and Type for Type Composition](#17-choose-interface-for-object-contracts-and-type-for-type-composition)
2. [Naming and Module Boundaries](#2-naming-and-module-boundaries) — **CRITICAL**
    - 2.1 [Place Project-wide Constants in the Root `constant` Folder](#21-place-project-wide-constants-in-the-root-constant-folder)
    - 2.2 [Place Owner-only Constants in the Owner `constant` Folder](#22-place-owner-only-constants-in-the-owner-constant-folder)
    - 2.3 [Use Role-Based File, Symbol, and Constant Naming](#23-use-role-based-file-symbol-and-constant-naming)
    - 2.4 [Use Direct Imports and Dedicated Public Entry Points](#24-use-direct-imports-and-dedicated-public-entry-points)
    - 2.5 [Restrict Absolute Aliases to Layer Roots](#25-restrict-absolute-aliases-to-layer-roots)
    - 2.6 [Read Environment Values Through `config/env.ts`](#26-read-environment-values-through-config-env-ts)
    - 2.7 [Name Types by Role and Lifetime](#27-name-types-by-role-and-lifetime)
3. [Functions and Helper Boundaries](#3-functions-and-helper-boundaries) — **MEDIUM-HIGH**
    - 3.1 [Declare Functions as Arrow Consts](#31-declare-functions-as-arrow-consts)
    - 3.2 [Use Named Object Params for Complex Signatures](#32-use-named-object-params-for-complex-signatures)
    - 3.3 [Extract Support Functions Only When the Boundary Is Real](#33-extract-support-functions-only-when-the-boundary-is-real)
    - 3.4 [Place and Promote Support Functions Deliberately](#34-place-and-promote-support-functions-deliberately)
    - 3.5 [Avoid Imperative Assembly in Wide Scopes](#35-avoid-imperative-assembly-in-wide-scopes)
    - 3.6 [Name a Value Only to Prevent Recompute or Explain a Judgment](#36-name-a-value-only-to-prevent-recompute-or-explain-a-judgment)
    - 3.7 [Name Functions by What Comes Out](#37-name-functions-by-what-comes-out)
4. [Values and Data Structures](#4-values-and-data-structures) — **HIGH**
    - 4.1 [Prefer Immutable Array Sorting](#41-prefer-immutable-array-sorting)
    - 4.2 [Use Set and Map for Repeated Lookups](#42-use-set-and-map-for-repeated-lookups)
    - 4.3 [Read Object Fields Through Chains, Not Destructuring](#43-read-object-fields-through-chains-not-destructuring)
    - 4.4 [Declare Meaningful Numbers Instead of Writing Them Inline](#44-declare-meaningful-numbers-instead-of-writing-them-inline)
    - 4.5 [Avoid Lookup Tables for Simple Value Choices](#45-avoid-lookup-tables-for-simple-value-choices)
5. [Absence and Fallback Handling](#5-absence-and-fallback-handling) — **HIGH**
    - 5.1 [Expose Optional Values Instead of Silent Fallbacks](#51-expose-optional-values-instead-of-silent-fallbacks)
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

**Review with:** `types-document-custom-types-and-shapes`

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

### 1.2 Prefer Function Variable Types Over Parameter Annotations

**Rule:** `T01-02` · `types-prefer-function-variable-types-over-parameter-annotations`

**Applies when:** 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우.

**Review with:** `types-mark-unused-parameters-with-underscore`

**Impact: MEDIUM-HIGH (계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다)**

타입을 붙일 자리가 둘 있습니다.

| 붙이는 자리 | 형태 |
| --- | --- |
| 매개변수와 반환값에 하나씩 | `const handleClick = (event: MouseEvent<HTMLButtonElement>): void => …` |
| 함수를 담는 변수에 한 번 | `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …` |

쓸 수 있는 계약이 이미 있으면 아래쪽을 씁니다.
이름 하나로 매개변수와 반환값이 함께 정해져서 계약을 한 자리에서 읽습니다.
이미 있는 인터페이스, 객체 계약, 프레임워크 별칭을 먼저 찾고,
매개변수 타입은 쓸 계약이 없을 때만 직접 적습니다.
인터페이스에 콜백 필드가 있으면 `Contract["onSelect"]`처럼 인덱스 접근으로 가져다 씁니다.
가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore` 규칙을 다시 봅니다.
함수 타입 별칭을 새로 선언하는 것은 같은 시그니처를 쓰는 구현이 이미 둘 이상일 때만입니다.
한 번만 쓰는 지역 함수 때문에 함수 타입 별칭을 늘리지 않습니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
커링 팩토리가 돌려주는 리액트 핸들러는 프레임워크 컨벤션이 판정합니다.

**Incorrect (계약이 있는데 시그니처를 다시 적음):**

```ts
// 이미 있는 계약
interface UserFormatters {
	toStateLabel: (state: Record<string, unknown>) => string;
	toRoleLabel: (role: string) => string;
}

const toStateLabel = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (이미 있는 계약에서 시그니처를 가져와 함수 전체에 타입을 붙임):**

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

### 1.3 Document Custom Types and Declarative Shapes

**Rule:** `T01-03` · `types-document-custom-types-and-shapes`

**Applies when:** 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 반환 타입이 익명으로 추론되는 경우.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: MEDIUM (구현을 파헤치지 않고도 도메인 전용 계약을 이해합니다)**

선언형 형태는 헤더와 필드를 나눠 문서화합니다.

- 커스텀 `type`, `interface`, 스키마 최상단, 객체형 상수: 선언 위에 헤더 문서 주석
- `interface`, `type`, 스키마의 필드: 각 필드 바로 위에 문서 주석
- 객체형 상수는 헤더만 씁니다.
  필드 주석은 `interface`, `type`, 스키마에만 답니다.
  `constant` 폴더의 상수와 `enum` 성격 상수 객체의 키에는 달지 않습니다.
- 필드가 없는 인덱스 접근 별칭(`type ProductId = ProductRecord["id"]`)과
  `Omit`으로 뺀 형태: 적을 필드가 없으므로 헤더만 씁니다.
  필드가 있는 `interface`는 원본에서 가져온 필드여도 각 필드에 주석을 답니다.

주석이 있다고 끝나지 않습니다.
각 본문이 `docs-write-concise-korean-comments-about-purpose-and-constraints` 규칙의 한국어 조건을 만족해야 합니다.

이름 붙인 형태의 필드가 한 글자도 안 바뀌었더라도,
위치 인자를 대체하는 입력 계약이나 함수 결과를 고정하는 출력 계약 역할을 처음 맡으면
이 규칙을 적용합니다.
새로 맡은 역할을 헤더와 각 필드 주석으로 설명합니다.
새 입력이나 출력 역할이 새 타입 선언을 요구하지는 않습니다.
맞는 형태가 이미 우리 코드에 있으면 그대로 연결하고, 그 선언의 헤더와 필드 문서를 새 역할에 맞게 보강합니다.

외부·생성된·읽기 전용·공용 형태를 그대로 쓰기만 하면 해당하지 않습니다.
그 선언을 고치지 않고, 문서를 붙이려고 지역 별칭을 새로 만들지도 않습니다.
호출 계약을 문서화할지는 `docs-require-header-jsdoc-on-key-declarations` 같은 문서 규칙이 따로 판정합니다.

이름 붙인 선언 없이 구현 안에서만 추론되는 익명 객체는 이 규칙의
선언형 형태가 아닙니다.
쿼리의 `select`가 익명으로 반환하는 객체가 그 경우입니다.
이 규칙을 억지로 켜려고 필드 주석이나 새 타입 별칭을 만들지 않습니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씀):**

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

**Correct (헤더와 필드별 문서 주석을 사용):**

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

### 1.4 Mark Unused Parameters With an Underscore Prefix

**Rule:** `T01-04` · `types-mark-unused-parameters-with-underscore`

**Applies when:** 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.

**Impact: MEDIUM (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

쓰지 않는 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
커링한 핸들러의 마지막 콜백도 예외가 아닙니다.
매개변수를 하나도 쓰지 않는 경우도 예외가 아닙니다.

`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않아도 `() =>`로 줄이지 않습니다.
`(_event) =>`로 받아 계약을 남깁니다.

**Incorrect (계약의 일부인 콜백 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 쓰지 않는 매개변수만 `_`로 표시):**

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

### 1.5 Narrow `unknown` Instead of Asserting

**Rule:** `T01-05` · `types-narrow-unknown-instead-of-asserting`

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

표 셋째 줄, 외부 패키지 타입이 실제와 다른 경우의 이유 주석은
`docs-justify-convention-exceptions-with-a-reason-comment` 규칙이 정한 조건을 채워야 합니다.
"타입이 이상해서" 같은 다시 확인할 수 없는 말은 근거가 아닙니다.

`any`와 `!`는 `tooling-configure-biome-to-enforce-these-rules` 규칙이 기계로 막습니다.
`as`와 `@ts-expect-error`는 리뷰가 봅니다.

**Incorrect (검사를 끄고 넘어감):**

```ts
const storedFilter = JSON.parse(localStorage.getItem("product-filter") as string) as ProductFilter;

const firstProduct = products.find((product) => product.isActive)!;

// @ts-expect-error 타입이 이상하다
chart.setOption(option);
```

**Correct (앱 밖에서 온 값은 스키마 결과에서 타입을 얻음):**

```ts
const storedValue = localStorage.getItem("product-filter");

if (storedValue === null) {
	throw new MissingStoredFilterError("product-filter");
}

const storedFilter = productFilterSchema.parse(JSON.parse(storedValue));
```

**Correct (없을 수 있으면 그대로 드러냄):**

```ts
const firstProduct = products.find((product) => product.isActive);

if (!firstProduct) {
	throw new NoActiveProductError();
}
```

**Correct (외부 패키지 타입이 실제와 달라 확인할 수 있는 이유를 남김):**

```ts
// package.json의 echarts 5.5는 setOption 타입이 series 배열을 받지 못한다.
// echarts/types/dist/shared.d.ts의 SeriesOption 선언과 런타임 동작이 다르다.
chart.setOption(option as EChartsOption);
```

### 1.6 Replace `enum` With `as const` Objects

**Rule:** `T01-06` · `types-replace-enum-with-as-const-objects`

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

**Incorrect (`enum`을 직접 사용):**

```ts
enum ProductStatus {
	pending = "pending",
	passed = "passed",
	failed = "failed",
}
```

**Correct (객체 리터럴과 타입 추출을 조합):**

```ts
/**
 * product 심사 상태 값 집합
 */
const product_status = {
	pending: "pending",
	waiting_review: "waiting_review",
	passed: "passed",
	failed: "failed",
} as const;

/**
 * product 심사 상태 타입. product_status에 값을 더하면 따라 넓어진다
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
```

### 1.7 Choose Interface for Object Contracts and Type for Type Composition

**Rule:** `T01-07` · `types-choose-interface-for-object-contracts-and-type-for-composition`

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
| mapped·conditional type, indexed access | `type` |
| `Omit`·`Record` 같은 계산과 교차 조합 | `type` |
| union의 한 갈래이거나 타입 관계가 핵심인 객체 | `type` |

객체 형태라는 이유만으로 모두 `interface`로 바꾸지는 않습니다.
필드를 직접 설명하는 독립 계약이면 `interface`를 쓰고, 다른 타입에서 무엇을 고르거나 빼고 합치는지가 뜻의 중심이면
`type`을 씁니다.
`Draft`, `State` 같은 이름도 선언 형식을 정하지 않습니다.
같은 역할 이름이라도 독립된 필드 계약이면 `interface`, 타입 계산 결과면 `type`입니다.

선언 형식을 맞추려고 새 별칭을 만들지 않습니다.
구현 안에서 충분히 추론되는 익명 결과와 외부·생성된 계약은 그대로 둡니다.
같은 뜻의 계약이 이미 있으면 `types-reuse-existing-contracts-before-new-types`에 따라 먼저 재사용합니다.

**Incorrect (독립된 필드 계약을 객체 `type` 별칭으로 선언):**

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

**Correct (필드 계약은 `interface`, 타입 조합은 `type`으로 구분):**

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

**Impact: CRITICAL**

식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 상수 위치가 소유자와 출처를 바로 드러내야 합니다. 타입 이름은 값의 역할과 수명을 드러내고 소유자 경로가 이미 말하는 문맥을 반복하지 않습니다. 여기서 **소유자**는 자기 폴더가 있는 모듈 하나입니다. 그 폴더 안 파일은 그 소유자만 씁니다.

### 2.1 Place Project-wide Constants in the Root `constant` Folder

**Rule:** `T02-01` · `naming-place-project-constants-in-the-root-constant-folder`

**Applies when:** 프로젝트 전반이 쓰는 URL 경로, 페이지 크기, 표시 문구, 기준값을 추가·이동·중복 정의할 때. 루트 `constant` 폴더의 파일이나 상수 이름을 바꿀 때.

**Review with:** `naming-place-owner-constants-in-the-owner-constant-folder`, `naming-use-direct-imports-and-public-entry-points`

**Impact: MEDIUM-HIGH (프로젝트 전반의 값이 쓰는 파일마다 흩어지지 않고 이름만으로 종류와 주제가 읽힙니다)**

상수를 어디 두는지는 그 값이 누구 것인지로 갈립니다.

| 값 | 자리 | 이름 |
| --- | --- | --- |
| 프로젝트 전반의 값 | `constant/<주제>.ts` | `<주제>_<이름>` |
| 한 소유자의 값 | `<owner>/constant/<주제>.ts` | `<주제>_<이름>` |

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 값도 사라지면 그 소유자 것입니다.
`chart_axis_tick_count`는 화면과 함께 사라집니다.
`api_request_timeout_ms`는 화면을 지워도 서버 통신에 남습니다.
루트는 프로젝트가 소유자인 자리라 위 표의 두 행이 같은 모양입니다.
한 소유자의 값을 두는 법은 `naming-place-owner-constants-in-the-owner-constant-folder` 규칙이 정합니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 값이 자리를 옮겨 다닙니다.

**파일은 주제 하나이고, 상수는 그 주제로 시작합니다.**

- 파일명은 안에 있는 상수 이름이 공유하는 첫 마디입니다.
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

**Incorrect (프로젝트 전반의 값을 쓰는 자리에서 선언):**

```ts
// page/products/pg-products.tsx
const default_page_size = 20;
```

```ts
// page/billing/pg-billing.tsx
const default_page_size = 20;
const request_timeout_ms = 20_000;
```

**Incorrect (객체 하나에 모아 색인을 손으로 유지함):**

```ts
// constant/config.ts
export const config = {
	api: {request_timeout_ms: 20_000},
	pagination: {default_page_size: 20},
} as const;
```

**Correct (주제 파일에 상수를 하나씩 내보내고 쓰는 자리에서 이름으로 가져옴):**

```ts
// constant/api.ts
/**
 * 요청 하나를 기다리는 최대 시간. 게이트웨이가 30초에 끊어 그보다 먼저 실패를 알린다
 */
export const api_request_timeout_ms = 20_000;
```

```ts
// constant/pagination.ts
/**
 * 목록 화면이 처음 불러오는 개수
 */
export const pagination_default_page_size = 20;
```

```ts
// page/products/pg-products.tsx
import {api_request_timeout_ms} from "@/constant/api";
import {pagination_default_page_size} from "@/constant/pagination";

const productClient = createClient({timeoutMs: api_request_timeout_ms});
const productQuery = useProductQuery({client: productClient, pageSize: pagination_default_page_size});
```

### 2.2 Place Owner-only Constants in the Owner `constant` Folder

**Rule:** `T02-02` · `naming-place-owner-constants-in-the-owner-constant-folder`

**Applies when:** 한 소유자의 상수나 선언형 계약을 추가하거나 옮길 때. 루트 상수와 소유자 전용 상수 사이에서 위치를 바꿀 때.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming` · 함께 적용

**Review with:** `naming-place-project-constants-in-the-root-constant-folder`

**Impact: MEDIUM-HIGH (한 소유자의 상수가 루트 폴더를 넓히지 않고 소유자 이름을 되풀이하지 않습니다)**

한 소유자의 상수는 루트로 올리지 않습니다.
그 소유자 아래 `constant` 폴더에 둡니다.
루트와 소유자 중 어디에 두는지 가르는 표와 파일·이름의 모양은
`naming-place-project-constants-in-the-root-constant-folder` 규칙에 있습니다.
여기서는 소유자 아래에서만 다른 것을 봅니다.

- 파일은 `constant/<주제>.ts`이고 상수는 `<주제>_`로 시작합니다.
  소유자 이름은 폴더가 이미 말하므로 접두사로 되풀이하지 않습니다.
  `page/detail/constant/legend.ts`의 상수는 `legend_hit_tolerance_px`입니다.
  `detail_legend_hit_tolerance_px`처럼 소유자 이름을 앞에 붙이지 않습니다.
- 파서 묶음이나 스키마처럼 함수를 담은 계약도 같은 `constant` 폴더에 둡니다.
  파일은 계약마다 나누고, 이름은 그 계약을 정한 규칙과 `naming-use-consistent-file-and-symbol-naming`이 정합니다.
- 소유자 아래에 `config`, `constants`, `common` 폴더는 만들지 않습니다.
- 파일이 하나뿐인 `constant` 폴더도 그대로 둡니다.
- 그 소유자를 지워도 남을 값이면 루트 규칙을 따라 올립니다.

**Incorrect (한 소유자의 상수를 루트로 올림):**

```ts
// constant/chart.ts
// product 상세 화면만 쓰는 값이 루트에 있다
export const chart_axis_tick_count = 6;
```

**Incorrect (소유자 이름을 되풀이하고 객체 하나에 모음):**

```ts
// page/product-detail/constant/product-detail.ts
export const product_detail_config = {
	chart_axis_tick_count: 6,
} as const;
```

**Correct (소유자 아래 주제 파일에 둠):**

```ts
// page/product-detail/constant/chart.ts
/**
 * product 상세 차트의 축 눈금 수. 표시 폭이 좁아 여섯을 넘기면 라벨이 겹친다
 */
export const chart_axis_tick_count = 6;
```

### 2.3 Use Role-Based File, Symbol, and Constant Naming

**Rule:** `T02-03` · `naming-use-consistent-file-and-symbol-naming`

**Applies when:** TypeScript 파일, 폴더, 변수, 함수, 타입, 객체·스키마 키의 이름을 새로 만들거나 바꿀 때. 밖으로 나가는 키를 받는 쪽 표기로 적을지 판단할 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.

**Impact: MEDIUM-HIGH (일반 심볼과 불변 데이터 상수를 이름으로 구분해 읽는 사람이 의도를 바로 압니다)**

| 자리 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 타입, 인터페이스, 컴포넌트 | `PascalCase` |
| 모듈 스코프의 불변 데이터 상수, 상수 집합 | `snake_case` |
| 불변 데이터 상수와 상수 집합 객체가 소유한 상수 키 | `snake_case` |
| 그 외 변수, 함수, 객체 키, 스키마 키, 타입 필드 | `camelCase` |

**`const` 선언을 전부 상수로 보지 않습니다.**
함수, 컴포넌트, 훅이나 API 호출 결과, 스키마, 요청 객체, 지역 파생값은
`const`로 선언해도 각 역할의 표기를 유지합니다.

여기서 불변 데이터 상수는 모듈 스코프에 한 번 선언해 실행 중 같은 의미로 쓰는
리터럴, 기본값, 값 집합, 조회표입니다.
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

**Incorrect (역할과 맞지 않는 표기를 사용):**

```ts
// userSettings.ts
// 스키마와 그 필드는 일반 심볼이라 camelCase다
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});

const retryPolicy = {
	maxAttempts: 3,
} as const;
```

**Correct (파일명은 `kebab-case`, 스키마 키는 `camelCase`):**

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

**Correct (불변 데이터 상수와 값 집합은 이름과 상수 키를 모두 `snake_case`로 표기):**

```ts
// constant/pagination.ts
/**
 * 목록 화면이 처음 불러오는 개수
 */
export const pagination_default_page_size = 20;
```

```ts
/**
 * product 게시 상태 값 집합
 */
const product_status = {
	draft: "draft",
	waiting_review: "waiting_review",
	published: "published",
} as const;
```

**Correct (밖으로 나가는 키만 받는 쪽 표기를 그대로 씀):**

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

**Review with:** `naming-restrict-absolute-aliases-to-layer-roots`

**Impact: MEDIUM-HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않습니다.
필요한 파일에서 바로 가져옵니다.
역할 폴더를 `index.ts`로 묶는 것도 배럴이라 만들지 않습니다.
같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체는
다시 내보내는 계층이 아니므로 배럴이 아닙니다.
타입만 가져올 때는 `import type`을 써서 계약과 실행 의존을 나눕니다.

내보내기는 이름 붙인 내보내기만 씁니다.
`default`는 이름을 사용처가 지어서 같은 것이 파일마다 다른 이름으로 불리고,
이름 바꾸기도 사용처까지 번지지 않습니다.
도구가 그 파일의 계약으로 `default`를 요구할 때만 씁니다.
`vite.config.ts` 같은 설정 진입점이 그 자리입니다.

절대경로 별칭으로 어디까지 열지는 `naming-restrict-absolute-aliases-to-layer-roots` 규칙이 정합니다.

경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면
가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

**Incorrect (배럴과 섞인 가져오기로 경계를 흐림):**

```ts
import {pagination_default_page_size, toDisplayDate, UserProfile} from "./index";
```

**Incorrect (`default`로 내보내 사용처마다 다른 이름이 생김):**

```tsx
// component/ui/tabs/ui-tabs.tsx
const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};

export default UiTabs;
```

```tsx
// 사용처가 이름을 지어서 같은 컴포넌트가 파일마다 다른 이름으로 불린다
import Tabs from "@/component/ui/tabs/ui-tabs";
```

**Correct (직접 가져오기와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/type/user-profile";
import {pagination_default_page_size} from "@/constant/pagination";
import {toDisplayDate} from "@/util/date/to-display-date";
import {WgChartCard} from "@/component/widget/chart-card/wg-chart-card";
import {toUserSaveRequest} from "./function/to-user-save-request";
```

**Correct (도구가 계약으로 요구하는 파일만 `default`):**

```ts
// vite.config.ts
export default defineConfig({plugins: [react()]});
```

### 2.5 Restrict Absolute Aliases to Layer Roots

**Rule:** `T02-05` · `naming-restrict-absolute-aliases-to-layer-roots`

**Applies when:** 절대경로 별칭으로 다른 모듈을 가져올 때. 별칭이 가리키는 경로 깊이를 바꿀 때.

**Review with:** `naming-use-direct-imports-and-public-entry-points`

**Impact: CRITICAL (소유자 내부 모듈이 밖에서 직접 열리지 않아 경계가 남습니다)**

절대경로 별칭의 첫 마디는 전역 레이어 루트여야 합니다.

| 경로 | 판정 |
| --- | --- |
| `@/component`, `@/constant`, `@/config`, `@/util`, `@/type`, `@/hook`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

레이어 루트가 담는 것은 다음과 같습니다.

- `component`는 `component/ui`와 `component/widget` 두 컴포넌트 레이어를 담습니다.
  `ui`와 `widget`의 경계는 프레임워크 컨벤션의 레이어 규칙이 정합니다.
- `constant`는 프로젝트 전반이 쓰는 상수를, `config`는 환경마다 달라지는 값을 담습니다.
- `util`은 프로젝트 전반이 쓰는 함수를 값의 종류 폴더로 묶어 담습니다.
- `type`은 프로젝트 전반이 쓰는 계약을, `hook`은 여러 소유자가 쓰는 훅을 담습니다.
- `service`는 서버 통신 클라이언트를 담습니다.
- `store`는 여러 화면이 함께 읽는 상태를 담습니다.
  상태 관리 라이브러리를 쓰든 컨텍스트를 쓰든 파일명은 `use-<name>-store.ts`입니다.
- `asset`은 아이콘 같은 정적 자원을 담습니다.

루트는 프로젝트가 소유자인 자리라 `constant`·`util`·`type`·`hook`은 소유자 아래 역할 폴더와 같은 규칙을 따릅니다.

- 첫 마디가 레이어 루트면 그 아래 깊이는 제한하지 않습니다.
  `@/component/widget/chart-card/wg-chart-card`는 허용입니다.
- 화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
- 소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

**Incorrect (화면 내부 모듈을 절대경로로 가져옴):**

```ts
import {SalesChartCard} from "@/page/detail/component/sales-trend-panel/component/sales-chart-card";
```

**Correct (레이어 루트로 시작하는 별칭과 소유자 안 상대경로):**

```ts
import {WgChartCard} from "@/component/widget/chart-card/wg-chart-card";
import {SalesChartCard} from "./component/sales-chart-card";
```

### 2.6 Read Environment Values Through `config/env.ts`

**Rule:** `T02-06` · `naming-read-environment-values-through-config-env`

**Applies when:** `import.meta.env`나 `process.env`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값이나 기능 플래그를 새로 들여올 때.

**Review with:** `absence-expose-optional-values-instead-of-silent-fallbacks`, `naming-place-project-constants-in-the-root-constant-folder`

**Impact: HIGH (환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 파일에서 읽힙니다)**

환경마다 달라지는 값은 쓰는 파일에서 직접 읽지 않습니다.
루트 `config/env.ts`가 한 번 읽어 `env_` 상수로 내보내고, 나머지는 그 이름을 씁니다.
`import.meta.env`와 `process.env`가 나오는 파일은 이 파일 하나입니다.

`constant` 폴더와 `config` 폴더는 값이 바뀌는 때가 다릅니다.
`constant`의 값은 코드와 함께 바뀌고, `config`의 값은 배포마다 바뀝니다.
배포 환경은 프로젝트 단위라 `config` 폴더는 루트에만 있고 소유자 아래에는 만들지 않습니다.
기능 플래그도 배포마다 바뀌는 값이라 `config/feature.ts`에 `feature_` 상수로 둡니다.
상수 파일과 이름의 모양은 `naming-place-project-constants-in-the-root-constant-folder` 규칙과 같습니다.

환경 값이라 여기서 더 요구하는 것은 셋입니다.

- 키가 없을 때 리터럴로 덮지 않습니다.
  `absence-expose-optional-values-instead-of-silent-fallbacks` 규칙을 따라 그 자리에서 드러냅니다.
- 값을 읽는 즉시 우리 이름으로 바꿔 담습니다.
  `VITE_` 같은 번들러 접두사가 앱 안으로 새지 않게 합니다.
- 비밀값은 클라이언트 번들에 들어가는 이름으로 읽지 않습니다.
  번들러가 노출하는 접두사가 붙은 값은 브라우저에서 그대로 보입니다.

**Incorrect (쓰는 파일마다 직접 읽고 없을 때 리터럴로 덮음):**

```ts
// service/product-client.ts
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// service/report-client.ts
const reportBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
```

**Correct (`config/env.ts`가 한 번 읽고 없으면 드러냄):**

```ts
// config/env.ts
if (!import.meta.env.VITE_API_BASE_URL) {
	throw new MissingEnvironmentValueError("VITE_API_BASE_URL");
}

/**
 * API 서버 주소. 배포 환경마다 다르다
 */
export const env_api_base_url = import.meta.env.VITE_API_BASE_URL;
```

```ts
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
| `Resolved*` | 원본·fallback·현재 조건을 합쳐 값이 확정됐을 때 |
| `Condition` | 필터나 적용 여부를 가르는 조건일 때 |
| `Criterion` | 정렬·평가 기준 한 건일 때 |
| `Setting` | 사용자가 고르거나 조절하는 설정 한 건일 때 |
| `Row`·`Column`·`Item`·`Point`·`Series` | 컬렉션 안 한 요소의 역할이 분명할 때 |

`Result`는 더 구체적인 결과 명사가 없을 때만 씁니다.
`Spec`은 외부 명세나 검증할 요구사항 자체를 나타낼 때, `Model`은 식별성·행동·도메인 규칙을 가진 실제 모델일 때만
씁니다.
단순 가공 결과나 화면 표시 계약에 `VM`, `ViewModel`, 막연한 `Model`을 기본 접미사로 붙이지 않습니다.

역할어는 이미 필요한 계약의 이름을 고르는 기준입니다.
`Params`, `Content`, `Snapshot`을 쓰려고 새 타입을 만들지 않습니다.
맞는 기존 계약이나 추론되는 익명 결과가 있으면 그대로 씁니다.

소유자 폴더가 이미 말하는 도메인은 타입 이름에 반복하지 않습니다.
`sales-report/type/` 안에서는 `SalesReportSnapshot`이 아니라 `ReportSnapshot`처럼 남은 문맥만 이름에 둡니다.
소유자 밖으로 내보내 문맥이 사라지거나 다른 타입과 충돌할 때만 필요한 도메인 접두를 유지합니다.

타입 파일도 실제 명사로 짓습니다.
`report-snapshot.ts`처럼 쓰고 `report-vm.ts`, `report-view-model.ts`, 막연한 `report-model.ts`는 쓰지 않습니다.
외부·생성된 계약의 이름과 `DTO` 같은 접미사는 그 계약이 정한 그대로 보존하며, 직접 작성한 내부 계약에 반대편
표식처럼 붙이지 않습니다.
프레임워크 전용 `Props`, `Handle`, `Slot`, `Renderer`는 해당 프레임워크 규칙이 정합니다.

**Incorrect (소유자와 막연한 화면 계약 접미사를 반복):**

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

**Correct (한 조회 시점에 고정된 값이라는 역할을 이름에 표시):**

```ts
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

함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진 자리에 둡니다. 이름은 무엇이 나오는지로 짓고, 변수는 재계산을 막거나 판정을 설명할 때만 만듭니다. 넓은 스코프에서 `let` 재할당과 `push`로 값을 쌓지 않는 것도 여기서 봅니다.

### 3.1 Declare Functions as Arrow Consts

**Rule:** `T03-01` · `functions-declare-functions-as-arrow-consts`

**Applies when:** 이름을 지어 선언하는 함수를 새로 만들거나 선언 형태나 본문 형태를 바꿀 때. 객체 프로퍼티에 함수를 담거나 그 형태를 바꿀 때. 제외: 인라인 콜백이거나 클래스 메서드, 제너레이터, 오버로드 선언인 경우.

**Review with:** `functions-use-named-object-params-for-complex-signatures`

**Impact: MEDIUM (선언과 본문 형태가 하나로 고정되어 호이스팅 순서 의존이나 형태가 갈리는 diff가 생기지 않습니다)**

함수에 이름을 지어 선언할 때는 `const`에 화살표 함수를 담습니다.
`function` 선언문은 쓰지 않습니다.

- 한 파일 안에서 두 형태를 섞으면 어느 것이 공개 계약인지 형태로 구분할 수 없습니다.
- `function` 선언문은 호이스팅되므로 선언보다 위에서 호출해도 동작합니다.
  그러면 읽는 순서와 실행 순서가 달라집니다.

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
| 오버로드 선언 | 시그니처를 겹쳐 쓰는 선언 문법은 `const`로 옮길 수 없습니다 |

오버로드 **선언 문법**(`function` 시그니처를 겹쳐 쓰는 형태)은 `const`로 쓸 수 없습니다.
호출 시그니처를 모은 타입을 `const`에 붙이는 형태를 쓸 수 있으면 그쪽을 씁니다.

**Incorrect (`function` 선언문과 화살표를 한 파일에서 섞음):**

```ts
export function toTrimmedTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}

export const toProductSlug = (title: string): string => {
	return toTrimmedTitle(title).toLowerCase();
};
```

**Incorrect (쓰는 곳이 선언보다 위에 와서 읽는 순서가 어긋남):**

```ts
export const toProductLabel = (product: Product): string => {
	return decorate(product.title);
};

function decorate(title: string): string {
	return `# ${title}`;
}
```

**Incorrect (본문을 한 줄로 줄여 선언마다 형태가 갈림):**

```ts
const decorate = (title: string): string => `# ${title}`;

export const toProductBadge = (product: Product): ProductBadge => ({
	label: decorate(product.title),
	tone: product.published ? "solid" : "muted",
});
```

**Incorrect (객체 프로퍼티의 함수를 메서드 축약형으로 씀):**

```ts
export const cell_formatter_by_value_type = {
	text(value: string): string {
		return value.trim();
	},
} as const;
```

**Correct (모두 `const` 화살표에 블록 본문. 쓰기 전에 선언):**

```ts
const decorate = (title: string): string => {
	return `# ${title}`;
};

export const toTrimmedTitle = (rawTitle: string): string => {
	return rawTitle.trim().replace(/\s+/g, " ");
};

export const toProductSlug = (title: string): string => {
	return toTrimmedTitle(title).toLowerCase();
};

export const toProductBadge = (product: Product): ProductBadge => {
	return {
		label: decorate(product.title),
		tone: product.published ? "solid" : "muted",
	};
};
```

**Correct (객체 프로퍼티의 함수는 화살표. 인라인 콜백은 한 줄):**

```ts
export const cell_formatter_by_value_type = {
	/**
	 * 표 셀의 문자열은 앞뒤 공백을 지워 보여 준다
	 */
	text: (value: string): string => {
		return value.trim();
	},
} as const;

export const toProductIds = (products: Product[]): string[] => {
	return products.map((product) => product.id);
};
```

**Correct (클래스 메서드와 제너레이터는 그대로 둠):**

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

**Incorrect (시그니처에서 바로 구조분해):**

```ts
const toRequestUrl = ({baseUrl, resourcePath, searchParams}: ApiRequestTarget): URL => {
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

**Incorrect (본문 첫 줄로 옮겼을 뿐 출처는 똑같이 지워짐):**

```ts
const toRequestUrl = (target: ApiRequestTarget): URL => {
	const {baseUrl, resourcePath, searchParams} = target;
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

**Correct (객체 전체를 받고 체인으로 읽음):**

```ts
/**
 * 요청 URL 조립. searchParams는 set으로 넣어 baseUrl에 있던 같은 키를 덮는다.
 *
 * 입력 계약은 type/api-request-target.ts의 ApiRequestTarget을 그대로 쓴다
 */
const toRequestUrl = (target: ApiRequestTarget): URL => {
	const requestUrl = new URL(target.resourcePath, target.baseUrl);

	for (const [key, value] of Object.entries(target.searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

### 3.3 Extract Support Functions Only When the Boundary Is Real

**Rule:** `T03-03` · `functions-extract-helpers-only-when-the-boundary-is-real`

**Applies when:** 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`, `functions-place-and-promote-support-functions`

**Impact: MEDIUM (흐름을 읽으려고 파일을 왕복하게 만드는 조각내기를 막습니다)**

기본은 빼지 않는 것입니다.
흐름은 한 자리에서 위에서 아래로 읽히는 편이 낫습니다.
빼는 사유는 셋뿐입니다.
셋 중 하나에 해당해야 뺍니다.

| 사유 | 조건 |
| --- | --- |
| 재사용 | **이 변경을 적용한 뒤의 트리**에서 서로 다른 파일 둘 이상이 실제로 부릅니다. 사용처를 나중에 추가할 계획만 있으면 세지 않습니다 |
| 렌더 파일 밖으로 | `.tsx` 안의 **요청·저장 payload 조립** 함수입니다. 훅·JSX·컴포넌트 상태를 하나도 쓰지 않으면 사용처가 하나여도 `.ts`로 옮깁니다 |
| 전용 보조 | 같은 파일에서 그 함수만 부르는 보조가 **둘 이상** 딸려 있습니다. 전용 보조는 새 파일 안에 비공개로 따라갑니다 |

두 번째 사유는 재사용이 아니라 `.tsx`에 렌더가 아닌 코드를 남기지 않으려는 것입니다.
`.ts` 안에서는 해당하지 않습니다.
옮길 자리는 같은 소유자 폴더의 `.ts`입니다.
어느 하위 폴더인지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
**표시용 가공은 여기에 해당하지 않습니다.** 목록을 화면 모양으로 바꾸거나 문자열을 조립하는 것은
쓰는 자리에 그대로 둡니다.
밖으로 내는 것은 서버로 보낼 값을 만드는 함수뿐입니다.

어느 사유든 그 함수만 따로 읽어도 뜻이 통해야 합니다.
바깥 변수, 훅, 컴포넌트 상태에 기대면 아직 뺄 수 없습니다.

**같은 파일 안에서 몇 번 불리는지는 사유가 아닙니다.**
이 규칙은 파일 경계만 봅니다.
같은 파일 안에서 비공개 함수로 단계를 나누는 것은 대상이 아닙니다.
같은 계산을 두세 번 적어도 괜찮습니다.
파일을 하나 더 여는 쪽이 더 비쌉니다.
"나중에 또 쓸 것 같아서"도 사유가 아닙니다.
그때 가서 뺍니다.

전용 보조 사유는 반대 방향의 넘침을 막습니다.
단계가 다시 단계를 거느리기 시작하면 한 파일이 계속 자랍니다.
그때부터는 한 파일에 계속 두는 쪽이 더 비쌉니다.

사유와 무관하게 빼지 않는 것:

- 본문이 한 줄인 계산
- `.map()` 콜백 하나에만 쓰이는 변환
- 선택 값 보정, 라벨 기본값 같은 자잘한 정리 단계

뺀 다음 어디 두고 언제 공용으로 올릴지는
`functions-place-and-promote-support-functions`가 정합니다.

**Incorrect (한 번만 쓰는 한 줄 계산을 파일로 분리):**

```ts
// page/profile/function/get-next-iteration.ts
export const getNextIteration = (previous: number, iterationCount: number): number => {
	return (previous + 1) % iterationCount;
};
```

**Incorrect (전용 보조가 딸린 단계를 한 파일에 계속 쌓음):**

```txt
page/report/function/to-sales-overview.ts
  toSalesOverview          내보낸 함수
  toSummaryBand            내보낸 함수만 부름. 전용 보조 없음
  toTrendChart             내보낸 함수만 부름. 전용 보조 셋이 딸림
  toTrendBasePoints        toTrendChart만 부름
  toTrendBaseLabel         toTrendChart만 부름
  toTrendPoints            toTrendChart만 부름
```

**Correct (작은 계산은 쓰는 자리에 그대로 둠):**

```tsx
// page/profile/pg-profile.tsx
const handleNextClick = () => {
	setIteration((previous) => (previous + 1) % iterationCount);
};
```

**Correct (`.map()` 콜백 하나에만 쓰이는 변환은 그 자리에 둠):**

```ts
// page/product/function/to-product-view.ts
/**
 * product 표시 모델 조립. 라벨 이름이 비면 코드를 보여 준다
 */
export const toProductView = (record: RecordItem): ProductView => {
	return {
		id: record.id,
		labels: record.labels.map((label) => label.name.trim() || label.code),
	};
};
```

**Correct (서로 다른 파일 둘이 이미 부르는 순수 함수를 뺌):**

```ts
// page/profile/function/to-profile-save-request.ts
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
// page/profile/pg-profile-form.tsx와 page/profile/pg-profile-drawer.tsx가 함께 부른다
import { toProfileSaveRequest } from "./function/to-profile-save-request";
```

**Correct (`.tsx` 안의 순수 조립 함수는 사용처가 하나여도 형제 `.ts`로 냄):**

```ts
// page/products/function/to-product-save-request.ts
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
import { toProductSaveRequest } from "./function/to-product-save-request";
```

**Correct (전용 보조가 딸린 단계만 자기 파일로 나감):**

```txt
page/report/function/to-sales-overview/
├── to-sales-overview.ts   내보낸 함수와 toSummaryBand가 남음
└── to-trend-chart.ts      전용 보조 셋을 비공개로 품음
```

### 3.4 Place and Promote Support Functions Deliberately

**Rule:** `T03-04` · `functions-place-and-promote-support-functions`

**Applies when:** 보조 함수를 어느 파일이나 폴더에 둘지 정할 때. 파일 안에서 내보낸 함수와 비공개 보조의 선언 순서를 정할 때. 루트 `util` 폴더로 파일을 옮기거나 종류 폴더를 새로 만들 때.

**Requires selected:** `functions-extract-helpers-only-when-the-boundary-is-real` · 함께 적용

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 루트 `util`에 한 소유자의 함수가 섞이지 않습니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 그 결과를 어디 두고 언제 올릴지만 봅니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
- 내보낸 대표 함수 하나당 파일 하나이고, 파일명은 그 함수 이름입니다.
  전용 보조가 파일로 나가면 대표 함수는 자기 이름 폴더를 갖고, 나간 파일은 그 안에 둡니다.
  루트 `util`도 같습니다.
- 파일 안에서는 import, 내보낸 계약 타입, 내보낸 대표 함수, 비공개 보조 순서로 둡니다.
  비공개 보조끼리도 같은 방향입니다.
  부르는 쪽을 위에, 불리는 쪽을 아래에 두어 파일 전체가 위에서 아래로 읽히게 합니다.
  함수 본문 속 참조는 호출 시점에 해석되므로 불리는 쪽이 아래 있어도 됩니다.
  모듈을 불러올 때 값이 계산되는 선언만 순서를 탑니다.
  그런 선언은 자기가 부르는 선언 뒤에 둡니다.
- 호출 깊이는 파일마다 내보낸 함수 하나, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  단계가 더 필요하면 먼저 같은 파일의 비공개 함수로 두고,
  파일로 나갈지는 `functions-extract-helpers-only-when-the-boundary-is-real`의 사유가 정합니다.
- 자기 폴더 밖에서는 내보낸 함수가 내보낸 함수를 타고 가는 사슬을 만들지 않습니다.
  대표 함수가 자기 폴더 안 파일을 부르는 것은 사슬이 아니라 그 함수의 내부입니다.
  자기 폴더 안 파일을 가져오는 것은 그 대표 함수뿐이고,
  다른 파일도 부르게 되면 재사용이 생긴 것이니 `function` 바로 아래로 꺼냅니다.
  루트 `util` 함수가 다른 루트 `util` 함수를 가져오는 것도 사슬이 아닙니다.
  둘 다 공개 진입점이고, 가져오는 줄에서 어느 종류 폴더의 무엇인지 그대로 읽힙니다.

**루트 `util`은 프로젝트가 소유자인 함수 폴더입니다.**
파일 하나에 함수 하나, 전용 보조는 자기 이름 폴더라는 규칙은 소유자 아래와 같습니다.
다른 점은 폴더 한 겹입니다.
함수가 많아 종류 폴더로 묶습니다.

- 종류는 함수가 받는 값의 타입입니다.
  `date`, `money`, `string`, `array`, `dom`, `url`이 그 이름입니다.
- 도메인 타입도 값의 타입입니다.
  `Spread`를 받는 함수는 `util/spread/`에 둡니다.
- 화면이나 기능 이름으로는 짓지 않습니다.
  받는 값의 타입으로 종류를 짓지 못하면 그 함수는 `util`이 아니라 소유자 함수입니다.
- 소유자 아래 `function` 폴더에는 종류 폴더를 두지 않습니다.
  함수가 몇 개라 파일 목록으로 충분합니다.

**루트 승격은 그 함수가 누구 것인지로 판정합니다.**

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 함수도 사라지면 그 소유자 것입니다.

- 소유자와 함께 사라지면 그 소유자 아래에 둡니다.
  profile 저장 화면이 없어지면 `toProfileSaveRequest`가 조립할 요청도 없습니다.
- 소유자를 지워도 남으면 지금 한 곳만 써도 올립니다.
  `toDisplayDate`는 소유자가 하나든 셋이든 `util/date/`에 둘 함수입니다.

두 소유자가 같은 함수를 써야 하면 셋 중 하나로 해소합니다.

1. 표시까지 같으면 `widget` 컴포넌트가 소유합니다.
2. 계산만 같으면 각 소유자가 각자 갖습니다.
3. 프로젝트 전반의 계산이면 루트 `util`로 올립니다.

1번은 함수를 공유하는 것이 아니라 표시를 공유하는 것입니다.
어느 레이어인지는 프레임워크 컨벤션의 레이어 규칙이 판정합니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 함수가 자리를 옮겨 다닙니다.
나중에 쓸 것 같아서 함수를 미리 만들지도 않습니다.

**Incorrect (잡동사니 파일과 내보낸 함수 세 단계 사슬):**

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

**Incorrect (보조 모듈 안에서 내보낸 함수가 내보낸 함수를 타고 감):**

```ts
// profile-support.ts
export const toProfileValues = (formValues: ProfileFormValues) => {
	// ...
};

export const toAvatarRequests = (files: UploadFile[]) => {
	// ...
};

export const toProfileSaveRequest = (
	formValues: ProfileFormValues,
	files: UploadFile[],
) => {
	return {
		...toProfileValues(formValues),
		avatarRequests: toAvatarRequests(files),
	};
};
```

**Incorrect (소유자와 함께 사라질 함수를 루트 `util`로 올림):**

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

**Correct (소유자 아래 대표 함수 하나당 파일 하나):**

```ts
// page/product-form/function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title을 거부한다
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Correct (내보낸 함수가 맨 위, 불리는 쪽이 호출자 아래로 이어짐):**

```ts
// page/report/function/to-summary-rows.ts
/**
 * 요약 표가 그리는 행 목록. 이름이 비면 코드로 표시한다
 */
export const toSummaryRows = (response: SalesSummaryResponse): SummaryRow[] => {
	return response.items.map(toSummaryRow);
};

const toSummaryRow = (item: SalesSummaryItem): SummaryRow => {
	return {id: item.id, label: toSummaryLabel(item)};
};

const toSummaryLabel = (item: SalesSummaryItem): string => {
	return item.name.trim() || item.code;
};
```

**Correct (전용 보조가 나간 대표 함수는 자기 이름 폴더를 가짐):**

```txt
page/report/function/
├── to-sales-overview/
│   ├── to-sales-overview.ts   대표 함수. 자기 폴더 안 파일을 조립
│   └── to-trend-chart.ts      이 폴더 밖에서는 가져오지 않음
└── to-sales-filter-request.ts
```

**Correct (소유자를 지워도 남는 함수는 종류 폴더에 파일 하나로 올림):**

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
 * ko-KR로 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
 */
export const toDisplayDate = (value: string): string => {
	return new Date(value).toLocaleDateString("ko-KR");
};
```

```ts
// util/money/to-signed-amount.ts
/**
 * 금액 표시는 화면마다 다르지 않다. 소수 두 자리와 부호를 고정한다
 */
export const toSignedAmount = (amount: Amount): string => {
	const sign = amount.value < 0 ? "-" : "+";
	return `${sign}$${Math.abs(amount.value).toFixed(2)}`;
};
```

### 3.5 Avoid Imperative Assembly in Wide Scopes

**Rule:** `T03-05` · `functions-avoid-imperative-assembly-in-wide-scopes`

**Applies when:** 모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 만들 때.

**Review with:** `functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.
쓰는 자리가 좁은 스코프 하나면 그 안에서 바로 계산합니다.
조건이 둘 이상이면 삼항을 겹치지 않고 조건부 스프레드나 `filter`로 한 번에 조립합니다.
분기와 보정이 얽혀 좁은 스코프에 담기지 않으면 떼어 낼지를 다시 봅니다.
그 판정은 `functions-extract-helpers-only-when-the-boundary-is-real`이 합니다.
떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`이 정하고,
중간값에 이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let visibleTabs = ["overview"];

if (canManageItems) {
	visibleTabs.push("items");
}
```

**Correct (조건부 스프레드로 한 번에 계산):**

```ts
const visibleTabs = ["overview", ...(canManageItems ? ["items"] : [])];
```

**Correct (조건이 셋 이상이면 표로 두고 걸러 냄):**

```ts
const visibleTabs = [
	{id: "overview", isVisible: true},
	{id: "items", isVisible: canManageItems},
	{id: "members", isVisible: canInviteMembers},
]
	.filter((tab) => tab.isVisible)
	.map((tab) => tab.id);
```

### 3.6 Name a Value Only to Prevent Recompute or Explain a Judgment

**Rule:** `T03-06` · `functions-name-a-value-only-for-recompute-or-judgment`

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
| 함수 값 | 이름이 곧 계약이고 선언 형태는 `functions-declare-functions-as-arrow-consts`가 정합니다 |

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

**Incorrect (돌려주기만 할 값을 변수로 뺌):**

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

**Incorrect (두 번 쓴다는 이유만으로 변수로 뺌):**

```ts
const toRowClassNames = (row: Row): string[] => {
	const isOverdue = row.dueDate < today;

	return [
		isOverdue ? "ui_row__root--overdue" : "ui_row__root",
		isOverdue ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Correct (항이 하나라 두 번 적어도 그 자리에 그대로 씀):**

```ts
const toRowClassNames = (row: Row): string[] => {
	return [
		row.dueDate < today ? "ui_row__root--overdue" : "ui_row__root",
		row.dueDate < today ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Correct (한 번만 써도 합성 판정이라 변수로 뺌):**

```ts
const toRowAction = (row: Row): RowAction => {
	const isEditable = row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId;

	return isEditable ? rowAction.edit : rowAction.view;
};
```

**Correct (콜백 밖으로 빼 행마다 다시 계산하지 않음):**

```ts
const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
	// 콜백 안으로 옮기면 행마다 다시 계산한다
	const lowerKeyword = keyword.trim().toLowerCase();

	return rows.filter((row) => row.title.toLowerCase().includes(lowerKeyword));
};
```

**Correct (바깥과 주고받는 호출이라 변수로 뺌):**

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

### 3.7 Name Functions by What Comes Out

**Rule:** `T03-07` · `functions-name-functions-by-what-comes-out`

**Applies when:** 이름을 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 생성기·프레임워크·외부 계약이 정한 이름을 그대로 쓰는 경우.

**Impact: MEDIUM (이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다)**

함수 이름은 입력이나 구현 동작이 아니라 호출 뒤 얻는 값이나 효과를 말합니다.
접미사를 먼저 정하지 말고 아래 구분에서 가장 구체적인 동사를 고릅니다.

| 이름 | 사용하는 때 | 예 |
| --- | --- | --- |
| `to<대상>` | 입력 형태를 다른 출력 형태로 바꿀 때 | `toDetailContent` |
| `get<대상>` | 이미 존재하는 값을 가져올 때 | `getSelectedRow` |
| `find<대상>` | 값 하나 또는 없음을 돌려줄 때 | `findUserByEmail` |
| `resolve<대상>` | 조건·fallback·현재 문맥에서 답 하나를 정할 때 | `resolveDisplayRows` |
| `normalize<대상>` | 같은 개념의 값을 허용 범위나 기본 표현에 맞출 때 | `normalizePageSize` |
| `parse<대상>` | 문자열·`unknown`을 검증하며 타입이 보장된 값으로 읽을 때 | `parseSearchParams` |
| `format<대상>` | 값을 사람이 읽는 문자열로 표시할 때 | `formatCandidateDayCount` |
| `compare<대상>` | 두 값을 비교해 정렬 순서를 돌려줄 때 | `compareIndexedDriver` |
| `sort<대상>` | 정렬한 목록을 돌려줄 때 | `sortProductsByUpdatedAt` |
| `load<대상>`·`fetch<대상>` | 비동기 I/O를 수행하거나 여러 요청을 조율할 때 | `loadPatternSearchExport` |
| `is`·`has`·`can`·`should` | 참이나 거짓으로 질문에 답할 때 | `shouldShowSummary` |

`resolve`는 여러 후보 중 답을 정할 때, `normalize`는 같은 개념의 표현을
허용 범위에 맞출 때만 씁니다. 단지 계산 과정이 복잡하다는 이유로 붙이지 않습니다.

**이름에는 출력 역할만 남깁니다.**

- 입력은 시그니처가 말하므로 이름에 반복하지 않습니다.
  `mapResponseToModel`처럼 입력과 막연한 접미사를 함께 적지 않습니다.
- 소유자 경로가 이미 말하는 도메인을 되풀이하지 않습니다.
  `sales-trend-panel/function/` 안에서는 `toSalesTrendComparisonWindows`보다
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
`filter`, `map`, `update`는 우리가 짓는 이름의 첫 동사로 쓰지 않습니다.
무엇이 나오는지 또는 어떤 효과가 생기는지 구체적으로 말하지 못하기 때문입니다.

- `filterActiveUsers`는 활성 사용자를 남기는지 제외하는지 모호합니다.
  남은 목록이 출력이면 `toActiveUsers`로 씁니다.
- `mapProductRows`는 행이 입력인지 출력인지 모호합니다.
  행이 출력이면 `toProductRows`로 씁니다.
- `updateProduct`는 저장 효과인지 새 값을 만드는 계산인지 모호합니다.
  각각 `saveProduct`나 `toUpdatedProduct`처럼 나눕니다.
- 배열의 짧은 인라인 변환에서 쓰는 `array.map(...)`은 함수 이름 규칙과 무관합니다.
- `handle`과 `use`처럼 프레임워크가 의미를 정하는 이름은 해당 프레임워크 규칙이 판정합니다.

생성기·프레임워크·외부 계약이 정한 이름은 그대로 씁니다.
`new Promise((resolve, reject) => …)`의 매개변수와 생성된 API의 `fetch` 함수처럼
우리가 소유하지 않는 이름을 이 규칙에 맞추려고 바꾸거나 감싸지 않습니다.

**Incorrect (입력·구현 동작·막연한 접미사를 이름에 씀):**

```ts
export const buildUserPayload = (formValues: UserFormValues) => { /* … */ };
export const mapResponseToModel = (response: UserResponse) => { /* … */ };
export const processUserRows = (rows: UserRow[]) => { /* … */ };
```

**Correct (출력 역할이나 효과를 이름에 씀):**

```ts
/**
 * 사용자 저장 요청 조립. 서버가 빈 문자열을 거부해 비운 칸은 넣지 않는다
 */
export const toUserSaveRequest = (formValues: UserFormValues) => { /* … */ };

/**
 * 비활성 사용자를 제외한 목록
 */
export const toActiveUsers = (rows: UserRow[]) => { /* … */ };

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

값을 다루는 관용구를 한 가지로 고정합니다. 넘겨받은 배열은 제자리에서 바꾸지 않고, 반복되는 조회는 `Set`과 `Map`으로 모읍니다. 객체에서 값을 꺼낼 때는 구조분해로 끊지 않고 체인으로 읽어 출처를 남깁니다. 한 곳에서 쓸 값은 조회표로 우회하지 않고 사용처에서 직접 고릅니다. 뜻이 있는 숫자는 쓰는 자리에 적지 않고 상수로 선언합니다.

### 4.1 Prefer Immutable Array Sorting

**Rule:** `T04-01` · `values-prefer-immutable-array-sorting`

**Applies when:** 프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.

**Impact: HIGH (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

이 함수가 만들지 않은 배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이 그 경우입니다.

`.toSorted()`를 먼저 씁니다.
쓰려면 `tsconfig`의 `lib`에 `ES2023` 이상이 있어야 하고, **실행 환경도 지원해야 합니다.**
`lib`는 타입 검사만 열어 주고 폴리필하지 않습니다.
둘 중 하나라도 안 되면 `[...list].sort()`로 복사한 뒤 정렬합니다.

**Incorrect (매개변수로 받은 배열을 제자리에서 변경):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.sort((left, right) => left.name.localeCompare(right.name));
};
```

**Correct (`toSorted()`로 새 배열을 만듦):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.toSorted((left, right) => left.name.localeCompare(right.name));
};
```

**Correct (`lib`나 실행 환경이 안 되면 복사 후 정렬):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return [...users].sort((left, right) => left.name.localeCompare(right.name));
};
```

### 4.2 Use Set and Map for Repeated Lookups

**Rule:** `T04-02` · `values-use-set-and-map-for-repeated-lookups`

**Applies when:** 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.

**Impact: MEDIUM (반복되는 포함 검사와 키 접근을 한 번 만든 `Set`·`Map` 조회로 바꿉니다)**

같은 목록에 포함 검사나 키 조회를 여러 번 한다면 `includes`와 `find`를 매번 돌리지 않습니다.
`Set`이나 `Map`으로 한 번 정리합니다.
다음 중 하나면 바꿉니다.
그 밖에는 그대로 둡니다.

- 같은 목록을 겨냥한 조회가 루프나 `map`·`filter`·`some` 콜백 안에 있습니다.
- 같은 목록을 겨냥한 조회가 서로 다른 세 지점 이상에서 일어납니다.

**Incorrect (같은 배열을 반복 순회하며 포함 여부를 확인):**

```ts
const visibleProducts = products.filter((product) => allowedProductIds.includes(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIds.includes(product.id));
```

**Correct (반복 조회는 `Set`으로 승격):**

```ts
const allowedProductIdSet = new Set(allowedProductIds);

const visibleProducts = products.filter((product) => allowedProductIdSet.has(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIdSet.has(product.id));
```

**Correct (반복 키 조회는 `Map`으로 승격):**

```ts
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
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

**Incorrect (시그니처와 본문에서 구조분해해 출처가 사라짐):**

```ts
const toInvoiceLine = ({product, quantity}: InvoiceLineInput): InvoiceLine => {
	const {title, unitPrice} = product;

	return {
		label: title,
		amount: unitPrice * quantity,
	};
};
```

**Incorrect (별칭 `const`로 끊어 이름만 남김):**

```ts
const currency = pricing_default_currency;

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency,
		amount: lines.reduce((sum, line) => sum + line.amount, 0),
	};
};
```

**Incorrect (이름을 바꿔 꺼내 출처와 원래 이름이 함께 사라짐):**

```ts
const {status: projectStatus, owner: projectOwner} = project;

if (projectStatus === "archived") {
	notify(projectOwner);
}
```

**Correct (체인으로 읽어 출처가 쓰는 자리마다 남음):**

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
		amount: lines.reduce((sum, line) => sum + line.amount, 0),
	};
};

if (project.status === "archived") {
	notify(project.owner);
}
```

**Correct (배열과 튜플은 자리로 풀어도 됨):**

```ts
const [keyword, setKeyword] = useState("");

for (const [key, value] of Object.entries(target.searchParams)) {
	requestUrl.searchParams.set(key, value);
}
```

**Correct (필드 읽기가 아니라 계산한 결과라 이름을 붙임):**

```ts
const toOverdueLines = (invoice: Invoice, today: Date): InvoiceLine[] => {
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
소유자를 지워도 남으면 루트 `constant` 폴더, 소유자와 함께 사라지면 그 소유자의 `constant` 폴더입니다.

**같은 파일에 지역 `const`로 옮기는 것으로는 끝나지 않습니다.**
`functions-name-a-value-only-for-recompute-or-judgment`가 지역 변수를 만들 자리를 따로 정하고,
숫자를 옮기는 것은 그 둘 중 어디에도 없습니다.
갈 곳은 지역 변수가 아니라 `constant` 폴더입니다.

**뜻이 없는 숫자는 그대로 적습니다.**
아래는 이름을 붙여도 읽는 사람이 얻는 것이 없습니다.

| 그대로 적는 것 | 예 |
| --- | --- |
| 관용값 | `0`, `1`, `2`, `10`, `24`, `60` |
| 배열 인덱스 | `rows[0]`, `parts[1]` |
| 선언의 초기값 | `let count = 0` |
| 상수 선언 자신의 값 | `export const retry_max_attempts = 42` |
| 기본 매개변수 | `(limit = 42) => …` |

`??`·`||` 오른쪽은 이 규칙이 아니라
`absence-expose-optional-values-instead-of-silent-fallbacks`가 봅니다.
없는 값을 다루는 자리라 판정이 다릅니다.

**여러 숫자가 한 뜻을 이루면 배열이 아니라 객체로 둡니다.**
`{first: 0x1100, last: 0x115f}`처럼 키를 붙이면 그 값은 무시되지만
`[0x1100, 0x115f]`처럼 배열에 담으면 자리마다 걸립니다.
숫자 여러 개가 한 뜻을 이루는 조회표도 각 칸에 이름을 주라는 뜻입니다.

`tooling-configure-biome-to-enforce-these-rules` 규칙이 `style/noMagicNumbers`로 이 선을 강제합니다.
그 규칙은 테스트 파일에서만 꺼집니다.
기대값은 리터럴 자체가 계약이라 상수로 빼면 검증할 것이 남지 않습니다.

**Incorrect (뜻이 있는 숫자를 쓰는 자리에 적음):**

```ts
const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > 42;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, 37);
};

const toScheduledSave = (save: () => void): void => {
	setTimeout(save, 300);
};
```

**Incorrect (지역 `const`로 자리만 옮김):**

```ts
const maxAttempts = 42;

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > maxAttempts;
};
```

**Correct (상수로 선언하고 이름을 가리킴):**

```ts
// constant/retry.ts
/**
 * 이 횟수를 넘으면 사용자에게 실패를 보여 준다
 */
export const retry_max_attempts = 42;
```

```ts
// constant/preview.ts
/**
 * 미리보기에 그릴 행 수. 서버가 한 번에 주는 최대치와 맞춘다
 */
export const preview_row_count = 37;
```

```ts
import {preview_row_count} from "@/constant/preview";
import {retry_max_attempts} from "@/constant/retry";

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > retry_max_attempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, preview_row_count);
};
```

**Correct (뜻이 없는 숫자는 그대로):**

```ts
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

**Incorrect (한 곳의 프롭 값을 고르려고 조회표를 만듦):**

```tsx
const chart_toolbar_variant_by_card_variant = {
	default: "default",
	fill: "default",
	dialog: "dialog",
} satisfies Record<UiChartCardProps["variant"], UiChartToolbarProps["variant"]>;

<UiChart.Toolbar variant={chart_toolbar_variant_by_card_variant[props.variant]} />;
```

**Correct (값이 달라지는 조건을 사용처에 적음):**

```tsx
<UiChart.Toolbar variant={props.variant === "fill" ? "default" : props.variant} />;
```

**Correct (외부 코드와 화면 상태의 대응 관계가 계약이면 이유를 남기고 조회표를 둠):**

```ts
// GET /orders의 P·C·D 코드를 화면의 주문 상태 어휘로 바꾸는 API 경계 계약이다.
const order_status_by_api_code = {
	P: "pending",
	C: "completed",
	D: "cancelled",
} as const satisfies Record<OrderStatusCode, OrderStatus>;
```

## 5. Absence and Fallback Handling

**Impact: HIGH**

값이 없을 수 있는 상태를 다루는 규칙을 모읍니다. 기본값으로 덮어 감추지 않고 없다는 사실을 사용처까지 남깁니다.

### 5.1 Expose Optional Values Instead of Silent Fallbacks

**Rule:** `T05-01` · `absence-expose-optional-values-instead-of-silent-fallbacks`

**Applies when:** 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.

**Review with:** `naming-place-owner-constants-in-the-owner-constant-folder`, `naming-place-project-constants-in-the-root-constant-folder`

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
같은 파일 위쪽에 `const supportEmailFallback = "help@example.com";`을 두는 것으로는 통과하지 못합니다.
상수로 선언된 이름이어야 합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

**어디서 해소할지는 순서로 정합니다.**

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

**Incorrect (`??`와 `||` 오른쪽에 리터럴을 적음):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
const productRows = response.data.rows ?? [];
const isCompact = (variant ?? "default") === "compact";
```

**Correct (없을 수 있다는 사실을 그대로 드러냄):**

```ts
if (!settings.supportEmail) {
	throw new MissingSupportEmailError();
}

sendInvite({from: settings.supportEmail});
```

**Correct (그대로 비교하면 기본값이 필요 없음):**

```ts
const isCompact = variant === "compact";
const productIds = response.data.rows?.map((row) => row.id);
```

**Correct (값이 들어오는 경계에서 한 번 해소해 아래쪽에는 선택 값이 오지 않음):**

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
```

**Correct (경계에서 못 하면 쓰는 자리에 그대로 적음):**

```ts
fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size});
```

**Correct (이름을 붙인다면 파생값임이 드러나는 이름):**

```ts
const effectivePageSize = query.pageSize ?? pagination_default_page_size;

fetchProducts({pageSize: effectivePageSize});
setVisibleRowCount(effectivePageSize);
```

## 6. JSDoc and Comment Conventions

**Impact: MEDIUM**

함수 본문 안 주석은 의도와 긴 절차의 단계를 적고 코드를 옮겨 적지 않습니다. 선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 따로 정해져 있습니다. 본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

### 6.1 Keep Body Comments for Intent and Steps

**Rule:** `T06-01` · `docs-keep-body-comments-for-intent-and-steps`

**Applies when:** 함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때.

**Review with:** `docs-justify-convention-exceptions-with-a-reason-comment`, `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

본문 안에서 코드 한 줄이나 절차의 단계를 설명할 때는 `//`만 씁니다.
블록 주석을 쓰지 않습니다.
본문 안이라도 `docs-require-header-jsdoc-on-key-declarations`가 지목한 선언 위에는 블록을 씁니다.
컴포넌트 본문의 핸들러, 이펙트, 쿼리 바인딩이 그 자리입니다.
그 밖의 지역 선언에는 블록을 쓰지 않습니다.
블록의 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.
JSX 자식 자리에는 `//`를 쓸 수 없어 이 규칙이 닿지 않습니다.
그 자리의 주석 형태는 프레임워크 규칙이 정합니다.

본문 주석은 이런 자리에 답니다.

- 도메인 규칙
- 예외를 막은 의도
- 외부 라이브러리나 API의 제약
- 부수효과의 순서
- **긴 절차의 단계 구분.** 흐름을 쪼개지 않고 한 자리에 두기로 한 함수일수록 단계 표시가 필요합니다.

주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
규칙이 허용한 예외의 이유를 남기는 주석은
`docs-justify-convention-exceptions-with-a-reason-comment`가 따로 정합니다.
이 규칙은 본문 안 어디에 다는지만 봅니다.

**Incorrect (본문 안 지역 선언에 블록 주석을 씀):**

```ts
const toMatchedProducts = (products: Product[], keyword: string) => {
	/**
	 * keyword를 소문자로 바꾼다.
	 */
	const lowerKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(lowerKeyword));
};
```

**Correct (`//`로 제약과 단계를 표시):**

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

**Applies when:** 쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 커스텀 타입, 스토어, 포매터 선언을 추가·변경할 때. 분기나 `await`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때. 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: MEDIUM (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

이름 붙인 쿼리와 뮤테이션, 원격 함수, 커스텀 훅, 스토어, 표시 문자열을 만드는 포매터 선언에는
헤더 문서 주석을 씁니다.
본문에 분기나 `await`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트도 대상입니다.
다시 쓰거나 내보낸 보조 함수도 대상입니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

커스텀 `type`과 `interface` 문서화는 `types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고 여기서 다시 판정하지 않습니다.

주석의 형식은 `docs-write-doc-comments-as-multiline-blocks`가,
태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const toSortedUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Correct (여러 줄 블록에 설명만 작성):**

```ts
/**
 * 중복 제거 후 사용자 ID 정렬
 */
export const toSortedUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
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

글자 수 제한은 두지 않지만 새 정보가 없는 문장은 쓰지 않습니다.
내용이 한 문장으로 통하면 한 문장으로 쓰고, 읽는 사람이 배경을 알아야 하면 여러 문장으로 씁니다.
기준은 길이가 아니라 그 주석을 읽고 이해할 수 있는지입니다.
문장이 몇 개든 형식은 언제나 여러 줄 블록이며, 그 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.

쓰지 않는 것:

- 선언 이름의 낱말을 한국어로 바꿔 적기만 하고 새 정보가 없는 문장.
  `sortRuleRefs`에 `/** 규칙 참조를 정렬 */`을 다는 것이 그 경우입니다.
- 코드를 한 줄씩 따라 읽으며 옮겨 적은 문장
- 설명 없이 `@param`·`@returns`만 나열한 주석

태그를 붙일지도 내용 판단이라 여기서 정합니다.

- 선언이 무엇인지는 이름과 문법이 이미 드러내므로 태그로 다시 적지 않습니다.
- `@api`·`@helper`·`@field` 같은 역할 태그를 붙이지 않습니다.
- `@schema`처럼 규격에 없는 태그를 새로 만들지 않습니다.
- `@summary`는 헤더 첫 줄이 이미 하는 일이라 쓰지 않습니다.
- `@deprecated`·`@example`·`@param`·`@returns`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.
- 역할 태그는 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다.

기술 용어와 식별자는 영어를 섞어 써도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
새로 넣거나 고친 문서 주석에는 그 선언의 목적이나 제약을 설명하는 한국어 구절이 있어야 합니다.
필드 주석이 한국어여도 헤더 주석이 영어뿐이면 통과하지 못합니다.

**Incorrect (영문이거나 선언 이름을 옮겨 적기만 함):**

```ts
/**
 * This function sorts rule refs and returns the result.
 */
export const sortRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return Array.from(new Set(refs)).sort();
};

/**
 * 규칙 참조를 정렬하는 함수
 */
export const sortRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return Array.from(new Set(refs)).sort();
};

/**
 * route-local product tree props
 */
export interface PgProductTreeProps {
	categoryNodes: ProductCategoryNode[];
}
```

**Incorrect (역할 태그로 선언의 성격을 다시 적음):**

```ts
/**
 * @api product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
```

**Correct (이름에 없는 정보를 더함):**

```ts
/**
 * 중복을 제거한 뒤 정렬한다. 호출부가 목록을 다시 정렬하지 않아도 되게 하려는 것이다.
 */
export const sortRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return Array.from(new Set(refs)).sort();
};

/**
 * 저장 응답의 정렬 순서를 그대로 믿지 않고 다시 정렬한다.
 *
 * 서버가 같은 updatedAt 인 항목의 순서를 보장하지 않아
 * 목록이 새로고침할 때마다 흔들리는 문제가 있었다.
 */
export const sortProductsByUpdatedAt = (products: Product[]): Product[] => {
	return [...products].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
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

### 6.4 Write Doc Comments as Multiline Blocks

**Rule:** `T06-04` · `docs-write-doc-comments-as-multiline-blocks`

**Applies when:** 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 `/** … */`이나 `//`로 선언을 설명하려 할 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`

**Impact: LOW (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 다른 줄에 둡니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  규칙이 허용한 예외의 이유를 적을 때는 `//` 한 줄을 씁니다.
  그 형식은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.
- 어떤 태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

**Incorrect (한 줄 블록과 `//`로 선언을 설명):**

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

**Correct (같은 내용을 여러 줄 블록으로 고정):**

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
JSX 자식 자리에는 `//`가 없어 프레임워크 규칙이 정한 형태로 씁니다.
어투와 내용은 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

**Incorrect (확인할 수 없는 말로 예외를 정당화):**

```ts
// 성능을 위해 메모이제이션
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (외부 패키지의 제약을 가리킴):**

```ts
// ag-grid는 columnDefs 참조가 바뀌면 컬럼 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (측정 결과를 가리킴):**

```ts
// 행 5,000개에서 매 렌더 필터링이 120ms로 측정됐다. 지연한 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => rows.filter((row) => matchRow(row, deferredKeyword)), [deferredKeyword, rows]);
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
| `style/noRestrictedImports` | `typescript/naming-restrict-absolute-aliases-to-layer-roots`의 경로 표 |
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
| `correctness/useSingleJsDocAsterisk` | `typescript/docs-write-doc-comments-as-multiline-blocks` |
| `suspicious/noExplicitAny` | `typescript/types-narrow-unknown-instead-of-asserting` |
| `style/noNonNullAssertion` | `typescript/types-narrow-unknown-instead-of-asserting` |

`style/useConst`는 `biome` 2.5.7의 `recommended`에 이미 있어 설정에 다시 적어도 동작이 달라지지 않습니다.
어느 컨벤션을 대신하는지 보이게 하려고 표와 설정에 남겨 둡니다.

기계가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- 모듈 스코프 `const`와 객체 리터럴 키에는 `snake_case`를 허용합니다.
  `biome`은 불변 데이터 상수와 함수, 스키마, 요청 객체를 구분하지 못하고,
  어떤 객체 키가 불변 데이터 상수나 상수 집합에 속하는지도 구분하지 못합니다.
  `snake_case`를 쓸 자리는 `naming-use-consistent-file-and-symbol-naming` 규칙에 따라 리뷰가 판정합니다.
  `PascalCase`는 합성 컴포넌트의 `{Root, Header, Footer}` 때문에 `objectLiteralProperty`에만 남깁니다.
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
`assert.equal(rules.length, 111)`의 `111`은 설정으로 뺄 값이 아니라 그 테스트가 고정하는 계약입니다.
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

**Incorrect (`recommended`만 켜고 컨벤션 항목을 리뷰에 맡김):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"preset": "recommended"}
	}
}
```

**Correct (컨벤션 항목을 설정으로 고정):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {
			"preset": "recommended",
			"complexity": {"useMaxParams": {"level": "error", "options": {"max": 3}}},
			"correctness": {"noUnusedFunctionParameters": "error", "useSingleJsDocAsterisk": "error"},
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
						"patterns": [{"group": ["@/page/**"], "message": "화면 내부는 절대경로로 가져오지 않습니다."}]
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
			"includes": ["test/**/*.ts"],
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
