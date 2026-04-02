# React 컨벤션

**Version 1.0.0**  
Agent Conventions  
2026년 4월

> **안내:**  
> 이 문서는 에이전트와 LLM이 이 컨벤션 세트의 코드를 유지보수하고,  
> 생성하고, 리팩터링할 때 따르도록 compile한 가이드입니다.  
> source of truth는 현재 skill의 `rules/*.md`와, `extends`로 연결된 base skill의 `rules/*.md`에 있고, 이 파일은 생성 결과물입니다.

---

## 개요

에이전트 협업 팀을 위한 React 코딩 컨벤션입니다. 이 가이드는 shared 코드와 route-local 코드 사이의 명확한 소유 경계, React 계약에 맞는 handler/prop 시그니처, 예측 가능한 화면 흐름, 오리진을 보존하는 state 접근, React 고유 문서화 규칙을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, compiled guide에는 `typescript` base skill이 함께 포함됩니다.

이 가이드는 `TypeScript 컨벤션` base skill을 함께 포함합니다.

---

## 포함된 Base Skill

- TypeScript 컨벤션

---

## 목차

1. [TypeScript 컨벤션 Base - Naming and Module Boundaries](#1-typescript-base---naming-and-module-boundaries) — **HIGH**
   - 1.1 [Centralize Shared Config and Constants Under One Namespace](#11-centralize-shared-config-and-constants-under-one-namespace)
   - 1.2 [Preserve Config Origin With Chained Access](#12-preserve-config-origin-with-chained-access)
   - 1.3 [Use Consistent File, Symbol, and Field Naming](#13-use-consistent-file-symbol-and-field-naming)
   - 1.4 [Use Direct Imports and Dedicated Public Entry Points](#14-use-direct-imports-and-dedicated-public-entry-points)
2. [TypeScript 컨벤션 Base - Types and Contracts](#2-typescript-base---types-and-contracts) — **CRITICAL**
   - 2.1 [Document Custom Types and Declarative Shapes](#21-document-custom-types-and-declarative-shapes)
   - 2.2 [Mark Unused Parameters With an Underscore Prefix](#22-mark-unused-parameters-with-an-underscore-prefix)
   - 2.3 [Prefer Function Variable Types Over Parameter Annotations](#23-prefer-function-variable-types-over-parameter-annotations)
   - 2.4 [Reuse Callback Signatures From Existing Contracts](#24-reuse-callback-signatures-from-existing-contracts)
   - 2.5 [Reuse Existing Contracts Before Declaring New Types](#25-reuse-existing-contracts-before-declaring-new-types)
3. [TypeScript 컨벤션 Base - Functions and Helper Boundaries](#3-typescript-base---functions-and-helper-boundaries) — **HIGH**
   - 3.1 [Avoid Imperative Assembly in Wide Scopes](#31-avoid-imperative-assembly-in-wide-scopes)
   - 3.2 [Extract Helpers Only When the Boundary Is Real](#32-extract-helpers-only-when-the-boundary-is-real)
   - 3.3 [Replace `enum` With `as const` Objects](#33-replace-enum-with-as-const-objects)
   - 3.4 [Use Named Object Params for Complex Signatures](#34-use-named-object-params-for-complex-signatures)
4. [TypeScript 컨벤션 Base - Absence and Fallback Handling](#4-typescript-base---absence-and-fallback-handling) — **HIGH**
   - 4.1 [Expose Optional Values Instead of Silent Fallbacks](#41-expose-optional-values-instead-of-silent-fallbacks)
5. [TypeScript 컨벤션 Base - JSDoc and Comment Conventions](#5-typescript-base---jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
   - 5.1 [Keep Inline Comments for Constraints and Caveats Only](#51-keep-inline-comments-for-constraints-and-caveats-only)
   - 5.2 [Require Header JSDoc on Key Declarations](#52-require-header-jsdoc-on-key-declarations)
   - 5.3 [Use `@description` for External Integration Functions](#53-use-description-for-external-integration-functions)
   - 5.4 [Use `@helper` for Reusable Pure Helper Functions](#54-use-helper-for-reusable-pure-helper-functions)
   - 5.5 [Use `@tool` for Model-callable Tool Factories](#55-use-tool-for-model-callable-tool-factories)
   - 5.6 [Write Concise Korean Comments About Purpose and Constraints](#56-write-concise-korean-comments-about-purpose-and-constraints)
6. [TypeScript 컨벤션 Base - Guardrails and Review Checks](#6-typescript-base---guardrails-and-review-checks) — **MEDIUM**
   - 6.1 [Review Banned TypeScript Shortcuts Before Finishing](#61-review-banned-typescript-shortcuts-before-finishing)
7. [Ownership and Boundaries](#7-ownership-and-boundaries) — **CRITICAL**
   - 7.1 [Avoid Barrel Exports and React Namespace Types](#71-avoid-barrel-exports-and-react-namespace-types)
   - 7.2 [Keep UI, Widget, and -local Ownership Separate](#72-keep-ui-widget-and--local-ownership-separate)
   - 7.3 [Place Route-local Files by Visual Scope](#73-place-route-local-files-by-visual-scope)
   - 7.4 [Prefer Plain .ts Helpers Over Local Custom Hooks](#74-prefer-plain-ts-helpers-over-local-custom-hooks)
   - 7.5 [Route Shared Constants Through a Config Entry Point](#75-route-shared-constants-through-a-config-entry-point)
   - 7.6 [Use Consistent File and Symbol Naming](#76-use-consistent-file-and-symbol-naming)
8. [Typing and Contracts](#8-typing-and-contracts) — **HIGH**
   - 8.1 [Prefer React Handler Type Aliases Over Inline Event Parameter Annotations](#81-prefer-react-handler-type-aliases-over-inline-event-parameter-annotations)
   - 8.2 [Reuse Prop and API Contracts Before Creating New Types](#82-reuse-prop-and-api-contracts-before-creating-new-types)
9. [Component Structure and JSX](#9-component-structure-and-jsx) — **HIGH**
   - 9.1 [Accept props as a Whole and Destructure Inside the Component](#91-accept-props-as-a-whole-and-destructure-inside-the-component)
   - 9.2 [Prefer Arrow Functions and Object Parameters for Complex Signatures](#92-prefer-arrow-functions-and-object-parameters-for-complex-signatures)
   - 9.3 [Use Activity for JSX Render Branches](#93-use-activity-for-jsx-render-branches)
   - 9.4 [Use Named Handlers Instead of Hiding Logic in JSX](#94-use-named-handlers-instead-of-hiding-logic-in-jsx)
10. [Screen File Discipline](#10-screen-file-discipline) — **HIGH**
   - 10.1 [Avoid Premature Abstraction in Screen Code](#101-avoid-premature-abstraction-in-screen-code)
   - 10.2 [Extract Utilities Only When the Boundary Is Real](#102-extract-utilities-only-when-the-boundary-is-real)
   - 10.3 [Keep Derived Values Close to Where They Are Used](#103-keep-derived-values-close-to-where-they-are-used)
   - 10.4 [Keep Route Entry Files Focused on Screen Flow](#104-keep-route-entry-files-focused-on-screen-flow)
   - 10.5 [Move Pure Support Code Out of Route Entry Files](#105-move-pure-support-code-out-of-route-entry-files)
11. [Events and Interaction Flow](#11-events-and-interaction-flow) — **MEDIUM-HIGH**
   - 11.1 [Keep Screen-specific Handler Flow Inline Until a Real Utility Emerges](#111-keep-screen-specific-handler-flow-inline-until-a-real-utility-emerges)
   - 11.2 [Name Handlers Predictably and Curry Extra Arguments](#112-name-handlers-predictably-and-curry-extra-arguments)
12. [State and Data Flow](#12-state-and-data-flow) — **CRITICAL**
   - 12.1 [Avoid Silent Fallback Defaults and Ad-hoc Loading Branches](#121-avoid-silent-fallback-defaults-and-ad-hoc-loading-branches)
   - 12.2 [Choose State Tools by Source of Truth](#122-choose-state-tools-by-source-of-truth)
   - 12.3 [Name Query and Mutation Bindings Consistently](#123-name-query-and-mutation-bindings-consistently)
   - 12.4 [Prefer React Compiler Defaults Over Manual Memoization](#124-prefer-react-compiler-defaults-over-manual-memoization)
   - 12.5 [Preserve Response and Store Origin in Wide Scopes](#125-preserve-response-and-store-origin-in-wide-scopes)
   - 12.6 [Shape React Query Data in query.select](#126-shape-react-query-data-in-queryselect)
   - 12.7 [Store Shared Role and Authority Decisions Once](#127-store-shared-role-and-authority-decisions-once)
13. [Documentation and Comments](#13-documentation-and-comments) — **MEDIUM**
   - 13.1 [Limit Inline Comments to Non-obvious Logic](#131-limit-inline-comments-to-non-obvious-logic)
   - 13.2 [Require JSDoc on React Hooks, Handlers, and Key Declarations](#132-require-jsdoc-on-react-hooks-handlers-and-key-declarations)
   - 13.3 [Use @description for API Calls and @summary for Everything Else](#133-use-description-for-api-calls-and-summary-for-everything-else)

---

## 1. TypeScript 컨벤션 Base - Naming and Module Boundaries

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

## 2. TypeScript 컨벤션 Base - Types and Contracts

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

## 3. TypeScript 컨벤션 Base - Functions and Helper Boundaries

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

### 3.3 Replace `enum` With `as const` Objects

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

## 4. TypeScript 컨벤션 Base - Absence and Fallback Handling

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

## 5. TypeScript 컨벤션 Base - JSDoc and Comment Conventions

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

### 5.3 Use `@description` for External Integration Functions

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

### 5.4 Use `@helper` for Reusable Pure Helper Functions

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

### 5.5 Use `@tool` for Model-callable Tool Factories

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

## 6. TypeScript 컨벤션 Base - Guardrails and Review Checks

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

## 7. Ownership and Boundaries

**Impact: CRITICAL**

Shared UI, widget, route-local 코드는 소유 경계가 분명해야 에이전트가 코드를 예측 가능하게 배치할 수 있습니다.

### 7.1 Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막음)**

`index.ts` 기반 barrel export를 만들지 않고, React 타입은 `React.MouseEvent` 같은 전역 네임스페이스 대신 `import type`으로 직접 가져옵니다. 이렇게 해야 import 경로와 타입 출처가 더 명시적으로 유지됩니다.

**Incorrect (barrel export와 namespace 타입 혼용):**

```ts
// index.ts
export * from "./user-card";

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};
```

**Correct (직접 import와 import type 사용):**

```ts
import type { MouseEventHandler } from "react";

const handleClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 7.2 Keep UI, Widget, and -local Ownership Separate

**Impact: CRITICAL (공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음)**

`ui`는 순수 view, `widget`은 여러 화면에서 재사용되는 공용 조합, `-local`은 특정 route 맥락을 아는 화면 전용 코드로 유지합니다. 파일명도 `ui-*`, `widget-*` 접두사로 소유자를 바로 드러내야 합니다.

**Incorrect (view 레이어와 화면 전용 로직이 섞임):**

```tsx
// <component-root>/ui/button/ui-delete-table-button.tsx
const UiDeleteTableButton = () => {
  const navigate = useNavigate();

  return <button onClick={() => void navigate({ to: "/tables" })}>삭제</button>;
};
```

**Correct (레이어별 책임과 이름이 분리됨):**

```tsx
// <component-root>/ui/button/ui-button.tsx
export interface UiButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const UiButton = (props: UiButtonProps) => {
  const { onClick } = props;
  return <button onClick={onClick} />;
};
```

```tsx
// <route-root>/tables/-local/delete-table-button.tsx
const DeleteTableButton = () => {
  const navigate = useNavigate();
  return <UiButton onClick={() => void navigate({ to: "/tables" })} />;
};
```

### 7.3 Place Route-local Files by Visual Scope

**Impact: HIGH (route 전용 component, style, logic를 예측 가능한 위치에 유지함)**

화면 전용 컴포넌트와 스타일은 `-local/`에 두고, 비컴포넌트 로직은 라우트와 같은 계층의 `.ts` 파일에 둡니다. 같은 계층 `.ts` 파일에는 JSX를 직접 넣지 않고, 필요하면 렌더링 콜백을 주입합니다.

**Incorrect (화면 전용 컴포넌트와 순수 로직 위치가 뒤섞임):**

```tsx
// folders.ts
export const renderFolderTitle = () => <span>Folder</span>;
```

**Correct (시각 코드와 비시각 로직의 위치를 분리):**

```ts
// folders.ts
export const mapFolderNodeToTreeData = (node: FolderNode, renderers: FolderTreeRenderers) => {
  return {
    key: String(node.id),
    title: renderers.renderTitle(node),
  };
};
```

```tsx
// -local/folder-tree.tsx
<UiTree treeData={nodes.map((node) => mapFolderNodeToTreeData(node, { renderTitle }))} />
```

### 7.4 Prefer Plain .ts Helpers Over Local Custom Hooks

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함)**

컴포넌트 하나를 위한 계산, 정규화, payload 조립은 기본적으로 일반 `.ts` helper로 둡니다. React 생명주기, state, context, effect에 실제로 묶일 때만 custom hook으로 승격합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (순수 계산은 일반 helper로 유지):**

```ts
export const buildMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

### 7.5 Route Shared Constants Through a Config Entry Point

**Impact: HIGH (공용 상수가 route와 local component 곳곳에 흩어지는 것을 막음)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 `-local` 컴포넌트에 흩뿌리지 말고 공개 진입점에서 가져옵니다. 사용처는 `config.*` 체이닝으로 접근해 출처를 유지합니다.

**Incorrect (공용 상수를 화면 파일에 직접 선언):**

```ts
export const DASHBOARD_MENU_KEY = {
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
} as const;
```

**Correct (공용 진입점에서 상수를 사용):**

```ts
import { config } from "<config-entry-import-path>";

config.navigation.projectMenuKey.dashboard;
```

### 7.6 Use Consistent File and Symbol Naming

**Impact: HIGH (에이전트가 파일을 만들거나 옮길 때 소유 경계와 의도를 분명하게 유지함)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입과 컴포넌트는 `PascalCase`, 상수는 `SCREAMING_SNAKE_CASE`를 사용합니다. 파일명과 심볼명이 소유자나 역할을 바로 드러내야 route-local 이동과 공용화 판단이 쉬워집니다.

**Incorrect (파일명과 심볼 규칙이 제각각임):**

```tsx
// UserCard.tsx
export const user_card = () => {
  return null;
};
```

**Correct (파일명과 심볼 규칙이 일관됨):**

```tsx
// user-card.tsx
export const UserCard = () => {
  return null;
};
```

## 8. Typing and Contracts

**Impact: HIGH**

React가 제공하는 handler와 prop 계약은 선언 위치에서 바로 드러나야 하며, props/API 시그니처 재사용도 React 문맥에 맞게 유지해야 합니다.

### 8.1 Prefer React Handler Type Aliases Over Inline Event Parameter Annotations

**Impact: HIGH (React handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함)**

React가 제공하는 이벤트 핸들러 타입이나 prop callback 계약이 이미 있다면, 매개변수 타입보다 함수 변수 타입 선언을 우선합니다. 일반 TypeScript 함수 타입 규칙은 base skill에서 다루고, 여기서는 React handler alias를 바로 쓰는 경우를 강조합니다.

**Incorrect (핸들러 타입이 있는데 매개변수만 타입 지정):**

```ts
const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};
```

**Correct (함수 변수 타입으로 시그니처를 고정):**

```ts
import type { MouseEventHandler } from "react";

const handleAddButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 8.2 Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (중복 타입 구조가 시간이 지나며 어긋나는 것을 막음)**

Props 콜백 구현 시에는 Props 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다. 필요하면 `Pick`, `Omit`, indexed access 같은 파생 타입으로 좁힙니다.

**Incorrect (같은 계약을 새 타입으로 다시 정의):**

```ts
interface PermissionMemberEditValues {
  id: number;
  name: string;
  role: string;
}
```

**Correct (기존 계약을 직접 재사용):**

```ts
type PermissionGroupAdminSummary = Pick<PermissionGroupAdminResponse, "id" | "name">;

const handleLinkClick: LinkProps["onLinkClick"] = (event) => {
  event.preventDefault();
};
```

## 9. Component Structure and JSX

**Impact: HIGH**

컴포넌트는 계약이 분명하게 드러나야 하며, JSX 안에 동작을 숨기지 않고 렌더링 로직을 읽기 쉽게 유지해야 합니다.

### 9.1 Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약을 시그니처에 남기고 실제 사용을 본문 가까이에 유지함)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다. 이렇게 하면 시그니처에서 계약을 한눈에 읽고, 본문에서 실제 사용하는 값을 좁은 스코프에 둘 수 있습니다.

**Incorrect (시그니처에서 바로 구조분해):**

```tsx
const UserCard = ({ id, onSave }: UserCardProps) => {
  return <button onClick={onSave}>{id}</button>;
};
```

**Correct (계약과 사용 위치를 분리):**

```tsx
const UserCard = (props: UserCardProps) => {
  const { id, onSave } = props;
  return <button onClick={onSave}>{id}</button>;
};
```

### 9.2 Prefer Arrow Functions and Object Parameters for Complex Signatures

**Impact: MEDIUM-HIGH (함수 선언과 다중 인자 계약을 더 쉽게 확장하고 수정할 수 있게 함)**

함수는 기본적으로 화살표 함수로 선언하고, 매개변수가 3개 이상이거나 같은 계열 값이 함께 이동하면 단일 객체 매개변수로 묶습니다. 객체 매개변수 타입은 파일 상단에 선언해 계약을 먼저 드러냅니다.

**Incorrect (길고 취약한 positional parameter 나열):**

```ts
export function updateEntryMediaUploadFileByUid(
  uploadFileListByColumn: Record<string, UploadFile[]>,
  columnName: string,
  fileUid: string,
  updater: (uploadFile: UploadFile) => UploadFile,
) {
  // ...
}
```

**Correct (화살표 함수와 객체 매개변수 사용):**

```ts
export interface UpdateEntryMediaUploadFileByUidParams {
  uploadFileListByColumn: Record<string, UploadFile[]>;
  columnName: string;
  fileUid: string;
  updater: (uploadFile: UploadFile) => UploadFile;
}

export const updateEntryMediaUploadFileByUid = (params: UpdateEntryMediaUploadFileByUidParams) => {
  const { uploadFileListByColumn, columnName, fileUid, updater } = params;
  // ...
};
```

### 9.3 Use Activity for JSX Render Branches

**Impact: MEDIUM (표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함)**

JSX에서 렌더링 노드를 바꾸는 조건부 분기에는 삼항 렌더링 대신 `<Activity />`를 사용합니다. 속성값 계산은 삼항을 허용하지만, 노드 자체의 표시/숨김은 `Activity`로 통일합니다.

**Incorrect (렌더링 노드 선택을 삼항으로 처리):**

```tsx
return hasItems ? <ItemList /> : <EmptyState />;
```

**Correct (표시/숨김을 Activity로 드러냄):**

```tsx
return (
  <>
    <Activity mode={hasItems ? "visible" : "hidden"}>
      <ItemList />
    </Activity>
    <Activity mode={hasItems ? "hidden" : "visible"}>
      <EmptyState />
    </Activity>
  </>
);
```

### 9.4 Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 함)**

JSX에서는 명명된 핸들러 참조를 기본으로 하고, 아주 짧은 단순 위임만 인라인 함수로 허용합니다. 분기, 비동기 호출, 여러 부수효과가 들어가면 반드시 핸들러로 분리합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨김):**

```tsx
<UiButton
  onClick={async () => {
    if (!selectedTable) {
      return;
    }

    await mutationContentTypeRemove.mutateAsync({ params: { projectId } });
    void navigate({ to: "/next" });
  }}
/>
```

**Correct (로직을 명명된 핸들러로 노출):**

```tsx
const handleRemoveTableButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  // ...
};

<UiButton onClick={handleRemoveTableButtonClick} />;
```

## 10. Screen File Discipline

**Impact: HIGH**

Route entry 파일은 화면 흐름을 분명하게 보여줘야 하며, helper 추출도 경계가 정당할 때만 해야 합니다.

### 10.1 Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함)**

반복이 보인다는 이유만으로 즉시 공용 hook, 공용 컴포넌트, 공용 helper로 올리지 않습니다. 실제 재사용 범위가 둘 이상에서 검증되고 계약이 안정되었을 때만 공용화를 허용합니다.

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const usePermissionA = () => {
  // 유사 로직
};

const usePermissionB = () => {
  // 유사 로직
};
```

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * @summary 입력 검증, 저장, 오류 표시 계약
 */
export const useContentEditor = () => {
  // ...
};
```

### 10.2 Extract Utilities Only When the Boundary Is Real

**Impact: HIGH (route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음)**

유틸 분리는 React state와 직접 결합되지 않고, 입력/출력 계약이 명확하며, 함수명이 도메인 의도를 설명할 때만 검토합니다. 반복, 복잡한 분기, 정규화, 테스트 가치가 실제로 있을 때만 같은 계층 `.ts` 파일로 뺍니다. `queryClient.invalidateQueries`처럼 해당 hook 컨텍스트에 붙어 있을 때 더 읽기 쉬운 동기화 로직은 별도 유틸로 모으지 않습니다.

**Incorrect (한 줄 계산까지 helper로 쪼갬):**

```ts
const getNextPage = (page: number) => page + 1;
const handleMoveNextPage = () => {
  setPage(getNextPage(page));
};
```

**Correct (정규화나 순회처럼 경계가 선명한 로직만 분리):**

```ts
export const normalizeFolderTreeNodes = (nodes: ContentFolderNodeResponse[]) => {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
  }));
};
```

```ts
const handleSave = async () => {
  await mutationContentTypeUpsert.mutateAsync({ data: request });
  await queryClient.invalidateQueries({ queryKey: ["content-type-list"] });
};
```

필요하다면 함수 시그니처 가독성을 위해 JSDoc 헤더에 `biome-ignore format:`를 제한적으로 둘 수 있지만, helper 추출의 근거로 사용하면 안 됩니다.

### 10.3 Keep Derived Values Close to Where They Are Used

**Impact: HIGH (오리진을 보존하고 route 파일이 alias와 명령형 setup 코드로 채워지는 것을 막음)**

화면 상단에서 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 금지합니다. Hook 파라미터, JSX 표시값, effect 내부 계산은 실제 사용하는 좁은 스코프에서 직접 계산합니다. JSX에서만 쓰는 표시값은 특히 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

**Incorrect (화면 상단에서 파생값과 별칭을 누적):**

```ts
const tableInfoData = responseContentManagerGetTableInfo.data;
const hasSelectedRows = selectedRows.length > 0;
const selectedTableNameForQuery = selectedEntryTableState.selectedTableNode?.tableName;
```

**Correct (사용 지점 가까이에서 계산):**

```ts
const responseContentManagerSearchContents = useContentManagerSearchContentsSuspense({
  tableName: selectedEntryTableState.selectedTableNode?.tableName,
});
```

```tsx
<Activity mode={selectedRows.length > 0 ? "visible" : "hidden"} />
```

```tsx
return <UiInput value={selectedNodeContext?.node?.name} />;
```

### 10.4 Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다.

**Incorrect (흐름보다 분해 자체가 목적이 됨):**

```tsx
return (
  <PageShell>
    <PageHeaderSection />
    <PageContentSection />
    <PageFooterSection />
  </PageShell>
);
```

**Correct (화면 엔트리에서 흐름과 orchestration이 보임):**

```tsx
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense({ projectId });
const handleSubmitButtonClick = async () => {
  // ...
};

return <ContentTypeBuilderScreen onSubmit={handleSubmitButtonClick} />;
```

### 10.5 Move Pure Support Code Out of Route Entry Files

**Impact: HIGH (route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함)**

화면 전용 불변 설정, 옵션 목록, preset, 컬럼 메타, 순수 helper, 타입 선언은 route entry 상단에 쌓아두지 말고 같은 계층 `.ts` 파일로 이동합니다. route entry에는 React state, API response/mutation, handler, `useEffect`, 렌더링 흐름만 남기는 것을 기본값으로 삼습니다.

**Incorrect (route entry 상단에 순수 지원 코드가 누적됨):**

```ts
const getMediaColumnRules = () => {
  // ...
};

const buildFileRequests = () => {
  // ...
};
```

**Correct (route entry에는 흐름만 남김):**

```tsx
const [mediaUploadFileListByColumn, setMediaUploadFileListByColumn] = useState({});
const responseContentManagerGetTableInfo = useContentManagerGetTableInfo();

const handleFormFinish = () => {
  // ...
};
```

## 11. Events and Interaction Flow

**Impact: MEDIUM-HIGH**

Event handler는 이름이 예측 가능하고 간접 호출이 최소화된 상태로, 빠르게 훑어볼 수 있어야 합니다.

### 11.1 Keep Screen-specific Handler Flow Inline Until a Real Utility Emerges

**Impact: MEDIUM (모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지함)**

핸들러가 길어져도 바로 helper로 쪼개지 않습니다. 먼저 early return, 단계적 지역 변수, 의미 있는 블록 구분으로 읽기 쉽게 유지하고, `screen-extract-utilities-selectively` 규칙을 만족할 때만 분리합니다.

**Incorrect (재사용 근거 없이 흐름을 지나치게 분해):**

```ts
const validate = () => {/* ... */};
const buildRequest = () => {/* ... */};
const runMutation = async () => {/* ... */};
const postProcess = () => {/* ... */};
```

**Correct (핸들러에서 흐름을 직접 읽을 수 있게 유지):**

```ts
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!responseContentTypeGetListSuspense.data.selectedTable) {
    return;
  }

  if (mutationContentTypeUpsert.isPending) {
    return;
  }

  await mutationContentTypeUpsert.mutateAsync({ data: request });
  void navigate({ to: "/content-type-builder" });
};
```

### 11.2 Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 피함)**

이벤트 핸들러는 `handle + Target + Event` 패턴으로 이름 짓습니다. 추가 인자가 필요하면 handler factory 형태의 고차 함수로 감싸고, 최종 반환값은 React handler 타입으로 고정합니다.

**Incorrect (이름과 시그니처가 제각각임):**

```ts
const onSelect = (id: string, event: MouseEvent<HTMLLIElement>) => {
  console.log(id, event.currentTarget);
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 handler):**

```ts
import type { MouseEventHandler } from "react";

const handleListItemClick =
  (id: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    console.log(id);
  };
```

## 12. State and Data Flow

**Impact: CRITICAL**

Server state, store 접근, 파생값은 오리진을 보존해야 하며 데이터 변형도 가능한 한 소스 가까이에 있어야 합니다.

### 12.1 Avoid Silent Fallback Defaults and Ad-hoc Loading Branches

**Impact: HIGH (결측 데이터를 숨기지 않고 로딩 UX를 Suspense 또는 명시적 예외 처리 쪽으로 유도함)**

옵셔널 값에 `??`, `||`로 습관적인 기본값을 넣지 않고, `isPending`, `isFetching` 같은 상태를 즉시 렌더링하지 않습니다. 결측값은 드러내고, 로딩은 기본적으로 Suspense 경계나 상위 레이아웃에서 처리합니다. 예외가 필요하면 가까운 한글 주석으로 이유를 남깁니다.

**Incorrect (결측과 로딩을 즉석에서 숨김):**

```tsx
const name = responseUserGetItemSuspense.data?.name ?? "";

if (responseUserGetItemSuspense.isPending) {
  return <Spinner />;
}
```

**Correct (결측을 드러내고 의도 있는 분기만 허용):**

```tsx
const name = responseUserGetItemSuspense.data?.name;

return (
  <Activity mode={name ? "visible" : "hidden"}>
    <UserName value={name} />
  </Activity>
);
```

### 12.2 Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음)**

로컬 UI 상태는 `useState` 또는 `useReducer`, 전역 클라이언트 상태는 `Zustand`, 서버 상태는 `@tanstack/react-query`를 사용합니다. 상태 도구를 수명과 소유자 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 source of truth에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

### 12.3 Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API hook과 로컬 바인딩을 쉽게 훑고 추적할 수 있게 함)**

Swagger 기반 hook 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다. query는 `response...`, mutation은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

**Incorrect (query와 mutation 바인딩 이름이 제각각임):**

```ts
const tableList = useContentTypeGetListSuspense();
const deleteTableApi = useContentTypeRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();
const mutationContentTypeRemove = useContentTypeRemove();
```

### 12.4 Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (검증되지 않은 값어치 없이 노이즈만 늘리는 방어적 useMemo/useCallback을 피함)**

React 19 컴파일러가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 사용하지 않습니다. 외부 라이브러리가 참조 동일성에 민감하거나, 병목이 실제로 확인된 경우에만 허용하고 바로 위에 한글 주석으로 이유를 남깁니다.

**Incorrect (단순 가공을 관성적으로 memoization):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (필요할 때만 이유를 적고 사용):**

```ts
// 테이블 라이브러리가 columns 참조 동일성을 요구하여 리렌더 폭증을 방지한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

### 12.5 Preserve Response and Store Origin in Wide Scopes

**Impact: CRITICAL (파일 전체에서 alias를 따라가지 않아도 값의 출처를 바로 알 수 있게 함)**

페이지, 레이아웃, 화면 스코프에서는 `response...`, `mutation...`, `*Store` 원본을 유지합니다. 넓은 스코프 구조분해와 별칭 상수는 피하고, 정말 필요할 때만 handler나 effect 내부의 좁은 스코프에서 제한적으로 구조분해합니다. `props`를 본문 첫 줄에서 구조분해하는 패턴만 예외로 봅니다.

**Incorrect (넓은 스코프 구조분해로 출처가 흐려짐):**

```ts
const { tables, selectedTable } = responseContentTypeGetListSuspense.data;
```

**Correct (원본 체이닝으로 출처를 유지):**

```tsx
<UiList dataSource={responseContentTypeGetListSuspense.data.tables} />
<UiTable dataSource={responseContentTypeGetListSuspense.data.selectedTable.columns} />
```

```ts
useEffect(() => {
  const { data, isFetching } = responseContentManagerSearchContentsSuspense;

  if (!isFetching && data.contents.length === 0) {
    return;
  }
}, [responseContentManagerSearchContentsSuspense]);
```

### 12.6 Shape React Query Data in query.select

**Impact: CRITICAL (응답 변환을 fetch 경계 가까이에 두고 렌더 타임의 반복 매핑을 피함)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다. `data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 말고, 도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다. 여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 hook 경계에서 풀 수 있는지 검토합니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const endpoints = responsePermissionGroupGetApiEndpointListSuspense.data.list;
```

**Correct (패칭 시점에 필요한 모양으로 변환):**

```ts
const responsePermissionGroupGetApiEndpointListSuspense = usePermissionGroupGetApiEndpointListSuspense({
  query: {
    select: ({ data }) => ({
      endpoints: data.list,
    }),
  },
});
```

### 12.7 Store Shared Role and Authority Decisions Once

**Impact: HIGH (중복된 권한 판별 휴리스틱이 여러 화면에 퍼지는 것을 막음)**

역할, 권한, 공용 판별 결과는 스토어에 한 번 적재하고 화면에서는 그 결과만 참조합니다. 화면마다 문자열 비교나 유틸 호출로 다시 계산하지 않고, 스토어 접근도 구조분해보다 원본 객체 체이닝을 우선합니다. Suspense query처럼 `onSuccess`가 없으면 `useEffect` 또는 `useLayoutEffect`에서 동기화하고, selector 최적화는 정말 필요한 경우에만 근거 주석과 함께 예외적으로 사용합니다.

**Incorrect (화면마다 판별을 반복하고 구조분해로 오리진을 잃음):**

```ts
const isSuperAdmin = isSuperAdminRoleName(roleName);
const { isEditor } = useRoleStore();
```

**Correct (공용 판별 결과를 스토어에서 한 번 참조):**

```ts
const roleStore = useRoleStore();

if (roleStore.isSuperAdmin) {
  // ...
}
```

```ts
useEffect(() => {
  if (!responseRoleGetItemSuspense.data) {
    return;
  }

  roleStore.setRole(responseRoleGetItemSuspense.data.role);
}, [responseRoleGetItemSuspense.data, roleStore]);
```

## 13. Documentation and Comments

**Impact: MEDIUM**

React 경계 선언에는 역할에 맞는 JSDoc을 남기고, inline comment는 JSX나 handler 흐름에서 비자명한 제약만 설명해야 합니다.

### 13.1 Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (코드를 해설하기보다 주석을 caveat, 제약, 부수효과 설명에 집중시킴)**

함수 본문 안에서는 JSDoc 대신 `//` 라인 주석을 사용하고, 도메인 규칙, 예외 방어, 라이브러리 제약, 부수효과 순서처럼 코드만 읽어서는 놓치기 쉬운 경우에만 남깁니다. 변수명 반복이나 단순 매핑 설명은 주석으로 적지 않습니다. 함수 시그니처를 한 줄로 유지해야 가독성이 더 좋은 경우에만 헤더 JSDoc 안에서 `biome-ignore format:`를 제한적으로 사용합니다.

**Incorrect (코드 그대로를 반복하는 주석):**

```ts
// selectedKey를 selectedKeys 첫 번째 값으로 할당
const selectedKey = selectedKeys[0];
```

**Correct (도메인 제약이나 caveat를 설명):**

```ts
// TABLE 단건 ON 시 해당 TABLE의 상위 FOLDER만 ON으로 복구하고 형제 TABLE 상태는 유지
const updatedNodes = updateNodeDisplayed(nodes, targetId, true);
```

```ts
/**
 * @summary 트리 노드 UiTree 데이터 변환
 * biome-ignore format: 매개변수 가독성 목적 시그니처 한 줄 유지
 */
export const mapFolderNodeToTreeData = (node: ContentFolderTreeNode, renderers: FolderTreeRenderers) => {
  return {
    title: renderers.renderTitle(node),
    icon: renderers.renderIcon(node),
  };
};
```

### 13.2 Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

API 호출 훅과 mutation 선언, 이벤트 핸들러, `useEffect`, 주요 유틸 함수, 커스텀 `type`과 `interface`, 그리고 예외적으로 사용하는 `useMemo`/`useCallback`에는 JSDoc을 작성합니다. 상태 변수나 단순 파생값처럼 문맥상 자명한 선언에는 강제하지 않습니다.

**Incorrect (중요한 선언에 문맥 설명이 없음):**

```ts
const mutationContentTypeRemove = useContentTypeRemove();

useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

**Correct (선언 의도와 역할을 바로 위에 문서화):**

```ts
/**
 * @description 테이블 삭제 API
 */
const mutationContentTypeRemove = useContentTypeRemove();

/**
 * @summary 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

### 13.3 Use @description for API Calls and @summary for Everything Else

**Impact: MEDIUM (JSDoc 의도를 표준화해 생성 코드와 수기 선언을 일관되게 읽히게 함)**

API 관련 변수 선언은 `@description`, 그 외 handler, `useEffect`, 일반 함수, 타입 선언은 `@summary`를 사용합니다. 문장은 명사형 종결과 개조식 표현을 기본으로 하고, 하나의 선언에 두 태그를 섞지 않습니다.

**Incorrect (API 주석에 태그를 혼용):**

```ts
/**
 * @description 테이블 목록 조회 API
 * @summary v1 테이블 목록 조회
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();
```

**Correct (선언 종류에 맞는 태그 하나만 사용):**

```ts
/**
 * @description 테이블 목록 조회 API
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();

/**
 * @summary 테이블 선택 쿼리스트링 갱신
 */
const handleSelectTable: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
- https://react.dev
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs
