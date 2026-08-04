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
    - 5.2 [Require Header Doc Comments on Key Declarations](#52-require-header-doc-comments-on-key-declarations)
    - 5.3 [Write Concise Korean Comments About Purpose and Constraints](#53-write-concise-korean-comments-about-purpose-and-constraints)
6. [Guardrails and Review Checks](#6-guardrails-and-review-checks) — **MEDIUM**
    - 6.1 [Review Banned TypeScript Shortcuts Before Finishing](#61-review-banned-typescript-shortcuts-before-finishing)

---

## 1. Naming and Module Boundaries

**Impact: HIGH**

식별자, 가져오기, 공개 진입점, 설정 접근 방식이 소유자와 출처를 바로 드러내야 합니다.

### 1.1 Centralize Shared Config Under `shared/config.ts`

**Rule:** `T01` · `naming-centralize-shared-config-namespaces`

**Applies when:** 여러 말단 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때. 공용 설정 경계를 바꿀 때.

**Review with:** `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (공용 설정 값이 말단 파일로 흩어져 공개 출처를 잃는 것을 막습니다)**

여러 파일이 함께 쓰는 설정과 상수는 `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` 네임스페이스 아래에 모읍니다.
말단 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
`config.*` 체인으로 읽히게 정리합니다.

수가 많지 않으면 폴더로 미리 쪼개지 않고 `config.ts` 하나로 둡니다.
서로 독립된 여러 묶음으로 커졌을 때만 나눌지 검토합니다.

소유자 하나만 쓰는 선언형 설정은 전역으로 올리지 않습니다.
그 소유자 아래 `config` 폴더에 `<owner>_config`로 둡니다. `constants` 폴더는 만들지 않습니다.

**Incorrect (공용 설정을 말단 파일마다 흩뿌림):**

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

**Applies when:** 말단 모듈에서 `config`나 `util` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때.

**Impact: HIGH (넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다)**

공용 설정과 공용 순수 함수는 말단 모듈에서 직접 가져오기 한 뒤 `config.*`, `util.*` 체인으로 씁니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 출처를 흐리지 않습니다.
구조분해가 필요하면 함수 안 좁은 스코프에서만 씁니다.

`shared/config.ts`와 `shared/util.ts`는 찾기 쉬우라고 네임스페이스를 유지합니다.
기능별 `helper.ts`나 `utils.ts`를 만들지 않고, `config`와 `util` 이름은 공용 경계에서만 씁니다.

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

**Applies when:** TypeScript 파일, 지역 변수·함수·타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.

**Impact: HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입은 `PascalCase`입니다.
폴더명은 `kebab-case` 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.
`const`인지에 따라 표기를 달리하지 않습니다. 모듈 안 지역 값은 모두 `camelCase`로 맞춥니다.

공용 설정 객체의 키와 enum 성격 상수 객체의 이름과 키는 `snake_case`입니다.
일반 객체 키, 스키마 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것은 지역 심볼을 새로 짓는 일이 아니라 이 규칙의 대상이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

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
 * 사용자 프로필 스키마
 */
const userProfileSchema = z.object({
	/**
	 * 저장소 경로
	 */
	repoPath: z.string(),
});
```

### 1.4 Use Direct Imports and Dedicated Public Entry Points

**Rule:** `T04` · `naming-use-direct-imports-and-public-entry-points`

**Applies when:** 가져오기·내보내기, 배럴, 공용 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 절대경로 별칭으로 다른 모듈을 가져올 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.

**Impact: HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 가져오기 소유를 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않습니다. 필요한 파일에서 바로 가져옵니다.
역할 폴더를 `index.ts`로 묶는 것도 배럴이라 만들지 않습니다.
같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체는
다시 내보내는 계층이 아니라 배럴이 아닙니다.
타입만 가져올 때는 `import type`을 써서 계약과 실행 의존을 나눕니다.

절대경로 별칭은 전역 레이어 루트만 가리킵니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget` | 허용 |
| `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면
가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

**Incorrect (배럴과 섞인 가져오기로 경계를 흐림):**

```ts
import {config, util, UserProfile} from "./index";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```ts
import {SpikeChartCard} from "@/page/detail/component/spike-pattern-panel/component/spike-chart-card";
```

**Correct (직접 가져오기와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/shared/contracts";
import {config} from "@/shared/config";
import {util} from "@/shared/util";
import {WgChartCard} from "@/widget/chart-card/wg-chart-card";
import {buildUserSaveRequest} from "./function/build-user-save-request";
```

## 2. Types and Contracts

**Impact: CRITICAL**

함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게 유지해야 합니다.

### 2.1 Document Custom Types and Declarative Shapes

**Rule:** `T05` · `types-document-custom-types-and-shapes`

**Applies when:** 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 익명으로 추론된 반환인 경우.

**Impact: CRITICAL (구현을 파헤치지 않고도 도메인 전용 계약을 이해합니다)**

선언형 형태는 헤더와 필드를 나눠 문서화합니다.

- 커스텀 `type`, `interface`, 스키마 최상단, 객체형 상수: 선언 위에 헤더 문서 주석
- 객체형 계약과 스키마 필드: 각 필드 바로 위에 문서 주석
- `Pick`, `Omit`, 인덱스 접근 별칭: 필드가 없으므로 헤더만 씁니다

주석이 있다고 끝나지 않습니다.
각 본문이 `docs-write-concise-korean-comments-about-purpose-and-constraints`의 한국어 조건을 만족해야 합니다.

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
질의의 `select`가 익명으로 반환하는 객체가 그 경우입니다.
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

**Correct (헤더와 필드별 doc 주석을 사용):**

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

### 2.2 Mark Unused Parameters With an Underscore Prefix

**Rule:** `T06` · `types-mark-unused-parameters-with-underscore`

**Applies when:** 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.

**Impact: MEDIUM-HIGH (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

커링한 핸들러의 마지막 콜백도 마찬가지입니다.
프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않는 경우도 예외가 아닙니다.
`() =>` 대신 `(_event) =>`로 받아 계약을 남깁니다.

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
 * 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = (_message, _level) => {};
```

### 2.3 Prefer Function Variable Types Over Parameter Annotations

**Rule:** `T07` · `types-prefer-function-variable-types-over-parameter-annotations`

**Applies when:** 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우.

**Impact: CRITICAL (호출 계약을 재사용할 수 있게 두고 지역 타입 표기가 공용 함수 타입을 조각내지 않게 합니다)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다.
이미 있는 인터페이스, 객체 계약, 프레임워크 별칭을 먼저 씁니다.
같은 호출 계약을 여러 구현이 함께 쓸 때만 함수 타입 별칭을 따로 선언합니다.
한 번만 쓰는 지역 함수 때문에 함수 타입 별칭을 늘리지 않습니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
반대로 이름 붙인 핸들러나 커링 팩토리가 돌려주는 핸들러를 기존 프레임워크 별칭으로 고정하면 이 규칙을 적용합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (기존 계약이나 실제 공유되는 callable contract를 재사용해 함수 변수 타입을 고정):**

```ts
/**
 * 사용자 formatter 계약
 */
interface UserFormatters {
	/**
	 * 상태 문자열 formatter
	 */
	formatState: (state: Record<string, unknown>) => string;
}

const formatState: UserFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
/**
 * request 정규화 계약
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

**Applies when:** 인터페이스, 객체, 프레임워크가 정한 콜백을 구현하면서 기존 시그니처를 다시 쓰거나 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우.

**Requires selected:** `types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

**Review with:** `types-mark-unused-parameters-with-underscore`

**Impact: HIGH (기존 인터페이스나 객체 계약이 이미 정한 콜백 시그니처가 어긋나지 않습니다)**

콜백을 구현할 때 매개변수 타입을 다시 적지 않습니다. 이미 있는 인터페이스나 계약의 시그니처를 인덱스 접근로 가져다 씁니다.
가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore`를 다시 봅니다.
그래야 구현과 계약의 타입 정의가 한곳에 남습니다.

타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백은 시그니처를 다시 선언한 것이 아니라 대상이 아닙니다.
프레임워크 옵션 객체의 `select: (response) => ...`는 문맥 추론을 그대로 씁니다.
반대로 이름 붙인 콜백이나 커링 팩토리의 마지막 핸들러를 인터페이스·객체·프레임워크 별칭으로 고정하면
기존 콜백 계약을 다시 쓰는 것이라 이 규칙을 적용합니다.

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
 * toast formatter 계약
 */
interface ToastFormatters {
	/**
	 * toast 메시지 포맷 함수
	 */
	formatMessage: (message: string) => string;
}

const formatMessage: ToastFormatters["formatMessage"] = (message) => {
	return `[app] ${message}`;
};
```

### 2.5 Reuse Existing Contracts Before Declaring New Types

**Rule:** `T09` · `types-reuse-existing-contracts-before-new-types`

**Applies when:** 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없는 새 형태, 소유자만 옮긴 경우, 그대로인 계약을 새 자리에서 쓰는 경우.

**Review with:** `types-document-custom-types-and-shapes`

**Impact: HIGH (의미가 그대로면 기존 타입이나 스키마에서 파생해 같은 형태를 두 번 선언하지 않습니다)**

기존 타입이나 스키마와 필드 타입, 선택 여부, 뜻이 같으면 그대로 참조하거나 `Pick`, `Omit`, 인덱스 접근로 파생합니다.
새로 선언하는 것은 뜻이 다를 때만입니다. 소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

형태가 그대로인 계약을 새 자리에서 쓰는 것만으로는 이 규칙이 걸리지 않습니다.
호출 계약 역할은 `types-document-custom-types-and-shapes`가 따로 판정합니다.

위치 인자를 객체 입력으로 바꾸면서 고칠 수 있는 우리 형태를 다시 쓰면
`types-document-custom-types-and-shapes`만 걸리고 이 규칙은 걸리지 않습니다.
외부·생성된·읽기 전용·공용 형태를 그대로 쓰면 두 타입 규칙 모두 대상이 아니고, 문서화는 문서 규칙이 따로 판정합니다.
요청에 없는 `*Params`나 `*Input`을 만들어 이 규칙을 스스로 켜지 않습니다.
맞는 형태가 없는 새 도메인 계약은 문서화 규칙만 걸립니다.

원본 입력과 정규화한 값은 필드가 같아도 뜻이 달라 입력 형태를 따로 두는 것이 맞습니다.
그때도 문서화 규칙만 걸리고 이 규칙은 걸리지 않습니다.

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
 * 사용자 미리보기 계약
 */
type UserPreview = Pick<UserRecord, "id" | "name">;
```

## 3. Functions and Helper Boundaries

**Impact: HIGH**

함수 시그니처와 보조 함수 추출 규칙이 읽기 쉬운 흐름을 지키면서 진짜 재사용할 로직만 떼어 내야 합니다.

### 3.1 Avoid Imperative Assembly in Wide Scopes

**Rule:** `T10` · `functions-avoid-imperative-assembly-in-wide-scopes`

**Applies when:** 파일 위쪽이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 만들거나 정리할 때.

**Impact: HIGH (분기로 공유 지역 변수를 바꾸지 않아 파일 전역 로직이 선언형으로 남습니다)**

파일 위쪽이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
한 번만 쓰면 실제 쓰는 좁은 스코프에서 바로 계산합니다.
분기와 보정이 얽힌 계산은 `resolve*`, `build*`, `normalize*` 같은 함수로 떼어 냅니다.

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

**Applies when:** 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 잔손질 단계의 경계를 바꿀 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`

**Impact: HIGH (재사용 계약이나 테스트 경계가 없는데 보조 함수를 빼서 흐름이 조각나는 것을 막습니다)**

보조 함수는 "이름"이 아니라 "호출 경계"가 있을 때만 떼어 냅니다.

- 필수: 입력과 출력이 분명하고, 실행 문맥 없이도 따로 검증할 수 있어야 합니다
- 떼어 낼 신호: 여러 소유자가 직접 호출하거나, 여러 내보낸 함수에서 같은 도메인 규칙이 반복됩니다
- 그대로 둘 것: 한 번만 쓰는 짧은 계산, 선택 값 보정, 라벨 기본값, 메서드 하나만 쓰는 변환 함수
- 배치: 범용 `helper.ts`나 `utils.ts`는 만들지 않고, 소유자 아래 `function` 폴더에 대표 함수 하나당 파일 하나
- 깊이: 호출은 소유자에서 내보낸 함수, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다
- 승격: 여러 소유자가 실제로 함께 쓰는 순수 함수만 `shared/util.ts`의 `util.*`로 올립니다

내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
흐름을 알려고 파일을 왕복해야 하면 경계가 아니라 그냥 쪼갠 것입니다.

**Incorrect (단회성 계산을 범용 util 파일로 분리):**

```ts
// utils.ts
export const util = {
	getNextIteration(iteration: number) {
		return iteration + 1;
	},
};
```

**Incorrect (support module 안에서도 내보내기 helper를 단계별로 누적):**

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

**Incorrect (네임스페이스 메서드 하나 때문에 변환 함수를 쪼갬):**

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

**Correct (작은 계산은 local 흐름에 둠):**

```ts
const nextIteration = iteration + 1;
```

**Correct (feature-local support module은 domain-sized 내보내기 안에서 단계별로 정리):**

```ts
// profile-support.ts
/**
 * profile form 값을 저장 payload로 조립
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
		 * date 입력값을 ISO 문자열로 정규화
		 */
		normalize(value: Date | string): string {
			return new Date(value).toISOString();
		},
	},
};
```

### 3.3 Prefer Immutable Array Sorting

**Rule:** `T12` · `functions-prefer-immutable-array-sorting`

**Applies when:** props, 상태, 매개변수, 공유 입력에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.

**Impact: MEDIUM (props, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

원본 배열을 계속 써야 하면 `.sort()`로 제자리에서 바꾸지 않습니다.
실행 환경이 ES2023 이상이거나 `toSorted()`를 쓸 수 있으면 `.toSorted()`를 먼저 씁니다.
아니면 복사한 뒤 정렬합니다.
동반 스킬이므로 지원 여부가 불분명한 환경에 `toSorted()`를 강제하지는 않습니다.

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

**Applies when:** `enum` 이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 enum 고유 문법과 번들 부담을 피합니다.

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
 * 감사 상태 값 집합
 */
type AuditStatus = (typeof audit_status)[keyof typeof audit_status];
```

### 3.5 Use Named Object Params for Complex Signatures

**Rule:** `T14` · `functions-use-named-object-params-for-complex-signatures`

**Applies when:** 매개변수가 3개를 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수를 어디서 구조분해할지 바꿀 때. 제외: 리액트 함수 컴포넌트가 props 를 받고 구조분해하는 방식만 바꾸는 경우.

**Impact: HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 3개를 넘거나 같은 계열 값이 함께 넘어오면 객체 하나로 묶습니다.
시그니처 자리에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언하고, 함수 본문 첫 줄에서 구조분해합니다.
구조분해 줄이 길어 포매터 예외가 필요해도 함수 본문 안에서 처리합니다.

리액트 함수 컴포넌트가 props 를 통째로 받아 본문에서 구조분해하는 것만 바뀌면
`react/composition-destructure-props-inside`가 담당하므로 이 규칙을 겹쳐 적용하지 않습니다.
객체 인자와 필드 타입, 선택 여부, 뜻이 같은 계약이 이미 있으면 그대로 씁니다.
이 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.

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
 * grouped args로 API request URL 생성
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

**Applies when:** 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.

**Impact: MEDIUM (조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다)**

같은 목록에 포함 검사나 키 조회를 여러 번 한다면 `includes`와 `find`를 매번 돌리지 않습니다.
`Set`이나 `Map`으로 한 번 정리합니다.
한두 번 조회면 그대로 두고, 반복이 실제로 있을 때만 바꿉니다.

**Incorrect (같은 배열을 반복 순회하며 membership을 확인):**

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

빠진 값을 기본값 연산자로 덮지 않고 일부러 드러내야 합니다.

### 4.1 Expose Optional Values Instead of Silent Fallbacks

**Rule:** `T16` · `absence-expose-optional-values-instead-of-silent-fallbacks`

**Applies when:** 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.

**Review with:** `docs-keep-inline-comments-for-constraints-and-caveats`

**Impact: HIGH (일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다)**

선택 값에 `??`나 `||`로 기본값을 채워 없음을 덮지 않습니다.
값이 없을 수 있다는 사실을 그대로 드러냅니다.
도메인상 기본값이 분명하고 코드 바로 위에 이유 주석이 있을 때만 예외로 씁니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
/**
 * 제품 명세에 따라 페이지 크기 기본값 적용
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

주석 규칙은 역할 태그 없이 여러 줄 블록과 한국어 본문으로 선언의 목적과 제약을 드러내야 합니다.

### 5.1 Keep Inline Comments for Constraints and Caveats Only

**Rule:** `T17` · `docs-keep-inline-comments-for-constraints-and-caveats`

**Applies when:** 함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서를 주석으로 설명할 때.

**Impact: MEDIUM (자명한 코드를 설명하는 주석은 막고 오해를 막는 메모만 남깁니다)**

함수 본문 안에서는 블록 주석을 쓰지 않습니다.
`//` 주석은 도메인 규칙, 예외를 막은 의도, 외부 라이브러리 제약, 부수효과 순서처럼
없으면 오해할 자리에만 씁니다.
변수명을 그대로 되풀이하는 설명은 남기지 않습니다.

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

### 5.2 Require Header Doc Comments on Key Declarations

**Rule:** `T18` · `docs-require-header-jsdoc-on-key-declarations`

**Applies when:** 질의·변경 요청, 원격 함수, 뻔하지 않은 핸들러와 이펙트, 내보낸 보조 함수와 훅, 커스텀 타입, 스토어 선언을 추가·변경할 때. 선언 위 주석의 형식이나 태그를 정할 때.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints` · 함께 적용

**Impact: MEDIUM-HIGH (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

이름 붙인 질의와 변경 요청, 원격 함수, 뻔하지 않은 핸들러와 이펙트, 재사용하거나 내보낸 보조 함수,
커스텀 훅, 커스텀 `type`과 `interface`, 스토어, 포매터, 예외 메모 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

형식은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나누고 `/** 한 줄 */`은 쓰지 않습니다.
선언 설명에 `//`를 쓰지 않습니다. `//`는 본문 안 제약 설명 몫입니다.

역할 태그는 쓰지 않습니다.
`@api`, `@helper`, `@summary` 같은 태그를 붙이지 않고 `@schema`처럼 새로 만들지도 않습니다.
선언이 무엇인지는 이름 규칙과 문법이 이미 드러냅니다.
`@deprecated`, `@example`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Incorrect (한 줄 형태와 `//` 설명을 섞어 씀):**

```ts
/** 중복 제거 후 사용자 ID 정렬 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};

// entry 목록 조회 API
const responseEntryList = useEntryList();
```

**Incorrect (역할 태그를 붙임):**

```ts
/**
 * @helper 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Correct (여러 줄 블록에 설명만 작성):**

```ts
/**
 * 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};

/**
 * entry 목록 조회 API
 */
const responseEntryList = useEntryList();
```

### 5.3 Write Concise Korean Comments About Purpose and Constraints

**Rule:** `T19` · `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Applies when:** TypeScript·TSX 의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때.

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 쓰고 목적, 제약, 부수효과를 짧게 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

기술 용어와 식별자는 영어로 섞어도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
새로 넣거나 고친 문서 주석에는 그 선언의 목적이나 제약을 설명하는 한국어 구절이 있어야 합니다.
다른 필드 주석이 한국어라고 영어뿐인 헤더 주석을 대신 통과시키지 않습니다.

**Incorrect (영문 또는 How 중심의 장황한 설명):**

```ts
/**
 * This function sorts rule refs and returns the result.
 */

/**
 * route-local entry tree props
 */
```

**Correct (한글, 명사형, 의도 중심 설명):**

```ts
/**
 * 중복 제거 후 규칙 경로 정렬
 */

/**
 * route-local 엔트리 트리 입력 계약
 */
```

## 6. Guardrails and Review Checks

**Impact: MEDIUM**

마무리 전에 컨벤션을 가장 자주 무너뜨리는 지름길을 기준으로 코드를 점검해야 합니다.

### 6.1 Review Banned TypeScript Shortcuts Before Finishing

**Rule:** `T20` · `guardrails-review-banned-typescript-shortcuts-before-finishing`

**Applies when:** TypeScript·TSX 변경을 끝났다고 판정할 때. 변경 내역에서 배럴, 중복 타입, 이른 보조 함수, 넓은 조립, 근거 없는 기본값, 자명한 주석을 점검할 때.

**Required on completion:** 마무리 시 항상 적용

**Impact: MEDIUM (가져오기, 타입, 보조 함수, 기본값, 주석 규율을 가장 자주 무너뜨리는 지름길을 잡아냅니다)**

끝났다고 보기 전에 자주 되풀이되는 지름길을 다시 확인합니다.
배럴, 기존 타입 재선언, 재사용 근거 없이 앞당긴 추상화, 넓은 스코프 조립, 이유 없는 기본값,
자명한 코드를 설명하는 주석은 마무리 전에 지웁니다.

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
 * 사용자 미리보기 계약
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
