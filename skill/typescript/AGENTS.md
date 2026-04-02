# TypeScript Conventions

**Version 1.0.0**  
Agent Conventions  
April 2026

> **안내:**  
> 이 문서는 에이전트와 LLM이 이 컨벤션 세트의 코드를 유지보수하고,  
> 생성하고, 리팩터링할 때 따르도록 compile한 가이드입니다.  
> source of truth는 `rules/*.md`에 있고, 이 파일은 생성 결과물입니다.

---

## 개요

TypeScript conventions for agent-assisted teams. The guide emphasizes explicit naming, direct imports, reusable type contracts, disciplined helper extraction, intentional absence handling, and consistent JSDoc annotation boundaries. Rule files in rules/ are the source of truth and compile into AGENTS.md for agent consumption.

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
   - 3.3 [Replace `enum` With `as const` Objects](#33-replace-enum-with-as-const-objects)
   - 3.4 [Use Named Object Params for Complex Signatures](#34-use-named-object-params-for-complex-signatures)
4. [Absence and Fallback Handling](#4-absence-and-fallback-handling) — **HIGH**
   - 4.1 [Expose Optional Values Instead of Silent Fallbacks](#41-expose-optional-values-instead-of-silent-fallbacks)
5. [JSDoc and Comment Conventions](#5-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
   - 5.1 [Document Declarative Shapes With `@summary` and `@field`](#51-document-declarative-shapes-with-summary-and-field)
   - 5.2 [Keep Inline Comments for Constraints and Caveats Only](#52-keep-inline-comments-for-constraints-and-caveats-only)
   - 5.3 [Require Header JSDoc on Key Declarations](#53-require-header-jsdoc-on-key-declarations)
   - 5.4 [Use `@description` for External Integration Functions](#54-use-description-for-external-integration-functions)
   - 5.5 [Use `@helper` for Reusable Pure Helper Functions](#55-use-helper-for-reusable-pure-helper-functions)
   - 5.6 [Use `@tool` for Model-callable Tool Factories](#56-use-tool-for-model-callable-tool-factories)
   - 5.7 [Write Concise Korean Comments About Purpose and Constraints](#57-write-concise-korean-comments-about-purpose-and-constraints)
6. [Guardrails and Review Checks](#6-guardrails-and-review-checks) — **MEDIUM**
   - 6.1 [Review Banned TypeScript Shortcuts Before Finishing](#61-review-banned-typescript-shortcuts-before-finishing)

---

## 1. Naming and Module Boundaries

**Impact: HIGH**

Identifiers, imports, public entry points, and config access patterns should make ownership and origin immediately visible.

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

## 2. Types and Contracts

**Impact: CRITICAL**

Function signatures, callback reuse, type deduplication, and custom shape documentation should keep contracts explicit and reusable.

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

## 3. Functions and Helper Boundaries

**Impact: HIGH**

Function signatures and helper extraction rules should preserve readable local flow while separating real reusable logic.

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

## 4. Absence and Fallback Handling

**Impact: HIGH**

Missing values should be surfaced intentionally instead of hidden behind casual fallback operators.

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

## 5. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

Comment and annotation rules should explain purpose, constraints, and execution boundaries without repeating obvious code behavior.

### 5.1 Document Declarative Shapes With `@summary` and `@field`

**Impact: MEDIUM-HIGH (keeps exported shape declarations and runtime maps self-describing without duplicate type-only wrappers)**

shape를 설명하는 타입, 인터페이스, 객체형 상수에는 `@summary`를 작성하고, shape 내부 필드는 각 필드 바로 위 `@field` 블록 주석을 사용합니다. 필드 설명만을 위해 별도 타입을 만드는 대신, 실제 shape를 소유한 선언 위에서 직접 의미를 설명합니다.

**Incorrect (`@property`나 중복된 타입 주석으로 설명을 분산):**

```ts
/**
 * @summary 채팅 응답의 섹션 제목
 * @property selected_rules 선택된 규칙 문서 섹션 제목
 */
export const heading = {
	selected_rules: "Selected rules",
} as const;
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 채팅 응답의 섹션 제목
 */
export const heading = {
	/**
	 * @field 선택된 규칙 문서 섹션 제목
	 */
	selected_rules: "Selected rules",
	/**
	 * @field 요구사항 요약 섹션 제목
	 */
	requirement_summary: "Requirement summary",
} as const;
```

### 5.2 Keep Inline Comments for Constraints and Caveats Only

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

### 5.3 Require Header JSDoc on Key Declarations

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

### 5.4 Use `@description` for External Integration Functions

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

### 5.5 Use `@helper` for Reusable Pure Helper Functions

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

### 5.6 Use `@tool` for Model-callable Tool Factories

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

### 5.7 Write Concise Korean Comments About Purpose and Constraints

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

Before finishing, code should be checked against the recurring shortcuts that most often erode the TypeScript conventions.

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

## 참고 자료

- https://www.typescriptlang.org/docs/
- https://jsdoc.app
- https://zod.dev
