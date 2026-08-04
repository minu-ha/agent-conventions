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
    - 1.2 [Place Owner-only Config in the Owner Config Folder](#12-place-owner-only-config-in-the-owner-config-folder)
    - 1.3 [Preserve Shared Namespace Origin With Chained Access](#13-preserve-shared-namespace-origin-with-chained-access)
    - 1.4 [Use Consistent File, Symbol, and Field Naming](#14-use-consistent-file-symbol-and-field-naming)
    - 1.5 [Use Direct Imports and Dedicated Public Entry Points](#15-use-direct-imports-and-dedicated-public-entry-points)
    - 1.6 [Restrict Absolute Aliases to Layer Roots](#16-restrict-absolute-aliases-to-layer-roots)
2. [Types and Contracts](#2-types-and-contracts) — **CRITICAL**
    - 2.1 [Reuse Existing Contracts Before Declaring New Types](#21-reuse-existing-contracts-before-declaring-new-types)
    - 2.2 [Prefer Function Variable Types Over Parameter Annotations](#22-prefer-function-variable-types-over-parameter-annotations)
    - 2.3 [Document Custom Types and Declarative Shapes](#23-document-custom-types-and-declarative-shapes)
    - 2.4 [Mark Unused Parameters With an Underscore Prefix](#24-mark-unused-parameters-with-an-underscore-prefix)
3. [Functions and Helper Boundaries](#3-functions-and-helper-boundaries) — **HIGH**
    - 3.1 [Declare Functions as Arrow Consts](#31-declare-functions-as-arrow-consts)
    - 3.2 [Use Named Object Params for Complex Signatures](#32-use-named-object-params-for-complex-signatures)
    - 3.3 [Extract Support Functions Only When the Boundary Is Real](#33-extract-support-functions-only-when-the-boundary-is-real)
    - 3.4 [Place and Promote Support Functions Deliberately](#34-place-and-promote-support-functions-deliberately)
    - 3.5 [Avoid Imperative Assembly in Wide Scopes](#35-avoid-imperative-assembly-in-wide-scopes)
    - 3.6 [Prefer Immutable Array Sorting](#36-prefer-immutable-array-sorting)
    - 3.7 [Replace `enum` With `as const` Objects](#37-replace-enum-with-as-const-objects)
    - 3.8 [Use Set and Map for Repeated Lookups](#38-use-set-and-map-for-repeated-lookups)
4. [Absence and Fallback Handling](#4-absence-and-fallback-handling) — **HIGH**
    - 4.1 [Expose Optional Values Instead of Silent Fallbacks](#41-expose-optional-values-instead-of-silent-fallbacks)
5. [JSDoc and Comment Conventions](#5-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
    - 5.1 [Keep Inline Comments for Constraints and Caveats Only](#51-keep-inline-comments-for-constraints-and-caveats-only)
    - 5.2 [Require Header Doc Comments on Key Declarations](#52-require-header-doc-comments-on-key-declarations)
    - 5.3 [Write Concise Korean Comments About Purpose and Constraints](#53-write-concise-korean-comments-about-purpose-and-constraints)
    - 5.4 [Write Doc Comments as Multiline Blocks](#54-write-doc-comments-as-multiline-blocks)
    - 5.5 [Avoid Role Tags in Doc Comments](#55-avoid-role-tags-in-doc-comments)
    - 5.6 [Justify Convention Exceptions With a Checkable Reason Comment](#56-justify-convention-exceptions-with-a-checkable-reason-comment)
6. [Tooling](#6-tooling) — **MEDIUM**
    - 6.1 [Configure Biome to Enforce the Mechanical Rules](#61-configure-biome-to-enforce-the-mechanical-rules)

---

## 1. Naming and Module Boundaries

**Impact: HIGH**

식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 설정 위치가 소유자와 출처를 바로 드러내야 합니다.

### 1.1 Centralize Shared Config Under `shared/config.ts`

**Rule:** `T01` · `naming-centralize-shared-config-namespaces`

**Applies when:** 여러 말단 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때. 공용 설정 경계를 바꿀 때.

**Review with:** `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (공용 설정 값이 말단 파일로 흩어져 공개 출처를 잃는 것을 막습니다)**

**두 소유자 이상이 같은 값을 쓰면** `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` 네임스페이스 아래에 모읍니다.
소유자 하나만 쓰는 값은 아직 여기 올리지 않습니다.
말단 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
`config.*` 체인으로 읽히게 정리합니다.

수가 많지 않으면 폴더로 미리 쪼개지 않고 `config.ts` 하나로 둡니다.
서로 독립된 여러 묶음으로 커졌을 때만 나눌지 검토합니다.

소유자 하나만 쓰는 선언형 설정을 어디 둘지는
`naming-place-owner-config-in-the-owner-config-folder`가 정합니다.

**Incorrect (같은 값을 두 소유자가 각자 선언):**

```ts
// page/entries/pg-entries.tsx
const defaultPageSize = 20;
const billing_feature_keys = ["invoices", "refunds"];
```

```ts
// page/billing/pg-billing.tsx
const defaultPageSize = 20;
```

**Correct (공용 설정은 `shared/config.ts` 이름 공간에서 읽음):**

```ts
import {config} from "@/shared/config";

config.api.public_base_url;
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
```

### 1.2 Place Owner-only Config in the Owner Config Folder

**Rule:** `T02` · `naming-place-owner-config-in-the-owner-config-folder`

**Applies when:** 소유자 하나만 쓰는 선언형 설정을 추가하거나 옮길 때. 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때.

**Review with:** `naming-centralize-shared-config-namespaces`, `naming-use-consistent-file-and-symbol-naming`

**Impact: MEDIUM-HIGH (한 소유자만 쓰는 설정이 전역 진입점을 넓히지 않습니다)**

소유자 하나만 쓰는 선언형 설정은 전역으로 올리지 않습니다.
그 소유자 아래 `config` 폴더에 둡니다.

- 파일은 `config/<owner>-config.ts`, 내보내는 상수는 `<owner>Config`입니다.
  이름 표기는 `naming-use-consistent-file-and-symbol-naming`을 따릅니다.
- `constants` 폴더는 만들지 않습니다.
- 두 번째 소유자가 같은 값을 쓰게 되면 `naming-centralize-shared-config-namespaces`를 따라 올립니다.

**Incorrect (소유자 하나만 쓰는 설정을 전역으로 올림):**

```ts
// shared/config.ts
export const config = {
	entryDetail: {
		chartAxisTickCount: 6,
	},
} as const;
```

**Correct (소유자 아래 `config` 폴더에 둠):**

```ts
// page/entry-detail/config/entry-detail-config.ts
/**
 * entry 상세 화면 전용 표시 설정
 */
export const entryDetailConfig = {
	chartAxisTickCount: 6,
} as const;
```

### 1.3 Preserve Shared Namespace Origin With Chained Access

**Rule:** `T03` · `naming-preserve-config-origin-with-chained-access`

**Applies when:** 말단 모듈에서 `config`나 `util` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때.

**Impact: HIGH (넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다)**

공용 설정과 공용 순수 함수는 말단 모듈에서 직접 가져오기 한 뒤 `config.*`, `util.*` 체인으로 씁니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 출처를 흐리지 않습니다.
구조분해가 필요하면 함수 안 좁은 스코프에서만 씁니다.

`shared/config.ts`와 `shared/util.ts`는 찾기 쉬우라고 네임스페이스를 유지합니다.
`config`와 `util` 이름은 공용 경계에서만 씁니다. 기능별로 같은 이름을 다시 쓰지 않습니다.
보조 함수 파일을 어디 둘지는 `functions-place-and-promote-support-functions`가 정합니다.

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

### 1.4 Use Consistent File, Symbol, and Field Naming

**Rule:** `T04` · `naming-use-consistent-file-and-symbol-naming`

**Applies when:** TypeScript 파일, 지역 변수·함수·타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.

**Impact: HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입은 `PascalCase`입니다.
폴더명은 `kebab-case` 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.
`const`인지에 따라 표기를 달리하지 않습니다. 모듈 안 지역 값은 모두 `camelCase`로 맞춥니다.

공용 설정 객체의 키와 `enum` 성격 상수 객체의 이름과 키는 `snake_case`입니다.
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

### 1.5 Use Direct Imports and Dedicated Public Entry Points

**Rule:** `T05` · `naming-use-direct-imports-and-public-entry-points`

**Applies when:** 가져오기·내보내기, 배럴, 공용 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.

**Impact: HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 가져오기 소유를 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않습니다. 필요한 파일에서 바로 가져옵니다.
역할 폴더를 `index.ts`로 묶는 것도 배럴이라 만들지 않습니다.
같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체는
다시 내보내는 계층이 아니라 배럴이 아닙니다.
타입만 가져올 때는 `import type`을 써서 계약과 실행 의존을 나눕니다.

절대경로 별칭으로 어디까지 열지는 `naming-restrict-absolute-aliases-to-layer-roots`가 정합니다.

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
import {buildUserSaveRequest} from "./function/build-user-save-request";
```

### 1.6 Restrict Absolute Aliases to Layer Roots

**Rule:** `T06` · `naming-restrict-absolute-aliases-to-layer-roots`

**Applies when:** 절대경로 별칭으로 다른 모듈을 가져올 때. 별칭이 가리키는 경로 깊이를 바꿀 때.

**Review with:** `naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (소유자 내부 모듈이 밖에서 직접 열리지 않아 경계가 남습니다)**

절대경로 별칭의 첫 마디는 전역 레이어 루트여야 합니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget` | 허용 |
| `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

- 첫 마디가 레이어 루트면 그 아래 깊이는 제한하지 않습니다.
  `@/widget/chart-card/wg-chart-card`는 허용입니다.
- 화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
- 소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

**Incorrect (화면 내부 모듈을 절대경로로 가져옴):**

```ts
import {SpikeChartCard} from "@/page/detail/component/spike-pattern-panel/component/spike-chart-card";
```

**Correct (레이어 루트로 시작하는 별칭과 소유자 안 상대경로):**

```ts
import {WgChartCard} from "@/widget/chart-card/wg-chart-card";
import {SpikeChartCard} from "./component/spike-chart-card";
```

## 2. Types and Contracts

**Impact: CRITICAL**

함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게 유지해야 합니다.

### 2.1 Reuse Existing Contracts Before Declaring New Types

**Rule:** `T07` · `types-reuse-existing-contracts-before-new-types`

**Applies when:** 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없는 새 형태, 소유자만 옮긴 경우, 그대로인 계약을 새 자리에서 쓰는 경우.

**Review with:** `types-document-custom-types-and-shapes`

**Impact: HIGH (의미가 그대로면 기존 타입이나 스키마에서 파생해 같은 형태를 두 번 선언하지 않습니다)**

필드 이름, 타입, 선택 여부가 모두 같은 선언이 이미 있으면 그대로 참조하거나 `Pick`, `Omit`, 인덱스 접근으로 파생합니다.
필드가 하나라도 다르면 새로 선언합니다. 소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

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

// 필드 이름·타입·선택 여부가 그대로인데 새로 선언했다
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

### 2.2 Prefer Function Variable Types Over Parameter Annotations

**Rule:** `T08` · `types-prefer-function-variable-types-over-parameter-annotations`

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
가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore`를 다시 봅니다.
함수 타입 별칭을 새로 선언하는 것은 같은 시그니처를 쓰는 구현이 이미 둘 이상일 때만입니다.
한 번만 쓰는 지역 함수 때문에 함수 타입 별칭을 늘리지 않습니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
커링 팩토리가 돌려주는 리액트 핸들러는 `react/typing-take-handler-types-from-existing-contracts`가 판정합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (이미 있는 계약에서 시그니처를 가져와 함수 전체에 타입을 붙임):**

```ts
// 이미 있는 계약
interface UserFormatters {
	formatState: (state: Record<string, unknown>) => string;
	formatRole: (role: string) => string;
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

### 2.3 Document Custom Types and Declarative Shapes

**Rule:** `T09` · `types-document-custom-types-and-shapes`

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

### 2.4 Mark Unused Parameters With an Underscore Prefix

**Rule:** `T10` · `types-mark-unused-parameters-with-underscore`

**Applies when:** 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.

**Impact: MEDIUM-HIGH (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

커링한 핸들러의 마지막 콜백도 마찬가지입니다.
프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않는 경우도 예외가 아닙니다.
`() =>` 대신 `(_event) =>`로 받아 계약을 남깁니다.

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

const noopLog: LogSink = (_message, _level) => {};
```

## 3. Functions and Helper Boundaries

**Impact: HIGH**

함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진 자리에 둡니다. 값과 자료구조를 다루는 관용구도 여기에 모입니다.

### 3.1 Declare Functions as Arrow Consts

**Rule:** `T11` · `functions-declare-functions-as-arrow-consts`

**Applies when:** 이름 붙인 함수를 새로 만들거나 선언 형태를 바꿀 때. 제외: 클래스 메서드, 제너레이터, 오버로드 선언.

**Review with:** `functions-use-named-object-params-for-complex-signatures`

**Impact: MEDIUM (선언 형태가 한 가지로 고정되어 호이스팅에 기대는 순서 의존이 생기지 않습니다)**

이름 붙인 함수는 `const`에 화살표 함수를 담아 선언합니다.
`function` 선언문은 쓰지 않습니다.

- 한 파일 안에서 두 형태를 섞으면 어느 것이 공개 계약인지 형태로 구분할 수 없습니다.
- `function` 선언문은 호이스팅되므로 선언보다 위에서 호출해도 동작합니다.
  그러면 읽는 순서와 실행 순서가 달라집니다.
- 화살표 함수는 `this`를 새로 만들지 않아 콜백으로 넘길 때 `bind` 로 `this` 를 다시 묶지 않아도 됩니다.

세 자리는 예외로 둡니다.

| 예외 | 이유 |
| --- | --- |
| 클래스 메서드 | 메서드 문법이 정본입니다. 화살표 필드로 바꾸지 않습니다 |
| 제너레이터 | `function*` 없이 쓸 수 없습니다 |
| 오버로드 선언 | 시그니처를 여러 줄로 겹쳐 쓰려면 `function` 선언문이 필요합니다 |
| 객체 리터럴 메서드 | `util.date.normalize(value)` 처럼 네임스페이스 안 멤버는 메서드 문법을 씁니다 |

**Incorrect (`function` 선언문과 화살표를 한 파일에서 섞음):**

```ts
export function normalizeEntryTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}

export const buildEntrySlug = (title: string): string => normalizeEntryTitle(title).toLowerCase();
```

**Incorrect (쓰는 곳이 선언보다 위에 와서 읽는 순서가 어긋남):**

```ts
export const buildEntryLabel = (entry: Entry): string => decorate(entry.title);

function decorate(title: string): string {
	return `# ${title}`;
}
```

**Correct (모두 `const` 화살표로 선언하고 쓰기 전에 선언):**

```ts
const decorate = (title: string): string => `# ${title}`;

export const normalizeEntryTitle = (rawTitle: string): string => rawTitle.trim().replace(/\s+/g, " ");

export const buildEntryLabel = (entry: Entry): string => decorate(entry.title);
```

**Correct (클래스 메서드와 제너레이터는 그대로 둠):**

```ts
export class EntryCursor {
	private buffer: Entry[] = [];

	*pages(): Generator<Entry[]> {
		yield this.buffer;
	}

	reset(): void {
		this.buffer = [];
	}
}
```

### 3.2 Use Named Object Params for Complex Signatures

**Rule:** `T12` · `functions-use-named-object-params-for-complex-signatures`

**Applies when:** 매개변수가 3개를 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수를 어디서 구조분해할지 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받고 구조분해하는 방식만 바꾸는 경우.

**Impact: HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 3개를 넘거나 같은 계열 값이 함께 넘어오면 객체 하나로 묶습니다.
시그니처 자리에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언하고, 함수 본문 첫 줄에서 구조분해합니다.
구조분해 줄이 길어 포매터 예외가 필요해도 함수 본문 안에서 처리합니다.

리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다.
구조분해는 `react/composition-destructure-props-inside`가, 타입 선언 위치는
`react/composition-declare-props-interface-above-the-component`가 담당합니다.
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

### 3.3 Extract Support Functions Only When the Boundary Is Real

**Rule:** `T13` · `functions-extract-helpers-only-when-the-boundary-is-real`

**Applies when:** 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 잔손질 단계의 경계를 바꿀 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`, `functions-place-and-promote-support-functions`

**Impact: HIGH (재사용 계약이나 테스트 경계가 없는데 보조 함수를 빼서 흐름이 조각나는 것을 막습니다)**

보조 함수는 "이름"이 아니라 "호출 경계"가 있을 때만 떼어 냅니다.

- 필수: 입력과 출력이 분명하고, 실행 문맥 없이도 따로 검증할 수 있어야 합니다
- 떼어 낼 신호: 여러 소유자가 직접 호출하거나, 여러 내보낸 함수에서 같은 도메인 규칙이 반복됩니다
- 그대로 둘 것: 한 번만 쓰는 짧은 계산, 선택 값 보정, 라벨 기본값, 메서드 하나만 쓰는 변환 함수
떼어 낸 다음 어디 두고 언제 공용으로 올릴지는
`functions-place-and-promote-support-functions`가 정합니다.

흐름을 알려고 파일을 왕복해야 하면 경계가 아니라 그냥 쪼갠 것입니다.

**Incorrect (한 번만 쓰는 한 줄 계산을 파일로 분리):**

```ts
// page/profile/function/get-next-iteration.ts
export const getNextIteration = (iteration: number): number => iteration + 1;
```

**Incorrect (보조 모듈 안에서도 내보내기 도우미를 단계별로 누적):**

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

**Correct (작은 계산은 지역 흐름에 둠):**

```ts
const nextIteration = iteration + 1;
```

**Correct (기능 지역 보조 모듈은 도메인 단위 내보내기 안에서 단계별로 정리):**

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

**Correct (단일 소유자 이름 공간의 단계는 메서드 본문에 둠):**

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

### 3.4 Place and Promote Support Functions Deliberately

**Rule:** `T14` · `functions-place-and-promote-support-functions`

**Applies when:** 보조 함수를 둘 파일이나 폴더를 정할 때. `shared/` 아래로 파일을 옮기거나 `util.*` 에 항목을 추가할 때.

**Requires selected:** `functions-extract-helpers-only-when-the-boundary-is-real` · 함께 적용

**Impact: HIGH (잡동사니 파일이 생기지 않고 공용 승격이 실제 사용처를 근거로 일어납니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`가 먼저 판정합니다.
이 규칙은 그 결과를 어디 두고 언제 올릴지만 봅니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 skill 의 역할 폴더 규칙이 정합니다.
- 소유자 아래에서는 대표 내보낸 함수 하나당 파일 하나입니다.
  전역 `shared/util.ts` 는 여러 소유자가 함께 쓰는 순수 함수를 모으는 자리라 예외입니다.
- 호출 깊이는 소유자에서 내보낸 함수, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
- 공용 승격은 **두 소유자 이상이 이미 직접 호출할 때만** 합니다.
  그때 `shared/util.ts`의 `util.*`로 올립니다. 나중에 쓸 것 같아서 올리지 않습니다.

**Incorrect (잡동사니 파일과 세 단계 사슬):**

```ts
// utils.ts
export const util = {
	normalizeTitle: (title: string) => title.trim(),
	buildPayload: (values: EntryFormValues) => ({title: util.normalizeTitle(values.title)}),
	buildRequest: (values: EntryFormValues) => ({body: util.buildPayload(values)}),
};
```

**Correct (소유자 아래 대표 함수 하나당 파일 하나):**

```ts
// page/entry-form/function/build-entry-save-request.ts
/**
 * entry 폼 값을 저장 요청으로 조립
 */
export const buildEntrySaveRequest = (values: EntryFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Correct (두 소유자가 이미 쓰는 순수 함수만 공용으로 올림):**

```ts
// shared/util.ts
export const util = {
	date: {
		/**
		 * 화면 표시용 날짜 문자열 변환
		 */
		formatDisplayDate(value: string): string {
			return new Date(value).toLocaleDateString("ko-KR");
		},
	},
} as const;
```

### 3.5 Avoid Imperative Assembly in Wide Scopes

**Rule:** `T15` · `functions-avoid-imperative-assembly-in-wide-scopes`

**Applies when:** 파일 위쪽이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 만들거나 정리할 때.

**Review with:** `functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: HIGH (분기로 공유 지역 변수를 바꾸지 않아 파일 전역 로직이 선언형으로 남습니다)**

파일 위쪽이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
한 번만 쓰면 실제 쓰는 좁은 스코프에서 바로 계산합니다.
분기와 보정이 얽혀 좁은 스코프에 담기지 않으면 떼어 낼지를 다시 봅니다.
그 판정은 `functions-extract-helpers-only-when-the-boundary-is-real`가 합니다.
떼어 내기로 정했을 때 이름은 `resolve*`, `build*`, `normalize*`를 씁니다.

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

### 3.6 Prefer Immutable Array Sorting

**Rule:** `T16` · `functions-prefer-immutable-array-sorting`

**Applies when:** 프롭스, 상태, 매개변수, 공유 입력에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.

**Impact: MEDIUM (프롭스, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

원본 배열을 계속 써야 하면 `.sort()`로 제자리에서 바꾸지 않습니다.
실행 환경이 ES2023 이상이거나 `toSorted()`를 쓸 수 있으면 `.toSorted()`를 먼저 씁니다.
아니면 복사한 뒤 정렬합니다.
`toSorted()`는 ES2023 이라 `tsconfig` 의 `lib` 에 `ES2023` 이상이 있어야 씁니다.
없으면 복사 후 정렬을 씁니다.

**Incorrect (원본 배열을 직접 변경):**

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

### 3.7 Replace `enum` With `as const` Objects

**Rule:** `T17` · `functions-replace-enum-with-as-const-objects`

**Applies when:** `enum` 이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 `enum` 고유 문법과 번들 부담을 피합니다.

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

### 3.8 Use Set and Map for Repeated Lookups

**Rule:** `T18` · `functions-use-set-and-map-for-repeated-lookups`

**Applies when:** 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.

**Impact: MEDIUM (조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다)**

같은 목록에 포함 검사나 키 조회를 여러 번 한다면 `includes`와 `find`를 매번 돌리지 않습니다.
`Set`이나 `Map`으로 한 번 정리합니다.
다음 중 하나면 바꿉니다. 그 밖에는 그대로 둡니다.

- 같은 목록을 겨냥한 조회가 루프나 `map`·`filter`·`some` 콜백 안에 있습니다.
- 같은 목록을 겨냥한 조회가 서로 다른 세 지점 이상에서 일어납니다.

**Incorrect (같은 배열을 반복 순회하며 포함 여부를 확인):**

```ts
const visibleEntries = entries.filter((entry) => allowedEntryIds.includes(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIds.includes(entry.id));
```

**Correct (반복 조회는 `Set`으로 승격):**

```ts
const allowedEntryIdSet = new Set(allowedEntryIds);

const visibleEntries = entries.filter((entry) => allowedEntryIdSet.has(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIdSet.has(entry.id));
```

**Correct (반복 키 조회는 `Map`으로 승격):**

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

**Rule:** `T19` · `absence-expose-optional-values-instead-of-silent-fallbacks`

**Applies when:** 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.

**Review with:** `docs-keep-inline-comments-for-constraints-and-caveats`

**Impact: HIGH (일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다)**

선택 값에 `??`나 `||`로 기본값을 채워 없음을 덮지 않습니다.
값이 없을 수 있다는 사실을 그대로 드러냅니다.
도메인상 기본값이 분명하고 `docs-justify-convention-exceptions-with-a-reason-comment`를
만족하는 이유 주석이 있을 때만 예외로 씁니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (없을 수 있다는 사실을 그대로 드러냄):**

```ts
const supportEmail: string | undefined = settings.supportEmail;

if (!supportEmail) {
	throw new MissingSupportEmailError();
}
```

**Correct (설정 키를 가리키는 근거가 있을 때만 `??` 를 씁니다):**

```ts
// 기본 페이지 크기는 config.pagination.default_page_size 가 정본이다.
const pageSize = query.pageSize ?? config.pagination.default_page_size;
```

## 5. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

함수 본문 안 주석은 제약과 예외만 적습니다. 선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 따로 정해져 있습니다. 본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

### 5.1 Keep Inline Comments for Constraints and Caveats Only

**Rule:** `T20` · `docs-keep-inline-comments-for-constraints-and-caveats`

**Applies when:** 함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서를 주석으로 설명할 때.

**Impact: MEDIUM (자명한 코드를 설명하는 주석은 막고 오해를 막는 메모만 남깁니다)**

함수 본문 안에서는 블록 주석을 쓰지 않습니다.
`//` 주석은 도메인 규칙, 예외를 막은 의도, 외부 라이브러리 제약, 부수효과 순서처럼
없으면 오해할 자리에만 씁니다.
주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
이 규칙은 어디에 두는지만 봅니다.

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

**Rule:** `T21` · `docs-require-header-jsdoc-on-key-declarations`

**Applies when:** 쿼리·뮤테이션, 원격 함수, 분기나 `await` 가 있는 핸들러와 이펙트, 내보낸 보조 함수와 훅, 커스텀 타입, 스토어 선언을 추가·변경할 때.

**Requires selected:** `docs-write-concise-korean-comments-about-purpose-and-constraints`, `docs-write-doc-comments-as-multiline-blocks` · 함께 적용

**Impact: MEDIUM-HIGH (구현을 읽기 전에 중요한 경계를 찾고 설명할 수 있습니다)**

이름 붙인 쿼리와 뮤테이션, 원격 함수, 본문에 분기·`await`·두 개 이상의 동작이 있는 핸들러와 이펙트,
재사용하거나 내보낸 보조 함수,
커스텀 훅, 커스텀 `type`과 `interface`, 스토어, 포매터, 예외 메모 선언에는 헤더 문서 주석을 씁니다.
중요한 경계가 파일 검색에서 바로 보이게 하려는 것입니다.

주석의 형식은 `docs-write-doc-comments-as-multiline-blocks`가,
태그를 붙일지는 `docs-avoid-role-tags-in-doc-comments`가 정합니다.

헤더 문서 주석은 본문이 비어 있거나 영문 라벨뿐이면 요구를 채우지 못합니다.
함께 선택되는 `docs-write-concise-korean-comments-about-purpose-and-constraints`는
형식만 맞추는 절차가 아니라 실제 한국어 내용을 요구합니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
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

**Rule:** `T22` · `docs-write-concise-korean-comments-about-purpose-and-constraints`

**Applies when:** TypeScript·TSX 의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때.

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 쓰고 목적, 제약, 부수효과를 짧게 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

기술 용어와 식별자는 영어로 섞어도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
새로 넣거나 고친 문서 주석에는 그 선언의 목적이나 제약을 설명하는 한국어 구절이 있어야 합니다.
다른 필드 주석이 한국어라고 영어뿐인 헤더 주석을 대신 통과시키지 않습니다.

**Incorrect (영문이거나 방법만 늘어놓는 장황한 설명):**

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

### 5.4 Write Doc Comments as Multiline Blocks

**Rule:** `T23` · `docs-write-doc-comments-as-multiline-blocks`

**Applies when:** 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 `/** … */` 이나 `//` 로 선언을 설명하려 할 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`

**Impact: MEDIUM (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나눕니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  규칙이 허용한 예외의 이유를 적을 때는 `//` 한 줄을 씁니다.
  그 형식은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.

**Incorrect (한 줄 블록과 `//` 로 선언을 설명):**

```ts
/** entry 목록 조회 */
export const fetchEntryList = async (): Promise<Entry[]> => {
	return await client.get("/entries");
};

// entry 저장 요청
export const saveEntry = async (entry: Entry): Promise<void> => {
	await client.post("/entries", entry);
};
```

**Correct (여러 줄 블록으로 고정):**

```ts
/**
 * entry 목록 조회
 */
export const fetchEntryList = async (): Promise<Entry[]> => {
	return await client.get("/entries");
};

/**
 * entry 저장 요청
 */
export const saveEntry = async (entry: Entry): Promise<void> => {
	await client.post("/entries", entry);
};
```

### 5.5 Avoid Role Tags in Doc Comments

**Rule:** `T24` · `docs-avoid-role-tags-in-doc-comments`

**Applies when:** 문서 주석에 태그를 넣거나 바꿀 때. 새 태그 이름을 만들려 할 때.

**Review with:** `docs-require-header-jsdoc-on-key-declarations`

**Impact: MEDIUM (선언의 성격을 태그로 두 번 적지 않아 태그가 어긋날 일이 없습니다)**

선언이 무엇인지는 이름 규칙과 문법이 이미 드러냅니다.
그것을 태그로 다시 적지 않습니다.

- `@api`, `@helper`, `@field` 같은 역할 태그를 붙이지 않습니다.
- `@summary` 는 헤더 첫 줄이 이미 하는 일이라 쓰지 않습니다.
- `@schema`처럼 새 태그를 만들지 않습니다.
- `@deprecated`, `@example`, `@param`, `@returns`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

역할 태그는 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다.

**Incorrect (역할 태그로 선언 성격을 다시 적음):**

```ts
/**
 * @api entry 목록 조회
 */
export const fetchEntryList = async (): Promise<Entry[]> => {
	return await client.get("/entries");
};

/**
 * @schema entry 저장 입력
 */
export interface SaveEntryInput {
	title: string;
}
```

**Correct (설명만 적고 규격 태그만 필요할 때 씁니다):**

```ts
/**
 * entry 목록 조회
 */
export const fetchEntryList = async (): Promise<Entry[]> => {
	return await client.get("/entries");
};

/**
 * entry 저장 입력
 *
 * @deprecated `SaveEntryRequest` 로 옮기는 중이다.
 */
export interface SaveEntryInput {
	title: string;
}
```

### 5.6 Justify Convention Exceptions With a Checkable Reason Comment

**Rule:** `T25` · `docs-justify-convention-exceptions-with-a-reason-comment`

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

주석은 예외가 일어나는 줄 바로 위에 한국어 한 줄로 씁니다.
형식과 어투는 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

**Incorrect (확인할 수 없는 말로 예외를 정당화):**

```ts
// 성능을 위해 메모이제이션
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);

// 안전하게 기본값 처리
const pageSize = settings.pageSize ?? 20;
```

**Correct (외부 제약과 설정 키를 가리킴):**

```ts
// ag-grid 는 columnDefs 참조가 바뀌면 컬럼 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);

// 기본 페이지 크기는 config.pagination.default_page_size 가 정본이다.
const pageSize = settings.pageSize ?? config.pagination.default_page_size;
```

**Correct (측정 결과를 가리킴):**

```ts
// 행 5,000개에서 매 렌더 필터링이 120ms 로 측정됐다. 지연한 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => rows.filter((row) => matchRow(row, deferredKeyword)), [deferredKeyword, rows]);
```

## 6. Tooling

**Impact: MEDIUM**

이 컨벤션 중 기계가 잡을 수 있는 항목은 biome 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가 담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.

### 6.1 Configure Biome to Enforce the Mechanical Rules

**Rule:** `T26` · `tooling-configure-biome-to-enforce-these-rules`

**Applies when:** 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json` 의 `linter.rules` 에 항목을 추가·삭제할 때.

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다. `biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `functions-replace-enum-with-as-const-objects` |
| `style/useImportType` | `naming-use-direct-imports-and-public-entry-points` |
| `style/noRestrictedImports` | `naming-restrict-absolute-aliases-to-layer-roots`의 경로 표 |
| `style/useNamingConvention` | `naming-use-consistent-file-and-symbol-naming` |
| `correctness/noUnusedFunctionParameters` | `types-mark-unused-parameters-with-underscore` |
| `performance/noNamespaceImport` | `naming-use-direct-imports-and-public-entry-points` |

도구가 끝까지 못 가는 자리가 넷 있습니다. 이 넷은 리뷰가 봅니다.

- `enum` 성격 상수 객체에만 `snake_case`를 쓰는 구분은 `useNamingConvention`으로 표현할 수 없습니다.
  모듈 최상위 `const`에 세 표기를 다 허용해 두고, 어느 쪽이 맞는지는 사람이 봅니다.
  `functions-declare-functions-as-arrow-consts` 때문에 이름 붙인 함수도 이 항목에 들어가므로
  함수 이름의 `camelCase`도 도구가 아니라 리뷰가 봅니다.
- `functions-declare-functions-as-arrow-consts` 자체는 `biome`에 대응 규칙이 없습니다.
- `functions-avoid-imperative-assembly-in-wide-scopes`는 `useConst`로 잡히지 않습니다.
  `let` 을 `const` 로 바꿔 주기만 하고 `push` 누적은 그대로 남습니다.
- `types-mark-unused-parameters-with-underscore` 중 **매개변수를 아예 생략한 경우**는 도구가 못 봅니다.
  `noUnusedFunctionParameters`는 남겨 둔 매개변수만 봅니다.

**Incorrect (`recommended` 만 켜고 컨벤션 항목을 리뷰에 맡김):**

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
			"performance": {"noNamespaceImport": "error"},
			"style": {
				"noEnum": "error",
				"noParameterAssign": "error",
				"useConst": "error",
				"useImportType": "error",
				"noRestrictedImports": {
					"level": "error",
					"options": {
						"patterns": [{"group": ["@/page/*/*"], "message": "화면 내부는 절대경로로 가져오지 않습니다."}]
					}
				},
				"useNamingConvention": {
					"level": "error",
					"options": {
						"strictCase": false,
						"conventions": [
							{"selector": {"kind": "typeLike"}, "formats": ["PascalCase"]},
							{"selector": {"kind": "const", "scope": "global"}, "formats": ["camelCase", "PascalCase", "snake_case"]},
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
