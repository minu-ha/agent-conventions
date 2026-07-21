# TypeScript 컨벤션 Rule Index

> 생성된 compact routing index입니다. 모든 local entry를 스캔한 뒤 선택한 rule 본문만 여세요.

- Skill: `typescript`
- Version: `1.0.0`
- Routing digest: `sha256:1b9f4a35189f60626ff7f10d5f9b0a23565a9d26f77a973061240d230c23b3fa`
- Local rules: 22
- Section counts: `naming` 4, `types` 5, `functions` 6, `absence` 1, `docs` 5, `guardrails` 1

## Local Rules

### 1. Naming and Module Boundaries — HIGH (4 rules)

- `T01` · ID `naming-centralize-shared-config-namespaces` · [Centralize Shared Config Under \`shared/config.ts\`](rules/naming-centralize-shared-config-namespaces.md) · Impact: `HIGH` · Applies when: 여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의하거나 shared config 경계를 바꾼다. · Tags: `config`, `namespace`, `ownership` · Review with: `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`
- `T02` · ID `naming-preserve-config-origin-with-chained-access` · [Preserve Shared Namespace Origin With Chained Access](rules/naming-preserve-config-origin-with-chained-access.md) · Impact: `HIGH` · Applies when: \`config\` 또는 \`util\` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경한다. · Tags: `chaining`, `config`, `traceability`
- `T03` · ID `naming-use-consistent-file-and-symbol-naming` · [Use Consistent File, Symbol, and Field Naming](rules/naming-use-consistent-file-and-symbol-naming.md) · Impact: `HIGH` · Applies when: TypeScript 파일, 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꾼다. · Tags: `files`, `naming`, `symbols`
- `T04` · ID `naming-use-direct-imports-and-public-entry-points` · [Use Direct Imports and Dedicated Public Entry Points](rules/naming-use-direct-imports-and-public-entry-points.md) · Impact: `HIGH` · Applies when: TypeScript import/export, barrel, type-only 의존, shared 공개 진입점 또는 feature support module 경계를 추가·변경한다. · Tags: `exports`, `imports`, `public-entry`

### 2. Types and Contracts — CRITICAL (5 rules)

- `T05` · ID `types-document-custom-types-and-shapes` · [Document Custom Types and Declarative Shapes](rules/types-document-custom-types-and-shapes.md) · Impact: `CRITICAL` · Applies when: custom type·interface, schema root, 객체형 상수, 계약 field 또는 Pick·Omit·Indexed Access alias를 추가·변경한다. · Tags: `jsdoc`, `shapes`, `types`
- `T06` · ID `types-mark-unused-parameters-with-underscore` · [Mark Unused Parameters With an Underscore Prefix](rules/types-mark-unused-parameters-with-underscore.md) · Impact: `MEDIUM-HIGH` · Applies when: 기존 callback이나 framework 계약을 구현·변경하며 계약 매개변수 일부를 생략하거나 사용하지 않는다. · Tags: `callbacks`, `naming`, `parameters`
- `T07` · ID `types-prefer-function-variable-types-over-parameter-annotations` · [Prefer Function Variable Types Over Parameter Annotations](rules/types-prefer-function-variable-types-over-parameter-annotations.md) · Impact: `CRITICAL` · Applies when: 기존 callable 계약이 있는 함수 구현을 추가·변경하거나 같은 시그니처를 여러 구현이 공유하도록 리팩터링한다. · Tags: `annotations`, `contracts`, `function-types`
- `T08` · ID `types-reuse-callback-signatures-from-existing-contracts` · [Reuse Callback Signatures From Existing Contracts](rules/types-reuse-callback-signatures-from-existing-contracts.md) · Impact: `HIGH` · Applies when: interface, 객체 또는 framework가 이미 정의한 callback을 구현·전달하면서 시그니처를 새로 적거나 바꾼다. · Tags: `callbacks`, `indexed-access`, `reuse` · Review with: `types-prefer-function-variable-types-over-parameter-annotations`
- `T09` · ID `types-reuse-existing-contracts-before-new-types` · [Reuse Existing Contracts Before Declaring New Types](rules/types-reuse-existing-contracts-before-new-types.md) · Impact: `HIGH` · Applies when: 기존 type, interface 또는 schema와 같거나 일부만 다른 shape를 새로 선언·변경하려 한다. · Tags: `omit`, `pick`, `type-reuse` · Review with: `types-document-custom-types-and-shapes`

### 3. Functions and Helper Boundaries — HIGH (6 rules)

- `T10` · ID `functions-avoid-imperative-assembly-in-wide-scopes` · [Avoid Imperative Assembly in Wide Scopes](rules/functions-avoid-imperative-assembly-in-wide-scopes.md) · Impact: `HIGH` · Applies when: 파일 상단이나 넓은 스코프에서 \`let\` 재대입, 배열 \`push\` 또는 조건부 누적으로 값을 조립하거나 이를 리팩터링한다. · Tags: `assembly`, `imperative`, `scope`
- `T11` · ID `functions-extract-helpers-only-when-the-boundary-is-real` · [Extract Support Functions Only When the Boundary Is Real](rules/functions-extract-helpers-only-when-the-boundary-is-real.md) · Impact: `HIGH` · Applies when: support function을 추출·이동·export·공유하거나 generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꾼다. · Tags: `boundaries`, `extraction`, `helpers` · Review with: `docs-require-header-jsdoc-on-key-declarations`, `docs-use-helper-for-reusable-pure-helper-functions`
- `T12` · ID `functions-prefer-immutable-array-sorting` · [Prefer Immutable Array Sorting](rules/functions-prefer-immutable-array-sorting.md) · Impact: `MEDIUM` · Applies when: props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬하거나 기존 \`.sort\(\)\` 호출을 추가·변경한다. · Tags: `arrays`, `functions`, `immutability`, `sorting`
- `T13` · ID `functions-replace-enum-with-as-const-objects` · [Replace \`enum\` With \`as const\` Objects](rules/functions-replace-enum-with-as-const-objects.md) · Impact: `MEDIUM-HIGH` · Applies when: \`enum\` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경한다. · Tags: `as-const`, `enum`, `values` · Review with: `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes`
- `T14` · ID `functions-use-named-object-params-for-complex-signatures` · [Use Named Object Params for Complex Signatures](rules/functions-use-named-object-params-for-complex-signatures.md) · Impact: `HIGH` · Applies when: 매개변수 3개 이상 또는 같은 계열 인자를 받는 함수를 추가·변경하거나 객체 매개변수를 시그니처에서 구조분해한다. · Tags: `functions`, `params`, `signatures`
- `T15` · ID `functions-use-set-and-map-for-repeated-lookups` · [Use Set and Map for Repeated Lookups](rules/functions-use-set-and-map-for-repeated-lookups.md) · Impact: `MEDIUM` · Applies when: 같은 컬렉션에 \`includes\`, \`find\` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경한다. · Tags: `functions`, `lookups`, `map`, `performance`, `set`

### 4. Absence and Fallback Handling — HIGH (1 rule)

- `T16` · ID `absence-expose-optional-values-instead-of-silent-fallbacks` · [Expose Optional Values Instead of Silent Fallbacks](rules/absence-expose-optional-values-instead-of-silent-fallbacks.md) · Impact: `HIGH` · Applies when: optional 값의 읽기·정규화·전달을 바꾸거나 \`??\`, \`||\`, 기본값 또는 빈 값 대체 분기를 추가·변경한다. · Tags: `absence`, `fallback`, `optional` · Review with: `docs-keep-inline-comments-for-constraints-and-caveats`

### 5. JSDoc and Comment Conventions — MEDIUM-HIGH (5 rules)

- `T17` · ID `docs-keep-inline-comments-for-constraints-and-caveats` · [Keep Inline Comments for Constraints and Caveats Only](rules/docs-keep-inline-comments-for-constraints-and-caveats.md) · Impact: `MEDIUM` · Applies when: 함수 본문의 \`//\` 주석을 추가·수정·유지하거나 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명한다. · Tags: `caveats`, `comments`, `inline`
- `T18` · ID `docs-require-header-jsdoc-on-key-declarations` · [Require Header JSDoc on Key Declarations](rules/docs-require-header-jsdoc-on-key-declarations.md) · Impact: `MEDIUM-HIGH` · Applies when: 원격 연동 함수, 이벤트 handler, reactive sync block, reusable helper, custom type·interface, store 또는 formatter 예외 함수를 추가·변경한다. · Tags: `boundaries`, `declarations`, `jsdoc` · Review with: `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`
- `T19` · ID `docs-standardize-annotation-tags-by-declaration-role` · [Standardize Annotation Tags by Declaration Role](rules/docs-standardize-annotation-tags-by-declaration-role.md) · Impact: `MEDIUM-HIGH` · Applies when: TypeScript/TSX 선언의 JSDoc 태그를 추가·변경하거나 선언 역할에 맞는 annotation을 검토한다. · Tags: `annotations`, `jsdoc`, `roles`
- `T20` · ID `docs-use-helper-for-reusable-pure-helper-functions` · [Use \`@helper\` on Reusable Support Functions](rules/docs-use-helper-for-reusable-pure-helper-functions.md) · Impact: `MEDIUM-HIGH` · Applies when: 여러 caller가 쓰는 pure support function, owner-named exported helper 또는 \`shared/util.ts\` 함수를 추가·변경하거나 \`@helper\`를 붙이려 한다. · Tags: `helper`, `pure-functions`, `reuse`
- `T21` · ID `docs-write-concise-korean-comments-about-purpose-and-constraints` · [Write Concise Korean Comments About Purpose and Constraints](rules/docs-write-concise-korean-comments-about-purpose-and-constraints.md) · Impact: `MEDIUM` · Applies when: TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰한다. · Tags: `comments`, `korean`, `purpose`

### 6. Guardrails and Review Checks — MEDIUM (1 rule)

- `T22` · ID `guardrails-review-banned-typescript-shortcuts-before-finishing` · [Review Banned TypeScript Shortcuts Before Finishing](rules/guardrails-review-banned-typescript-shortcuts-before-finishing.md) · Impact: `MEDIUM` · Applies when: TypeScript/TSX 변경을 완료 판정하거나 diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검한다. · Tags: `banned-patterns`, `guardrails`, `review`
