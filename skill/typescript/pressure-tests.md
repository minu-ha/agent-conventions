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
  - 기술 identifier를 영문으로 섞더라도 `@summary route-local 엔트리 트리 입력 계약`처럼 각 annotation body에 목적을 나타내는 한글 구절이 있음
  - inline comment는 제약과 caveat만 설명함
  - 자명한 `no-op`, `increment` 설명은 제거함
- Likely fail signals
  - `@schema`, `@contract`, `@data` 같은 비표준 태그 사용
  - 다른 `@field`만 한글이고 header는 `@summary route-local entry tree props`처럼 영문 label로 끝남
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

### T9. Callback and Naming Applicability Precision

- Focus
  - `types-reuse-callback-signatures-from-existing-contracts`
  - `types-mark-unused-parameters-with-underscore`
  - `naming-use-consistent-file-and-symbol-naming`
- Prompt
  - "기존 callback 계약을 재사용해 구현하고 미사용 parameter를 남겨야 해. 같은 diff에 `import { createPortal } from \"react-dom\"`도 추가하지만 alias나 local rename은 없어."
- Expected pass signals
  - callback 계약 재사용 rule의 `reviewWith`로 unused parameter rule을 재평가함
  - 계약상 남겨야 하는 미사용 parameter에는 `_` prefix를 붙임
  - alias 없는 third-party import binding 추가만으로 symbol naming rule을 선택하지 않음
- Likely fail signals
  - callback 계약을 재사용하면서 미사용 parameter 검토를 누락함
  - 변경하지 않은 third-party export 이름을 local naming 대상으로 과선택함

### T10. Existing Contract Relocation Precision

- Focus
  - `types-reuse-existing-contracts-before-new-types`
- Prompt
  - "유일한 기존 `UserPreview` type 선언을 내용과 이름 변경 없이 owner 파일로 옮겨줘. 복제나 파생 type 추가는 없어."
- Expected pass signals
  - sole existing declaration의 pure relocation은 새·중복 shape 판단이 아니므로 rule을 N/A로 둠
  - 같은 shape를 두 번째로 선언하거나 이동 중 shape를 바꿀 때만 다시 선택함
- Likely fail signals
  - type 파일 이동 자체만으로 contract reuse rule을 과선택함
  - 원본을 남겨 중복 declaration을 만듦

### T11. Callable Role and Contextual Callback Precision

- Focus
  - `types-document-custom-types-and-shapes`
  - `types-reuse-existing-contracts-before-new-types`
  - `types-prefer-function-variable-types-over-parameter-annotations`
  - `types-reuse-callback-signatures-from-existing-contracts`
- Positive control
  - 기존 named shape가 positional 함수의 새 object input 계약 역할을 얻으면 shape가 같아도 문서화 rule은 Selected
- Negative controls
  - unchanged contract를 새 call site에서 참조만 하면 reuse rule은 N/A
  - annotation 없는 one-off `query.select` callback과 익명 inferred 반환 literal은 callback/shape rules에서 N/A
- Likely fail signals
  - 동일 owner 이동이라는 이유로 새 callable input 역할을 무시함
  - query option literal에 불필요한 type alias나 field JSDoc을 추가해 규칙을 스스로 활성화함

### T12. Curried Framework Handler Completion

- Focus
  - `naming-use-direct-imports-and-public-entry-points`
  - `types-mark-unused-parameters-with-underscore`
  - `types-prefer-function-variable-types-over-parameter-annotations`
  - `types-reuse-callback-signatures-from-existing-contracts`
- Prompt
  - "entry id를 받는 curried button handler를 기존 `MouseEventHandler` 계약으로 구현해줘."
- Expected pass signals
  - 같은 `react` module path라도 value/type specifier 추가·삭제를 import 변경으로 Selected 처리함
  - 최종 callback은 `(_event) =>`로 계약 parameter를 보존함
- Likely fail signals
  - module path가 같다는 이유로 import specifier 변경을 N/A 처리함
  - handler가 event를 쓰지 않는다는 이유로 parameter를 통째로 생략함

### T13. React Props and Existing Object Contract Boundaries

- Focus
  - `functions-use-named-object-params-for-complex-signatures`
  - `types-document-custom-types-and-shapes`
  - `types-reuse-existing-contracts-before-new-types`
- Positive control
  - 일반 함수의 네 positional 인자를 object input으로 바꾸되 같은 raw input 역할의 기존 `CreateEntryPayloadInput`을 그대로 연결하고 callable input 역할에 맞게 기존 JSDoc을 보강함
  - 같은 field라도 정규화 전 raw input인 `CreateEntryPayloadParams`와 정규화 후 payload인 `CreateEntryPayload`는 의미가 다르므로 별도 input contract를 허용함
- Negative controls
  - React 함수 컴포넌트에서 `props` 전체를 받고 본문에서 구조분해하는 변경만으로 named object params 규칙을 선택하지 않음
  - 같은 field·type·optionality·의미와 같은 raw input 역할을 가진 기존 계약이 있는데 `CreateEntryPayloadParams`나 `CreateEntryPayloadInput`을 새로 만들지 않음
- Expected pass signals
  - React props-only 변경은 React props 규칙이 소유하고 TypeScript named object params 규칙은 N/A
  - positional→object 전환의 문서화 규칙은 Selected, 기존 계약 재사용 규칙은 N/A
  - 기존 compatible shape가 없거나 정규화 전후처럼 field 의미가 달라 실제 새 domain shape가 필요한 경우도 문서화 규칙만 선택함
- Likely fail signals
  - React props 객체를 일반 함수의 복잡한 인자 묶음으로 과선택함
  - named object params 규칙을 지키기 위해 요청에 없던 `*Params`·`*Args`·`*Input` 중복 타입을 만듦
  - 구현이 만든 중복 타입을 근거로 contract reuse 규칙을 사후 Selected 처리함
  - 정규화 전 input과 정규화 후 payload를 field 목록만 보고 같은 의미의 계약으로 합침

### T14. External Contract and Documentation Independence

- Focus
  - `types-document-custom-types-and-shapes`
  - `types-reuse-existing-contracts-before-new-types`
  - `docs-require-header-jsdoc-on-key-declarations`
- Prompt
  - "generated SDK의 read-only shared input type을 private one-off 함수의 object input으로 그대로 연결해줘. SDK 선언과 주석은 바꾸지 마."
- Expected pass signals
  - unchanged external/generated/read-only/shared shape 사용만으로 두 type 규칙은 모두 N/A
  - type owner JSDoc 수정이나 문서화 전용 local alias를 만들지 않음
  - callable이 key declaration에 해당할 때만 `docs-require-header-jsdoc-on-key-declarations`를 독립적으로 Selected하고 그 mandatory docs closure를 따름
- Likely fail signals
  - N/A type rule의 숨은 요구로 callable header나 SDK owner JSDoc을 추가함
  - 문서화를 위해 중복 local `*Params` alias를 만듦

## 유지보수 원칙

- 새로운 TypeScript rule을 추가했다면, 최소 1개의 pressure scenario를 이 문서에 추가합니다.
- 반복해서 같은 오작동이 나오면 prompt를 더 구체적으로 고치고, rule 본문과 positive example도 함께 보정합니다.
- scenario는 특정 프레임워크보다 여러 TypeScript codebase에 공통으로 나타나는 판단 오류를 우선 다룹니다.
- rule 본문이나 `appliesWhen`, `reviewWith`, `requiresSelected`, `requiredOnCompletion`을 바꾸기 전에 같은 fixture로 RED를 재현하고, 수정 후 동일 candidate/mutation arm을 다시 실행합니다.
