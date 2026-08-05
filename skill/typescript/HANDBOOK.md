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

1. [Types and Contracts](#1-types-and-contracts) — **CRITICAL**
    - 1.1 [Reuse Existing Contracts Before Declaring New Types](#11-reuse-existing-contracts-before-declaring-new-types)
    - 1.2 [Prefer Function Variable Types Over Parameter Annotations](#12-prefer-function-variable-types-over-parameter-annotations)
    - 1.3 [Document Custom Types and Declarative Shapes](#13-document-custom-types-and-declarative-shapes)
    - 1.4 [Mark Unused Parameters With an Underscore Prefix](#14-mark-unused-parameters-with-an-underscore-prefix)
    - 1.5 [Narrow `unknown` Instead of Asserting](#15-narrow-unknown-instead-of-asserting)
    - 1.6 [Replace `enum` With `as const` Objects](#16-replace-enum-with-as-const-objects)
2. [Naming and Module Boundaries](#2-naming-and-module-boundaries) — **HIGH**
    - 2.1 [Centralize Shared Config Under `shared/config.ts`](#21-centralize-shared-config-under-shared-config-ts)
    - 2.2 [Place Owner-only Config in the Owner Config Folder](#22-place-owner-only-config-in-the-owner-config-folder)
    - 2.3 [Preserve Shared Namespace Origin With Chained Access](#23-preserve-shared-namespace-origin-with-chained-access)
    - 2.4 [Use Consistent File, Symbol, and Field Naming](#24-use-consistent-file-symbol-and-field-naming)
    - 2.5 [Use Direct Imports and Dedicated Public Entry Points](#25-use-direct-imports-and-dedicated-public-entry-points)
    - 2.6 [Restrict Absolute Aliases to Layer Roots](#26-restrict-absolute-aliases-to-layer-roots)
    - 2.7 [Read Environment Values Through Shared Config](#27-read-environment-values-through-shared-config)
3. [Functions and Helper Boundaries](#3-functions-and-helper-boundaries) — **HIGH**
    - 3.1 [Declare Functions as Arrow Consts](#31-declare-functions-as-arrow-consts)
    - 3.2 [Use Named Object Params for Complex Signatures](#32-use-named-object-params-for-complex-signatures)
    - 3.3 [Extract Support Functions Only When the Boundary Is Real](#33-extract-support-functions-only-when-the-boundary-is-real)
    - 3.4 [Place and Promote Support Functions Deliberately](#34-place-and-promote-support-functions-deliberately)
    - 3.5 [Avoid Imperative Assembly in Wide Scopes](#35-avoid-imperative-assembly-in-wide-scopes)
    - 3.6 [Name a Value Only When It Is Reused](#36-name-a-value-only-when-it-is-reused)
    - 3.7 [Name Functions by What Comes Out](#37-name-functions-by-what-comes-out)
4. [Values and Data Structures](#4-values-and-data-structures) — **HIGH**
    - 4.1 [Prefer Immutable Array Sorting](#41-prefer-immutable-array-sorting)
    - 4.2 [Use Set and Map for Repeated Lookups](#42-use-set-and-map-for-repeated-lookups)
5. [Absence and Fallback Handling](#5-absence-and-fallback-handling) — **HIGH**
    - 5.1 [Expose Optional Values Instead of Silent Fallbacks](#51-expose-optional-values-instead-of-silent-fallbacks)
6. [JSDoc and Comment Conventions](#6-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
    - 6.1 [Keep Body Comments for Intent and Steps](#61-keep-body-comments-for-intent-and-steps)
    - 6.2 [Require Header Doc Comments on Key Declarations](#62-require-header-doc-comments-on-key-declarations)
    - 6.3 [Write Concise Korean Comments About Purpose and Constraints](#63-write-concise-korean-comments-about-purpose-and-constraints)
    - 6.4 [Write Doc Comments as Multiline Blocks](#64-write-doc-comments-as-multiline-blocks)
    - 6.5 [Justify Convention Exceptions With a Checkable Reason Comment](#65-justify-convention-exceptions-with-a-checkable-reason-comment)
7. [Tooling](#7-tooling) — **MEDIUM**
    - 7.1 [Configure Biome to Enforce the Mechanical Rules](#71-configure-biome-to-enforce-the-mechanical-rules)

---

## 1. Types and Contracts

**Impact: CRITICAL**

함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게 유지해야 합니다. 실행 값과 타입을 한 선언에서 잡는 `as const` 객체도 여기서 정합니다.

### 1.1 Reuse Existing Contracts Before Declaring New Types

**Rule:** `T01` · `types-reuse-existing-contracts-before-new-types`

**Applies when:** 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없거나 소유자만 옮긴 경우, 그대로인 계약을 새 자리에서 쓰는 경우. 제외: 고칠 수 없는 형태를 그대로 쓰는 경우.

**Review with:** `types-document-custom-types-and-shapes`

**Impact: HIGH (뜻이 그대로면 기존 타입이나 스키마에서 끌어와 같은 형태를 두 번 선언하지 않습니다)**

필드 이름, 타입, 선택 여부가 모두 같은 선언이 이미 있으면 그대로 참조합니다.
그중 일부만 필요하면 **`interface`를 선언하고 각 필드를 `원본["필드"]` 인덱스 접근으로 가져옵니다.**
같은 이름의 필드가 타입이나 선택 여부에서 하나라도 다르면 끌어오지 않고 새로 선언합니다.
필드 구성이 부분집합인 것은 다른 것이 아닙니다.
그때가 인덱스 접근을 쓰는 자리입니다.
소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

**`Pick`은 쓰지 않습니다.** 고르는 것은 언제나 닫힌 집합이라
써드파티 타입이어도 `interface`에 인덱스 접근으로 적을 수 있습니다.
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
`ReturnType`, `Parameters`, `Awaited`는 형태에서 필드를 고르는 일이 아니라 이 규칙 대상이 아닙니다.

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

**Rule:** `T02` · `types-prefer-function-variable-types-over-parameter-annotations`

**Applies when:** 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우.

**Review with:** `types-mark-unused-parameters-with-underscore`

**Impact: CRITICAL (계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다)**

타입을 붙일 자리가 둘 있습니다.

| 붙이는 자리 | 형태 |
| --- | --- |
| 매개변수와 반환값에 하나씩 | `const handleClick = (event: MouseEvent<HTMLButtonElement>): void => …` |
| 함수를 담는 변수에 한 번 | `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …` |

쓸 수 있는 계약이 이미 있으면 아래쪽을 씁니다.
이름 하나로 매개변수와 반환값이 함께 정해져서 계약을 한 자리에서 읽습니다.
이미 있는 인터페이스, 객체 계약, 프레임워크 별칭을 먼저 찾고,
매개변수 타입은 쓸 계약이 없을 때만 직접 적습니다.
인터페이스가 콜백을 필드로 갖고 있으면 `Contract["onSelect"]`처럼 인덱스 접근으로 가져다 씁니다.
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

**Rule:** `T03` · `types-document-custom-types-and-shapes`

**Applies when:** 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 반환 타입이 익명으로 추론되는 경우.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: CRITICAL (구현을 파헤치지 않고도 도메인 전용 계약을 이해합니다)**

선언형 형태는 헤더와 필드를 나눠 문서화합니다.

- 커스텀 `type`, `interface`, 스키마 최상단, 객체형 상수: 선언 위에 헤더 문서 주석
- `interface`, `type`, 스키마의 필드: 각 필드 바로 위에 문서 주석
- 객체형 상수는 헤더만 씁니다.
  필드 주석은 `interface`, `type`, 스키마에만 답니다.
  `shared/config.ts`의 설정 객체와 `enum` 성격 상수 객체의 키에는 달지 않습니다
- 필드가 없는 인덱스 접근 별칭(`type ProductId = ProductRecord["id"]`)과
  `Omit`으로 뺀 형태: 적을 필드가 없으므로 헤더만 씁니다.
  필드를 가진 `interface`는 원본에서 가져온 필드여도 각 필드에 주석을 답니다

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

**Rule:** `T04` · `types-mark-unused-parameters-with-underscore`

**Applies when:** 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.

**Impact: MEDIUM-HIGH (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
커링한 핸들러의 마지막 콜백도 예외가 아닙니다.
매개변수를 쓰지 않는 경우도 예외가 아닙니다.

`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않아도 `() =>`로 줄이지 않습니다.
`(_event) =>`로 받아 계약을 남깁니다.

**Incorrect (계약의 일부인 콜백 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 미사용 매개변수만 `_`로 표시):**

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

**Rule:** `T05` · `types-narrow-unknown-instead-of-asserting`

**Applies when:** `as` 단언, `!` 비-널 단언, `any`, `@ts-expect-error`를 추가할 때. 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때.

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

**Rule:** `T06` · `types-replace-enum-with-as-const-objects`

**Applies when:** `enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때. 제외: 외부 패키지가 내보낸 `enum` 값을 그대로 읽어 쓰는 경우.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 `enum` 고유 문법을 피합니다.

`enum`은 타입 표기를 지우는 것만으로 실행 코드가 되지 않습니다.
그래서 TypeScript 5.8의 `--erasableSyntaxOnly`나 타입만 지우는 번들러와 함께 쓸 수 없습니다.
이 컨벤션의 `biome` 설정도 `style/noEnum`으로 `enum` 선언을 막습니다.

외부 패키지가 `enum`을 내보내고 그 값을 그대로 넘겨야 하면 그 `enum`을 씁니다.
우리가 새로 선언하는 값 묶음만 이 규칙 대상입니다.

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
	passed: "passed",
	failed: "failed",
} as const;

/**
 * product 심사 상태 타입. product_status 에 값을 더하면 따라 넓어진다
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
```

## 2. Naming and Module Boundaries

**Impact: HIGH**

식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 설정 위치가 소유자와 출처를 바로 드러내야 합니다. 여기서 **소유자**는 자기 폴더를 가진 모듈 하나입니다. 그 폴더 안 파일들은 그 소유자만 씁니다.

### 2.1 Centralize Shared Config Under `shared/config.ts`

**Rule:** `T07` · `naming-centralize-shared-config-namespaces`

**Applies when:** 여러 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때. 공용 설정 경계를 바꿀 때.

**Review with:** `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (공용 설정 값이 쓰는 파일마다 흩어져 공개 출처를 잃는 것을 막습니다)**

설정을 어디 두는지는 그 값을 쓰는 소유자가 몇인지로 갈립니다.

| 쓰는 소유자 | 자리 | 이름 |
| --- | --- | --- |
| 둘 이상 | `shared/config.ts` | `config.*` |
| 하나 | `<owner>/config/<owner>-config.ts` | `<owner>Config` |

**두 소유자 이상이 같은 값을 쓰면** `shared/config.ts` 한 파일을 공개 진입점으로 삼습니다.
`config` 네임스페이스 아래에 모아 `config.*` 체인으로 읽히게 하고,
쓰는 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
소유자 하나만 쓰는 값은 아직 여기 올리지 않습니다.

최상위 네임스페이스가 다섯을 넘고 서로 참조하지 않을 때만 `config.ts` 하나를 폴더로 나눌지 검토합니다.
그 선에 닿기 전에는 미리 쪼개지 않습니다.

소유자 하나만 쓰는 설정의 폴더 위치와 파일명은
`naming-place-owner-config-in-the-owner-config-folder` 규칙이 정합니다.

**Incorrect (같은 값을 두 소유자가 각자 선언):**

```ts
// page/products/pg-products.tsx
const defaultPageSize = 20;
const billingFeatureKeys = ["invoices", "refunds"];
```

```ts
// page/billing/pg-billing.tsx
const defaultPageSize = 20;
```

**Correct (공용 설정 네임스페이스에서 읽어 쓰는 자리에 넘김):**

```ts
// page/products/pg-products.tsx
import {config} from "@/shared/config";

const productClient = createClient({baseUrl: config.api.public_base_url});
const productQuery = useProductQuery({
	client: productClient,
	pageSize: config.pagination.default_page_size,
});
```

```ts
// page/billing/pg-billing.tsx
import {config} from "@/shared/config";

const billingClient = createClient({baseUrl: config.api.billing_base_url});
const billingQuery = useBillingQuery({
	client: billingClient,
	pageSize: config.pagination.default_page_size,
	featureKeys: config.features.billing_feature_keys,
});
```

### 2.2 Place Owner-only Config in the Owner Config Folder

**Rule:** `T08` · `naming-place-owner-config-in-the-owner-config-folder`

**Applies when:** 소유자 하나만 쓰는 선언형 설정을 추가하거나 옮길 때. 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming` · 함께 적용

**Review with:** `naming-centralize-shared-config-namespaces`

**Impact: MEDIUM-HIGH (한 소유자만 쓰는 설정이 전역 진입점을 넓히지 않습니다)**

소유자 하나만 쓰는 선언형 설정은 전역으로 올리지 않습니다.
그 소유자 아래 `config` 폴더에 둡니다.
전역과 소유자 중 어디에 두는지 가르는 표는 `naming-centralize-shared-config-namespaces` 규칙에 있습니다.

- 파일은 소유자 폴더 바로 아래 `config/<owner>-config.ts`, 내보내는 상수는 `<owner>Config`입니다.
- `constants` 폴더는 만들지 않습니다.
- 두 번째 소유자가 같은 값을 쓰게 되면 `naming-centralize-shared-config-namespaces` 규칙을 따라 올립니다.

**Incorrect (소유자 하나만 쓰는 설정을 전역으로 올림):**

```ts
// shared/config.ts
export const config = {
	product_detail: {
		chart_axis_tick_count: 6,
	},
} as const;
```

**Correct (소유자 아래 `config` 폴더에 둠):**

```ts
// page/product-detail/config/product-detail-config.ts
/**
 * product 상세 화면 전용 표시 설정
 */
export const productDetailConfig = {
	chart_axis_tick_count: 6,
} as const;
```

### 2.3 Preserve Shared Namespace Origin With Chained Access

**Rule:** `T09` · `naming-preserve-config-origin-with-chained-access`

**Applies when:** `config`나 `util` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때.

**Review with:** `functions-place-and-promote-support-functions`

**Impact: HIGH (넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다)**

공용 설정과 공용 순수 함수는 쓰는 파일에서 직접 가져온 뒤 `config.*`, `util.*` 체인으로 씁니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 출처를 흐리지 않습니다.
구조분해가 필요하면 함수 안 좁은 스코프에서만 씁니다.

`shared/config.ts`와 `shared/util.ts`는 찾기 쉬우라고 네임스페이스를 유지합니다.
`config`와 `util` 이름은 공용 경계에서만 씁니다.
기능별로 같은 이름을 다시 쓰지 않습니다.
보조 함수 파일을 어디 둘지는 `functions-place-and-promote-support-functions` 규칙이 정합니다.

**Incorrect (넓은 스코프에서 원본 출처를 감춤):**

```ts
const {api, features} = config;
const {date} = util;
const billingBaseUrl = api.billing_base_url;
const enableRefunds = features.enable_refunds;
const isoDate = date.toIsoString(createdAt);
```

**Correct (쓰는 자리에서 체인 그대로 읽어 출처를 남김):**

```ts
const billingClient = createClient({baseUrl: config.api.billing_base_url});
const createdAtLabel = util.date.toIsoString(createdAt);

if (config.features.enable_refunds) {
	openRefundDialog({client: billingClient, createdAtLabel});
}
```

### 2.4 Use Consistent File, Symbol, and Field Naming

**Rule:** `T10` · `naming-use-consistent-file-and-symbol-naming`

**Applies when:** TypeScript 파일, 지역 변수, 함수, 타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.

**Impact: HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

| 대상 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 변수, 함수 | `camelCase` |
| 타입, 인터페이스, 컴포넌트 | `PascalCase` |
| 선언형 설정 객체의 키 | `snake_case` |
| `enum` 성격 상수 객체의 이름과 키 | `snake_case` |
| 일반 객체 키, 스키마 키, 타입 필드 | `camelCase` |

`const`인지에 따라 표기를 달리하지 않습니다.
설정과 `enum` 성격 객체를 뺀 나머지 모듈 값은 `camelCase`입니다.
설정 키는 공용이든 소유자 전용이든 `snake_case`라, 소유자 설정을 공용으로 올릴 때 키를 고치지 않습니다.
폴더명은 프레임워크가 강제하는 이름만 예외로 둡니다.

**`snake_case`를 쓰는 자리는 선언형 설정 객체와 `enum` 성격 상수 객체뿐입니다.**
라이브러리 인자, API 요청 본문, DOM 속성으로 그대로 넘어가는 키는 받는 쪽 표기를 그대로 씁니다.
그 둘이 아니면 `camelCase`입니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것은 지역 심볼을 새로 짓는 일이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

**Incorrect (파일명, 심볼명, 필드명이 제각각임):**

```ts
// userSettings.ts
// 우리 코드만 읽는 스키마다. 설정 객체도 enum 성격 상수도 아니라 키는 camelCase여야 한다
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});
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

**Correct (선언형 설정 객체와 `enum` 성격 상수 객체만 `snake_case`):**

```ts
// shared/config.ts
/**
 * 환경마다 달라지는 공용 설정
 */
export const config = {
	pagination: {
		default_page_size: 20,
	},
} as const;

/**
 * product 게시 상태 값 집합
 */
const product_status = {
	draft: "draft",
	published: "published",
} as const;
```

### 2.5 Use Direct Imports and Dedicated Public Entry Points

**Rule:** `T11` · `naming-use-direct-imports-and-public-entry-points`

**Applies when:** 가져오기, 내보내기, 배럴, 공용 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.

**Review with:** `naming-restrict-absolute-aliases-to-layer-roots`

**Impact: HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 가져오기 소유를 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않습니다.
필요한 파일에서 바로 가져옵니다.
역할 폴더를 `index.ts`로 묶는 것도 배럴이라 만들지 않습니다.
같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체는
다시 내보내는 계층이 아니므로 배럴이 아닙니다.
타입만 가져올 때는 `import type`을 써서 계약과 실행 의존을 나눕니다.

절대경로 별칭으로 어디까지 열지는 `naming-restrict-absolute-aliases-to-layer-roots` 규칙이 정합니다.

경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면
가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

**Incorrect (배럴과 섞인 가져오기로 경계를 흐림):**

```ts
import {config, util, UserProfile} from "./index";
```

**Correct (직접 가져오기와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/shared/contracts";
import {config} from "@/shared/config";
import {util} from "@/shared/util";
import {WgChartCard} from "@/widget/chart-card/wg-chart-card";
import {toUserSaveRequest} from "./function/to-user-save-request";
```

### 2.6 Restrict Absolute Aliases to Layer Roots

**Rule:** `T12` · `naming-restrict-absolute-aliases-to-layer-roots`

**Applies when:** 절대경로 별칭으로 다른 모듈을 가져올 때. 별칭이 가리키는 경로 깊이를 바꿀 때.

**Review with:** `naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (소유자 내부 모듈이 밖에서 직접 열리지 않아 경계가 남습니다)**

절대경로 별칭의 첫 마디는 전역 레이어 루트여야 합니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget`, `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

- 첫 마디가 레이어 루트면 그 아래 깊이는 제한하지 않습니다.
  `@/widget/chart-card/wg-chart-card`는 허용입니다.
- 화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
- 소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

**Incorrect (화면 내부 모듈을 절대경로로 가져옴):**

```ts
import {SalesChartCard} from "@/page/detail/component/sales-trend-panel/component/sales-chart-card";
```

**Correct (레이어 루트로 시작하는 별칭과 소유자 안 상대경로):**

```ts
import {WgChartCard} from "@/widget/chart-card/wg-chart-card";
import {SalesChartCard} from "./component/sales-chart-card";
```

### 2.7 Read Environment Values Through Shared Config

**Rule:** `T13` · `naming-read-environment-values-through-shared-config`

**Applies when:** `import.meta.env`나 `process.env`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값을 새로 들여올 때.

**Review with:** `absence-expose-optional-values-instead-of-silent-fallbacks`, `naming-centralize-shared-config-namespaces`

**Impact: MEDIUM-HIGH (환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 곳에서 읽힙니다)**

환경마다 값이 달라지는 것은 쓰는 파일에서 직접 읽지 않습니다.
`shared/config.ts`가 한 번 읽어 `config.*`로 내보내고, 나머지는 그 이름을 씁니다.
읽는 자리를 하나로 모으는 이유는 `naming-preserve-config-origin-with-chained-access` 규칙과 같습니다.

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

**Correct (공용 설정이 한 번 읽고 없으면 드러냄):**

```ts
// shared/config.ts
if (!import.meta.env.VITE_API_BASE_URL) {
	throw new MissingEnvironmentValueError("VITE_API_BASE_URL");
}

/**
 * 환경마다 달라지는 공용 설정
 */
export const config = {
	api: {
		base_url: import.meta.env.VITE_API_BASE_URL,
	},
} as const;
```

```ts
// service/product-client.ts
import {config} from "@/shared/config";

const productClient = createClient({baseUrl: config.api.base_url});
```

## 3. Functions and Helper Boundaries

**Impact: HIGH**

함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진 자리에 둡니다. 이름은 무엇이 나오는지로 짓고, 값에 이름은 두 번 이상 쓸 때만 붙입니다.

### 3.1 Declare Functions as Arrow Consts

**Rule:** `T14` · `functions-declare-functions-as-arrow-consts`

**Applies when:** 이름 붙인 함수를 새로 만들거나 선언 형태를 바꿀 때. 제외: 클래스 메서드, 제너레이터, 오버로드 선언, 객체 리터럴 메서드인 경우.

**Review with:** `functions-use-named-object-params-for-complex-signatures`

**Impact: MEDIUM (선언 형태가 한 가지로 고정되어 호이스팅에 기대는 순서 의존이 생기지 않습니다)**

이름 붙인 함수는 `const`에 화살표 함수를 담아 선언합니다.
`function` 선언문은 쓰지 않습니다.

- 한 파일 안에서 두 형태를 섞으면 어느 것이 공개 계약인지 형태로 구분할 수 없습니다.
- `function` 선언문은 호이스팅되므로 선언보다 위에서 호출해도 동작합니다.
  그러면 읽는 순서와 실행 순서가 달라집니다.

네 자리는 예외로 둡니다.

| 예외 | 이유 |
| --- | --- |
| 클래스 메서드 | 메서드 문법을 그대로 씁니다. 화살표 필드로 바꾸지 않습니다 |
| 제너레이터 | `function*` 없이 쓸 수 없습니다 |
| 오버로드 선언 | 시그니처를 겹쳐 쓰는 선언 문법은 `const`로 옮길 수 없습니다 |
| 객체 리터럴 메서드 | `util.date.toIsoString(value)`처럼 네임스페이스 안 멤버는 메서드 문법을 씁니다 |

오버로드 **선언 문법**(`function` 시그니처를 겹쳐 쓰는 형태)은 `const`로 쓸 수 없습니다.
호출 시그니처를 모은 타입을 `const`에 붙이는 형태를 쓸 수 있으면 그쪽을 씁니다.

**Incorrect (`function` 선언문과 화살표를 한 파일에서 섞음):**

```ts
export function toTrimmedTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}

export const toProductSlug = (title: string): string => toTrimmedTitle(title).toLowerCase();
```

**Incorrect (쓰는 곳이 선언보다 위에 와서 읽는 순서가 어긋남):**

```ts
export const toProductLabel = (product: Product): string => decorate(product.title);

function decorate(title: string): string {
	return `# ${title}`;
}
```

**Correct (모두 `const` 화살표로 선언하고 쓰기 전에 선언):**

```ts
const decorate = (title: string): string => `# ${title}`;

export const toTrimmedTitle = (rawTitle: string): string => rawTitle.trim().replace(/\s+/g, " ");

export const toProductSlug = (title: string): string => toTrimmedTitle(title).toLowerCase();

export const toProductLabel = (product: Product): string => decorate(product.title);
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

**Rule:** `T15` · `functions-use-named-object-params-for-complex-signatures`

**Applies when:** 매개변수가 3개를 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수를 어디서 구조분해할지 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받고 구조분해하는 방식만 바꾸는 경우.

**Review with:** `types-reuse-existing-contracts-before-new-types`

**Impact: HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 3개를 넘거나 같은 계열 값이 함께 넘어오면 위치 인자를 객체 하나로 묶습니다.
시그니처 자리에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언하고, 함수 본문 첫 줄에서 구조분해합니다.
구조분해 줄이 길어 `biome-ignore`가 필요해도 함수 본문 안에서 처리합니다.
그 주석에 무엇을 근거로 적을지는 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다.
구조분해 방식과 프롭스 타입 선언 위치는 프레임워크 컨벤션이 담당합니다.

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

**Correct (객체 전체를 받고 본문에서 구조분해):**

```ts
/**
 * 요청 URL 조립. searchParams 는 set 으로 넣어 baseUrl 에 있던 같은 키를 덮는다.
 *
 * 입력 계약은 shared/api/type.ts 의 ApiRequestTarget 을 그대로 쓴다
 */
const toRequestUrl = (target: ApiRequestTarget): URL => {
	const {baseUrl, resourcePath, searchParams} = target;
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

### 3.3 Extract Support Functions Only When the Boundary Is Real

**Rule:** `T16` · `functions-extract-helpers-only-when-the-boundary-is-real`

**Applies when:** 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`, `functions-place-and-promote-support-functions`

**Impact: HIGH (흐름을 읽으려고 파일을 왕복하게 만드는 조각내기를 막습니다)**

기본은 빼지 않는 것입니다.
흐름은 한 자리에서 위에서 아래로 읽히는 편이 낫습니다.
빼는 사유는 둘뿐입니다.
둘 중 하나에 해당해야 뺍니다.

| 사유 | 조건 |
| --- | --- |
| 재사용 | **이 변경을 적용한 뒤의 트리**에서 서로 다른 파일 둘 이상이 실제로 부릅니다. 호출부 추가가 예정만 되어 있으면 세지 않습니다 |
| 렌더 파일 밖으로 | `.tsx` 안의 **요청·저장 payload 조립** 함수입니다. 훅·JSX·컴포넌트 상태를 하나도 쓰지 않으면 호출부가 하나여도 `.ts`로 옮깁니다 |

두 번째 사유는 재사용이 아니라 `.tsx`에 렌더가 아닌 코드를 남기지 않으려는 것입니다.
`.ts` 안에서는 해당하지 않습니다.
옮길 자리는 같은 소유자 폴더의 `.ts`입니다.
어느 하위 폴더인지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
**표시용 가공은 여기 들지 않습니다.** 목록을 화면 모양으로 바꾸거나 문자열을 조립하는 것은
쓰는 자리에 그대로 둡니다.
밖으로 내는 것은 서버로 보낼 값을 만드는 함수뿐입니다.

어느 사유든 그 함수만 따로 읽어도 뜻이 통해야 합니다.
바깥 변수, 훅, 컴포넌트 상태에 기대면 아직 뺄 수 없습니다.

**`.ts` 안에서 같은 파일만 쓰는 함수는 몇 번 반복되든 다른 파일로 빼지 않습니다.**
이 규칙은 파일 경계만 봅니다.
같은 파일 안에서 비공개 함수로 단계를 나누는 것은 대상이 아닙니다.
같은 계산을 두세 번 적어도 괜찮습니다.
파일을 하나 더 여는 쪽이 더 비쌉니다.
"나중에 또 쓸 것 같아서"는 사유가 아닙니다.
그때 가서 뺍니다.

사유와 무관하게 빼지 않는 것:

- 본문이 한 줄인 계산
- `.map()` 콜백 하나에만 쓰이는 변환
- 선택 값 보정, 라벨 기본값 같은 자잘한 정리 단계

뺀 다음 어디 두고 언제 공용으로 올릴지는
`functions-place-and-promote-support-functions`가 정합니다.

**Incorrect (한 번만 쓰는 한 줄 계산을 파일로 분리):**

```ts
// page/profile/function/get-next-iteration.ts
export const getNextIteration = (iteration: number): number => iteration + 1;
```

**Incorrect (네임스페이스 메서드 하나 때문에 변환 함수를 쪼갬):**

```ts
const toLabelText = (label: Label) => label.name.trim() || label.code;

const toProductView = (record: RecordItem): ProductView => {
	return {
		id: record.id,
		labels: record.labels.map(toLabelText),
	};
};

export const api = {
	record: {
		toProductView(record: RecordItem): ProductView {
			return toProductView(record);
		},
	},
};
```

**Correct (작은 계산은 쓰는 자리에 그대로 둠):**

```tsx
// page/profile/pg-profile.tsx
const handleNextClick = () => {
	setIteration(iteration + 1);
};
```

**Correct (단일 소유자 네임스페이스의 단계는 메서드 본문에 둠):**

```ts
export const api = {
	record: {
		toProductView(record: RecordItem): ProductView {
			return {
				id: record.id,
				labels: record.labels.map((label) => label.name.trim() || label.code),
			};
		},
	},
};
```

**Correct (서로 다른 파일 둘이 이미 부르는 순수 함수를 뺌):**

```ts
// page/profile/function/to-profile-save-request.ts
/**
 * profile 저장 payload 조립. 서버가 앞뒤 공백이 붙은 displayName 을 거부한다
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

**Correct (`.tsx` 안의 순수 조립 함수는 호출부가 하나여도 형제 `.ts`로 냄):**

```ts
// page/products/function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 업로드가 끝난 첨부만 넘겨야 attachmentIds 가 채워진다
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

### 3.4 Place and Promote Support Functions Deliberately

**Rule:** `T17` · `functions-place-and-promote-support-functions`

**Applies when:** 보조 함수를 둘 파일이나 폴더를 정할 때. `shared/` 아래로 파일을 옮기거나 `util.*`에 항목을 추가할 때.

**Requires selected:** `functions-extract-helpers-only-when-the-boundary-is-real` · 함께 적용

**Impact: HIGH (잡동사니 파일이 생기지 않고 공용 승격이 실제 사용처를 근거로 일어납니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`가 먼저 판정합니다.
이 규칙은 그 결과를 어디 두고 언제 올릴지만 봅니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 skill의 역할 폴더 규칙이 정합니다.
- 소유자 아래에서는 대표 내보낸 함수 하나당 파일 하나입니다.
  전역 `shared/util.ts`는 여러 소유자가 함께 쓰는 순수 함수를 모으는 자리라 예외입니다.
- 호출 깊이는 소유자에서 내보낸 함수, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
  단계를 나누고 싶으면 내보내지 말고 한 함수 본문 안에 지역 변수로 둡니다.
- 공용 승격은 **두 소유자 이상이 이미 직접 호출할 때만** 합니다.
  그때 `shared/util.ts`의 `util.*`로 올립니다.
  나중에 쓸 것 같아서 올리지 않습니다.

**Incorrect (잡동사니 파일과 내보낸 함수 세 단계 사슬):**

```ts
// utils.ts
export const toTrimmedTitle = (title: string) => title.trim();

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

**Correct (소유자 아래 대표 함수 하나당 파일 하나):**

```ts
// page/product-form/function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title 을 거부한다
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Correct (두 소유자가 이미 쓰는 순수 함수만 공용으로 올림):**

```ts
// shared/util.ts
export const util = {
	date: {
		/**
		 * ko-KR 로 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
		 */
		toDisplayDate(value: string): string {
			return new Date(value).toLocaleDateString("ko-KR");
		},
	},
} as const;
```

### 3.5 Avoid Imperative Assembly in Wide Scopes

**Rule:** `T18` · `functions-avoid-imperative-assembly-in-wide-scopes`

**Applies when:** 모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 만들 때.

**Review with:** `functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: HIGH (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.
한 번만 쓰면 실제 쓰는 좁은 스코프에서 바로 계산합니다.
조건이 둘 이상이면 삼항을 겹치지 않고 조건부 스프레드나 `filter`로 한 번에 조립합니다.
분기와 보정이 얽혀 좁은 스코프에 담기지 않으면 떼어 낼지를 다시 봅니다.
그 판정은 `functions-extract-helpers-only-when-the-boundary-is-real`가 합니다.
떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`가 정하고,
중간값에 이름을 붙일지는 `functions-name-a-value-only-when-it-is-reused`가 정합니다.

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

### 3.6 Name a Value Only When It Is Reused

**Rule:** `T19` · `functions-name-a-value-only-when-it-is-reused`

**Applies when:** 순수 계산의 결과를 지역 `const`로 받는 줄을 추가·삭제할 때. 식을 그 자리에 적을지 이름을 붙일지 정할 때.

**Review with:** `functions-avoid-imperative-assembly-in-wide-scopes`

**Impact: HIGH (한 번 쓸 값에 이름을 붙이지 않아 식의 출처가 쓰는 자리에 그대로 남습니다)**

부수효과 없는 순수 식의 결과를 **한 번만 쓰면 이름을 붙이지 않고 그 자리에 적습니다.**
두 번 이상 쓰면 그 자리들을 모두 감싸는 가장 좁은 스코프에 `const`로 둡니다.

이름을 붙이는 순간 읽는 사람은 그 값이 어디서 왔는지 확인하러 위로 올라가야 합니다.
한 번 쓸 값이면 올라갈 이유가 없게 그 자리에 적는 편이 낫습니다.

대상은 순수 식의 결과뿐입니다.
아래는 이름을 붙이는 것이 문법이거나 순서가 뜻을 갖는 자리라 해당하지 않습니다.

| 대상이 아닌 것 | 이유 |
| --- | --- |
| **콜백이나 반복문 안으로 들어가는 값** | 코드에 한 번 적혀 있어도 실행은 원소마다 한 번씩입니다 |
| 훅 호출과 `useState` 반환 | 부르는 자리와 횟수가 정해져 있습니다 |
| `await`나 `yield`가 붙은 값 | 실행 순서가 뜻을 갖습니다 |
| 바깥과 주고받는 호출 (`init()`, `localStorage.getItem()`) | 옮기면 부르는 시점이 달라집니다 |
| 함수 값에 붙인 이름 | 이름이 곧 계약입니다 |

**코드에 한 번 적힌 것과 실행에서 한 번인 것은 다릅니다.**
`.map()`이나 `.filter()` 콜백 안, 반복문 안으로 옮기면 원소 수만큼 다시 계산합니다.
그런 값은 콜백 밖에 이름을 붙여 둡니다.
`values-use-set-and-map-for-repeated-lookups`가 만드는 `Set`도 같은 이유로 밖에 둡니다.

`let` 재할당과 배열 `push` 누적은 `functions-avoid-imperative-assembly-in-wide-scopes`가 봅니다.

**Incorrect (한 번 쓸 값에 이름을 붙임):**

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

**Correct (그 자리에 적음):**

```ts
const toNextIteration = (iteration: number): number => {
	return iteration + 1;
};

const toRowLabel = (row: Row): string => {
	return `${row.title} (${row.id})`;
};
```

**Correct (두 번 이상 쓰므로 이름을 붙임):**

```ts
const toRowClassNames = (row: Row): string[] => {
	const isOverdue = row.dueDate < today;

	return [
		isOverdue ? "ui_row__root--overdue" : "ui_row__root",
		isOverdue ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Correct (콜백 밖이라 이름을 붙여 둠):**

```ts
const filterVisibleRows = (rows: Row[], keyword: string): Row[] => {
	// 콜백 안으로 옮기면 행마다 다시 계산한다
	const normalizedKeyword = keyword.trim().toLowerCase();

	return rows.filter((row) => row.title.toLowerCase().includes(normalizedKeyword));
};
```

**Correct (바깥과 주고받는 호출이라 대상이 아님):**

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

**Rule:** `T20` · `functions-name-functions-by-what-comes-out`

**Applies when:** 이름 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 외부 패키지가 정한 이름을 별칭 없이 그대로 쓰는 경우.

**Impact: MEDIUM-HIGH (이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다)**

`build`, `create`, `normalize`, `resolve`, `process`는 서로 바꿔 써도 뜻이 안 변합니다.
그런 동사는 이름 자리를 차지하면서 아무것도 알려 주지 않습니다.
아래 금지 목록이 그런 동사를 모아 둔 것입니다.

**형태를 바꾸는 함수는 `to<나오는 것>`으로 짓습니다.**
반환 타입을 이름이 말해 주므로 구현을 열지 않아도 됩니다.

| 하는 일 | 이름 |
| --- | --- |
| 형태를 바꾼다 | `to<결과>` |
| 이미 있는 값을 꺼낸다 | `get<대상>` |
| 찾는데 없을 수 있다 | `find<대상>` |
| 참·거짓을 답한다 | `is<상태>`, `has<대상>`, `can<동작>` |
| 걸러 낸다 | `filter<대상>` |
| 정렬한다 | `sort<대상>` |
| 서버를 부른다 | `fetch<대상>`, `save<대상>`, `remove<대상>` |

표에 없는 도메인 동작은 그 동작의 이름을 그대로 씁니다.
`submitOrder`, `cancelBooking`처럼 씁니다.
표는 자주 나오는 갈래를 못 박은 것이고, 아래 금지 목록만 예외 없이 지킵니다.

**이름의 첫 동사만 봅니다.** `isCheckedRow`나 `handleCheckAll`처럼 뒤에 섞인 낱말은 대상이 아닙니다.

첫 동사로 쓰지 않는 것입니다.
이름이 무엇이 나오는지 알려 주지 않습니다.

`build`, `create`, `make`, `normalize`, `resolve`, `process`, `manage`, `do`, `perform`, `execute`

- `update<대상>`은 무엇이 어떻게 바뀌는지 알 수 없어 쓰지 않습니다.
  `save<대상>`이나 `to<결과>`로 나눠 적습니다.
- `handle`은 이벤트 핸들러 이름에만 씁니다.
  리액트 규칙이 그 형태를 따로 정합니다.
- 프레임워크가 이름을 정해 둔 자리는 대상이 아닙니다.
  규격이 요구하는 메서드 이름은 금지 목록에 있어도 그대로 씁니다.
- `new Promise((resolve, reject) => …)`의 매개변수처럼 언어 관용구가 정한 이름도 대상이 아닙니다.
- 외부 패키지가 `createClient`처럼 지어 둔 이름은 그대로 씁니다.
  우리가 짓는 이름만 봅니다.

**Incorrect (동사가 결과를 안 알려 줌):**

```ts
export const buildUserPayload = (formValues: UserFormValues) => { /* … */ };
export const normalizeUserValues = (formValues: UserFormValues) => { /* … */ };
export const resolveUserLabel = (user: User) => { /* … */ };
export const processUserRows = (rows: UserRow[]) => { /* … */ };
```

**Correct (이름이 결과를 말함):**

```ts
/**
 * 사용자 저장 요청 조립. 서버가 빈 문자열을 거부해 비운 칸은 넣지 않는다
 */
export const toUserSaveRequest = (formValues: UserFormValues) => { /* … */ };

/**
 * 목록에 표시할 사용자 이름을 만든다. 표시 이름이 비면 이메일 앞부분을 쓴다
 */
export const toUserDisplayName = (user: User) => { /* … */ };

/**
 * 비활성 사용자를 뺀 목록
 */
export const filterActiveUsers = (rows: UserRow[]) => { /* … */ };

/**
 * 관리자 권한 판정. 역할 목록이 비어 있으면 조회가 끝나지 않은 상태라 false 다
 */
export const isAdminUser = (user: User) => { /* … */ };
```

## 4. Values and Data Structures

**Impact: HIGH**

값을 다루는 관용구를 한 가지로 고정합니다. 내가 만들지 않은 배열은 제자리에서 바꾸지 않고, 반복되는 조회는 `Set`과 `Map`으로 드러냅니다.

### 4.1 Prefer Immutable Array Sorting

**Rule:** `T21` · `values-prefer-immutable-array-sorting`

**Applies when:** 프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.

**Impact: MEDIUM (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

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

**Rule:** `T22` · `values-use-set-and-map-for-repeated-lookups`

**Applies when:** 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.

**Impact: MEDIUM (조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다)**

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

## 5. Absence and Fallback Handling

**Impact: HIGH**

값이 없을 수 있는 상태를 다루는 규칙을 모읍니다. 기본값으로 덮어 감추지 않고 없다는 사실을 호출부까지 남깁니다.

### 5.1 Expose Optional Values Instead of Silent Fallbacks

**Rule:** `T23` · `absence-expose-optional-values-instead-of-silent-fallbacks`

**Applies when:** 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.

**Review with:** `naming-centralize-shared-config-namespaces`, `naming-place-owner-config-in-the-owner-config-folder`

**Impact: HIGH (그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다)**

**`??`와 `||` 오른쪽에 리터럴을 적지 않고 이미 선언된 이름만 가리킵니다.**

| 형태 | 판정 |
| --- | --- |
| `?? "help@example.com"`, `?? 0`, `?? []`, `\|\| "-"` 같은 리터럴 | 위반 |
| `?? config.pagination.default_page_size`처럼 설정에 선언된 이름 | 통과 |
| 같은 파일 지역 `const`로 리터럴만 옮긴 것 | 위반. 자리만 바꾼 것입니다 |
| 기본 매개변수나 구조분해 기본값에 **리터럴**을 적은 것. `(size = 10) =>`, `{size = 10}` | 위반 |
| 기본 매개변수가 선언된 이름을 가리키는 것. `(size = config.pagination.default_page_size) =>` | 통과 |
| 삼항 `value ? value : "-"`, `String(value ?? "")` | 위반 |

기본값이 정말 필요하면 그 기본값에 이름을 붙여 선언하고 그 이름을 가리킵니다.
여러 소유자가 쓰면 `naming-centralize-shared-config-namespaces`,
한 소유자만 쓰면 `naming-place-owner-config-in-the-owner-config-folder`가 자리를 정합니다.
같은 파일 위쪽에 `const supportEmailFallback = "help@example.com";`을 두는 것으로는 통과하지 못합니다.
설정에 선언된 이름이어야 합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

빈 배열도 리터럴입니다.
`items ?? []` 대신 `items?.map(…)`으로 값이 없는 상태를 그대로 다룹니다.
선택 값을 그대로 비교하면 기본값이 아예 필요 없는 경우가 많습니다.

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

**Correct (선언된 기본값을 가리킴):**

```ts
const pageSize = query.pageSize ?? config.pagination.default_page_size;
```

**Correct (그대로 비교하면 기본값이 필요 없음):**

```ts
const isCompact = variant === "compact";
const productIds = response.data.rows?.map((row) => row.id);
```

## 6. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

함수 본문 안 주석은 의도와 긴 절차의 단계를 적고 코드를 옮겨 적지 않습니다. 선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 따로 정해져 있습니다. 본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

### 6.1 Keep Body Comments for Intent and Steps

**Rule:** `T24` · `docs-keep-body-comments-for-intent-and-steps`

**Applies when:** 함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때.

**Review with:** `docs-justify-convention-exceptions-with-a-reason-comment`, `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

본문 안에서 코드 한 줄이나 절차의 단계를 설명할 때는 `//`만 씁니다.
블록 주석을 쓰지 않습니다.
본문 안이라도 `docs-require-header-jsdoc-on-key-declarations`가 지목한 선언 위에는 블록을 씁니다.
컴포넌트 본문의 핸들러, 이펙트, 쿼리 바인딩이 그 자리입니다.
그 밖의 지역 선언에는 블록을 쓰지 않습니다.
블록의 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.

본문 주석은 이런 자리에 답니다.

- 도메인 규칙
- 예외를 막은 의도
- 외부 라이브러리나 API의 제약
- 부수효과의 순서
- **긴 절차의 단계 구분.** 흐름을 쪼개지 않고 한 자리에 두기로 한 함수일수록 단계 표시가 필요합니다

주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
규칙이 허용한 예외의 이유를 남기는 주석은
`docs-justify-convention-exceptions-with-a-reason-comment`가 따로 정합니다.
이 규칙은 본문 안 어디에 다는지만 봅니다.

**Incorrect (본문 안 지역 선언에 블록 주석을 씀):**

```ts
const filterProducts = (products: Product[], keyword: string) => {
	/**
	 * keyword를 소문자로 바꾼다.
	 */
	const normalizedKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(normalizedKeyword));
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

**Rule:** `T25` · `docs-require-header-jsdoc-on-key-declarations`

**Applies when:** 쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 커스텀 타입, 스토어, 포매터 선언을 추가·변경할 때. 분기나 `await`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때. 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: MEDIUM-HIGH (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

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

**Rule:** `T26` · `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Applies when:** TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때. 문서 주석에 태그를 붙이거나 뺄 때.

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 쓰고 목적, 제약, 부수효과를 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

글자 수 제한은 두지 않지만 새 정보가 없는 문장은 쓰지 않습니다.
내용이 한 문장으로 통하면 한 문장으로 쓰고, 읽는 사람이 배경을 알아야 하면 여러 문장으로 씁니다.
기준은 길이가 아니라 그 주석을 읽고 이해되는지입니다.
문장이 몇 개든 형식은 언제나 여러 줄 블록이고 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.

쓰지 않는 것:

- 선언 이름의 낱말을 한국어로 바꿔 적기만 하고 새 정보가 없는 문장.
  `sortRuleRefs`에 `/** 규칙 참조를 정렬 */`이 그 경우입니다
- 코드를 한 줄씩 따라 읽으며 옮겨 적은 문장
- 설명 없이 `@param`·`@returns`만 나열한 주석

태그를 붙일지도 내용 판단이라 여기서 정합니다.

- 선언이 무엇인지는 이름과 문법이 이미 드러내므로 태그로 다시 적지 않습니다.
- `@api`·`@helper`·`@field` 같은 역할 태그를 붙이지 않습니다.
- `@schema`처럼 규격에 없는 태그를 새로 만들지 않습니다.
- `@summary`는 헤더 첫 줄이 이미 하는 일이라 쓰지 않습니다.
- `@deprecated`·`@example`·`@param`·`@returns`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.
- 역할 태그는 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다.

기술 용어와 식별자는 영어로 섞어도 됩니다.
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
 * route-local 제품 트리 입력 계약
 */
export interface PgProductTreeProps {
	/**
	 * 사이드바에 그릴 분류 노드 목록
	 */
	categoryNodes: ProductCategoryNode[];
}
```

### 6.4 Write Doc Comments as Multiline Blocks

**Rule:** `T27` · `docs-write-doc-comments-as-multiline-blocks`

**Applies when:** 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 `/** … */`이나 `//`로 선언을 설명하려 할 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`

**Impact: MEDIUM (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나눕니다.

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

**Rule:** `T28` · `docs-justify-convention-exceptions-with-a-reason-comment`

**Applies when:** 규칙이 허용한 예외를 코드에 남길 때. 이미 있는 예외 주석의 내용을 바꿀 때. 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우.

**Review with:** `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Impact: MEDIUM-HIGH (예외가 취향인지 근거가 있는 것인지 코드에서 바로 갈립니다)**

여러 규칙이 예외를 허용하면서 "이유를 주석으로 남긴다"를 조건으로 답니다.
그 주석의 기준을 여기서 한 번만 정합니다.

이유 주석은 **다른 사람이 확인할 수 있는 것**을 가리켜야 합니다.

| 확인할 수 있는 근거 | 예 |
| --- | --- |
| 외부 패키지와 그 제약 | 어떤 라이브러리의 어떤 API가 무엇을 요구하는지 |
| 측정 결과 | 무엇을 재서 얼마가 나왔는지 |
| 제품 명세나 티켓 | 결정이 적힌 곳 |
| 설정 키 | `config.*` 경로 |

"성능을 위해", "안전하게", "필요해서"처럼 다시 확인할 수 없는 말은 근거가 아닙니다.
그런 주석은 예외 조건을 채우지 못합니다.

주석은 예외가 일어나는 줄 바로 위에 `//`로 씁니다.
형식과 어투는 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

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

**Rule:** `T29` · `tooling-configure-biome-to-enforce-these-rules`

**Applies when:** 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json`의 `linter.rules`에 항목을 추가·삭제할 때.

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다.
`biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/useImportType` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `style/noRestrictedImports` | `typescript/naming-restrict-absolute-aliases-to-layer-roots`의 경로 표 |
| `style/useNamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 심볼 표기 |
| `style/useFilenamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 파일명 |
| `style/noParameterAssign` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| `style/useConst` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| `correctness/noUnusedFunctionParameters` | `typescript/types-mark-unused-parameters-with-underscore` |
| `performance/noNamespaceImport` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `suspicious/noExplicitAny` | `typescript/types-narrow-unknown-instead-of-asserting` |
| `style/noNonNullAssertion` | `typescript/types-narrow-unknown-instead-of-asserting` |

`style/useConst`는 `biome` 2.2.4의 `recommended`에 이미 있어 설정에 다시 적어도 켜지는 것이 달라지지 않습니다.
어느 컨벤션을 대신하는지 보이게 하려고 표와 설정에 남겨 둡니다.

도구가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- 선언형 설정과 `enum` 성격 상수 객체에만 `snake_case`를 쓰는 구분은 `useNamingConvention`으로 표현할 수 없습니다.
  모듈 최상위 `const`와 객체 리터럴 키에 표기를 다 허용해 두고, 어느 쪽이 맞는지는 사람이 봅니다.
  `objectLiteralProperty`를 좁히면 규범이 요구하는 형태가 막힙니다.
  `snake_case`를 빼면 `config.pagination.default_page_size`가, `PascalCase`를 빼면
  합성 컴포넌트의 `{Root, Header, Footer}`가 걸립니다.
  설정 객체에 타입을 붙이면 키가 `typeProperty`로도 검사되므로 그쪽에도 `snake_case`를 허용합니다.
  `typescript/functions-declare-functions-as-arrow-consts` 때문에 이름 붙인 함수도 이 항목에 들어가므로
  함수 이름의 `camelCase`도 도구가 아니라 리뷰가 봅니다.
- 폴더명 `kebab-case` 단수는 어떤 `biome` 규칙도 보지 않습니다.
  `useFilenamingConvention`도 파일명만 보고 폴더명은 보지 않습니다.
  리뷰가 봅니다.
- 지역 변수의 `camelCase`도 끝까지 못 갑니다.
  `variable` 선택자에 `PascalCase`를 함께 허용해 컴포넌트 지역 선언을 통과시키기 때문입니다.
- `as` 단언과 `@ts-expect-error`는 `biome`이 막지 않습니다.
  `typescript/types-narrow-unknown-instead-of-asserting` 중 그 둘은 리뷰가 봅니다.
- `typescript/functions-declare-functions-as-arrow-consts` 자체는 `biome`에 대응 규칙이 없습니다.
- `typescript/functions-avoid-imperative-assembly-in-wide-scopes`는 `useConst`로 다 잡히지 않습니다.
  `let`을 `const`로 바꿔 주기만 하고 `push` 누적은 그대로 남습니다.
- `typescript/types-mark-unused-parameters-with-underscore` 중 **매개변수를 아예 생략한 경우**는 도구가 못 봅니다.
  `noUnusedFunctionParameters`는 남겨 둔 매개변수만 봅니다.

따로 켜지 않는 규칙이 하나 있습니다.
`style/useFragmentSyntax`는 JSX 조각을 `<>`로 바꾸라고 합니다.
`recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
프레임워크 컨벤션이 `<Fragment>`를 쓰라고 정하기 때문입니다.

**Incorrect (`recommended`만 켜고 컨벤션 항목을 리뷰에 맡김):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"recommended": true}
	}
}
```

**Correct (컨벤션 항목을 설정으로 고정):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"correctness": {"noUnusedFunctionParameters": "error"},
			"suspicious": {"noExplicitAny": "error"},
			"performance": {"noNamespaceImport": "error"},
			"style": {
				"noEnum": "error",
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
							{"selector": {"kind": "typeProperty"}, "formats": ["camelCase", "snake_case"]},
							{"selector": {"kind": "variable"}, "formats": ["camelCase", "PascalCase"]}
						]
					}
				}
			}
		}
	}
}
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
