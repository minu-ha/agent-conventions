# TypeScript Skill Pressure Tests

TypeScript skill을 수정하거나 새로운 rule을 추가했을 때, 실제 에이전트가 이 skill을 제대로 따르는지 확인하기 위한 유지보수용 pressure scenario 모음입니다.

이 문서는 source of truth는 아니지만, TypeScript skill 품질을 올리기 위한 회귀 테스트 자산으로 사용합니다.

## 목적

- TypeScript skill이 실제 프롬프트 압박 아래서도 일관된 판단을 내리는지 확인합니다.
- rule 간 충돌, 애매한 positive example, docs annotation 누락, helper 과추출을 조기에 발견합니다.
- "문서상으로는 맞아 보이는데 실제 agent는 다르게 행동하는" 문제를 재현 가능한 prompt 세트로 관리합니다.

## 실행 방법

각 scenario를 같은 prompt와 파일 evidence로 최소 2회, CRITICAL 누락 위험이 크면 3회 실행합니다.

1. `no-skill baseline`: convention 문서를 주지 않습니다.
2. `full-handbook oracle`: 독립 reviewer가 전체 `AGENTS.md`와 rule body로 exact 기대 partition을 승인합니다.
3. `progressive candidate`: `SKILL.md` → 전체 `RULES_INDEX.md` → selected/unknown stable-ID-matched contract를 읽고, CRITICAL 또는 deterministic expansion 조건에 맞는 full rule만 추가합니다.
4. `mutation RED`: candidate receipt에서 expected rule 하나를 제거합니다. coverage mismatch 또는 `UNKNOWN`이 완료를 반드시 차단해야 합니다.

각 arm은 `routing-evals.json`의 `expectedSkills`, exact `expectedSelected`, exact `expectedNotApplicable`, scope drift와 비교합니다. all-rules selection도 precision 실패입니다. candidate는 activation/selected/N/A exact match, exclusion-group ordinal 합집합, `FAIL 0`, `UNKNOWN 0`을 모두 만족해야 합니다.

protocol v3 결과에는 coordinator가 dispatch 전에 고정한 repository HEAD, index digest, arm/scenario/trial, exact UTF-8 prompt와 SHA-256/byte length/renderer version, model/runtime/reasoning, scorer/rubric, declared loaded files, receipt의 `Expanded`와 이유, verdict, input token을 기록합니다. progressive/full-handbook은 completion gate·conditional `reviewWith`·final-Selected `requiresSelected` trace와 delta 없는 연속 두 stable pass를 남깁니다. file-read telemetry가 없으면 observed라고 표현하지 않습니다. router+index+selected contract+expanded full rule의 implementation median/최대와 full-handbook oracle 대비 절감률을 함께 보고하고, scope drift·audit·reviewer phase의 반복 load도 누적 token에 포함합니다.

## Common Red Flags

- `??`, `||`로 결측을 습관적으로 숨김
- `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일을 먼저 만듦
- owner module export나 `shared/util.ts` helper에 `@helper`가 없음
- formatter 예외 함수, custom type/interface, schema root에 header JSDoc이 없음
- `Pick`/`Omit`/Indexed Access로 만든 alias에 `@summary`가 없음
- interface field나 schema field 설명이 없는데도 “Correct”처럼 제시됨
- callback 시그니처를 기존 계약에서 재사용하지 않고 다시 씀
- 미사용 callback parameter를 생략하거나 `_` 접두사를 붙이지 않음
- `config`, `util` 오리진을 넓은 스코프 alias로 끊음
- `enum`을 그대로 도입하거나 enum-like 상수에 `as const`를 쓰지 않음
- 재사용 가능한 callable contract가 있는데 parameter annotation만으로 함수 타입을 고정함

## Scenario Set

### T1. Optional Fallback Discipline

- Focus
  - `absence-expose-optional-values-instead-of-silent-fallbacks`
  - `docs-require-header-jsdoc-on-key-declarations`
- Prompt
  - "optional search param과 settings 값을 안전하게 정리해줘. 기본값이 필요한 곳만 TypeScript skill 기준으로 처리해줘."
- Expected pass signals
  - `??`, `||`를 습관적으로 쓰지 않음
  - 기본값이 제품 명세상 확정일 때만 explicit branch로 드러냄
  - 기본값 적용 helper를 뺐다면 `@helper`가 붙어 있음
- Likely fail signals
  - `settings.supportEmail ?? "help@example.com"`
  - `query.pageSize?.trim() || "20"` 같은 한 줄 fallback

### T2. Helper Boundary Discipline

- Focus
  - `functions-extract-helpers-only-when-the-boundary-is-real`
  - `docs-use-helper-for-reusable-pure-helper-functions`
  - `docs-require-header-jsdoc-on-key-declarations`
- Prompt
  - "payload 조립과 정규화 코드가 길어. TypeScript skill 기준으로 정리해줘."
- Expected pass signals
  - 작은 계산은 local flow에 남김
  - 진짜 exported pure support function만 남김
  - exported support helper에는 `@helper`가 붙어 있음
- Likely fail signals
  - `helper.ts`, `helpers.ts`, `utils.ts` 생성
  - support module 안에 sub-step export가 늘어남
  - exported helper인데 JSDoc이 없음

### T3. Type Contract Documentation

- Focus
  - `types-document-custom-types-and-shapes`
  - `types-reuse-existing-contracts-before-new-types`
  - `types-reuse-callback-signatures-from-existing-contracts`
- Prompt
  - "기존 타입 재사용과 문서화를 같이 맞춰줘. 새 타입은 최소화하고 계약 문서는 유지해야 해."
- Expected pass signals
  - `Pick`/`Omit`/Indexed Access로 파생하되 `@summary`를 유지함
  - custom interface에는 `@summary`, field에는 `@field`를 붙임
  - callback 시그니처는 기존 계약에서 재사용함
- Likely fail signals
  - 동일 구조 타입을 다시 선언함
  - 재사용 alias에는 문서가 사라짐
  - interface field 설명이 없음

### T4. Comment and Annotation Discipline

- Focus
  - `docs-standardize-annotation-tags-by-declaration-role`
  - `docs-write-concise-korean-comments-about-purpose-and-constraints`
  - `docs-keep-inline-comments-for-constraints-and-caveats`
- Prompt
  - "주석과 JSDoc을 TypeScript skill 기준으로 정리해줘. 설명성 주석은 줄이고 역할 태그는 맞춰줘."
- Expected pass signals
  - `@api`, `@helper`, `@summary`, `@field` 역할이 일관됨
  - inline comment는 제약과 caveat만 설명함
  - 자명한 `no-op`, `increment` 설명은 제거함
- Likely fail signals
  - `@schema`, `@contract`, `@data` 같은 비표준 태그 사용
  - `// no-op sink`, `// count를 1 증가` 같은 설명 주석 유지

