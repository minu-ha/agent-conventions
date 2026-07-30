# TypeScript 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=typescript`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 TypeScript 코딩 컨벤션입니다. 명시적인 네이밍, 직접 import, 재사용 가능한 타입 계약, 절제된 helper 추출, 반복 lookup과 정렬의 불변성, 의도적인 결측값 처리, 일관된 JSDoc 경계를 강조합니다. React, NestJS, TanStack Route, Playwright Test 같은 TypeScript 기반 skill이 공통으로 함께 따르는 규칙 세트이기도 합니다. `rules/` 아래 rule 파일이 source of truth입니다.

---

## 목차

1. [Naming and Module Boundaries](#1-naming-and-module-boundaries) — **HIGH**
    - 1.1 [Centralize Shared Config Under `shared/config.ts`](#11-centralize-shared-config-under-shared-config-ts)
    - 1.2 [Preserve Shared Namespace Origin With Chained Access](#12-preserve-shared-namespace-origin-with-chained-access)
    - 1.3 [Use Consistent File, Symbol, and Field Naming](#13-use-consistent-file-symbol-and-field-naming)
    - 1.4 [Use Direct Imports and Dedicated Public Entry Points](#14-use-direct-imports-and-dedicated-public-entry-points)
2. [Types and Contracts](#2-types-and-contracts) — **CRITICAL**
    - 2.1 [Document Custom Types and Declarative Shapes](#21-document-custom-types-and-declarative-shapes)
    - 2.2 [Mark Unused Parameters With an Underscore Prefix](#22-mark-unused-parameters-with-an-underscore-prefix)
    - 2.3 [Prefer Function Variable Types Over Parameter Annotations](#23-prefer-function-variable-types-over-parameter-annotations)
    - 2.4 [Reuse Callback Signatures From Existing Contracts](#24-reuse-callback-signatures-from-existing-contracts)
    - 2.5 [Reuse Existing Contracts Before Declaring New Types](#25-reuse-existing-contracts-before-declaring-new-types)
3. [Functions and Helper Boundaries](#3-functions-and-helper-boundaries) — **HIGH**
    - 3.1 [Avoid Imperative Assembly in Wide Scopes](#31-avoid-imperative-assembly-in-wide-scopes)
    - 3.2 [Extract Support Functions Only When the Boundary Is Real](#32-extract-support-functions-only-when-the-boundary-is-real)
    - 3.3 [Prefer Immutable Array Sorting](#33-prefer-immutable-array-sorting)
    - 3.4 [Replace `enum` With `as const` Objects](#34-replace-enum-with-as-const-objects)
    - 3.5 [Use Named Object Params for Complex Signatures](#35-use-named-object-params-for-complex-signatures)
    - 3.6 [Use Set and Map for Repeated Lookups](#36-use-set-and-map-for-repeated-lookups)
4. [Absence and Fallback Handling](#4-absence-and-fallback-handling) — **HIGH**
    - 4.1 [Expose Optional Values Instead of Silent Fallbacks](#41-expose-optional-values-instead-of-silent-fallbacks)
5. [JSDoc and Comment Conventions](#5-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
    - 5.1 [Keep Inline Comments for Constraints and Caveats Only](#51-keep-inline-comments-for-constraints-and-caveats-only)
    - 5.2 [Require Header JSDoc on Key Declarations](#52-require-header-jsdoc-on-key-declarations)
    - 5.3 [Standardize Annotation Tags by Declaration Role](#53-standardize-annotation-tags-by-declaration-role)
    - 5.4 [Use `@helper` on Reusable Support Functions](#54-use-helper-on-reusable-support-functions)
    - 5.5 [Write Concise Korean Comments About Purpose and Constraints](#55-write-concise-korean-comments-about-purpose-and-constraints)
6. [Guardrails and Review Checks](#6-guardrails-and-review-checks) — **MEDIUM**
    - 6.1 [Review Banned TypeScript Shortcuts Before Finishing](#61-review-banned-typescript-shortcuts-before-finishing)

---

## 1. Naming and Module Boundaries

**Impact: HIGH**

식별자, import, public entry point, config 접근 패턴은 소유권과 오리진을 바로 드러내야 합니다.

### 1.1 Centralize Shared Config Under `shared/config.ts`

**Rule:** `T01` · `naming-centralize-shared-config-namespaces`

**Applies when:** 여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의하거나 shared config 경계를 바꾼다.

**Review with:** `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (공용 설정 값이 leaf 파일로 흩어져 공개 출처 하나를 잃는 것을 막음)**

여러 파일에서 공유되는 설정과 상수는 기본적으로 `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` namespace
아래에 모읍니다.
leaf 파일마다 공용 URL, feature flag, 페이지 크기, 상수 문자열을 흩뿌리지 말고,
`config.*` 체이닝으로 읽을 수 있게 정리합니다.
수가 많지 않을 때는 `config/` 폴더로 미리 쪼개지 말고 단일 `config.ts`를 유지하고,
여러 독립 섹션으로 커졌을 때만 분리를 검토합니다.

**Incorrect (공용 설정을 leaf 파일마다 흩뿌림):**

```ts
const defaultPageSize = 20;
const billing_feature_keys = ["invoices", "refunds"];
```

**Correct (공용 설정은 `shared/config.ts` namespace에서 읽음):**

```ts
import {config} from "@/shared/config";

config.api.public_base_url;
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
```

### 1.2 Preserve Shared Namespace Origin With Chained Access

**Rule:** `T02` · `naming-preserve-config-origin-with-chained-access`

**Applies when:** `config` 또는 `util` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경한다.

**Impact: HIGH (넓은 스코프 별칭으로 출처를 숨기지 않고 값이 어디서 오는지 읽는 사람이 알게 함)**

공용 설정과 공용 순수 함수는 leaf 모듈 직접 import 뒤에 `config.*`, `util.*` 체이닝 접근을 기본으로 합니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 원본 오리진을 흐리지 말고,
필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 사용합니다.
특히 `shared/config.ts`와 `shared/util.ts`는 발견성을 위해 namespace를 유지하고,
feature-local `helper.ts`나 `utils.ts` 대신 공용 경계에서만 `config`/`util` 이름을 사용합니다.

**Incorrect (넓은 스코프에서 원본 오리진을 감춤):**

```ts
const {api, features} = config;
const {date} = util;
const billingBaseUrl = api.billing_base_url;
const enableRefunds = features.enable_refunds;
const normalizedDate = date.normalize(createdAt);
```

**Correct (체이닝으로 출처를 유지):**

```ts
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
config.env.sentry_dsn;
util.date.normalize(createdAt);
util.number.clamp(score, 0, 100);
```

### 1.3 Use Consistent File, Symbol, and Field Naming

**Rule:** `T03` · `naming-use-consistent-file-and-symbol-naming`

**Applies when:** TypeScript 파일, local 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꾼다. alias 없는 third-party import binding 추가는 제외한다.

**Impact: HIGH (모듈과 런타임 구조를 넘나들며 파일명·심볼·shape 필드를 예측 가능하게 유지함)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다.
`const`인지 여부로 별도 casing을 두지 않고, 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.
공용 설정 객체 키와 enum-like 상수 객체 이름 및 그 키는 `snake_case`, 일반 객체 키, schema 키,
커스텀 타입 필드는 `camelCase`를 유지합니다.
외부 package가 export한 이름을 alias 없이 그대로 가져오는 third-party import binding은 local symbol을 새로 작명하는
변경이 아니므로 이 규칙의 대상이 아닙니다.
local alias를 추가하거나 import binding 이름을 바꿀 때만 다시 판정합니다.

**Incorrect (파일명, 심볼명, 필드명이 제각각임):**

```ts
// userSettings.ts
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});
```

**Correct (형태별 네이밍 규칙을 일관되게 적용):**

```ts
// chat-state.ts
/**
 * @summary 사용자 프로필 스키마
 */
const userProfileSchema = z.object({
	/**
	 * @field 저장소 경로
	 */
	repoPath: z.string(),
});
```

### 1.4 Use Direct Imports and Dedicated Public Entry Points

**Rule:** `T04` · `naming-use-direct-imports-and-public-entry-points`

**Applies when:** TypeScript import/export, barrel, shared 공개 진입점·feature support module 경계를 추가·변경하거나 같은 module path의 value/type specifier를 추가·삭제·전환한다.

**Impact: HIGH (barrel 이나 모호한 재노출 계층에 기대지 않고 import 소유를 명시적으로 드러냄)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다.
공용 설정과 공용 순수 함수는 각각 `shared/config.ts`, `shared/util.ts` 같은 공개 진입점으로 모으고,
타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.
feature 전용 support code는 owner-named module처럼 소유자가 보이는 파일에서 named export를 직접 import합니다.

같은 module path를 계속 사용하더라도 import specifier의 value/type 구성이 추가·삭제·전환되면
import 계약 변경이므로 Selected입니다.
예를 들어 React value import에서 `useEffect`를 제거하거나 같은 `react` 경로에 handler type import를 추가하는 작업을
"module path가 같다"는 이유로 N/A 처리하지 않습니다.

**Incorrect (barrel과 혼합 import로 경계를 흐림):**

```ts
import {config, util, UserProfile} from "./index";
```

**Correct (직접 import와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/shared/contracts";
import {config} from "@/shared/config";
import {util} from "@/shared/util";
import {userProfileSchema} from "@/shared/schema";
import {buildUserSaveRequest} from "./user-profile-support";
```

## 2. Types and Contracts

**Impact: CRITICAL**

함수 시그니처, callback 재사용, 타입 중복 제거, custom shape 문서화는 계약을 명시적이고 재사용 가능하게 유지해야 합니다.

### 2.1 Document Custom Types and Declarative Shapes

**Rule:** `T05` · `types-document-custom-types-and-shapes`

**Applies when:** type·interface·schema root·객체 상수·계약 field·파생 alias를 추가·변경하거나 named shape에 callable 역할을 추가한다. 외부·generated·read-only·shared unchanged shape·익명 inferred 반환은 제외한다.

**Impact: CRITICAL (구현 세부를 파헤치지 않고도 도메인 전용 계약을 이해할 수 있게 함)**

선언형 shape는 헤더와 필드를 나눠 문서화합니다.

- custom `type`, `interface`, schema root, 객체형 상수: 헤더 `@summary`
- 객체형 계약과 schema field: 각 필드 바로 위 `@field`
- `Pick`/`Omit`/Indexed Access alias: 필드가 없으므로 헤더 `@summary`만 사용
- compound component public part props: React rule에 따라 `@part` + `@description` 허용

`@summary`와 `@field`는 태그 존재만으로 완료되지 않으며,
각 body가 `docs-write-concise-korean-comments-about-purpose-and-constraints`의 한국어 content gate를 만족해야 합니다.

기존 named shape의 field가 byte-equivalent여도,
positional 인자를 대체하는 새 callable input이나 함수 결과를 고정하는 output 계약 역할에 처음 연결되면
이 규칙은 Selected입니다.
선언의 새 계약 역할을 `@summary`와 각 `@field`로 설명합니다.
새 callable input 또는 output 역할은 새 type·interface 선언을 요구하지 않습니다.
호환되는 로컬 소유 named shape가 있으면 그대로 연결하고, 그 선언의 `@summary`와 `@field`를 새 역할에 맞게 보강합니다.

외부·generated·read-only·shared owner의 unchanged shape 사용만으로는 N/A입니다.
owner 선언은 수정하지 않고 문서화만을 위한 local alias도 만들지 않습니다.
callable 문서화 여부는 `docs-require-header-jsdoc-on-key-declarations` 등 docs rule의 applicability로만 판정합니다.

반대로 별도 named type·interface·schema root·객체형 상수 없이 구현 안에서만 추론되는 익명 객체 literal은 이 규칙의
선언형 shape가 아닙니다.
특히 query `select`의 익명 inferred 반환 literal은 N/A이며,
이 규칙을 스스로 활성화하려고 field JSDoc이나 새 type alias를 추가하지 않습니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씀):**

```ts
/**
 * @summary 게시 결과 요약
 * @field 게시 대상 문서 ID
 */
interface PublishResult {
	documentId: string;
	published: boolean;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 게시 결과 요약
 */
export interface PublishResult {
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: string;
	/**
	 * @field 게시 성공 여부
	 */
	published: boolean;
}

/**
 * @summary 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```

### 2.2 Mark Unused Parameters With an Underscore Prefix

**Rule:** `T06` · `types-mark-unused-parameters-with-underscore`

**Applies when:** 기존 callback·framework 계약 구현을 추가·변경하며 parameter를 생략하거나 사용하지 않는다. curried handler가 반환하는 최종 callback의 생략도 포함한다.

**Impact: MEDIUM-HIGH (계약의 일부를 조용히 버리지 않고 의도적으로 무시한 callback 매개변수를 드러냄)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

curried handler의 최종 callback을 포함해,
framework alias나 기존 callback 계약이 선언한 매개변수를 구현 함수에서 생략하는 경우도 Selected입니다.
`MouseEventHandler`를 반환하면서 event 매개변수를 쓰지 않는다면 매개변수 생략은 N/A 근거가 아니며,
`() =>` 대신 `_event`를 받는 `(_event) =>`로 계약을 보존합니다.

**Incorrect (계약의 일부인 callback 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 미사용 매개변수만 `_`로 표시):**

```ts
/**
 * @summary 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = (_message, _level) => {};
```

### 2.3 Prefer Function Variable Types Over Parameter Annotations

**Rule:** `T07` · `types-prefer-function-variable-types-over-parameter-annotations`

**Applies when:** 기존 callable 계약을 named·shared 함수 구현에 재사용하거나 같은 시그니처를 여러 구현이 공유하도록 바꾼다. annotation 없는 one-off contextually typed inline callback은 제외한다.

**Impact: CRITICAL (callable 계약을 재사용 가능하게 유지하고 지역 매개변수 annotation이 공용 함수 타입을 조각내는 것을 막음)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다.
이미 존재하는 interface, object contract, framework alias를 먼저 재사용하고,
동일 callable contract를 여러 구현이 공유할 때만 별도 함수 타입 alias를 선언합니다.
한 번만 쓰는 로컬 함수 때문에 함수 타입 alias를 늘리는 것은 지양합니다.

객체 literal 안에서 한 번만 쓰이고 매개변수·반환 타입 annotation이 없는 contextually typed inline callback은
named/shared 함수 구현 계약이 아니므로 N/A입니다.
예를 들어 `query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 별도 함수 타입으로 고정하지 않습니다.
반대로 named handler나 curried factory의 반환 handler를 기존 framework alias로 고정하는 변경은 Selected입니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (기존 계약이나 실제 공유되는 callable contract를 재사용해 함수 변수 타입을 고정):**

```ts
/**
 * @summary 사용자 formatter 계약
 */
interface UserFormatters {
	/**
	 * @field 상태 문자열 formatter
	 */
	formatState: (state: Record<string, unknown>) => string;
}

const formatState: UserFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
/**
 * @summary request 정규화 계약
 */
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};

const normalizeSearchRequest: NormalizeRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

### 2.4 Reuse Callback Signatures From Existing Contracts

**Rule:** `T08` · `types-reuse-callback-signatures-from-existing-contracts`

**Applies when:** interface·객체·framework의 named·shared callback 구현에서 기존 시그니처를 재사용·변경한다. annotation 없는 one-off contextually typed inline callback은 제외한다.

**Requires selected:** `types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

**Review with:** `types-mark-unused-parameters-with-underscore`

**Impact: HIGH (기존 interface나 객체 계약이 이미 정의한 callback 시그니처가 어긋나는 것을 막음)**

콜백 구현 시 매개변수를 다시 타이핑하기보다, 이미 존재하는 인터페이스나 계약의 시그니처를 Indexed Access로 재사용합니다.
재사용한 계약에 현재 구현이 쓰지 않는 parameter가 있으면 `types-mark-unused-parameters-with-underscore`를 다시
판정합니다.
이렇게 해야 구현과 계약 사이의 타입 정의가 한곳에서 유지됩니다.

annotation 없는 one-off contextually typed inline callback은 시그니처를 재선언한 것이 아니므로 N/A입니다.
예를 들어 framework option 객체의 `select: (response) => ...`는 contextual inference를 그대로 사용합니다.
반대로 named callback과 curried factory의 최종 반환 handler를 interface·객체·framework alias로 고정하는 작업은 기존
callback 계약 재사용이므로 Selected입니다.

**Incorrect (기존 계약이 있는데 콜백 시그니처를 다시 씀):**

```ts
interface ToastFormatters {
	formatMessage: (message: string) => string;
}

const formatMessage = (message: string): string => {
	return `[app] ${message}`;
};
```

**Correct (기존 계약의 시그니처를 직접 참조):**

```ts
/**
 * @summary toast formatter 계약
 */
interface ToastFormatters {
	/**
	 * @field toast 메시지 포맷 함수
	 */
	formatMessage: (message: string) => string;
}

const formatMessage: ToastFormatters["formatMessage"] = (message) => {
	return `[app] ${message}`;
};
```

### 2.5 Reuse Existing Contracts Before Declaring New Types

**Rule:** `T09` · `types-reuse-existing-contracts-before-new-types`

**Applies when:** 의미상 같은 기존 type·interface·schema 대신 shape를 새로 선언·변경·복제·파생하거나 중복 shape를 도입·제거한다. 호환 후보 없는 새 shape, 순수 owner 이동, unchanged contract의 새 사용처는 제외한다.

**Review with:** `types-document-custom-types-and-shapes`

**Impact: HIGH (의미가 그대로일 때 기존 타입·스키마에서 파생해 중복 shape 선언을 줄임)**

기존 type/schema와 field type·optionality·의미가 같으면 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다.
신규 선언은 의미가 다를 때만 허용하며 owner 이동·이름·JSDoc만 바뀌면 N/A입니다.

shape delta 없는 unchanged contract의 새 use/call site에서 `types-reuse-existing-contracts-before-new-types`는
N/A입니다.
callable 역할은 `types-document-custom-types-and-shapes`를 별도 판정합니다.

positional→object input에서 수정 가능한 로컬 소유 호환 shape를 재사용하면
`types-document-custom-types-and-shapes`는 Selected, `types-reuse-existing-contracts-before-new-types`는 N/A입니다.
외부·generated·read-only·shared unchanged shape면 두 type 규칙 모두 N/A이고 callable 문서화 여부는 docs rule이 독립
판정합니다.
요청 밖 `*Params`/`*Input`으로 자가 활성화하지 않습니다.
호환 shape 없는 새 domain contract는 문서화 규칙만 Selected입니다.

raw input과 normalized payload는 field가 같아도 의미가 달라 별도 input shape를 허용합니다.
`types-document-custom-types-and-shapes`는 Selected, `types-reuse-existing-contracts-before-new-types`는 N/A입니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
interface UserPreview {
	id: string;
	name: string;
}
```

**Correct (기존 계약에서 필요한 부분만 파생):**

```ts
/**
 * @summary 사용자 미리보기 계약
 */
type UserPreview = Pick<UserRecord, "id" | "name">;
```

## 3. Functions and Helper Boundaries

**Impact: HIGH**

함수 시그니처와 helper 추출 규칙은 읽기 쉬운 local flow를 유지하면서 진짜 재사용 로직만 분리해야 합니다.

### 3.1 Avoid Imperative Assembly in Wide Scopes

**Rule:** `T10` · `functions-avoid-imperative-assembly-in-wide-scopes`

**Applies when:** 파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push` 또는 조건부 누적으로 값을 조립하거나 이를 리팩터링한다.

**Impact: HIGH (분기로 공유 지역 변수를 변형하지 않고 파일 전역 로직을 선언적으로 유지함)**

파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 하지 않습니다.
단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산하고, 분기와 보정이 결합된 계산은 `resolve*`, `build*`,
`normalize*` 형태 유틸로 분리합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let visibleTabs = ["overview"];

if (canManageItems) {
	visibleTabs.push("items");
}
```

**Correct (좁은 스코프에서 한 번에 계산):**

```ts
const visibleTabs = canManageItems
	? ["overview", "items"]
	: ["overview"];
```

### 3.2 Extract Support Functions Only When the Boundary Is Real

**Rule:** `T11` · `functions-extract-helpers-only-when-the-boundary-is-real`

**Applies when:** support function을 추출·이동·export·공유하거나 generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꾼다.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`, `docs-use-helper-for-reusable-pure-helper-functions`

**Impact: HIGH (재사용 계약이나 테스트 경계가 실제로 없을 때 헬퍼 추출이 지역 흐름을 조각내는 것을 막음)**

support function은 "이름"이 아니라 "호출 경계"가 있을 때만 분리합니다.

- 필수: 명확한 input/output, 런타임 문맥 없는 독립 검증 가능성
- 추출 신호: 여러 owner의 직접 호출, 여러 export에서 반복되는 도메인 규칙
- 유지: 한 번만 쓰는 짧은 계산, optional 보정, label fallback, 단일 namespace method 전용 mapper
- 배치: generic `helper.ts`/`utils.ts` 금지, owner-named support module 우선
- 승격: 여러 owner가 실제 공유하는 범용 pure function만 `shared/util.ts`의 `util.*`

**Incorrect (단회성 계산을 generic util 파일로 분리):**

```ts
// utils.ts
export const util = {
	getNextIteration(iteration: number) {
		return iteration + 1;
	},
};
```

**Incorrect (support module 안에서도 export helper를 단계별로 누적):**

```ts
export const normalizeProfileValues = (formValues: ProfileFormValues) => {
	// ...
};

export const buildAvatarRequests = (files: UploadFile[]) => {
	// ...
};

export const buildProfileUpdatePayload = (
	formValues: ProfileFormValues,
	files: UploadFile[],
) => {
	return {
		...normalizeProfileValues(formValues),
		avatarRequests: buildAvatarRequests(files),
	};
};
```

**Incorrect (한 namespace method만 위해 mapper/helper를 쪼갬):**

```ts
const readLabelText = (label: Label) => label.name.trim() || label.code;

const mapRecordToEntryView = (record: RecordItem): EntryView => {
	const summary = record.description ?? record.memo;

	return {
		id: record.id,
		url: record.url,
		data: {
			type: "record",
			title: record.title,
			summary,
			labels: record.labels.map(readLabelText),
		},
	};
};

export const api = {
	record: {
		mapEntry: (record: RecordItem) => mapRecordToEntryView(record),
	},
};
```

**Correct (작은 계산은 local flow에 둠):**

```ts
const nextIteration = iteration + 1;
```

**Correct (feature-local support module은 domain-sized export 안에서 단계별로 정리):**

```ts
// profile-support.ts
/**
 * @helper profile form 값을 저장 payload로 조립
 */
export const buildProfileUpdatePayload = (formValues: ProfileFormValues) => {
	const normalizedDisplayName = formValues.displayName.trim();

	return {
		displayName: normalizedDisplayName,
	};
};
```

**Correct (단일 owner namespace의 단계는 메서드 본문에 둠):**

```ts
export const api = {
	record: {
		mapEntry: (record: RecordItem): EntryView => {
			const summary = record.description ?? record.memo;

			return {
				id: record.id,
				url: record.url,
				data: {
					type: "record",
					title: record.title,
					summary,
					labels: record.labels.map((label) => label.name.trim() || label.code),
				},
			};
		},
	},
};
```

```ts
// profile-form.ts
import { buildProfileUpdatePayload } from "./profile-support";
```

```ts
// shared/util.ts
export const util = {
	date: {
		/**
		 * @helper date 입력값을 ISO 문자열로 정규화
		 */
		normalize(value: Date | string): string {
			return new Date(value).toISOString();
		},
	},
};
```

### 3.3 Prefer Immutable Array Sorting

**Rule:** `T12` · `functions-prefer-immutable-array-sorting`

**Applies when:** props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬하거나 기존 `.sort()` 호출을 추가·변경한다.

**Impact: MEDIUM (props·state·공유 입력에서 온 배열을 정렬할 때 변형 버그를 피함)**

정렬이 필요한데 원본 배열을 계속 써야 한다면 `.sort()`로 제자리 mutation을 하지 않습니다.
프로젝트 런타임이 ES2023 이상이거나 `toSorted()` 지원이 보장되면 `.toSorted()`를 우선하고,
그렇지 않으면 복사 후 정렬합니다.
companion skill이므로 지원 여부가 불분명한 환경에 무조건 `toSorted()`를 강제하지는 않습니다.

**Incorrect (원본 배열을 직접 mutation):**

```ts
const sortedUsers = users.sort((left, right) => left.name.localeCompare(right.name));
```

**Correct (`toSorted()` 또는 복사 후 정렬로 불변성 유지):**

```ts
const sortedUsers = users.toSorted((left, right) => left.name.localeCompare(right.name));
```

```ts
const sortedUsers = [...users].sort((left, right) => left.name.localeCompare(right.name));
```

### 3.4 Replace `enum` With `as const` Objects

**Rule:** `T13` · `functions-replace-enum-with-as-const-objects`

**Applies when:** `enum` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경한다.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 런타임 값을 명시적으로, 타입 추출을 가볍게 유지함)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다.
이렇게 하면 런타임 값과 타입 추론을 함께 유지하면서도 enum 고유 문법과 번들 영향을 피할 수 있습니다.

**Incorrect (`enum`을 직접 사용):**

```ts
enum AuditStatus {
	pending = "pending",
	passed = "passed",
	failed = "failed",
}
```

**Correct (객체 리터럴과 타입 추출을 조합):**

```ts
const audit_status = {
	pending: "pending",
	passed: "passed",
	failed: "failed",
} as const;

/**
 * @summary 감사 상태 값 집합
 */
type AuditStatus = (typeof audit_status)[keyof typeof audit_status];
```

### 3.5 Use Named Object Params for Complex Signatures

**Rule:** `T14` · `functions-use-named-object-params-for-complex-signatures`

**Applies when:** 매개변수 3개 이상 또는 같은 계열 인자를 받는 일반 함수를 추가·변경하거나 객체 매개변수의 구조분해 위치를 바꾼다. React 함수 컴포넌트의 props 수신·구조분해만 바꾸면 제외한다.

**Impact: HIGH (긴 함수 시그니처를 읽을 수 있게 유지하고 위치 혼동 없이 묶인 입력을 확장하게 함)**

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고,
함수 시그니처에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 최상단의 named contract를 사용하고, 함수 본문 첫 줄에서 구조분해해 사용합니다.
구조분해 줄이 길어 formatter 예외가 꼭 필요할 때도 함수 본문 안에서 처리합니다.

React 함수 컴포넌트의 props 전체 수신과 본문 구조분해만 바뀌는 경우는 `react/composition-destructure-props-inside`가
담당하므로 이 규칙을 중복 선택하지 않습니다.
객체 인자와 field type·optionality·의미가 같은 기존 named contract가 있으면 그대로 재사용하고,
이 규칙을 지키기 위해 별도 `*Params`나 `*Args`를 새로 만들지 않습니다.

**Incorrect (시그니처에서 바로 구조분해):**

```ts
const buildRequestUrl = ({baseUrl, resourcePath, searchParams}: BuildRequestUrlArgs): URL => {
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
 * @summary grouped args로 API request URL 생성
 */
const buildRequestUrl = (args: BuildRequestUrlArgs): URL => {
	const {baseUrl, resourcePath, searchParams} = args;
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

### 3.6 Use Set and Map for Repeated Lookups

**Rule:** `T15` · `functions-use-set-and-map-for-repeated-lookups`

**Applies when:** 같은 컬렉션에 `includes`, `find` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경한다.

**Impact: MEDIUM (조회 횟수가 늘어나면 반복되는 포함 검사와 키 접근을 명시적으로 드러냄)**

같은 컬렉션에 대해 membership check나 keyed access를 여러 번 반복한다면 배열 `includes`,
`find`를 매번 다시 돌리지 말고 `Set`이나 `Map`으로 한 번 정리합니다.
단발성 한두 번 조회면 그대로 두고, 반복 lookup이 실제로 있는 경우에만 승격합니다.

**Incorrect (같은 배열을 반복 순회하며 membership를 확인):**

```ts
const visibleEntries = entries.filter((entry) => allowedEntryIds.includes(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIds.includes(entry.id));
```

**Correct (반복 lookup은 `Set`으로 승격):**

```ts
const allowedEntryIdSet = new Set(allowedEntryIds);

const visibleEntries = entries.filter((entry) => allowedEntryIdSet.has(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIdSet.has(entry.id));
```

**Correct (반복 keyed access는 `Map`으로 승격):**

```ts
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
```

## 4. Absence and Fallback Handling

**Impact: HIGH**

결측값은 casual fallback 연산자로 숨기지 말고 의도적으로 드러내야 합니다.

### 4.1 Expose Optional Values Instead of Silent Fallbacks

**Rule:** `T16` · `absence-expose-optional-values-instead-of-silent-fallbacks`

**Applies when:** optional 값의 읽기·정규화·전달을 바꾸거나 `??`, `||`, 기본값 또는 빈 값 대체 분기를 추가·변경한다.

**Review with:** `docs-keep-inline-comments-for-constraints-and-caveats`

**Impact: HIGH (일반 기본값으로 부재를 조용히 덮지 않고 결측 데이터가 드러나게 함)**

옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다.
값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며
코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
/**
 * @helper 제품 명세에 따라 페이지 크기 기본값 적용
 */
const resolvePageSize = (query: SearchQuery): string => {
	const normalizedPageSize = query.pageSize?.trim();

	if (!normalizedPageSize) {
		// 기본 페이지 크기는 제품 명세상 20으로 고정한다.
		return "20";
	}

	return normalizedPageSize;
};
```

## 5. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

주석과 annotation 규칙은 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@field`처럼 작은 고정 태그 세트로 선언 역할을 빠르게 드러내야 합니다.

### 5.1 Keep Inline Comments for Constraints and Caveats Only

**Rule:** `T17` · `docs-keep-inline-comments-for-constraints-and-caveats`

**Applies when:** 함수 본문의 `//` 주석을 추가·수정·유지하거나 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명한다.

**Impact: MEDIUM (자명한 코드를 설명하는 주석은 막고 실제 오해를 방지하는 메모는 남김)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고, `//` 주석은 도메인 규칙, 예외 방어 의도, 외부 라이브러리 제약,
부수효과 순서처럼 없으면 오해될 수 있는 경우에만 씁니다.
변수명 그대로 반복하는 설명은 남기지 않습니다.

**Incorrect (자명한 동작을 그대로 설명):**

```ts
// count를 1 증가시킨다.
const nextCount = count + 1;
```

**Correct (제약이나 우회 이유를 설명):**

```ts
// SDK가 빈 문자열을 허용하지 않아 trim 이후 값이 없으면 호출하지 않는다.
if (!normalizedToken) {
	return;
}
```

### 5.2 Require Header JSDoc on Key Declarations

**Rule:** `T18` · `docs-require-header-jsdoc-on-key-declarations`

**Applies when:** named query·mutation, 원격 함수, 비자명한 handler/effect, reusable/exported helper·custom hook, custom type·interface, store, formatter 또는 예외 memo 선언을 추가·변경한다.

**Requires selected:** `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints` · 함께 적용

**Impact: MEDIUM-HIGH (구현 본문을 뜯어보기 전에 중요한 경계를 검색하고 설명할 수 있게 함)**

named query·mutation binding과 원격 함수에는 `@api` 헤더 JSDoc을 작성하고, 비자명한 handler/effect,
reusable/exported helper·custom hook, 커스텀 `type`/`interface`, store,
formatter와 예외 memo 선언에도 헤더 JSDoc을 작성합니다.
중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다.
annotation 종류는 선언 역할에 따라 `@api`, `@event`, `@watch`, `@helper`, `@summary` 중 하나를 고릅니다.
header tag가 있어도 body가 비어 있거나 영문 label뿐이면 header 요구를 충족하지 않습니다.
`requiresSelected`의 `docs-write-concise-korean-comments-about-purpose-and-constraints`는 선택 bookkeeping이 아니라 실제
한국어 content gate입니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Correct (핵심 선언의 헤더 JSDoc과 역할 태그를 명시):**

```ts
/**
 * @helper 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

### 5.3 Standardize Annotation Tags by Declaration Role

**Rule:** `T19` · `docs-standardize-annotation-tags-by-declaration-role`

**Applies when:** TypeScript/TSX 선언의 JSDoc 태그를 추가·변경하거나 선언 역할에 맞는 annotation을 검토한다.

**Impact: MEDIUM-HIGH (고정된 소수의 annotation 집합으로 TypeScript와 TSX가 섞인 파일을 훑을 수 있게 유지함)**

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

**Incorrect (역할이 드러나지 않는 예전 태그나 part 전용 태그를 잘못 사용):**

```ts
/**
 * @description 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};

/**
 * @summary 선택된 entry 변경 처리
 */
const handleSelectEntry = (entryId: string) => {
	return entryId;
};

/**
 * @schema 게시 결과 스키마
 */
const publishResultSchema = z.object({
	documentId: z.string(),
});
```

**Correct (선언 역할에 따라 고정 태그를 사용):**

```ts
/**
 * @api 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};

/**
 * @event 선택된 entry 변경 처리
 */
const handleSelectEntry = (entryId: string) => {
	return entryId;
};

/**
 * @summary 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: z.string(),
});

/**
 * @part dialog root
 * @description dialog 열림 상태와 compound part 공유 context를 소유하는 루트 컴포넌트
 */
interface DialogRootProps {
	/**
	 * @field dialog 트리를 감싸는 자식 요소
	 */
	children: ReactNode;
}
```

### 5.4 Use `@helper` on Reusable Support Functions

**Rule:** `T20` · `docs-use-helper-for-reusable-pure-helper-functions`

**Applies when:** 여러 caller가 쓰는 pure support function, owner-named exported helper 또는 `shared/util.ts` 함수를 추가·변경하거나 `@helper`를 붙이려 한다.

**Impact: MEDIUM-HIGH (재사용 가능한 순수 support 로직을 지역 구현 세부나 통합 경계와 구분함)**

`@helper`는 재사용 가능한 pure support function에만 붙입니다.

사용 대상:

- 여러 caller가 직접 호출하는 문자열 조립, 정규화, 포맷, 계약 변환 함수
- owner-named support module의 domain-sized exported pure function
- 여러 owner가 공유하는 `shared/util.ts`의 `util.*` 함수

사용하지 않을 대상:

- 외부 I/O, 원격 데이터, 파일 접근 같은 `@api` 경계
- 한 함수나 한 support module 안에서만 쓰는 작은 sub-step
- 반복이 보이지만 아직 caller surface가 넓지 않은 local 계산

**Incorrect (외부 연동 함수나 단회성 계산을 helper로 혼동):**

```ts
/**
 * @helper 사용자 설정 파일 로드
 */
const loadUserSettings = async (): Promise<string> => {
	return await Promise.resolve("settings");
};
```

**Incorrect (support module 내부 sub-step을 전부 `@helper`로 export):**

```ts
/**
 * @helper 프로필 입력 trim
 */
export const normalizeProfileValues = (formValues: ProfileFormValues) => {
	return formValues;
};

/**
 * @helper 프로필 저장 payload 조립
 */
export const buildProfilePayload = (formValues: ProfileFormValues) => {
	return normalizeProfileValues(formValues);
};
```

**Correct (여러 caller가 공유하는 순수 정규화 경계에 `@helper`를 사용):**

```ts
/**
 * @helper 목록 화면과 상세 화면이 함께 쓰는 사용자 ID 정규화
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

### 5.5 Write Concise Korean Comments About Purpose and Constraints

**Rule:** `T21` · `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Applies when:** TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰한다.

**Impact: MEDIUM (코드 동작을 서술하지 않고 의도와 제약에 주석을 집중시킴)**

주석은 한글로 작성하고, 목적, 제약, 부작용 중심으로 간결하게 적습니다.
`@api`, `@event`, `@watch`, `@helper`, `@summary`, `@field` 문장은 명사형 종결이나 개조식 표현을 기본으로 하며,
코드 동작 설명보다 도입 이유와 제약 설명을 우선합니다.

기술 용어와 identifier는 영문으로 섞을 수 있지만
annotation 본문 전체가 ASCII 또는 영문 label이면 한글 주석으로 인정하지 않습니다.
새로 추가하거나 바꾼 각 annotation body에는 그 선언의 목적이나 제약을 설명하는 한글 구절이 있어야 합니다.
다른 `@field`가 한글이어도 영문-only `@summary`를 대신 통과시키지 않습니다.

**Incorrect (영문 또는 How 중심의 장황한 설명):**

```ts
/**
 * @summary This function sorts rule refs and returns the result.
 */

/**
 * @summary route-local entry tree props
 */
```

**Correct (한글, 명사형, 의도 중심 설명):**

```ts
/**
 * @summary 중복 제거 후 규칙 경로 정렬
 */

/**
 * @summary route-local 엔트리 트리 입력 계약
 */
```

## 6. Guardrails and Review Checks

**Impact: MEDIUM**

마무리 전에는 TypeScript 컨벤션을 가장 자주 무너뜨리는 반복 shortcut 기준으로 코드를 점검해야 합니다.

### 6.1 Review Banned TypeScript Shortcuts Before Finishing

**Rule:** `T22` · `guardrails-review-banned-typescript-shortcuts-before-finishing`

**Applies when:** TypeScript/TSX 변경을 완료 판정하거나 diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검한다.

**Required on completion:** 마무리 시 항상 적용

**Impact: MEDIUM (import·타입·헬퍼·fallback·주석 규율을 가장 자주 무너뜨리는 지름길을 잡음)**

작업을 끝냈다고 보기 전에 반복적으로 금지되는 TypeScript 지름길을 다시 확인합니다.
barrel export, 기존 타입 재선언, 재사용 근거 없는 조기 추상화, 넓은 스코프 명령형 조립, 사유 없는 폴백,
자명한 코드 설명 주석은 마무리 전에 제거합니다.

**Incorrect (금지 패턴을 그대로 남김):**

```ts
export * from "./index";

interface RequestSnapshot {
	request: string;
}

const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (공개 경계와 결측 처리를 명시적으로 유지):**

```ts
import type {UserRecord} from "<type-public-import>";

/**
 * @summary 사용자 미리보기 계약
 */
type UserPreview = Pick<UserRecord, "id" | "name">;

if (!settings.supportEmail) {
	throw new Error("supportEmail is required.");
}
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
