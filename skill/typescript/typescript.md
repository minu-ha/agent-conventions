# TypeScript 가이드라인

## 목차

1. 문서 목적
2. 핵심 원칙
3. 파일 및 네이밍 규칙
	1. 파일명/식별자
	2. export/import
	3. 상수/설정 namespace
	4. 체이닝 기반 접근
4. 타입 선언 원칙
	1. 최우선 원칙: 함수 변수 타입 선언 우선
	2. 차선 원칙: 함수 타입이 없을 때만 매개변수 타입 선언
	3. 콜백 시그니처 재사용 우선
	4. 미사용 매개변수 규칙
	5. Bad/Good: 타입 선언 우선순위
	6. 기존 타입 재사용 원칙
	7. 커스텀 타입/인터페이스 문서화 규칙
5. 함수/유틸 작성 규칙
	1. 함수 선언
	2. enum 대체
	3. 유틸 함수 분리 기준 (엄격)
	4. 상단 명령형 조립 금지
	5. Bad/Good: 유틸 분리 판단
6. 값 부재 및 폴백 규칙
	1. 옵셔널 값/폴백 처리 규칙
7. 주석 규칙
	1. 주석 원칙
	2. 선언 헤더 JSDoc 필수 지점
	3. 외부 연동 함수 주석 규칙 (`@description`)
	4. helper 함수 주석 규칙 (`@helper`)
	5. tool 함수 주석 규칙 (`@tool`)
	6. 함수 내부 주석 규칙 (`//`)
	7. 선언형 shape 주석 규칙
	8. Bad/Good: 주석 규칙
8. 금지 패턴

## 1. 문서 목적

이 문서는 프로젝트의 일반 TypeScript 코드 작성 기준을 단일 규격으로 정의합니다.
이 문서는 프론트엔드 전용 규칙에서 React 특화 내용을 덜어내고, Node.js/LangGraph 코드에도 적용 가능한 기준만 분리해 재구성한 것입니다.
LangGraph 상태, 그래프 제어 흐름, persistence, interrupt, MCP 연동 경계 규칙은 별도 LangGraph 전용 규칙 문서에서 정의합니다.
이 문서의 경로/alias 예시는 프로젝트마다 달라질 수 있는 실제 루트 대신 placeholder를 사용합니다.
- `<src-root>`: 애플리케이션 소스 루트 (`src`, `apps/server/src` 등)
- `<config-root>`: 설정 정의 루트 (`<src-root>/config` 등)
- `<config-entry-path>`: 설정 공개 진입 파일 경로
- `<schema-entry-path>`: 공용 schema 진입 파일 경로
- `<type-entry-path>`: 공용 type 진입 파일 경로
- `<convention-doc-root>`: 규칙 문서 루트
- `<config-public-import>`, `<helper-public-import>`, `<schema-public-import>`, `<type-public-import>`, `<graph-public-import>`: 공개 import alias 또는 package export 경로

## 2. 핵심 원칙

- 명시성: 타입, 데이터 출처, 의도가 코드에서 즉시 드러나야 합니다.
- 일관성: 같은 문제를 같은 패턴으로 해결해 코드베이스를 예측 가능하게 유지합니다.
- 책임 분리: 오케스트레이션, 순수 계산, 외부 연동 책임을 분리해 변경 비용을 낮춥니다.
- 추적 가능성: 값을 읽는 위치에서 원본 출처를 쉽게 따라갈 수 있어야 합니다.
- 결측값 노출: 값의 부재를 무심코 숨기지 말고, 필요한 경우 명시적으로 처리합니다.

## 3. 파일 및 네이밍 규칙

### 3.1 파일명/식별자

- 파일명은 `kebab-case`를 사용합니다.
- 일반 변수/함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다.
- 공용 설정 객체 키와 enum-like 상수 키는 `snake_case`를 사용합니다.
- state 키, 일반 객체 키, 스키마 키는 `camelCase`를 사용합니다.
- `StateSchema(...)` 변수명은 `*State`, Zod schema 변수명은 `*Schema`를 사용합니다.
- 로컬 변수, 임시 결과값, 함수 매개변수는 state/config에서 왔더라도 `camelCase`를 사용합니다.
- 커스텀 `type`/`interface`의 필드명은 `camelCase`를 사용합니다.

```ts
const chatState = new StateSchema({
	repoPath: z.string(),
});
```

### 3.2 export/import

