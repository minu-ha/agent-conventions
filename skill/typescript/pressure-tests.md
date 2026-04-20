# TypeScript Skill Pressure Tests

TypeScript skill을 수정하거나 새로운 rule을 추가했을 때, 실제 에이전트가 이 skill을 제대로 따르는지 확인하기 위한 유지보수용 pressure scenario 모음입니다.

이 문서는 source of truth는 아니지만, TypeScript skill 품질을 올리기 위한 회귀 테스트 자산으로 사용합니다.

## 목적

- TypeScript skill이 실제 프롬프트 압박 아래서도 일관된 판단을 내리는지 확인합니다.
- rule 간 충돌, 애매한 positive example, docs annotation 누락, helper 과추출을 조기에 발견합니다.
- "문서상으로는 맞아 보이는데 실제 agent는 다르게 행동하는" 문제를 재현 가능한 prompt 세트로 관리합니다.

## 실행 방법

1. 가능하면 실제 TypeScript 코드베이스에서 실행합니다.
2. 각 scenario는 최소 2번 돌립니다.
   - baseline: TypeScript skill 없이 실행
   - candidate: `convention-typescript`를 로드한 상태로 실행
3. 결과를 아래 항목으로 비교합니다.
   - 어떤 파일을 만들거나 수정했는지
   - type/interface/schema/helper 경계를 어떻게 나눴는지
   - fallback, JSDoc, helper 추출, type reuse 방식이 skill 기준과 맞는지
4. 한 scenario에서 2회 이상 같은 오작동이 반복되면, rule wording 또는 example 문제로 봅니다.

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

## 유지보수 원칙

- 새로운 TypeScript rule을 추가했다면, 최소 1개의 pressure scenario를 이 문서에 추가합니다.
- 반복해서 같은 오작동이 나오면 prompt를 더 구체적으로 고치고, rule 본문과 positive example도 함께 보정합니다.
- scenario는 특정 프레임워크보다 여러 TypeScript codebase에 공통으로 나타나는 판단 오류를 우선 다룹니다.
