# TypeScript 컨벤션 Rule Index

> 모든 entry를 스캔합니다. Selected/Unknown guidance path는 `contracts/<stable-id>.md`입니다.

- Skill: `typescript`
- Version: `1.0.0`
- Routing digest: `sha256:fbde2ddd61c5f90530228542fc8efa961a921b1952189e61be56a95daeb81f0c`
- Local rules: 22

## Local Rules

### 1. Naming and Module Boundaries (4)

- `T01` · `naming-centralize-shared-config-namespaces` · 여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의하거나 shared config 경계를 바꾼다. · reviewWith: `naming-preserve-config-origin-with-chained-access`, `naming-use-direct-imports-and-public-entry-points`
- `T02` · `naming-preserve-config-origin-with-chained-access` · \`config\` 또는 \`util\` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경한다.
- `T03` · `naming-use-consistent-file-and-symbol-naming` · TypeScript 파일, 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꾼다.
- `T04` · `naming-use-direct-imports-and-public-entry-points` · TypeScript import/export, barrel, type-only 의존, shared 공개 진입점 또는 feature support module 경계를 추가·변경한다.

### 2. Types and Contracts (5)

- `T05` · `types-document-custom-types-and-shapes` · custom type·interface, schema root, 객체형 상수, 계약 field 또는 Pick·Omit·Indexed Access alias를 추가·변경한다.
- `T06` · `types-mark-unused-parameters-with-underscore` · 기존 callback이나 framework 계약을 구현·변경하며 계약 매개변수 일부를 생략하거나 사용하지 않는다.
- `T07` · `types-prefer-function-variable-types-over-parameter-annotations` · 기존 callable 계약이 있는 함수 구현을 추가·변경하거나 같은 시그니처를 여러 구현이 공유하도록 리팩터링한다.
- `T08` · `types-reuse-callback-signatures-from-existing-contracts` · interface, 객체 또는 framework가 이미 정의한 callback을 구현·전달하면서 시그니처를 새로 적거나 바꾼다. · reviewWith: `types-prefer-function-variable-types-over-parameter-annotations`
- `T09` · `types-reuse-existing-contracts-before-new-types` · 기존 type, interface 또는 schema와 같거나 일부만 다른 shape를 새로 선언·변경하려 한다. · reviewWith: `types-document-custom-types-and-shapes`

### 3. Functions and Helper Boundaries (6)

- `T10` · `functions-avoid-imperative-assembly-in-wide-scopes` · 파일 상단이나 넓은 스코프에서 \`let\` 재대입, 배열 \`push\` 또는 조건부 누적으로 값을 조립하거나 이를 리팩터링한다.
- `T11` · `functions-extract-helpers-only-when-the-boundary-is-real` · support function을 추출·이동·export·공유하거나 generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꾼다. · reviewWith: `docs-require-header-jsdoc-on-key-declarations`, `docs-use-helper-for-reusable-pure-helper-functions`
- `T12` · `functions-prefer-immutable-array-sorting` · props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬하거나 기존 \`.sort\(\)\` 호출을 추가·변경한다.
- `T13` · `functions-replace-enum-with-as-const-objects` · \`enum\` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경한다. · reviewWith: `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes`
- `T14` · `functions-use-named-object-params-for-complex-signatures` · 매개변수 3개 이상 또는 같은 계열 인자를 받는 함수를 추가·변경하거나 객체 매개변수를 시그니처에서 구조분해한다.
- `T15` · `functions-use-set-and-map-for-repeated-lookups` · 같은 컬렉션에 \`includes\`, \`find\` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경한다.

### 4. Absence and Fallback Handling (1)

- `T16` · `absence-expose-optional-values-instead-of-silent-fallbacks` · optional 값의 읽기·정규화·전달을 바꾸거나 \`??\`, \`||\`, 기본값 또는 빈 값 대체 분기를 추가·변경한다. · reviewWith: `docs-keep-inline-comments-for-constraints-and-caveats`

### 5. JSDoc and Comment Conventions (5)

- `T17` · `docs-keep-inline-comments-for-constraints-and-caveats` · 함수 본문의 \`//\` 주석을 추가·수정·유지하거나 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명한다.
- `T18` · `docs-require-header-jsdoc-on-key-declarations` · named query·mutation binding, 원격 연동 함수, 이벤트 handler, reactive sync block, reusable helper, custom type·interface, store 또는 formatter 예외 선언을 추가·변경한다. · reviewWith: `docs-standardize-annotation-tags-by-declaration-role`, `docs-write-concise-korean-comments-about-purpose-and-constraints`
- `T19` · `docs-standardize-annotation-tags-by-declaration-role` · TypeScript/TSX 선언의 JSDoc 태그를 추가·변경하거나 선언 역할에 맞는 annotation을 검토한다.
- `T20` · `docs-use-helper-for-reusable-pure-helper-functions` · 여러 caller가 쓰는 pure support function, owner-named exported helper 또는 \`shared/util.ts\` 함수를 추가·변경하거나 \`@helper\`를 붙이려 한다.
- `T21` · `docs-write-concise-korean-comments-about-purpose-and-constraints` · TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰한다.

### 6. Guardrails and Review Checks (1)

- `T22` · `guardrails-review-banned-typescript-shortcuts-before-finishing` · TypeScript/TSX 변경을 완료 판정하거나 diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검한다.