### T5. Namespace and Origin Preservation

- Focus
  - `naming-centralize-shared-config-namespaces`
  - `naming-preserve-config-origin-with-chained-access`
  - `naming-use-direct-imports-and-public-entry-points`
- Prompt
  - "shared config와 util 접근을 정리해줘. 오리진이 계속 보였으면 좋겠어."
- Expected pass signals
  - `config.*`, `util.*` 체이닝을 유지함
  - barrel 대신 공개 진입점 또는 직접 import를 사용함
  - 넓은 스코프 alias destructuring을 줄임
- Likely fail signals
  - `const {api, features} = config`
  - `import {config, util} from "./index"`

### T6. Enum-like Runtime Value Discipline

- Focus
  - `functions-replace-enum-with-as-const-objects`
  - `naming-use-consistent-file-and-symbol-naming`
- Prompt
  - "상태 값 집합을 타입과 런타임에서 같이 써야 해. TypeScript skill 기준으로 정리해줘."
- Expected pass signals
  - `enum` 대신 object literal + `as const`를 사용함
  - 파생 타입에는 `@summary`를 유지함
  - enum-like 값 집합 이름과 키 casing이 naming rule과 맞음
- Likely fail signals
  - `enum AuditStatus { ... }`
  - object는 만들었지만 `as const`가 없음
  - 파생 타입 설명이 빠짐

### T7. Callable Contract Reuse

- Focus
  - `types-prefer-function-variable-types-over-parameter-annotations`
  - `types-reuse-callback-signatures-from-existing-contracts`
  - `types-mark-unused-parameters-with-underscore`
- Prompt
  - "formatter, normalizer, callback 함수 시그니처를 TypeScript skill 기준으로 정리해줘. 기존 계약 재사용이 우선이었으면 좋겠어."
- Expected pass signals
  - 기존 interface, object contract, framework alias가 있으면 함수 변수 타입으로 재사용함
  - 같은 callable contract를 여러 구현이 공유할 때만 별도 type alias를 선언함
  - 미사용 callback parameter는 `_` 접두사로 남김
- Likely fail signals
  - `const formatState = (state: Record<string, unknown>): string => { ... }`
  - 기존 계약이 있는데도 각 구현마다 parameter annotation을 다시 씀
  - 미사용 parameter를 생략하거나 이름만 남김

### T8. Single-owner Helper Collapse

- Focus
  - `functions-extract-helpers-only-when-the-boundary-is-real`
  - `functions-avoid-imperative-assembly-in-wide-scopes`
- Prompt
  - "API namespace 안에 `mapRecordToEntryView`, `readApiResponseHeaders`, `readOptionalDate` 같은 helper가 많아. TypeScript skill 기준으로 이해 비용이 낮게 정리해줘."
- Expected pass signals
  - 한 namespace method만 쓰는 mapper/helper는 호출 method 본문으로 접음
  - adapter의 한 단계 변환은 adapter 함수 본문에서 순서대로 보이게 둠
  - 여러 owner가 직접 import하지 않는 helper를 `shared/util.ts`로 승격하지 않음
  - 줄 수 감소보다 파일 왕복 감소와 owner flow 가시성을 우선 설명함
- Likely fail signals
  - 단회성 helper에 JSDoc만 추가하고 경계를 유지함
  - `read*`, `map*`, `create*` 이름을 붙였다는 이유로 helper를 남김
  - mapper를 별도 파일이나 generic util로 옮김

## 유지보수 원칙

- 새로운 TypeScript rule을 추가했다면, 최소 1개의 pressure scenario를 이 문서에 추가합니다.
- 반복해서 같은 오작동이 나오면 prompt를 더 구체적으로 고치고, rule 본문과 positive example도 함께 보정합니다.
- scenario는 특정 프레임워크보다 여러 TypeScript codebase에 공통으로 나타나는 판단 오류를 우선 다룹니다.
- rule 본문이나 `appliesWhen`, `reviewWith`, `requiresSelected`, `requiredOnCompletion`을 바꾸기 전에 같은 fixture로 RED를 재현하고, 수정 후 동일 candidate/mutation arm을 다시 실행합니다.