- `index.ts` 기반 barrel export를 금지합니다.
- 직접 export/import 구조를 유지합니다.
- 설정 공개 진입점은 `<config-public-import>`를 사용합니다.
- 공용 helper 및 role 기반 model 생성 공개 진입점은 `<helper-public-import>`를 사용합니다.
- 공용 Zod schema 공개 진입점은 `<schema-public-import>`를 사용합니다.
- 공용 타입 공개 진입점은 `<type-public-import>`를 사용합니다.
- `<config-root>/index.ts` 같은 배럴 진입점 대신 `<config-entry-path>` 단일 파일 진입점을 사용합니다.
- `<schema-entry-path>`는 여러 stage가 공유하는 공용 Zod schema를 모으는 단일 schema 진입점으로 사용합니다.
- `<type-entry-path>`는 재사용 타입을 모으는 단일 타입 진입점으로 사용합니다.
- stage 전용 structured output schema는 해당 graph 파일 안에 두고, 여러 graph가 함께 쓰는 schema와 공용 로그 channel만 `<schema-entry-path>`로 올립니다.
- 타입 전용 import는 `import type`을 사용합니다.

```ts
import type {RunnableConfig} from "@langchain/core/runnables";
```

```ts
import {config} from "<config-public-import>";
```

```ts
import {analysisStateValueSchema} from "<schema-public-import>";
```

```ts
import {createChatModel} from "<helper-public-import>";
```

```ts
import {mainState} from "<graph-public-import>/main";
import type {MainState} from "<type-public-import>";
```

### 3.3 상수/설정 namespace

- 여러 파일에서 공유되는 설정/상수 namespace는 `<config-entry-path>`를 공개 진입점으로 사용합니다.
- 설정은 여러 leaf 파일로 흩뿌리기보다 `<config-entry-path>` 한 파일에 섹션별로 모아두는 것을 기본값으로 사용합니다.
- 큰 설정 파일은 `env`, `chat`, `model`, `orchestration`, `rule`, `verification`처럼 주석 섹션으로 명확히 구분합니다.
- 섹션 구분은 단순 구분선보다 블록 주석을 사용하고, 각 섹션의 목적과 포함 범위를 함께 설명합니다.
- 공개 import 경로는 `<config-public-import>` 하나로 고정합니다.
- 환경변수는 `config.env.*` 아래로 정규화하고, `process.env` 직접 접근은 `<config-entry-path>` 내부로 제한합니다.
- main/stage graph 파일에 공용 설정 문자열, 키워드 배열, 명령 문자열을 분산 선언하지 않습니다.

```ts
// Bad: workflow 파일에 공용 설정을 흩뿌림
const typescriptRuleRef = "<convention-doc-root>/typescript.md";
const orchestration_keyword = ["workflow", "langgraph"];
```

```ts
// Good: 공용 설정은 공개 진입점을 통해 읽음
import {config} from "<config-public-import>";

config.rule.rule_ref.typescript;
config.model.default.model_name;
config.model.role.classification.provider;
config.env.google_api_key;
```

### 3.4 체이닝 기반 접근

- 공용 설정은 leaf 모듈 직접 import보다 `config.*` 체이닝 접근을 기본으로 합니다.
- 설정 그룹은 읽는 위치에서 의미가 드러나도록 최소 2단계 이상 namespace를 유지합니다.
- 예: `config.rule.rule_ref.pipeline`, `config.orchestration.task_category.workflow`, `config.verification.command.check`, `config.env.google_api_key`
- 넓은 스코프에서 원본 객체를 구조분해하거나 별칭 상수로 끊어 오리진을 흐리지 않습니다.
- 필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 허용합니다.
- 예외는 `<config-entry-path>` 내부에서 설정을 조립할 때뿐입니다.
- 이 규칙은 `biome.json`의 `noRestrictedImports`로 함께 강제합니다.

## 4. 타입 선언 원칙

### 4.1 최우선 원칙: 함수 변수 타입 선언 우선

- 함수 타입 선언은 매개변수 타입 선언보다 우선합니다.
- 재사용 가능한 콜백/함수 타입이 있으면 함수 변수에 먼저 선언합니다.

```ts
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};
```

### 4.2 차선 원칙: 함수 타입이 없을 때만 매개변수 타입 선언

- 적절한 함수 타입이 없을 때만 매개변수에 직접 타입을 명시합니다.

```ts
const parseIteration = (value: string): number => {
	return Number(value);
};
```

### 4.3 콜백 시그니처 재사용 우선

- 콜백 구현 시 매개변수 재타이핑보다 기존 시그니처 재사용을 우선합니다.

```ts
interface OrchestrationTransformers {
	formatLog: (message: string) => string;
}

const formatLog: OrchestrationTransformers["formatLog"] = (message) => {
	return `[workflow] ${message}`;
};
```

### 4.4 미사용 매개변수 규칙

- 미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.

```ts
const createNoopLogger = (_message: string): void => {
	// no-op
};
```

### 4.5 Bad/Good: 타입 선언 우선순위

```ts
// Bad: 함수 타입이 있는데 매개변수 타입만 사용
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

```ts
// Good: 함수 변수 타입 선언 우선
type FormatState = (state: Record<string, unknown>) => string;

const formatState: FormatState = (state) => {
	return JSON.stringify(state);
};
```

### 4.6 기존 타입 재사용 원칙

- 기존 타입/스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 금지합니다.
- 필요한 경우 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다.
- 신규 타입 선언은 구조 중복이 아니라 의미 차이가 실제로 있을 때만 허용합니다.

```ts
// Bad: 기존 상태 타입과 동일한 구조를 다시 선언
interface OrchestrationSnapshot {
	request: string;
	iteration: number;
}
```

```ts
// Good: 기존 타입 직접 참조
type DevelopmentSnapshot = Pick<DevelopmentOrchestrationState, "request" | "iteration">;
```

### 4.7 커스텀 타입/인터페이스 문서화 규칙

- 커스텀 `type`, `interface` 선언에는 무엇을 표현하는지 JSDoc을 작성합니다.
- 객체형 `type`, `interface`는 필드 의미를 각 필드 바로 위 `@field` 블록 주석으로 모두 명시합니다.
- `z.object(...)`, `StateSchema(...)`, 객체형 상수처럼 shape를 직접 선언하는 구조도 같은 기준으로 각 필드 바로 위 `@field` 블록 주석을 명시합니다.
- `StateSchema(...)` 헤더는 `@state`, `z.object(...)` 헤더는 `@schema`를 사용합니다.
- `Pick`/`Omit`/Indexed Access처럼 로컬 필드 선언이 없는 alias는 헤더 `@summary`만 작성합니다.
- 객체형 타입 헤더에 여러 `@field`를 나열하는 예전 방식은 사용하지 않습니다.
- 타입/인터페이스는 실제 재사용 계약이나 파생 타입 가치가 있을 때만 선언합니다.
- 필드 설명만을 위해 별도 `type`/`interface`를 새로 만들지 않습니다.
- 공용 재사용 타입은 `<type-entry-path>`에 모아두고 `<type-public-import>`로 읽습니다.
- 타입/인터페이스 선언은 `<type-entry-path>` 상단부터 의미 있는 단위로 모아 배치합니다.

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
	/**
	 * @field 실패 또는 보완 사유
	 */
	reason?: string;
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

## 5. 함수/유틸 작성 규칙

### 5.1 함수 선언

- 함수는 화살표 함수 사용을 기본으로 합니다.
- 반환 타입은 복잡한 함수에서 명시를 권장합니다.
- 매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶습니다.
- 단일 객체 매개변수 타입은 파일 최상단 `interface` 또는 `type`으로 선언합니다.
- 단일 객체 매개변수는 함수 시그니처에서 구조분해하지 않고 `args` 또는 더 구체적인 도메인 이름 객체 하나로 받습니다.
- 함수 본문 첫 줄에서 객체 매개변수를 구조분해해 사용합니다.
- 구조분해 묶음이 의미상 한 줄이 더 읽기 쉽고, 포매터가 과도한 세로 줄바꿈을 만들 때만 `biome-ignore format`을 제한적으로 허용합니다.
- 이 예외는 긴 `args` 구조분해나 함수 시그니처처럼 “한 묶음으로 봐야 읽기 쉬운 경우”에만 사용합니다.

```ts
// Bad: 시그니처에서 바로 구조분해
const buildPlanningPrompt = ({request, repoPath}: BuildPlanningPromptArgs): string => {
	return `${request} ${repoPath}`;
};
```

```ts
// Good: 객체 전체를 받은 뒤 함수 본문에서 구조분해
const buildPlanningPrompt = (args: BuildPlanningPromptArgs): string => {
	const {request, repoPath} = args;
	return `${request} ${repoPath}`;
};
```

```ts
// Good: 긴 구조분해는 필요한 곳에만 format 예외 허용
// biome-ignore format: grouped args destructuring is easier to scan on one line in this helper.
const {request, repoPath, taskCategory, projectArea, riskLevel, selectedRuleRefs} = args;
```

### 5.2 enum 대체

- `enum` 대신 객체 리터럴 + `as const`를 사용합니다.

```ts
const audit_status = {
	pending: "pending",
	passed: "passed",
	failed: "failed",
} as const;

