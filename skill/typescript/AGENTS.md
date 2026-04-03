# TypeScript 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=typescript`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 TypeScript 코딩 컨벤션입니다. 이 가이드는 명시적인 네이밍, 직접 import, 재사용 가능한 타입 계약, 절제된 helper 추출, 의도적인 결측값 처리, 일관된 JSDoc 경계를 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, React, NestJS, TanStack Route, Playwright Test 같은 TypeScript 기반 skill과 함께 로드하는 공통 companion rule 세트로도 사용됩니다.

---

## 목차

1. [Naming and Module Boundaries](#1-naming-and-module-boundaries) — **HIGH**
    - 1.1 [Centralize Shared Config and Constants Under One Namespace](#11-centralize-shared-config-and-constants-under-one-namespace)
    - 1.2 [Preserve Config Origin With Chained Access](#12-preserve-config-origin-with-chained-access)
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
    - 3.2 [Extract Helpers Only When the Boundary Is Real](#32-extract-helpers-only-when-the-boundary-is-real)
    - 3.3 [Replace enum With as const Objects](#33-replace-enum-with-as-const-objects)
    - 3.4 [Use Named Object Params for Complex Signatures](#34-use-named-object-params-for-complex-signatures)
4. [Absence and Fallback Handling](#4-absence-and-fallback-handling) — **HIGH**
    - 4.1 [Expose Optional Values Instead of Silent Fallbacks](#41-expose-optional-values-instead-of-silent-fallbacks)
5. [JSDoc and Comment Conventions](#5-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
    - 5.1 [Keep Inline Comments for Constraints and Caveats Only](#51-keep-inline-comments-for-constraints-and-caveats-only)
    - 5.2 [Require Header JSDoc on Key Declarations](#52-require-header-jsdoc-on-key-declarations)
    - 5.3 [Use @description for External Integration Functions](#53-use-description-for-external-integration-functions)
    - 5.4 [Use @helper for Reusable Pure Helper Functions](#54-use-helper-for-reusable-pure-helper-functions)
    - 5.5 [Write Concise Korean Comments About Purpose and Constraints](#55-write-concise-korean-comments-about-purpose-and-constraints)
6. [Guardrails and Review Checks](#6-guardrails-and-review-checks) — **MEDIUM**
    - 6.1 [Review Banned TypeScript Shortcuts Before Finishing](#61-review-banned-typescript-shortcuts-before-finishing)

---

## 1. Naming and Module Boundaries

**Impact: HIGH**

식별자, import, public entry point, config 접근 패턴은 소유권과 오리진을 바로 드러내야 합니다.

### 1.1 Centralize Shared Config and Constants Under One Namespace

**Impact: HIGH (prevents shared config values from scattering across leaf files and losing a single public source)**

여러 파일에서 공유되는 설정과 상수는 `<config-entry-path>`를 공개 진입점으로 삼아 한 namespace 아래에 모읍니다.   
leaf 파일마다 공용 URL, feature flag, 페이지 크기, 상수 문자열을 흩뿌리지 말고, `config.*` 체이닝으로 읽을 수 있게 정리합니다.

**Incorrect (공용 설정을 leaf 파일마다 흩뿌림):**

```ts
const defaultPageSize = 20;
const billing_feature_keys = ["invoices", "refunds"];
```

**Correct (공용 설정은 공개 namespace에서 읽음):**

```ts
import {config} from "<config-public-import>";

config.api.public_base_url;
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
```

### 1.2 Preserve Config Origin With Chained Access

**Impact: HIGH (keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases)**

공용 설정은 leaf 모듈 직접 import보다 `config.*` 체이닝 접근을 기본으로 합니다. 넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 원본 오리진을 흐리지 말고, 필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 사용합니다.

**Incorrect (넓은 스코프에서 원본 오리진을 감춤):**

```ts
const {api, features} = config;
const billingBaseUrl = api.billing_base_url;
const enableRefunds = features.enable_refunds;
```

**Correct (체이닝으로 출처를 유지):**

```ts
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
config.env.sentry_dsn;
```

### 1.3 Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (keeps file names, symbols, and shape fields predictable across modules and runtime structures)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다. 공용 설정 객체 키와 enum-like 상수 객체 이름 및 그 키는 `snake_case`, 일반 객체 키, schema 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

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
const userProfileSchema = z.object({
	repoPath: z.string(),
});
```

### 1.4 Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (makes import ownership explicit without relying on barrels or ambiguous re-export layers)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다. 공용 설정, helper, schema, type는 각각의 공개 진입점으로 모으고, 타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.

**Incorrect (barrel과 혼합 import로 경계를 흐림):**

```ts
import {config, normalizeUserProfile, UserProfile} from "./index";
```

**Correct (직접 import와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "<type-public-import>";
import {config} from "<config-public-import>";
import {userProfileSchema} from "<schema-public-import>";
import {normalizeUserProfile} from "<helper-public-import>";
import {userRoleLabels} from "<constants-public-import>";
```

## 2. Types and Contracts

**Impact: CRITICAL**

함수 시그니처, callback 재사용, 타입 중복 제거, custom shape 문서화는 계약을 명시적이고 재사용 가능하게 유지해야 합니다.

### 2.1 Document Custom Types and Declarative Shapes

**Impact: CRITICAL (keeps domain-specific contracts understandable without digging through implementation details)**

커스텀 `type`, `interface`, `z.object(...)`, 객체형 상수 같은 선언형 shape에는 JSDoc을 작성합니다. 객체형 계약은 헤더에 `@summary`, 각 필드 바로 위 `@field`를 쓰고, `Pick`/`Omit`/Indexed Access처럼 로컬 필드 선언이 없는 alias는 헤더 `@summary`만 둡니다.

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
 * @schema 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```

### 2.2 Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다. 이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

**Incorrect (계약의 일부인 callback 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 미사용 매개변수만 `_`로 표시):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = (_message, _level) => {
	// no-op sink
};
```

### 2.3 Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다. 이미 존재하는 interface, object contract, framework alias를 먼저 재사용하고, 동일 callable contract를 여러 구현이 공유할 때만 별도 함수 타입 alias를 선언합니다. 한 번만 쓰는 로컬 함수 때문에 함수 타입 alias를 늘리는 것은 지양합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (기존 계약이나 실제 공유되는 callable contract를 재사용해 함수 변수 타입을 고정):**

```ts
interface UserFormatters {
	formatState: (state: Record<string, unknown>) => string;
}

const formatState: UserFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};

const normalizeSearchRequest: NormalizeRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

### 2.4 Reuse Callback Signatures From Existing Contracts

**Impact: HIGH (prevents callback signatures from drifting when an existing interface or object contract already defines them)**

콜백 구현 시 매개변수를 다시 타이핑하기보다, 이미 존재하는 인터페이스나 계약의 시그니처를 Indexed Access로 재사용합니다. 이렇게 해야 구현과 계약 사이의 타입 정의가 한곳에서 유지됩니다.

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
interface ToastFormatters {
	formatMessage: (message: string) => string;
}

const formatMessage: ToastFormatters["formatMessage"] = (message) => {
	return `[app] ${message}`;
};
```

### 2.5 Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed)**

기존 타입이나 스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 만들지 않습니다. 의미 차이가 실제로 있을 때만 신규 타입을 만들고, 그 외에는 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
interface UserPreview {
	id: string;
	name: string;
}
```

**Correct (기존 계약에서 필요한 부분만 파생):**

```ts
type UserPreview = Pick<UserRecord, "id" | "name">;
```

## 3. Functions and Helper Boundaries

**Impact: HIGH**

함수 시그니처와 helper 추출 규칙은 읽기 쉬운 local flow를 유지하면서 진짜 재사용 로직만 분리해야 합니다.

### 3.1 Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (keeps file-wide logic declarative instead of mutating shared locals through branching assembly)**

파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 하지 않습니다. 단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산하고, 분기와 보정이 결합된 계산은 `resolve*`, `build*`, `normalize*` 형태 유틸로 분리합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let visibleTabs = ["overview"];

if (canManageMembers) {
	visibleTabs.push("members");
}
```

**Correct (좁은 스코프에서 한 번에 계산):**

```ts
const visibleTabs = canManageMembers
	? ["overview", "members"]
	: ["overview"];
```

### 3.2 Extract Helpers Only When the Boundary Is Real

**Impact: HIGH (stops helper extraction from fragmenting local flow when no reusable contract or testable boundary actually exists)**

유틸이나 helper는 입력/출력 계약이 명확하고, 함수명이 도메인 의도를 설명하며, 런타임 문맥 없이도 독립 검증이 가능할 때만 분리합니다. 재사용 근거 없이 보기 좋게 만들기 위한 분리나, 한 번만 쓰는 짧은 계산 추출은 피하고 먼저 early return, 단계적 변수, 의미 있는 블록 구분으로 가독성을 확보합니다.

**Incorrect (단회성 계산까지 helper로 분리):**

```ts
const getNextIteration = (iteration: number) => iteration + 1;
const nextIteration = getNextIteration(iteration);
```

**Correct (정규화나 직렬화처럼 실제 경계가 있을 때만 helper로 분리):**

```ts
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

### 3.3 Replace enum With as const Objects

**Impact: MEDIUM-HIGH (keeps runtime values explicit and type extraction lightweight without introducing enum-specific behavior)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다. 이렇게 하면 런타임 값과 타입 추론을 함께 유지하면서도 enum 고유 문법과 번들 영향을 피할 수 있습니다.

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

type AuditStatus = (typeof audit_status)[keyof typeof audit_status];
```

### 3.4 Use Named Object Params for Complex Signatures

**Impact: HIGH (keeps long function signatures readable and makes grouped inputs easier to extend without positional confusion)**

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고, 함수 시그니처에서 바로 구조분해하지 않습니다. 객체 매개변수 타입은 파일 최상단에 선언하고, 함수 본문 첫 줄에서 구조분해해 사용합니다. 구조분해 줄이 길어 formatter 예외가 꼭 필요할 때도 함수 본문 안에서 처리합니다.

**Incorrect (시그니처에서 바로 구조분해):**

```ts
const buildPlanningPrompt = ({request, repoPath}: BuildPlanningPromptArgs): string => {
	return `${request} ${repoPath}`;
};
```

**Correct (객체 전체를 받고 본문에서 구조분해하며, 길면 formatter 예외를 함수 본문 안에 둠):**

```ts
const buildPlanningPrompt = (args: BuildPlanningPromptArgs): string => {
	// biome-ignore format: grouped args destructuring is easier to scan on one line in this helper.
	const {request, repoPath, taskCategory, projectArea, riskLevel, selectedRuleRefs} = args;
	return `${request} ${repoPath} ${taskCategory} ${projectArea} ${riskLevel} ${selectedRuleRefs.join(",")}`;
};
```

## 4. Absence and Fallback Handling

**Impact: HIGH**

결측값은 casual fallback 연산자로 숨기지 말고 의도적으로 드러내야 합니다.

### 4.1 Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (makes missing data visible instead of quietly masking absence with generic defaults)**

옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다. 값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며 코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
// 기본 페이지 크기는 제품 명세상 20으로 고정한다.
const pageSize = query.pageSize?.trim() || "20";
```

## 5. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

주석과 annotation 규칙은 자명한 코드 동작을 반복하지 않고 목적, 제약, 실행 경계를 설명해야 합니다.

### 5.1 Keep Inline Comments for Constraints and Caveats Only

**Impact: MEDIUM (prevents inline comments from narrating obvious code while preserving notes that avoid real misunderstandings)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고, `//` 주석은 도메인 규칙, 예외 방어 의도, 외부 라이브러리 제약, 부수효과 순서처럼 없으면 오해될 수 있는 경우에만 씁니다. 변수명 그대로 반복하는 설명은 남기지 않습니다.

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

**Impact: MEDIUM-HIGH (makes important boundaries searchable and explainable before readers inspect the implementation body)**

외부 연동 함수, 주요 순수 함수, 재사용 함수, 도메인 규칙 함수, 커스텀 `type`/`interface`, 포맷 예외를 둔 함수 선언에는 예외 없이 선언 헤더 JSDoc을 작성합니다. 중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다. annotation 종류는 더 구체적인 규칙을 따라 `@summary`, `@description`, `@helper` 중 하나를 고릅니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

**Correct (핵심 선언의 헤더 JSDoc을 명시):**

```ts
/**
 * @summary 중복 제거 후 사용자 ID 정렬
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

### 5.3 Use @description for External Integration Functions

**Impact: MEDIUM-HIGH (marks functions that cross filesystem, network, environment, or SDK boundaries as integration points)**

파일 시스템, 네트워크, 환경 변수, 외부 SDK 호출 함수는 `@description`을 사용합니다. 이 annotation은 순수 helper가 아니라 외부 실행 경계를 넘는 함수라는 점을 분명히 드러냅니다. 단순히 중요하다는 이유만으로 `@description`을 쓰지 말고, 실제 외부 연동 경계일 때만 사용합니다.

**Incorrect (외부 연동 함수를 일반 helper처럼 표시):**

```ts
/**
 * @helper 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

**Correct (`@description`으로 외부 연동 경계를 표시):**

```ts
/**
 * @description 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

### 5.4 Use @helper for Reusable Pure Helper Functions

**Impact: MEDIUM-HIGH (distinguishes reusable pure support logic from local implementation details or integration boundaries)**

재사용 가능한 순수 helper, 문자열 조립 함수, 정규화 함수, 포맷 함수에는 `@helper`를 사용합니다.   
한 함수나 한 파일 안에서만 쓰는 작은 계산은 직접 두고, 여러 call site가 공유하거나 밖으로 빼야 읽기 흐름이 명확해질 때만 helper로 승격합니다.

**Incorrect (작은 외부 연동 함수나 단회성 계산을 helper로 혼동):**

```ts
/**
 * @helper 사용자 토큰 조회
 */
const loadUserToken = async (): Promise<string> => {
	return await Promise.resolve("token");
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

**Impact: MEDIUM (keeps comments focused on intent and constraints instead of narrating code mechanics)**

주석은 한글로 작성하고, 목적, 제약, 부작용 중심으로 간결하게 적습니다. `@summary`, `@helper`, `@description` 문장은 명사형 종결이나 개조식 표현을 기본으로 하며, 코드 동작 설명보다 도입 이유와 제약 설명을 우선합니다.

**Incorrect (영문 또는 How 중심의 장황한 설명):**

```ts
/**
 * @summary This function sorts rule refs and returns the result.
 */
```

**Correct (한글, 명사형, 의도 중심 설명):**

```ts
/**
 * @summary 중복 제거 후 규칙 경로 정렬
 */
```

## 6. Guardrails and Review Checks

**Impact: MEDIUM**

마무리 전에는 TypeScript 컨벤션을 가장 자주 무너뜨리는 반복 shortcut 기준으로 코드를 점검해야 합니다.

### 6.1 Review Banned TypeScript Shortcuts Before Finishing

**Impact: MEDIUM (catches the recurring shortcuts that most often erode import, type, helper, fallback, and comment discipline)**

작업을 끝냈다고 보기 전에 반복적으로 금지되는 TypeScript 지름길을 다시 확인합니다. barrel export, 기존 타입 재선언, 재사용 근거 없는 조기 추상화, 넓은 스코프 명령형 조립, 사유 없는 폴백, 자명한 코드 설명 주석은 마무리 전에 제거합니다.

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

type UserPreview = Pick<UserRecord, "id" | "name">;

if (!settings.supportEmail) {
	throw new Error("supportEmail is required.");
}
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
