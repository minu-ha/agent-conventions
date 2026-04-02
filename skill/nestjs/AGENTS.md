# NestJS 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`로 연결된 base skill source를 수정한 뒤 `npm --prefix package run build -- --skill=nestjs`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 NestJS 코딩 컨벤션입니다. 이 가이드는 명시적인 모듈 소유권, 얇은 controller, service 중심 도메인 로직, 의도적인 DTO 계약, NestJS/Prisma 경계에 맞는 예외 처리, 신뢰할 수 있는 backend 테스트 경계를 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, compiled guide에는 `typescript` base skill이 함께 포함됩니다.

이 가이드는 `TypeScript Convention`을 공통 기반 스킬로 함께 포함합니다.

---

## 함께 포함된 기반 스킬

- TypeScript Convention

---

## 목차

1. [TypeScript Convention Base - Naming and Module Boundaries](#1-typescript-convention-base---naming-and-module-boundaries) — **HIGH**
    - 1.1 [Centralize Shared Config and Constants Under One Namespace](#11-centralize-shared-config-and-constants-under-one-namespace)
    - 1.2 [Preserve Config Origin With Chained Access](#12-preserve-config-origin-with-chained-access)
    - 1.3 [Use Consistent File, Symbol, and Field Naming](#13-use-consistent-file-symbol-and-field-naming)
    - 1.4 [Use Direct Imports and Dedicated Public Entry Points](#14-use-direct-imports-and-dedicated-public-entry-points)
2. [TypeScript Convention Base - Types and Contracts](#2-typescript-convention-base---types-and-contracts) — **CRITICAL**
    - 2.1 [Document Custom Types and Declarative Shapes](#21-document-custom-types-and-declarative-shapes)
    - 2.2 [Mark Unused Parameters With an Underscore Prefix](#22-mark-unused-parameters-with-an-underscore-prefix)
    - 2.3 [Prefer Function Variable Types Over Parameter Annotations](#23-prefer-function-variable-types-over-parameter-annotations)
    - 2.4 [Reuse Callback Signatures From Existing Contracts](#24-reuse-callback-signatures-from-existing-contracts)
    - 2.5 [Reuse Existing Contracts Before Declaring New Types](#25-reuse-existing-contracts-before-declaring-new-types)
3. [TypeScript Convention Base - Functions and Helper Boundaries](#3-typescript-convention-base---functions-and-helper-boundaries) — **HIGH**
    - 3.1 [Avoid Imperative Assembly in Wide Scopes](#31-avoid-imperative-assembly-in-wide-scopes)
    - 3.2 [Extract Helpers Only When the Boundary Is Real](#32-extract-helpers-only-when-the-boundary-is-real)
    - 3.3 [Replace enum With as const Objects](#33-replace-enum-with-as-const-objects)
    - 3.4 [Use Named Object Params for Complex Signatures](#34-use-named-object-params-for-complex-signatures)
4. [TypeScript Convention Base - Absence and Fallback Handling](#4-typescript-convention-base---absence-and-fallback-handling) — **HIGH**
    - 4.1 [Expose Optional Values Instead of Silent Fallbacks](#41-expose-optional-values-instead-of-silent-fallbacks)
5. [TypeScript Convention Base - JSDoc and Comment Conventions](#5-typescript-convention-base---jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
    - 5.1 [Keep Inline Comments for Constraints and Caveats Only](#51-keep-inline-comments-for-constraints-and-caveats-only)
    - 5.2 [Require Header JSDoc on Key Declarations](#52-require-header-jsdoc-on-key-declarations)
    - 5.3 [Use @description for External Integration Functions](#53-use-description-for-external-integration-functions)
    - 5.4 [Use @helper for Reusable Pure Helper Functions](#54-use-helper-for-reusable-pure-helper-functions)
    - 5.5 [Use @tool for Model-callable Tool Factories](#55-use-tool-for-model-callable-tool-factories)
    - 5.6 [Write Concise Korean Comments About Purpose and Constraints](#56-write-concise-korean-comments-about-purpose-and-constraints)
6. [TypeScript Convention Base - Guardrails and Review Checks](#6-typescript-convention-base---guardrails-and-review-checks) — **MEDIUM**
    - 6.1 [Review Banned TypeScript Shortcuts Before Finishing](#61-review-banned-typescript-shortcuts-before-finishing)
7. [Module and Naming Boundaries](#7-module-and-naming-boundaries) — **HIGH**
    - 7.1 [Organize Domain Modules and Shared Backend Code by Scope](#71-organize-domain-modules-and-shared-backend-code-by-scope)
    - 7.2 [Place Shared and Module-local Constants by Scope](#72-place-shared-and-module-local-constants-by-scope)
    - 7.3 [Use Kebab-case Filenames With Nest Role Suffixes](#73-use-kebab-case-filenames-with-nest-role-suffixes)
8. [Layer Responsibilities and Dependencies](#8-layer-responsibilities-and-dependencies) — **CRITICAL**
    - 8.1 [Keep Controllers Thin and Boundary-focused](#81-keep-controllers-thin-and-boundary-focused)
    - 8.2 [Keep Services Responsible for Domain Rules and Prisma](#82-keep-services-responsible-for-domain-rules-and-prisma)
    - 8.3 [Preserve One-way Dependencies Through Services](#83-preserve-one-way-dependencies-through-services)
9. [DTOs and Backend Type Contracts](#9-dtos-and-backend-type-contracts) — **HIGH**
    - 9.1 [Document Custom Backend Types and Parameter Objects](#91-document-custom-backend-types-and-parameter-objects)
    - 9.2 [Expose Response DTO Fields Explicitly](#92-expose-response-dto-fields-explicitly)
    - 9.3 [Replace Local enum With as const Except Prisma Enums](#93-replace-local-enum-with-as-const-except-prisma-enums)
    - 9.4 [Reuse Prisma Generated Types Before New Backend Types](#94-reuse-prisma-generated-types-before-new-backend-types)
    - 9.5 [Validate Request DTOs With Validator, Transformer, and Swagger](#95-validate-request-dtos-with-validator-transformer-and-swagger)
10. [Methods, Async Flow, and Errors](#10-methods-async-flow-and-errors) — **HIGH**
    - 10.1 [Throw Context-rich NestJS Exceptions](#101-throw-context-rich-nestjs-exceptions)
    - 10.2 [Use Async/Await and Mark Intentional Fire-and-forget Calls](#102-use-asyncawait-and-mark-intentional-fire-and-forget-calls)
    - 10.3 [Use NestJS Class Methods and Explicit Async Return Types](#103-use-nestjs-class-methods-and-explicit-async-return-types)
11. [JSDoc and Comment Conventions](#11-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
    - 11.1 [Keep Inline Comments for Domain Rules and Library Caveats](#111-keep-inline-comments-for-domain-rules-and-library-caveats)
    - 11.2 [Require JSDoc on Service Hooks and Boundary Methods](#112-require-jsdoc-on-service-hooks-and-boundary-methods)
    - 11.3 [Use @summary and @description on Service and Prisma Boundaries](#113-use-summary-and-description-on-service-and-prisma-boundaries)
12. [Testing Strategy and Placement](#12-testing-strategy-and-placement) — **CRITICAL**
    - 12.1 [Add Tests When Branches, Endpoints, or Schema Behavior Change](#121-add-tests-when-branches-endpoints-or-schema-behavior-change)
    - 12.2 [Mock Unit Boundaries and Verify E2E Wiring](#122-mock-unit-boundaries-and-verify-e2e-wiring)
    - 12.3 [Place Test Files by Runtime Scope](#123-place-test-files-by-runtime-scope)
    - 12.4 [Separate Service Unit Tests From HTTP E2E Tests](#124-separate-service-unit-tests-from-http-e2e-tests)
13. [Guardrails and Review Checks](#13-guardrails-and-review-checks) — **MEDIUM**
    - 13.1 [Review Banned NestJS Shortcuts Before Finishing](#131-review-banned-nestjs-shortcuts-before-finishing)

---

## 1. TypeScript Convention Base - Naming and Module Boundaries

**Impact: HIGH**

이 섹션은 TypeScript 컨벤션에서 상속한 공통 규칙입니다. 식별자, import, public entry point, config 접근 패턴은 소유권과 오리진을 바로 드러내야 합니다.

### 1.1 Centralize Shared Config and Constants Under One Namespace

**Impact: HIGH (prevents shared config values from scattering across leaf files and losing a single public source)**

여러 파일에서 공유되는 설정과 상수는 `<config-entry-path>`를 공개 진입점으로 삼아 한 namespace 아래에 모읍니다. leaf 파일마다 공용 문자열, 키워드 배열, 명령 문자열을 흩뿌리지 말고, `config.*` 체이닝으로 읽을 수 있게 정리합니다.

**Incorrect (공용 설정을 leaf 파일마다 흩뿌림):**

```ts
const typescriptRuleRef = "<convention-doc-root>/typescript.md";
const orchestration_keyword = ["workflow", "langgraph"];
```

**Correct (공용 설정은 공개 namespace에서 읽음):**

```ts
import {config} from "<config-public-import>";

config.rule.rule_ref.typescript;
config.model.default.model_name;
config.model.role.classification.provider;
config.env.google_api_key;
```

### 1.2 Preserve Config Origin With Chained Access

**Impact: HIGH (keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases)**

공용 설정은 leaf 모듈 직접 import보다 `config.*` 체이닝 접근을 기본으로 합니다. 넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 원본 오리진을 흐리지 말고, 필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 사용합니다.

**Incorrect (넓은 스코프에서 원본 오리진을 감춤):**

```ts
const {env, verification} = config;
const googleApiKey = env.google_api_key;
const checkCommand = verification.command.check;
```

**Correct (체이닝으로 출처를 유지):**

```ts
config.rule.rule_ref.pipeline;
config.orchestration.task_category.workflow;
config.verification.command.check;
config.env.google_api_key;
```

### 1.3 Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (keeps file names, symbols, and shape fields predictable across modules and runtime structures)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다. 공용 설정 객체 키와 enum-like 상수 키는 `snake_case`, state 키와 일반 객체 키, schema 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

**Incorrect (파일명, 심볼명, 필드명이 제각각임):**

```ts
// userSettings.ts
const Chat_State = new StateSchema({
	repo_path: z.string(),
});
```

**Correct (형태별 네이밍 규칙을 일관되게 적용):**

```ts
// chat-state.ts
const chatState = new StateSchema({
	repoPath: z.string(),
});
```

### 1.4 Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (makes import ownership explicit without relying on barrels or ambiguous re-export layers)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다. 공용 설정, helper, schema, type는 각각의 공개 진입점으로 모으고, 타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.

**Incorrect (barrel과 혼합 import로 경계를 흐림):**

```ts
import {config, createChatModel, MainState} from "./index";
```

**Correct (직접 import와 공개 진입점을 구분):**

```ts
import type {RunnableConfig} from "@langchain/core/runnables";
import {config} from "<config-public-import>";
import {analysisStateValueSchema} from "<schema-public-import>";
import {createChatModel} from "<helper-public-import>";
import {mainState} from "<graph-public-import>/main";
import type {MainState} from "<type-public-import>";
```

## 2. TypeScript Convention Base - Types and Contracts

**Impact: CRITICAL**

이 섹션은 TypeScript 컨벤션에서 상속한 공통 규칙입니다. 함수 시그니처, callback 재사용, 타입 중복 제거, custom shape 문서화는 계약을 명시적이고 재사용 가능하게 유지해야 합니다.

### 2.1 Document Custom Types and Declarative Shapes

**Impact: CRITICAL (keeps domain-specific contracts understandable without digging through implementation details)**

커스텀 `type`, `interface`, `z.object(...)`, `StateSchema(...)`, 객체형 상수 같은 선언형 shape에는 JSDoc을 작성합니다. 객체형 계약은 헤더에 `@summary`, 각 필드 바로 위 `@field`를 쓰고, `Pick`/`Omit`/Indexed Access처럼 로컬 필드 선언이 없는 alias는 헤더 `@summary`만 둡니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씀):**

```ts
/**
 * @summary 오케스트레이션 검증 결과
 * @field ruleRef 검증 대상 규칙 문서 경로
 */
interface OrchestrationAuditResult {
	ruleRef: string;
	passed: boolean;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 오케스트레이션 검증 결과
 */
export interface OrchestrationAuditResult {
	/**
	 * @field 검증 대상 규칙 문서 경로
	 */
	ruleRef: string;
	/**
	 * @field 검증 통과 여부
	 */
	passed: boolean;
}

/**
 * @schema 모델 구조화 출력 스키마
 */
const auditResultSchema = z.object({
	/**
	 * @field 검증 대상 규칙 문서 경로
	 */
	ruleRef: z.string(),
});
```

### 2.2 Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다. 이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

**Incorrect (계약의 일부인 매개변수를 조용히 생략):**

```ts
const createNoopLogger = (): void => {
	// no-op
};
```

**Correct (미사용 매개변수를 `_`로 명시):**

```ts
const createNoopLogger = (_message: string): void => {
	// no-op
};
```

### 2.3 Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다. 적절한 함수 타입이 없을 때만 매개변수에 직접 타입을 명시하고, 그렇지 않으면 callable contract를 별도로 선언해 재사용합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (함수 변수 타입 선언을 우선):**

```ts
type FormatState = (state: Record<string, unknown>) => string;

const formatState: FormatState = (state) => {
	return JSON.stringify(state);
};
```

```ts
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};
```

### 2.4 Reuse Callback Signatures From Existing Contracts

**Impact: HIGH (prevents callback signatures from drifting when an existing interface or object contract already defines them)**

콜백 구현 시 매개변수를 다시 타이핑하기보다, 이미 존재하는 인터페이스나 계약의 시그니처를 Indexed Access로 재사용합니다. 이렇게 해야 구현과 계약 사이의 타입 정의가 한곳에서 유지됩니다.

**Incorrect (기존 계약이 있는데 콜백 시그니처를 다시 씀):**

```ts
interface OrchestrationTransformers {
	formatLog: (message: string) => string;
}

const formatLog = (message: string): string => {
	return `[workflow] ${message}`;
};
```

**Correct (기존 계약의 시그니처를 직접 참조):**

```ts
interface OrchestrationTransformers {
	formatLog: (message: string) => string;
}

const formatLog: OrchestrationTransformers["formatLog"] = (message) => {
	return `[workflow] ${message}`;
};
```

### 2.5 Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed)**

기존 타입이나 스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 만들지 않습니다. 의미 차이가 실제로 있을 때만 신규 타입을 만들고, 그 외에는 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
interface OrchestrationSnapshot {
	request: string;
	iteration: number;
}
```

**Correct (기존 계약에서 필요한 부분만 파생):**

```ts
type DevelopmentSnapshot = Pick<DevelopmentOrchestrationState, "request" | "iteration">;
```

## 3. TypeScript Convention Base - Functions and Helper Boundaries

**Impact: HIGH**

이 섹션은 TypeScript 컨벤션에서 상속한 공통 규칙입니다. 함수 시그니처와 helper 추출 규칙은 읽기 쉬운 local flow를 유지하면서 진짜 재사용 로직만 분리해야 합니다.

### 3.1 Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (keeps file-wide logic declarative instead of mutating shared locals through branching assembly)**

파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 하지 않습니다. 단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산하고, 분기와 보정이 결합된 계산은 `resolve*`, `build*`, `normalize*` 형태 유틸로 분리합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let selectedRuleRefs = ["<convention-doc-root>/pipeline.md"];

if (request.includes("typescript")) {
	selectedRuleRefs.push("<convention-doc-root>/typescript.md");
}
```

**Correct (좁은 스코프에서 한 번에 계산):**

```ts
const selectedRuleRefs = request.includes("typescript")
	? ["<convention-doc-root>/pipeline.md", "<convention-doc-root>/typescript.md"]
	: ["<convention-doc-root>/pipeline.md"];
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
export const normalizeRuleRefs = (ruleRefs: string[]): string[] => {
	return Array.from(new Set(ruleRefs)).sort();
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

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고, 함수 시그니처에서 바로 구조분해하지 않습니다. 객체 매개변수 타입은 파일 최상단에 선언하고, 함수 본문 첫 줄에서 구조분해해 사용합니다.

**Incorrect (시그니처에서 바로 구조분해):**

```ts
const buildPlanningPrompt = ({request, repoPath}: BuildPlanningPromptArgs): string => {
	return `${request} ${repoPath}`;
};
```

**Correct (객체 전체를 받고 본문에서 구조분해):**

```ts
const buildPlanningPrompt = (args: BuildPlanningPromptArgs): string => {
	const {request, repoPath} = args;
	return `${request} ${repoPath}`;
};

// biome-ignore format: grouped args destructuring is easier to scan on one line in this helper.
const {request, repoPath, taskCategory, projectArea, riskLevel, selectedRuleRefs} = args;
```

## 4. TypeScript Convention Base - Absence and Fallback Handling

**Impact: HIGH**

이 섹션은 TypeScript 컨벤션에서 상속한 공통 규칙입니다. 결측값은 casual fallback 연산자로 숨기지 말고 의도적으로 드러내야 합니다.

### 4.1 Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (makes missing data visible instead of quietly masking absence with generic defaults)**

옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다. 값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며 코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const googleApiKey = config.env.google_api_key ?? "demo-key";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
// 개발용 Agent Server 기본 포트는 환경 변수가 없으면 2024를 사용한다.
const agentServerPort = process.env.PORT?.trim() || "2024";
```

## 5. TypeScript Convention Base - JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

이 섹션은 TypeScript 컨벤션에서 상속한 공통 규칙입니다. 주석과 annotation 규칙은 자명한 코드 동작을 반복하지 않고 목적, 제약, 실행 경계를 설명해야 합니다.

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

외부 연동 함수, 주요 순수 함수, 재사용 함수, 도메인 규칙 함수, 커스텀 `type`/`interface`, 포맷 예외를 둔 함수 선언에는 예외 없이 선언 헤더 JSDoc을 작성합니다. 중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다.

**Incorrect (주요 선언에 헤더 설명이 없음):**

```ts
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

**Correct (핵심 선언의 헤더 JSDoc을 명시):**

```ts
/**
 * @description 워크플로 원문 파일 로드
 */
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

### 5.3 Use @description for External Integration Functions

**Impact: MEDIUM-HIGH (marks functions that cross filesystem, network, environment, or SDK boundaries as integration points)**

파일 시스템, 네트워크, 환경 변수, 외부 SDK 호출 함수는 `@description`을 사용합니다. 이 annotation은 순수 helper가 아니라 외부 실행 경계를 넘는 함수라는 점을 분명히 드러냅니다.

**Incorrect (외부 연동 함수를 일반 helper처럼 표시):**

```ts
/**
 * @helper 워크플로 원문 파일 로드
 */
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

**Correct (`@description`으로 외부 연동 경계를 표시):**

```ts
/**
 * @description 워크플로 원문 파일 로드
 */
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

### 5.4 Use @helper for Reusable Pure Helper Functions

**Impact: MEDIUM-HIGH (distinguishes reusable pure support logic from route, node, or integration boundaries)**

재사용 가능한 순수 helper, 문자열 조립 함수, 정규화 함수, 포맷 함수에는 `@helper`를 사용합니다. 한 node나 router 안에서만 쓰는 작은 계산은 직접 두고, 최소 3~4곳 이상 재사용되거나 밖으로 빼야 읽기 흐름이 명확해질 때만 helper로 승격합니다.

**Incorrect (작은 외부 연동 함수나 단회성 계산을 helper로 혼동):**

```ts
/**
 * @helper 사용자 토큰 조회
 */
const loadUserToken = async (): Promise<string> => {
	return await Promise.resolve("token");
};
```

**Correct (재사용 순수 계산에 `@helper`를 사용):**

```ts
/**
 * @helper 검증 실패 원인 문구 조립
 */
const buildAuditFailureMessage = (count: number): string => {
	return `${count}건의 검증 실패`;
};
```

### 5.5 Use @tool for Model-callable Tool Factories

**Impact: MEDIUM-HIGH (makes tool-creation boundaries explicit so model-callable execution surfaces are not mistaken for ordinary helpers)**

LangChain `tool(...)` 팩토리나 모델이 호출할 수 있는 도구 생성 함수는 `@tool`을 사용합니다. tool 내부에서만 쓰는 작은 보조 계산은 `@helper` 또는 무주석으로 둘 수 있지만, 도구 생성 경계 자체는 `@tool`로 드러내야 합니다.

**Incorrect (모델 호출 경계를 helper처럼 표기):**

```ts
/**
 * @helper 저장소 파일 읽기 tool 생성
 */
const createReadRepositoryFileTool = (repoPath: string) => {
	return tool(async ({fileRef}) => {
		return await readRepositoryFile({repoPath, fileRef});
	});
};
```

**Correct (`@tool`로 실행 경계를 표시):**

```ts
/**
 * @tool 저장소 파일 읽기 tool 생성
 */
const createReadRepositoryFileTool = (repoPath: string) => {
	return tool(async ({fileRef}) => {
		return await readRepositoryFile({repoPath, fileRef});
	});
};
```

### 5.6 Write Concise Korean Comments About Purpose and Constraints

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

## 6. TypeScript Convention Base - Guardrails and Review Checks

**Impact: MEDIUM**

이 섹션은 TypeScript 컨벤션에서 상속한 공통 규칙입니다. 마무리 전에는 TypeScript 컨벤션을 가장 자주 무너뜨리는 반복 shortcut 기준으로 코드를 점검해야 합니다.

### 6.1 Review Banned TypeScript Shortcuts Before Finishing

**Impact: MEDIUM (catches the recurring shortcuts that most often erode import, type, helper, fallback, and comment discipline)**

작업을 끝냈다고 보기 전에 반복적으로 금지되는 TypeScript 지름길을 다시 확인합니다. barrel export, 기존 타입 재선언, 재사용 근거 없는 조기 추상화, 넓은 스코프 명령형 조립, 사유 없는 폴백, 자명한 코드 설명 주석은 마무리 전에 제거합니다.

**Incorrect (금지 패턴을 그대로 남김):**

```ts
export * from "./index";

interface RequestSnapshot {
	request: string;
}

const googleApiKey = config.env.google_api_key ?? "demo-key";
```

**Correct (공개 경계와 결측 처리를 명시적으로 유지):**

```ts
import type {MainState} from "<type-public-import>";

type RequestSnapshot = Pick<MainState, "request">;

if (!config.env.google_api_key) {
	throw new Error("google_api_key is required.");
}
```

## 7. Module and Naming Boundaries

**Impact: HIGH**

파일명, 모듈 폴더, 상수 배치는 NestJS 도메인 경계와 역할을 한눈에 드러내야 합니다.

### 7.1 Organize Domain Modules and Shared Backend Code by Scope

**Impact: HIGH (keeps domain ownership and truly shared backend code separate so modules stay local by default)**

하나의 도메인은 하나의 모듈 폴더로 구성하고, `_shared/` 같은 공유 디렉터리에는 2개 이상의 모듈에서 함께 쓰는 코드만 둡니다. 한 모듈에서만 쓰이는 Guard, Pipe, Decorator, 상수는 해당 모듈 폴더 안에 유지합니다.

**Incorrect (공유 여부가 불분명한 코드가 전역으로 올라감):**

```txt
<src-root>/
  shared/
    users.guard.ts
    users.constants.ts
  users.service.ts
```

**Correct (도메인과 공유 범위를 분리):**

```txt
<src-root>/
  users/
    dto/
      create-user.dto.ts
      user-response.dto.ts
    users.module.ts
    users.controller.ts
    users.service.ts
    users.constants.ts
  <shared-dir>/
    constants.ts
    dto/
  prisma/
    prisma.module.ts
    prisma.service.ts
```

### 7.2 Place Shared and Module-local Constants by Scope

**Impact: MEDIUM-HIGH (prevents controller and service files from becoming ad-hoc homes for constants with unclear ownership)**

2개 이상의 모듈에서 공유되는 상수는 `<src-root>/<shared-dir>/constants.ts`에 모으고, 특정 도메인 모듈에서만 쓰이는 상수는 해당 모듈의 `*.constants.ts` 파일에 둡니다. Controller나 Service 파일에 공용 상수를 직접 선언하지 않습니다.

**Incorrect (Service 파일에 상수를 직접 선언):**

```ts
const DEFAULT_PAGE_SIZE = 20;
```

**Correct (상수 소유 범위에 맞는 파일에서 읽음):**

```ts
import {DEFAULT_PAGE_SIZE} from "./users.constants";
```

### 7.3 Use Kebab-case Filenames With Nest Role Suffixes

**Impact: HIGH (keeps NestJS file purpose obvious from the filename before the file is opened)**

NestJS 파일명은 `kebab-case`를 사용하고 역할 suffix를 반드시 포함합니다. 변수, 함수, 메서드는 `camelCase`, 클래스와 타입, 인터페이스는 `PascalCase`, 상수는 `SCREAMING_SNAKE_CASE`를 유지해 파일명과 심볼 역할이 함께 읽히도록 합니다.

**Incorrect (파일 목적이나 심볼 규칙이 불분명함):**

```txt
UsersService.ts
users.ts
CreateUser.ts
```

**Correct (역할 suffix와 일관된 심볼 규칙을 유지):**

```txt
users.module.ts
users.controller.ts
users.service.ts
create-user.dto.ts
user-response.dto.ts
```

## 8. Layer Responsibilities and Dependencies

**Impact: CRITICAL**

controller, service, Prisma 접근은 단방향 책임을 유지해야 비즈니스 로직과 런타임 경계가 흐려지지 않습니다.

### 8.1 Keep Controllers Thin and Boundary-focused

**Impact: CRITICAL (prevents controllers from absorbing domain logic, persistence calls, and response shaping that belongs in services)**

Controller는 요청 수신, 입력 검증 위임, 응답 반환만 담당합니다. 비즈니스 로직, Prisma 호출, 조건 분기, 응답 shape 조립은 Controller에 두지 않고 Service로 위임하며, `@Body()`, `@Param()`, `@Query()`는 DTO나 변환된 타입으로 받습니다.

**Incorrect (Controller에 Prisma 호출과 비즈니스 로직이 들어감):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Get(":id")
	async findOne(@Param("id") id: string) {
		const user = await this.prisma.user.findUnique({where: {id: Number(id)}});

		if (!user) {
			throw new NotFoundException();
		}

		return {...user, displayName: `${user.firstName} ${user.lastName}`};
	}
}
```

**Correct (Controller는 경계만 담당하고 Service로 위임):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(":id")
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.usersService.findOneOrThrow(id);
	}
}
```

### 8.2 Keep Services Responsible for Domain Rules and Prisma

**Impact: CRITICAL (keeps business rules, transaction orchestration, and persistence access in the backend layer designed to own them)**

Service는 비즈니스 로직, 도메인 규칙, 트랜잭션 조율을 담당하고 `PrismaService`를 직접 주입받아 데이터에 접근합니다. 다른 도메인 데이터가 필요하면 해당 도메인의 Service를 주입해 사용하고, 리소스 부재나 도메인 위반 예외도 Service에서 결정합니다.

**Incorrect (도메인 규칙이 Controller나 외부 레이어에 흩어짐):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		if (await this.prisma.user.findUnique({where: {email: dto.email}})) {
			throw new ConflictException();
		}

		return this.prisma.user.create({data: dto});
	}
}
```

**Correct (Service가 규칙과 Prisma 접근을 함께 소유):**

```ts
@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		const user = await this.prisma.user.findUnique({where: {id}});

		if (!user) {
			throw new NotFoundException(`User ${id} not found`);
		}

		return user;
	}
}
```

### 8.3 Preserve One-way Dependencies Through Services

**Impact: HIGH (prevents cross-layer shortcuts that bypass the service boundary and make backend change impact harder to reason about)**

의존 방향은 `Controller -> Service -> Prisma` 단방향만 허용합니다. Service가 Controller를 참조하는 것을 금지하고, 다른 도메인의 데이터가 필요하면 Prisma를 우회해 직접 접근하지 말고 해당 도메인 Service를 통해 연결합니다.

**Incorrect (Controller가 Prisma에 직접 접근해 서비스 경계를 우회):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.prisma.user.create({data: dto});
	}
}
```

**Correct (Controller에서 Service를 통해 한 방향으로 흐름 유지):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}
}
```

## 9. DTOs and Backend Type Contracts

**Impact: HIGH**

request DTO, response DTO, Prisma type, parameter object는 backend 계약을 명시적이고 재사용 가능하게 유지해야 합니다.

### 9.1 Document Custom Backend Types and Parameter Objects

**Impact: MEDIUM-HIGH (keeps backend-only contracts and parameter objects understandable without scanning method bodies)**

Prisma 생성 타입이 아닌 커스텀 `type`, `interface`, 파라미터 객체에는 JSDoc을 작성합니다. 객체형 계약은 헤더에 `@summary`, 각 필드 바로 위 `@field`를 사용하고, 관련 파일 최상단에 모아 배치합니다.

**Incorrect (커스텀 계약 설명이 없거나 헤더에 `@property`를 몰아씀):**

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 * @property page 페이지 번호
 */
interface PaginationParams {
	page: number;
	limit: number;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 */
interface PaginationParams {
	/**
	 * @field 1부터 시작하는 페이지 번호
	 */
	page: number;
	/**
	 * @field 페이지당 항목 수
	 */
	limit: number;
}
```

### 9.2 Expose Response DTO Fields Explicitly

**Impact: HIGH (prevents backend responses from leaking full Prisma models or sensitive fields by default)**

응답 DTO는 클라이언트에 노출할 필드를 명시적으로 선언하고, Prisma 모델 전체를 그대로 반환하지 않습니다. `@Exclude()`와 `@Expose()`를 사용해 민감 필드를 응답에서 제거합니다.

**Incorrect (응답에 모델 전체를 그대로 노출):**

```ts
return this.prisma.user.findUnique({where: {id}});
```

**Correct (응답 DTO가 노출 필드를 명시적으로 소유):**

```ts
@Exclude()
export class UserResponseDto {
	@Expose()
	id: number;

	@Expose()
	email: string;

	@Expose()
	name: string;

	@Expose()
	createdAt: Date;

	password: string;
}
```

### 9.3 Replace Local enum With as const Except Prisma Enums

**Impact: MEDIUM-HIGH (keeps local runtime values lightweight while still allowing generated Prisma enums to remain the source of truth)**

로컬 TypeScript `enum` 대신 객체 리터럴과 `as const`를 사용합니다. 다만 Prisma 스키마에서 생성된 enum은 `@prisma/client`에서 그대로 import해 source of truth를 유지합니다.

**Incorrect (로컬 enum을 직접 선언):**

```ts
enum UserRole {
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}
```

**Correct (로컬 값은 `as const`, Prisma enum은 generated source 사용):**

```ts
const USER_ROLE = {
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
} as const;

type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
```

```ts
import {Role} from "@prisma/client";
```

### 9.4 Reuse Prisma Generated Types Before New Backend Types

**Impact: HIGH (prevents duplicate backend type declarations when Prisma already owns the same structural contract)**

Prisma가 생성한 타입이 이미 존재하면 동일하거나 유사한 구조의 별도 타입 선언을 만들지 않습니다. 필요한 경우 Prisma 타입을 직접 참조하거나 `Pick`/`Omit`으로 파생하고, 구조 중복이 아니라 의미 차이가 실제로 있을 때만 신규 타입을 선언합니다.

**Incorrect (Prisma 타입과 같은 구조를 다시 선언):**

```ts
interface CreateUserParams {
	email: string;
	password: string;
	name: string;
}
```

**Correct (Prisma 생성 타입을 직접 재사용):**

```ts
import type {Prisma, User} from "@prisma/client";

type CreateUserParams = Prisma.UserCreateInput;
type UserData = User;
type SafeUser = Omit<User, "password">;
```

### 9.5 Validate Request DTOs With Validator, Transformer, and Swagger

**Impact: HIGH (keeps request contracts explicit by colocating validation, transformation, and API documentation on the DTO)**

요청 DTO는 `class-validator` 데코레이터로 유효성 검증을 선언하고, 필요할 때 `class-transformer`로 타입 변환을 명시합니다. 각 필드는 `@ApiProperty()`로 Swagger 문서를 유지하고, DTO 파일명은 `<action>-<domain>.dto.ts` 규칙을 따릅니다.

**Incorrect (요청 구조가 검증과 문서화 없이 흩어짐):**

```ts
export class CreateUserDto {
	email: string;
	password: string;
	name: string;
}
```

**Correct (DTO가 검증, 변환, 문서화를 함께 소유):**

```ts
export class CreateUserDto {
	@ApiProperty({example: "user@example.com"})
	@IsEmail()
	email: string;

	@ApiProperty({example: "password123", minLength: 8})
	@IsString()
	@MinLength(8)
	password: string;

	@ApiProperty({example: "홍길동"})
	@IsString()
	name: string;
}
```

## 10. Methods, Async Flow, and Errors

**Impact: HIGH**

backend 메서드는 shortcut에 기대지 말고 async 의도와 exception 맥락을 명시적으로 드러내야 합니다.

### 10.1 Throw Context-rich NestJS Exceptions

**Impact: HIGH (makes backend failures diagnosable by using the right NestJS exception type with real domain context)**

NestJS 내장 예외 클래스(`NotFoundException`, `BadRequestException`, `ForbiddenException` 등)를 사용하고, 메시지에는 도메인 이름이나 식별자 같은 맥락 정보를 포함합니다. 예외를 무음 처리하거나 `'Not found'` 같은 빈약한 메시지를 남기지 않습니다.

**Incorrect (맥락 없는 메시지와 무음 처리):**

```ts
throw new NotFoundException("Not found");

try {
	await this.prisma.user.delete({where: {id}});
} catch (error) {}
```

**Correct (맥락과 도메인 규칙을 드러내는 예외 사용):**

```ts
throw new NotFoundException(`User ${id} not found`);

if (user.role !== USER_ROLE.ADMIN) {
	throw new ForbiddenException("관리자 권한이 필요합니다.");
}
```

### 10.2 Use Async/Await and Mark Intentional Fire-and-forget Calls

**Impact: HIGH (keeps asynchronous backend flow readable and makes intentionally unawaited side effects explicit)**

비동기 처리는 `async/await`를 기본으로 사용하고 `.then()` 체이닝은 피합니다. `void` 반환 비동기 호출은 반드시 `await`하거나 `void` 키워드로 fire-and-forget 의도를 명시합니다.

**Incorrect (`.then()` 체이닝과 숨은 비동기 호출):**

```ts
this.prisma.user.findUnique({where: {id}}).then((user) => {
	return user;
});

this.eventsService.emit("user.created", user);
```

**Correct (`await` 또는 `void`로 의도를 드러냄):**

```ts
await this.eventsService.emit("user.created", user);

void this.eventsService.emit("user.created", user);
```

### 10.3 Use NestJS Class Methods and Explicit Async Return Types

**Impact: MEDIUM-HIGH (keeps backend class APIs conventional while making async method contracts readable without opening implementations)**

클래스 메서드는 NestJS 관례에 따라 일반 메서드 선언을 사용하고, 클래스 외부 유틸 함수는 화살표 함수를 기본으로 합니다. 복잡한 함수나 `async` 함수는 `Promise<T>` 반환 타입을 명시해 서비스 계약이 시그니처에서 드러나게 합니다.

**Incorrect (반환 계약이 불분명하거나 관례가 섞임):**

```ts
@Injectable()
export class UsersService {
	findOneOrThrow = async (id: number) => {
		return this.prisma.user.findUnique({where: {id}});
	};
}
```

**Correct (NestJS 메서드 스타일과 명시적 반환 타입 사용):**

```ts
@Injectable()
export class UsersService {
	async findOneOrThrow(id: number): Promise<SafeUser> {
		const user = await this.prisma.user.findUnique({where: {id}});

		if (!user) {
			throw new NotFoundException(`User ${id} not found`);
		}

		return user;
	}
}

export const buildPaginationMeta = (total: number, params: PaginationParams) => {
	const {page, limit} = params;
	return {total, page, limit, totalPages: Math.ceil(total / limit)};
};
```

## 11. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

주석과 annotation은 자명한 구현을 반복하지 않고 NestJS 경계 역할, Prisma 쿼리 의도, backend 위험 요소를 설명해야 합니다.

### 11.1 Keep Inline Comments for Domain Rules and Library Caveats

**Impact: MEDIUM (keeps inline comments reserved for backend constraints that would otherwise be easy to misread or accidentally remove)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고, `//` 주석은 도메인 규칙, 정합성 제약, Prisma 동작 제약, 트랜잭션 순서처럼 없으면 오해될 수 있는 내용에만 사용합니다. 변수명 그대로 반복하는 설명은 남기지 않습니다.

**Incorrect (변수명 반복이나 자명한 설명):**

```ts
const userId = params.id; // id 저장
```

**Correct (도메인 규칙이나 라이브러리 제약을 드러냄):**

```ts
// 소프트 삭제된 사용자는 목록 조회에서 제외하되 단건 조회는 허용한다.
const where = includeDeleted ? {id} : {id, deletedAt: null};
```

### 11.2 Require JSDoc on Service Hooks and Boundary Methods

**Impact: MEDIUM-HIGH (makes important backend execution boundaries searchable before readers inspect implementation details)**

Service public 메서드, 외부 API 호출 블록, NestJS 생명주기 훅, 커스텀 `type`/`interface`, Guard/Interceptor/Pipe 핵심 메서드에는 예외 없이 JSDoc을 작성합니다. Controller는 Swagger 데코레이터가 충분하면 JSDoc을 생략할 수 있습니다.

**Incorrect (핵심 서비스 메서드에 헤더 설명이 없음):**

```ts
@Injectable()
export class UsersService {
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}
}
```

**Correct (핵심 경계 선언에 JSDoc을 작성):**

```ts
@Injectable()
export class UsersService {
	/**
	 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}
}
```

### 11.3 Use @summary and @description on Service and Prisma Boundaries

**Impact: MEDIUM-HIGH (distinguishes simple backend intent summaries from more complex query explanations where readers need extra context)**

Service public 메서드 선언 바로 위에는 `@summary`를 사용하고, 복잡한 Prisma 쿼리나 트랜잭션이 포함된 메서드에는 `@description`을 함께 써서 왜 그런 조회가 필요한지 설명합니다. 단순 `findUnique`나 `create` 수준이면 `@summary`만으로 충분합니다.

**Incorrect (How 중심의 서술형 주석 또는 경계 누락):**

```ts
@Injectable()
export class UsersService {
	/**
	 * @summary id로 사용자를 찾아서 없으면 예외를 던집니다.
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}
}
```

**Correct (`@summary`와 필요한 경우 `@description`을 역할에 맞게 사용):**

```ts
@Injectable()
export class UsersService {
	/**
	 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}

	/**
	 * @summary 페이지네이션 사용자 목록 조회
	 * @description 역할 필터 + 생성일 내림차순 정렬 + 총 건수 병렬 조회
	 */
	async findManyWithCount(params: PaginationParams & {role?: Role}) {
		return this.prisma.$transaction([
			this.prisma.user.findMany({}),
			this.prisma.user.count({}),
		]);
	}
}
```

## 12. Testing Strategy and Placement

**Impact: CRITICAL**

unit과 e2e 테스트는 runtime 경계, 파일 배치, 의존 전략 기준으로 분리해 실패 원인을 빠르게 진단할 수 있어야 합니다.

### 12.1 Add Tests When Branches, Endpoints, or Schema Behavior Change

**Impact: HIGH (keeps backend regressions from slipping through when logic branches or API/database behavior changes)**

Service에 의미 있는 비즈니스 분기나 예외 처리가 추가되면 unit test를, 공개 API 엔드포인트가 추가되거나 변경되면 e2e test를 추가합니다. Prisma schema 변경이 API 동작에 영향을 주면 최소 한 개 이상의 e2e test로 회귀를 막습니다.

**Incorrect (분기나 엔드포인트가 늘어도 기존 테스트만 믿고 넘어감):**

```txt
- 새 권한 분기 추가
- 새 POST /users 엔드포인트 추가
- 응답 shape 변경
- 테스트 추가 없음
```

**Correct (변경된 경계에 맞는 테스트를 함께 추가):**

```txt
- Service 분기/예외 추가 -> unit test 추가
- 공개 HTTP 엔드포인트 추가/변경 -> e2e test 추가
- Prisma schema가 API 결과에 영향 -> e2e 회귀 테스트 추가
```

### 12.2 Mock Unit Boundaries and Verify E2E Wiring

**Impact: CRITICAL (keeps service unit tests fast and focused while making e2e tests prove real Nest wiring end to end)**

unit test에서는 DB, 외부 API, JWT, cache 같은 외부 의존성을 mock 처리하고 Service public 메서드의 핵심 분기와 예외를 검증합니다. e2e test에서는 `AppModule` 또는 필요한 실제 모듈 조합을 띄우고, `supertest`로 HTTP 진입점부터 ValidationPipe, Filter, Service, Prisma, DB 반영까지 실제 wiring을 검증합니다.

**Incorrect (unit에서 실제 DB를 띄우거나 e2e에서 핵심 wiring을 검증하지 않음):**

```txt
- unit test에서 실제 PostgreSQL 연결
- e2e test는 상태 코드만 보고 DB 반영 결과는 확인하지 않음
```

**Correct (레벨에 맞는 의존 전략을 사용):**

```ts
describe("AuthService", () => {
	it("login - invalid password increases lockCount", async () => {
		// unit: 외부 의존성은 jest.fn()으로 대체
	});
});
```

```ts
// e2e: supertest로 실제 HTTP 요청 + DB 반영 결과 검증
await request(app.getHttpServer()).post("/users").send(payload).expect(201);
```

### 12.3 Place Test Files by Runtime Scope

**Impact: HIGH (makes backend test ownership obvious by separating service-adjacent unit tests from top-level HTTP e2e tests)**

Service unit test는 대상 파일 옆의 `*.service.spec.ts`로 두고, HTTP e2e test는 `test/` 아래 `<domain>.e2e-spec.ts`로 둡니다. 테스트 파일명은 대상과 범위가 즉시 드러나야 하며, unit과 e2e를 같은 위치나 같은 이름 패턴으로 섞지 않습니다.

**Incorrect (범위와 대상이 드러나지 않는 배치):**

```txt
src/
  auth/
    auth.test.ts
test/
  test.ts
```

**Correct (런타임 범위에 따라 배치):**

```txt
src/
  auth/
    auth.service.ts
    auth.service.spec.ts

test/
  auth.e2e-spec.ts
```

### 12.4 Separate Service Unit Tests From HTTP E2E Tests

**Impact: CRITICAL (keeps backend failures diagnosable by assigning business logic and full-stack wiring to different test levels)**

테스트는 `unit test`와 `e2e test`를 기본 축으로 구분합니다. unit test는 Service 단위의 비즈니스 로직 검증을 담당하고, e2e test는 HTTP 요청부터 ValidationPipe, Filter, Service, Prisma, DB까지의 연결을 검증합니다. 특별한 이유가 없으면 controller 전용 spec보다 service unit test와 HTTP e2e test를 우선합니다.

**Incorrect (controller spec과 service logic test가 뒤섞임):**

```txt
- Controller 전용 spec을 기본값으로 만들고
- Service 분기 테스트는 생략
- HTTP e2e는 없음
```

**Correct (레벨별 목적을 분명히 분리):**

```txt
- Service 비즈니스 분기/예외 -> unit test
- HTTP 엔드포인트와 wiring -> e2e test
- 단순 DTO/상수 파일 -> 테스트 강제 없음
```

## 13. Guardrails and Review Checks

**Impact: MEDIUM**

backend 변경은 NestJS 레이어링, 타입 규율, 테스트 규율을 가장 자주 무너뜨리는 반복 shortcut 기준으로 점검해야 합니다.

### 13.1 Review Banned NestJS Shortcuts Before Finishing

**Impact: MEDIUM (catches the recurring shortcuts that most often blur NestJS layers, contracts, and test meaning before the work is closed out)**

마무리 전에 반복적으로 금지되는 NestJS 지름길을 다시 확인합니다. Controller에서 Prisma 직접 호출, `.then()` 체이닝, void 반환 비동기 호출 방치, 모델 전체 응답 노출, 중복 타입 선언, 맥락 없는 예외 메시지, 무음 처리, 이유 없는 폴백 같은 패턴은 정리하고 끝냅니다.

**Incorrect (금지 패턴을 남긴 채 마무리):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.prisma.user.create({data: dto});
	}
}

const userName = user?.name ?? "";
throw new NotFoundException("Not found");
```

**Correct (레이어, 결측, 예외 맥락을 명시적으로 유지):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}
}

if (!user) {
	throw new NotFoundException(`User ${id} not found`);
}
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
- https://docs.nestjs.com
- https://docs.nestjs.com/openapi/introduction
- https://www.prisma.io/docs