type AuditStatus = (typeof audit_status)[keyof typeof audit_status];
```

### 5.3 유틸 함수 분리 기준 (엄격)

- 유틸/helper 분리는 아래 필수 조건을 모두 만족하고, 추가 트리거 중 2개 이상을 만족할 때만 허용합니다.
- 함수가 길어져도 즉시 유틸로 쪼개지 않고, 먼저 early return, 단계적 변수, 의미 있는 블록 구분으로 가독성을 확보합니다.
- 필수 조건
	- 입력/출력 계약이 명확합니다.
	- 함수명이 도메인 의도를 설명합니다.
	- 런타임 문맥이 없어도 독립 검증이 가능합니다.
- 추가 트리거
	- 동일/유사 로직이 같은 파일 또는 인접 stage에서 3~4회 이상 반복됩니다.
	- 조건 분기 3개 이상, 재귀, 직렬화, 정규화 같은 도메인 변환이 포함됩니다.
	- 노드/핸들러 본문 길이가 과도해 흐름 파악을 방해합니다.
	- 단위 테스트로 독립 검증할 가치가 명확합니다.
- 아래 경우는 유틸 분리를 금지합니다.
	- 단순 값 대입, 한 줄 계산, 단회성 분기 추출
	- 재사용 근거 없이 보기 좋게 만들기 위한 분리
	- 오케스트레이션 흐름 자체를 잘게 쪼개 읽기 어렵게 만드는 분리
	- 특정 node/router 안에서 한 번만 쓰는 짧은 입력 정규화, payload 조립, 문자열 생성

### 5.4 상단 명령형 조립 금지

- 파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 금지합니다.
- 분기 + 탐색 + 보정이 결합된 계산은 `resolve*`, `build*`, `normalize*` 형태 유틸로 분리합니다.
- 단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산합니다.

```ts
// Bad: 넓은 스코프 명령형 조립
let selectedRuleRefs = ["<convention-doc-root>/pipeline.md"];
if (request.includes("typescript")) {
	selectedRuleRefs.push("<convention-doc-root>/typescript.md");
}
```

```ts
// Good: 좁은 스코프에서 한 번에 계산
const selectedRuleRefs = request.includes("typescript")
		? ["<convention-doc-root>/pipeline.md", "<convention-doc-root>/typescript.md"]
		: ["<convention-doc-root>/pipeline.md"];
```

### 5.5 Bad/Good: 유틸 분리 판단

```ts
// Bad: 단회성 계산까지 유틸로 분리
const getNextIteration = (iteration: number) => iteration + 1;
const nextIteration = getNextIteration(iteration);
```

```ts
// Good: 상태 정규화/직렬화는 유틸로 분리
export const normalizeRuleRefs = (ruleRefs: string[]): string[] => {
	return Array.from(new Set(ruleRefs)).sort();
};
```

## 6. 값 부재 및 폴백 규칙

### 6.1 옵셔널 값/폴백 처리 규칙

- 옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다.
- 값이 없을 수 있음을 명확히 드러내고, 필요한 경우 분기나 명시적 오류 처리로 표현합니다.
- 예외적으로 폴백이 꼭 필요하면 아래 조건을 모두 만족해야 합니다.
	- 도메인/요구사항상 기본값이 명확합니다.
	- 코드 바로 위에 한글 주석으로 이유를 남깁니다.
	- `??`, `||`, `?:` 중 가장 직접적인 표현 하나만 사용합니다.

```ts
// 금지: 호출부에서 env 결측을 조용히 숨기는 폴백
const googleApiKey = config.env.google_api_key ?? "demo-key";
```

```ts
// 허용: <config-entry-path>에서 로컬 서버 기본 포트를 명시적으로 고정
// 개발용 Agent Server 기본 포트는 환경 변수가 없으면 2024를 사용한다.
const agentServerPort = process.env.PORT?.trim() || "2024";
```

## 7. 주석 규칙

### 7.1 주석 원칙

- 주석은 한글로 작성합니다.
- 목적, 제약, 부작용 중심으로 간결하게 작성합니다.
- 코드만으로 자명한 내용은 주석을 생략합니다.
- `@summary`, `@helper`, `@description` 문장은 명사형 종결/개조식 표현을 기본으로 합니다.
- 코드 동작 설명보다 도입 이유와 제약 설명을 우선합니다.

### 7.2 선언 헤더 JSDoc 필수 지점

- 아래 항목은 예외 없이 주석을 작성합니다.
	- 외부 연동 함수
	- 주요 순수 함수, 재사용 함수, 도메인 규칙 함수
	- 커스텀 `type`, `interface` 선언
	- 포맷 예외를 둔 함수 선언

### 7.3 외부 연동 함수 주석 규칙 (`@description`)

- 파일 시스템, 네트워크, 환경 변수, 외부 SDK 호출 함수는 `@description`을 사용합니다.

```ts
/**
 * @description 워크플로 원문 파일 로드
 */
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

### 7.4 helper 함수 주석 규칙 (`@helper`)

- 재사용 가능한 순수 helper 함수, 문자열 조립 함수, 정규화 함수, 포맷 함수는 `@helper`를 사용합니다.
- helper는 “그래프 단계”가 아니라 “단계 안에서 재사용되는 보조 계산”임이 드러나야 합니다.
- 같은 파일 안에서 한 node/router에만 묶이는 작은 계산은 helper로 빼지 않고 해당 node/router 안에 직접 둡니다.
- 최소한 3~4곳 이상 재사용되거나, 밖으로 빼야 읽기 흐름이 명확해질 때만 `@helper` 분리를 허용합니다.
- 단, LangGraph의 state/node/router/edge/graph 선언은 별도 LangGraph 전용 규칙 문서의 annotation(`@state`, `@node`, `@router`, `@edge`, `@graph`)을 우선합니다.
- 외부 연동 함수는 계속 `@description`을 사용합니다.

```ts
/**
 * @helper 검증 실패 원인 문구 조립
 */
const buildAuditFailureMessage = (count: number): string => {
	return `${count}건의 검증 실패`;
};
```

### 7.5 tool 함수 주석 규칙 (`@tool`)

- LangChain `tool(...)` 팩토리 또는 모델이 호출할 수 있는 도구 생성 함수는 `@tool`을 사용합니다.
- tool은 helper와 다르게 “모델이 호출 가능한 실행 경계”라는 점이 드러나야 합니다.
- tool 내부에서만 쓰는 작은 보조 계산은 `@helper` 또는 무주석으로 둘 수 있습니다.

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

### 7.6 함수 내부 주석 규칙 (`//`)

- 함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않습니다.
- 아래 조건 중 1개 이상일 때만 `//` 주석을 작성합니다.
	- 도메인 규칙 설명이 없으면 오해 가능
	- 예외 케이스 방어 의도 노출 필요
	- 외부 라이브러리 제약/우회 설명 필요
	- 부수효과 순서 설명 필요
- 변수명 그대로 반복하는 설명은 금지합니다.

### 7.7 선언형 shape 주석 규칙

- 이 규칙은 `<config-root>/**`에 한정되지 않고, 타입/인터페이스/객체형 상수 전반에 적용합니다.
- shape를 설명하는 선언에는 `@summary`를 작성합니다.
- shape 내부 필드 주석은 각 필드 바로 위 `@field` 블록 주석을 사용합니다.
- 즉, 아래 순서를 우선합니다.
	- 재사용 가치가 있으면 shape를 설명하는 `type` 또는 `interface`
	- 재사용 가치가 없으면 `export const` 객체에 직접 `@field` 블록 주석
	- runtime 값인 `export const`에는 묶음 목적 `@summary`
- 객체형 상수가 외부에 공개되더라도, 필드 설명만을 위해 별도 `type`/`interface`를 만들지 않습니다.
- `satisfies`는 실제 계약 검증 가치가 있을 때만 사용합니다.
- 같은 필드 설명을 const JSDoc의 `@property`와 타입 내부 주석에 중복 작성하지 않습니다.
- 값 이름만 보고 의미가 분명한 enum-like 식별자 맵은 const 위 `@summary`만으로 충분할 수 있습니다.
- 타입, 인터페이스, 객체형 상수는 모두 이 형태의 주석 구조를 따라야 합니다.

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

### 7.8 Bad/Good: 주석 규칙

```ts
// Bad: 서술형 + How 중심
/**
 * @summary 규칙 경로를 정렬합니다.
 */
```

```ts
// Good: 명사형 + Why 중심
/**
 * @summary 중복 제거 후 규칙 경로 정렬
 */
```

## 8. 금지 패턴

- barrel export(`index.ts`) 생성
- 기존 타입이 있는데 동일/유사 구조 타입 재선언
- 재사용 근거 없는 조기 추상화
- 넓은 스코프 명령형 조립
- 사유 없는 `??`, `||` 폴백
- 자명한 코드 설명 주석
