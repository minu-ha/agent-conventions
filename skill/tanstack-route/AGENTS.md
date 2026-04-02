# TanStack Route 컨벤션

**Version 1.0.0**  
Agent Conventions  
2026년 4월

> **안내:**  
> 이 문서는 에이전트와 LLM이 이 컨벤션 세트의 코드를 유지보수하고,  
> 생성하고, 리팩터링할 때 따르도록 compile한 가이드입니다.  
> source of truth는 현재 skill의 `rules/*.md`와, `extends`로 연결된 base skill의 `rules/*.md`에 있고, 이 파일은 생성 결과물입니다.

---

## 개요

에이전트 협업 팀을 위한 TanStack Router 컨벤션입니다. 이 가이드는 layout-shell-first route grouping, 검색 가능한 파일명, 명시적인 router boundary 선언, route-local 소유권, generated artifact 보호를 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, compiled guide에는 route helper와 search schema에 공통으로 적용되는 `typescript` base skill이 함께 포함됩니다.

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
7. [Route Structure and Grouping](#7-route-structure-and-grouping) — **CRITICAL**
   - 7.1 [Avoid Folder-only and Flat-only Route Trees](#71-avoid-folder-only-and-flat-only-route-trees)
   - 7.2 [Keep Root Responsibilities in `__root.tsx`](#72-keep-root-responsibilities-in-roottsx)
   - 7.3 [Keep Shared-layout Screens Under One Parent Layout](#73-keep-shared-layout-screens-under-one-parent-layout)
   - 7.4 [Split Top-level Route Groups by Layout Shell](#74-split-top-level-route-groups-by-layout-shell)
   - 7.5 [Use Parentheses Folders for Pathless Route Groups](#75-use-parentheses-folders-for-pathless-route-groups)
8. [File Naming and Route Assets](#8-file-naming-and-route-assets) — **HIGH**
   - 8.1 [Create Route-local `*.ts` Helper Files Early](#81-create-route-local-ts-helper-files-early)
   - 8.2 [Name Top-level Groups by Shell Meaning](#82-name-top-level-groups-by-shell-meaning)
   - 8.3 [Prepare the Basic Route File Set](#83-prepare-the-basic-route-file-set)
   - 8.4 [Start Child Route Sets With Parentheses Folders](#84-start-child-route-sets-with-parentheses-folders)
   - 8.5 [Use Domain-specific Dynamic Segment Names](#85-use-domain-specific-dynamic-segment-names)
   - 8.6 [Use Searchable Feature Route File Names](#86-use-searchable-feature-route-file-names)
9. [Route Definition and Navigation Boundaries](#9-route-definition-and-navigation-boundaries) — **CRITICAL**
   - 9.1 [Export `Route` at the Top of the File](#91-export-route-at-the-top-of-the-file)
   - 9.2 [Match Route Paths to File Structure](#92-match-route-paths-to-file-structure)
   - 9.3 [Read Params and Search From the Local `Route`](#93-read-params-and-search-from-the-local-route)
   - 9.4 [Redirect Empty Entry Routes in `beforeLoad`](#94-redirect-empty-entry-routes-in-beforeload)
   - 9.5 [Run Auth and Permission Guards in `beforeLoad`](#95-run-auth-and-permission-guards-in-beforeload)
   - 9.6 [Validate Search Before Using Route Search](#96-validate-search-before-using-route-search)
10. [Route-local Ownership and Responsibilities](#10-route-local-ownership-and-responsibilities) — **HIGH**
   - 10.1 [Keep `*.index.tsx` Files Focused on Screen Flow](#101-keep-indextsx-files-focused-on-screen-flow)
   - 10.2 [Limit `*.layout.tsx` Files to Shell Concerns](#102-limit-layouttsx-files-to-shell-concerns)
   - 10.3 [Place Route-only Modules in `-local/`](#103-place-route-only-modules-in--local)
11. [Styles and Generated Artifacts](#11-styles-and-generated-artifacts) — **MEDIUM-HIGH**
   - 11.1 [Keep Route CSS at Route Scope](#111-keep-route-css-at-route-scope)
   - 11.2 [Never Edit Generated Route Tree Files](#112-never-edit-generated-route-tree-files)
12. [Workflow and Verification](#12-workflow-and-verification) — **MEDIUM**
   - 12.1 [Add New Routes in Layout-first Order](#121-add-new-routes-in-layout-first-order)
   - 12.2 [Review Route Structure Before Finishing](#122-review-route-structure-before-finishing)

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

## 7. Route Structure and Grouping

**Impact: CRITICAL**

layout shell 결정, root 경계, pathless grouping 규칙은 기능이 늘어나도 route tree를 예측 가능하게 유지합니다.

### 7.1 Avoid Folder-only and Flat-only Route Trees

**Impact: HIGH (keeps route trees readable without forcing deep nesting or excessively long filenames)**

폴더만으로 라우트를 표현하면 중첩이 깊어지고 `index.tsx` 반복이 심해집니다. 반대로 플랫 파일명만으로 구조를 표현하면 파일명이 지나치게 길어지고 rename 비용이 커집니다. 일반 폴더, `()` 그룹 폴더, feature 이름이 드러나는 엔트리 파일명을 함께 섞어 씁니다.

**Incorrect (폴더 전용 구조와 플랫 전용 구조로 한쪽에 치우침):**

```txt
Bad: 폴더만으로 표현
<route-root>/app/settings/permissions/members/index.tsx

Bad: 플랫 파일명만으로 표현
<route-root>/app.settings.permissions.members.index.tsx
```

**Correct (일반 폴더와 그룹 폴더, feature 엔트리를 혼합):**

```txt
<route-root>/app/
  app.layout.tsx
  app.index.tsx
  (settings)/
    settings.layout.tsx
    settings.index.tsx
    (permissions)/
      permissions.layout.tsx
      permissions.index.tsx
      (members)/
        members.index.tsx
```

### 7.2 Keep Root Responsibilities in `__root.tsx`

**Impact: HIGH (prevents app-wide route concerns from mixing with feature-specific shells)**

전역 라우트 컨텍스트와 앱 전체 공통 책임은 `<route-root>/__root.tsx`에서만 관리합니다. 루트는 `head`, 전역 `Outlet`, 전역 로딩/모달 정리처럼 모든 화면이 공유하는 책임만 가져야 하고, 특정 feature 전용 셸이나 화면 로직을 끌어오지 않습니다.

**Incorrect (루트 파일에 feature 전용 셸 책임을 섞음):**

```tsx
// <route-root>/__root.tsx
export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<AuthSidebarLayout>
			<ProjectDashboardHeader />
			<Outlet />
		</AuthSidebarLayout>
	);
}
```

**Correct (루트는 전역 책임만 유지):**

```tsx
// <route-root>/__root.tsx
export const Route = createRootRoute({
	head: () => ({
		meta: [{title: "App"}],
	}),
	component: Root,
});

function Root() {
	return (
		<>
			<GlobalModalHost />
			<Outlet />
		</>
	);
}
```

### 7.3 Keep Shared-layout Screens Under One Parent Layout

**Impact: HIGH (avoids duplicating top-level route shells when screens share the same layout)**

여러 화면이 같은 레이아웃 셸을 쓰면 같은 부모 `layout` 아래에 두고 하위 그룹만 늘립니다. 기능이 다르다는 이유만으로 최상위 레이아웃을 새로 만들지 말고, 동일 셸이라면 기존 부모 아래에서 확장합니다.

**Incorrect (같은 셸인데 기능별로 상위 layout을 새로 만듦):**

```txt
<route-root>/(orders)/orders.layout.tsx
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.layout.tsx
<route-root>/(members)/members.index.tsx
```

**Correct (같은 셸이면 하나의 부모 layout 아래에 유지):**

```txt
<route-root>/app.layout.tsx
<route-root>/app.index.tsx
<route-root>/app/(orders)/orders.index.tsx
<route-root>/app/(members)/members.index.tsx
<route-root>/app/(settings)/settings.index.tsx
```

### 7.4 Split Top-level Route Groups by Layout Shell

**Impact: CRITICAL (keeps top-level route boundaries aligned with real shell differences instead of feature names)**

최상위 라우트 그룹은 기능명 기준이 아니라 레이아웃 셸 기준으로 나눕니다. 헤더, 사이드바, 접근 가드, 브레드크럼, 전역 래퍼가 다르면 별도 최상위 그룹으로 분리하고, 모든 화면이 같은 셸을 공유하면 기능별 최상위 그룹으로 쪼개지 않습니다.

**Incorrect (같은 레이아웃인데 기능명으로 최상위 그룹을 분리):**

```txt
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.index.tsx
<route-root>/(settings)/settings.index.tsx
```

**Correct (셸 차이가 있을 때만 최상위 그룹을 분리):**

```txt
<route-root>/(public)/home.index.tsx
<route-root>/(workspace)/workspace.layout.tsx
<route-root>/(workspace)/workspace.index.tsx
<route-root>/(workspace)/workspace/(settings)/settings.index.tsx
```

### 7.5 Use Parentheses Folders for Pathless Route Groups

**Impact: HIGH (separates URL hierarchy from grouping hierarchy so nested routes stay organized without changing paths)**

일반 폴더는 실제 URL 세그먼트를 반영하는 상위 계층이고, 괄호 폴더 `()`는 하위 라우트를 그룹화하기 위한 pathless 계층입니다. URL에 보여야 하는 상위 계층만 일반 폴더로 두고, 하위 라우트 묶음은 괄호 폴더로 분리합니다.

**Incorrect (URL 계층과 그룹 계층을 같은 폴더 규칙으로 섞음):**

```txt
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (URL 폴더와 pathless 그룹 폴더를 구분):**

```txt
<route-root>/app/
  app.layout.tsx
  app.index.tsx
  (settings)/
    settings.index.tsx
    (security)/
      security.index.tsx
```

## 8. File Naming and Route Assets

**Impact: HIGH**

검색 가능한 entry 파일명, 의미 있는 segment 이름, 예측 가능한 route asset 세트는 route를 더 쉽게 찾고 유지보수하게 만듭니다.

### 8.1 Create Route-local `*.ts` Helper Files Early

**Impact: MEDIUM-HIGH (keeps route files from accumulating normalization and mapping logic before boundaries blur)**

라우트 전용 유틸, 헬퍼, 변환 함수는 가능하면 시작 시점부터 같은 계층 `*.ts` 파일에 모읍니다. 화면이 커진 뒤 나중에 억지로 분리하는 대신, 초기에 helper 자리를 확보해 route entry가 화면 흐름에 집중하게 만듭니다.

**Incorrect (helper를 route 파일 안에 계속 누적):**

```ts
// settings.index.tsx
const normalizeSettingsSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

const buildSettingsRedirect = (tab: string) => {
	return {to: "/app/settings/general", search: {tab}};
};
```

**Correct (같은 계층 helper 파일에 순수 로직을 분리):**

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```

```ts
// settings.ts
export const normalizeSettingsSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

export const buildSettingsRedirect = (tab: string) => {
	return {to: "/app/settings/general", search: {tab}};
};
```

### 8.2 Name Top-level Groups by Shell Meaning

**Impact: HIGH (makes top-level route groups communicate the shell they belong to instead of the feature they happen to contain)**

최상위 그룹 이름은 기능명이 아니라 레이아웃 셸 의미가 드러나야 합니다. `public/app`, `auth/workspace`, `marketing/admin`처럼 셸 단위를 표현하고, 같은 셸이면 새 그룹 이름을 만들지 않습니다.

**Incorrect (기능명으로 최상위 그룹 의미를 대신함):**

```txt
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.index.tsx
<route-root>/(reports)/reports.index.tsx
```

**Correct (셸 의미가 드러나는 이름을 사용):**

```txt
<route-root>/(public)/home.index.tsx
<route-root>/(workspace)/workspace.index.tsx
<route-root>/(workspace)/workspace/(reports)/reports.index.tsx
```

### 8.3 Prepare the Basic Route File Set

**Impact: MEDIUM-HIGH (gives nested routes a predictable place for styles, shell code, and pure helpers from the start)**

하위 라우트가 생기면 해당 라우트는 기본적으로 `*.css`, `*.layout.tsx`, `*.index.tsx`, 같은 계층 `*.ts` helper 파일 세트를 함께 준비합니다. 이렇게 해야 라우트가 커져도 스타일, 셸, 화면, 순수 로직의 자리가 처음부터 예측 가능하게 유지됩니다.

**Incorrect (화면 파일만 먼저 만들고 나머지 책임이 흩어짐):**

```txt
(settings)/
  settings.index.tsx
```

**Correct (기본 route 파일 세트를 함께 마련):**

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```

### 8.4 Start Child Route Sets With Parentheses Folders

**Impact: HIGH (makes child route groups explicit before filenames grow long or sibling routes become hard to scan)**

하위 라우트가 생기면 기본적으로 먼저 `(<feature>)` 그룹 폴더를 만들고, 그 안에 해당 feature 파일을 둡니다. 이렇게 하면 pathless 그룹 단위가 분명해지고, sibling route가 늘어나도 파일명이 불필요하게 길어지지 않습니다.

**Incorrect (하위 라우트를 플랫 파일명으로 계속 누적):**

```txt
<route-root>/app/settings.index.tsx
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (하위 라우트 묶음을 그룹 폴더로 먼저 감쌈):**

```txt
<route-root>/app/(settings)/settings.index.tsx
<route-root>/app/(settings)/(profile)/profile.index.tsx
<route-root>/app/(settings)/(security)/security.index.tsx
```

### 8.5 Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (keeps route params self-explanatory at the file level and inside router APIs)**

필수 path param은 `{$param}`, 선택 path param은 `{-$param}` 문법을 사용하고, param 이름은 도메인 의미가 드러나는 명사를 씁니다. generic `id`, `x` 같은 이름은 파일 구조만 봐서는 의미를 알 수 없으므로 피합니다.

**Incorrect (generic param 이름을 사용):**

```txt
users.{$id}.index.tsx
posts.{-$x}.tsx
```

**Correct (도메인 의미가 드러나는 이름을 사용):**

```txt
users.{$userId}.index.tsx
posts.{$postId}.edit.index.tsx
filters.{-$tab}.tsx
```

### 8.6 Use Searchable Feature Route File Names

**Impact: HIGH (keeps route entries easy to find in file search even when group folders are already present)**

그룹 폴더를 쓰더라도 엔트리 파일명은 `feature.index.tsx`, `feature.layout.tsx`처럼 feature 이름을 유지합니다. 그룹 폴더 아래 파일명을 모두 `index.tsx`, `layout.tsx`로 두면 검색성과 탐색성이 크게 떨어집니다.

**Incorrect (그룹 폴더 안에서 익명 파일명을 사용):**

```txt
(settings)/
  index.tsx
  layout.tsx
```

**Correct (feature 이름이 드러나는 엔트리 파일명을 사용):**

```txt
(settings)/
  settings.index.tsx
  settings.layout.tsx
```

## 9. Route Definition and Navigation Boundaries

**Impact: CRITICAL**

route 선언, redirect, guard, search 검증은 화면 안으로 새지 않고 router boundary에 명시적으로 유지되어야 합니다.

### 9.1 Export `Route` at the Top of the File

**Impact: HIGH (keeps the router contract obvious before the screen implementation details begin)**

각 라우트 파일은 `export const Route = createFileRoute("...")({...})` 형태를 기본으로 하고, export 이름은 항상 `Route`로 고정합니다. route definition은 파일 상단에 두고, 화면 컴포넌트나 helper는 그 아래에 배치합니다.

**Incorrect (컴포넌트와 보조 코드 뒤에 route definition을 숨김):**

```tsx
function UsersIndex() {
	return <UsersScreen />;
}

const usersRoutePath = "/app/(users)/users/";

export const UsersRoute = createFileRoute(usersRoutePath)({
	component: UsersIndex,
});
```

**Correct (파일 상단에서 `Route` 계약을 먼저 선언):**

```tsx
export const Route = createFileRoute("/app/(users)/users/")({
	component: UsersIndex,
});

function UsersIndex() {
	return <UsersScreen />;
}
```

### 9.2 Match Route Paths to File Structure

**Impact: HIGH (prevents route strings from drifting away from the file tree that owns them)**

`createFileRoute()` 문자열은 실제 파일 구조와 대응되게 작성합니다. 일반 폴더, pathless group, 동적 세그먼트, trailing slash 규칙을 문자열에 그대로 반영해야 route tree와 파일 위치를 함께 추적할 수 있습니다.

**Incorrect (경로 문자열이 파일 구조와 어긋남):**

```tsx
// file: <route-root>/app/(settings)/settings.index.tsx
export const Route = createFileRoute("/settings")({
	component: SettingsIndex,
});
```

**Correct (경로 문자열이 실제 파일 구조를 반영):**

```tsx
export const Route = createFileRoute("/app")({...});
export const Route = createFileRoute("/app/")({...});
export const Route = createFileRoute("/app/(settings)/settings/")({...});
```

### 9.3 Read Params and Search From the Local `Route`

**Impact: MEDIUM-HIGH (keeps param and search access aligned with the route file that owns the contract)**

param과 search 접근은 해당 파일의 `Route`에서 꺼내 쓰는 것을 기본으로 합니다. 훅 사용 패턴을 route definition 근처에서 일관되게 유지하면, 이 파일이 어떤 params/search 계약을 갖는지 한 곳에서 읽을 수 있습니다.

**Incorrect (전역 hook 호출로 계약 출처를 흐림):**

```tsx
const params = useParams({from: "/app/(users)/users/{$userId}/"});
const search = useSearch({from: "/app/(users)/users/"});
```

**Correct (해당 파일의 `Route`에서 직접 읽음):**

```tsx
const {useParams, useSearch} = Route;

const params = useParams();
const search = useSearch();
```

### 9.4 Redirect Empty Entry Routes in `beforeLoad`

**Impact: HIGH (moves entry redirects to the router boundary before screens mount and side effects begin)**

실화면이 없는 중간 route의 기본 진입은 `index` route의 `beforeLoad`에서 redirect로 처리합니다. path param이나 search를 유지해야 하면 `beforeLoad`에서 명시적으로 다시 넘겨 화면 마운트 이후 강제 이동을 피합니다.

**Incorrect (컴포넌트 렌더링 후 `useEffect`로 강제 이동):**

```tsx
function SettingsIndex() {
	const navigate = useNavigate();

	useEffect(() => {
		void navigate({to: "/app/settings/general"});
	}, [navigate]);

	return null;
}
```

**Correct (route 진입 단계에서 redirect 처리):**

```tsx
export const Route = createFileRoute("/app/(settings)/settings/")({
	beforeLoad: ({search}) => {
		throw redirect({to: "/app/settings/general", search, replace: true});
	},
});
```

### 9.5 Run Auth and Permission Guards in `beforeLoad`

**Impact: CRITICAL (keeps access control in router boundaries instead of after-the-fact screen navigation)**

인증과 권한 보장은 라우트 컴포넌트 본문이 아니라 `beforeLoad`에서 처리합니다. 공통 가드 로직은 route 전용 helper로 분리해 재사용하고, 화면 컴포넌트가 렌더링된 뒤 조건부 네비게이션을 하는 패턴은 피합니다.

**Incorrect (컴포넌트 렌더링 이후 조건부 네비게이션):**

```tsx
function ProtectedPage() {
	const token = useTokenStore();
	const navigate = useNavigate();

	if (!token) {
		void navigate({to: "/login"});
	}

	return <Outlet />;
}
```

**Correct (진입 전 가드로 접근을 차단):**

```tsx
export const Route = createFileRoute("/app")({
	beforeLoad: async ({context}) => {
		await ensureAuthenticated(context);
	},
	component: AppLayout,
});
```

### 9.6 Validate Search Before Using Route Search

**Impact: CRITICAL (normalizes query strings once at the route boundary instead of reparsing them throughout the screen)**

쿼리스트링을 읽는 화면은 `Route.useSearch()` 사용 전에 `validateSearch`를 선언합니다. search schema는 `z.object(...)`로 작성하고, 숫자형 페이지네이션이나 선택값은 `z.coerce.number()`로 보정하며, 초기값이나 방어값이 필요하면 `.default()`와 `.catch()`를 함께 사용합니다.

**Incorrect (사용처마다 문자열 파싱을 반복):**

```tsx
const search = useSearch({from: "/app/users"});
const page = Number(search.page ?? 1);
const size = Number(search.size ?? 20);
```

**Correct (route에서 먼저 search를 정규화):**

```tsx
export const Route = createFileRoute("/app/(users)/users/")({
	validateSearch: z.object({
		page: z.coerce.number().int().min(1).default(1).catch(1),
		size: z.coerce.number().int().min(1).max(100).default(20).catch(20),
	}),
	component: UsersIndex,
});
```

## 10. Route-local Ownership and Responsibilities

**Impact: HIGH**

`layout`, `index`, `-local` 파일은 각각 좁은 책임만 가져야 route flow가 보이고 책임이 흐려지지 않습니다.

### 10.1 Keep `*.index.tsx` Files Focused on Screen Flow

**Impact: HIGH (preserves a readable route entry where screen assembly, hooks, and handlers stay visible)**

`*.index.tsx`는 실제 화면 렌더링, API hook, 이벤트 핸들러, search 기반 상태 동기화, 화면 조립을 담당합니다. entry file이 순수 helper, 대형 상수, route 외부 재사용 로직까지 떠안기 시작하면 화면 흐름이 흐려지므로 route-local helper와 `-local/`로 책임을 분리합니다.

**Incorrect (entry file에 화면 흐름과 무관한 support code를 누적):**

```tsx
const DEFAULT_COLUMNS = ["name", "role", "status"] as const;

const normalizeMembersSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

export const Route = createFileRoute("/app/(members)/members/")({
	component: MembersIndex,
});
```

**Correct (entry file은 화면 흐름을 보여주고 support code는 분리):**

```tsx
import {normalizeMembersSearch} from "./members";
import {MembersToolbar} from "./-local/members-toolbar";

export const Route = createFileRoute("/app/(members)/members/")({
	component: MembersIndex,
});

function MembersIndex() {
	const search = Route.useSearch();
	const normalizedKeyword = normalizeMembersSearch(search.keyword);

	return <MembersToolbar keyword={normalizedKeyword} />;
}
```

### 10.2 Limit `*.layout.tsx` Files to Shell Concerns

**Impact: HIGH (prevents parent route shells from absorbing leaf-screen data and form logic)**

`*.layout.tsx`는 부모 경로 등록, 접근 제어, 공통 래퍼, 메뉴 상태 동기화, `<Outlet />`까지만 담당합니다. 하위 leaf 화면만 쓰는 API 호출이나 상세 폼 로직은 layout에 넣지 않고 해당 `index`나 `-local`로 내립니다.

**Incorrect (layout 파일이 leaf 화면 전용 로직까지 가짐):**

```tsx
function SettingsLayout() {
	const query = useSettingsDetailQuery();
	const form = useSettingsForm(query.data);

	return (
		<SettingsShell form={form}>
			<Outlet />
		</SettingsShell>
	);
}
```

**Correct (layout은 셸과 outlet 책임만 유지):**

```tsx
function AppLayout() {
	return <Outlet />;
}
```

### 10.3 Place Route-only Modules in `-local/`

**Impact: HIGH (keeps route-scoped UI and helpers close to the route until their contracts are stable)**

해당 라우트에서만 쓰는 모달, 폼, 상수, helper는 라우트 하위 `-local/`에 둡니다. 다른 라우트와 계약이 아직 안정되지 않았다면 shared UI나 공용 helper로 올리지 말고, 먼저 route-local 소유를 유지합니다.

**Incorrect (route 전용 모듈을 성급하게 공용 레이어로 올림):**

```txt
<component-root>/ui/modal/ui-setting-form-modal.tsx
<component-root>/ui/modal/ui-setting-form-modal.css
```

**Correct (해당 route 아래 `-local/`에 둠):**

```txt
(settings)/
  settings.index.tsx
  -local/
    modal-setting-form.tsx
    modal-setting-form.css
```

## 11. Styles and Generated Artifacts

**Impact: MEDIUM-HIGH**

route 스타일은 해당 route와 함께 있어야 하고, generated router output은 derived artifact로만 유지되어야 합니다.

### 11.1 Keep Route CSS at Route Scope

**Impact: MEDIUM-HIGH (prevents route-level styles and local component styles from collapsing into one oversized stylesheet)**

route 공용 스타일은 해당 route 폴더의 `*.css`에 두고, `-local` 컴포넌트 스타일은 `-local/*.css`에 둡니다. 같은 route의 `layout`과 `index`가 같은 시각 컨텍스트를 공유하더라도, route 공용 CSS와 local 전용 CSS를 한 파일에 뭉개지 않습니다.

**Incorrect (route 공용 스타일과 local 전용 스타일을 한 파일에 누적):**

```txt
(settings)/
  settings.index.tsx
  -local/
    modal-setting-form.tsx

settings.css에 modal 전용 스타일까지 모두 선언
```

**Correct (route 범위와 local 범위 스타일을 분리):**

```txt
(settings)/
  settings.css
  settings.index.tsx
  -local/
    modal-setting-form.tsx
    modal-setting-form.css
```

### 11.2 Never Edit Generated Route Tree Files

**Impact: MEDIUM-HIGH (preserves generated router output as a build artifact derived from route sources)**

라우트 추가나 변경 결과로 생성되는 `<generated-route-tree-path>`는 수동 수정하지 않습니다. 라우트 소스만 수정하고, 생성 파일은 결과물로만 다루어야 source of truth가 명확하게 유지됩니다.

**Incorrect (생성 파일을 직접 수정해 동작을 맞춤):**

```txt
// Bad
<generated-route-tree-path>에 수동으로 route node를 추가
<generated-route-tree-path>에서 import 경로를 직접 수정
```

**Correct (라우트 소스를 고치고 생성물은 다시 생성):**

```txt
// Good
route source file을 수정한다
router generator를 다시 실행한다
<generated-route-tree-path>는 결과물로만 확인한다
```

## 12. Workflow and Verification

**Impact: MEDIUM**

새 route 작업은 반복 가능한 setup과 review 순서를 따라야 구조, guard, router 계약을 마무리 전에 점검할 수 있습니다.

### 12.1 Add New Routes in Layout-first Order

**Impact: MEDIUM (reduces cleanup work by establishing shell, grouping, and search boundaries before route files sprawl)**

신규 라우트를 추가할 때는 화면 파일부터 급하게 만들지 말고, 레이아웃 셸과 그룹 구조를 먼저 고정하는 순서를 따릅니다. 이렇게 해야 route tree, helper 위치, search 검증 경계가 뒤늦게 흔들리지 않습니다.

**Incorrect (leaf 화면부터 만들고 나중에 구조를 끼워 맞춤):**

```txt
1. 바로 feature.index.tsx부터 만든다
2. 화면이 커진 뒤에 layout, helper, -local 위치를 고민한다
3. search parsing과 redirect를 화면 본문에서 임시로 처리한다
```

**Correct (layout-first 순서로 route를 추가):**

```txt
1. 모든 화면이 같은 레이아웃 셸인지 먼저 판단한다
2. 셸이 다르면 최상위 그룹을 분리하고, 같으면 기존 부모 layout 아래에 둔다
3. URL에 반영되는 상위 계층은 일반 폴더로 만든다
4. 하위 라우트가 생기면 (<feature>) 그룹 폴더를 만든다
5. 기본적으로 feature.css, feature.ts, feature.layout.tsx, feature.index.tsx를 준비한다
6. feature.ts에 화면 전용 helper와 정규화 로직 자리를 만든다
7. 동적 세그먼트가 필요하면 {$param}, {-$param} 규칙을 사용한다
8. search를 읽는 화면이면 validateSearch를 먼저 선언한다
9. route 전용 보조 모듈이 있으면 같은 계층 -local/에 둔다
10. 생성된 <generated-route-tree-path>는 수동 수정하지 않는다
```

### 12.2 Review Route Structure Before Finishing

**Impact: MEDIUM (catches grouping, guard, and ownership drift before a route change is declared complete)**

라우트 작업을 끝냈다고 보기 전에 구조 체크리스트를 다시 확인합니다. 화면이 보인다는 이유만으로 마무리하지 말고, 그룹 구조, helper 배치, guard 위치, generated artifact 처리까지 함께 점검해야 합니다.

**Incorrect (렌더링만 확인하고 구조 검토를 생략):**

```txt
- 페이지가 뜨는지만 확인한다
- redirect와 guard 위치는 나중에 정리한다
- helper가 route 파일 안에 남아 있어도 그대로 둔다
- generated route tree를 직접 고쳐서 통과시킨다
```

**Correct (마무리 전에 route 체크리스트를 순회):**

```txt
- 최상위 라우트 분리가 기능명이 아니라 레이아웃 셸 기준인가
- 폴더 전용 구조와 플랫 전용 구조 중 하나로 치우치지 않았는가
- URL에 반영되는 상위는 일반 폴더로 두었는가
- 하위 route 묶음은 () 그룹 폴더로 분리했는가
- 하위 route라면 feature.css, feature.ts, feature.layout.tsx, feature.index.tsx 기본 세트를 갖췄는가
- 그룹 폴더 안의 엔트리 파일명이 feature.index.tsx처럼 검색 가능한가
- 화면 전용 helper가 route 파일 안에 누적되지 않고 같은 계층 *.ts 파일 자리를 확보했는가
- 인증/권한 가드를 컴포넌트 본문이 아니라 beforeLoad에 두었는가
- 쿼리스트링을 읽는 화면에 validateSearch가 선언되어 있는가
- route 전용 보조 모듈이 -local/에 정리되어 있는가
- <generated-route-tree-path>를 수동 수정하지 않았는가
```

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
- https://tanstack.com/router/latest
- https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing
