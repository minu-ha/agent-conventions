# TypeScript 컨벤션 Rule Index

- Skill: `typescript`
- Routing digest: `sha256:00c3910c34e91ccc1b66d6baa9beda61b789f0f758434bd81fadbdcda5bf7661`

## Local Rules

- T01 | naming-centralize-shared-config-namespaces | 여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의할 때. shared config 경계를 바꿀 때. | reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
- T02 | naming-preserve-config-origin-with-chained-access | \`config\` 또는 \`util\` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경할 때.
- T03 | naming-use-consistent-file-and-symbol-naming | TypeScript 파일, local 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꿀 때. 제외: alias 없는 third-party import binding 추가인 경우.
- T04 | naming-use-direct-imports-and-public-entry-points | TypeScript import/export, barrel, shared 공개 진입점·owner support module 경계를 추가·변경할 때. 절대경로 alias로 다른 모듈을 가져올 때. 같은 module path의 value/type specifier를 추가·삭제·전환할 때.
- T05 | types-document-custom-types-and-shapes | type·interface·schema root·객체 상수·계약 field·파생 alias를 추가·변경할 때. named shape에 callable 역할을 추가할 때. 제외: 외부·generated·read-only·shared unchanged shape나 익명 추론 반환인 경우.
- T06 | types-mark-unused-parameters-with-underscore | 기존 callback·framework 계약 구현을 추가·변경하며 parameter를 생략하거나 사용하지 않을 때. curried handler가 반환하는 최종 callback에서 parameter를 생략할 때.
- T07 | types-prefer-function-variable-types-over-parameter-annotations | 기존 callable 계약을 named·shared 함수 구현에 재사용할 때. 같은 시그니처를 여러 구현이 공유하도록 바꿀 때. 제외: annotation 없는 one-off contextually typed inline callback인 경우.
- T08 | types-reuse-callback-signatures-from-existing-contracts | interface·객체·framework의 named·shared callback 구현에서 기존 시그니처를 재사용·변경할 때. 제외: annotation 없는 one-off contextually typed inline callback인 경우. | reviewWith: types-mark-unused-parameters-with-underscore
- T09 | types-reuse-existing-contracts-before-new-types | 의미상 같은 기존 type·interface·schema 대신 shape를 새로 선언·변경·복제·파생할 때. 중복 shape를 도입·제거할 때. 제외: 호환 후보 없는 새 shape, 순수 owner 이동, unchanged contract의 새 사용처인 경우. | reviewWith: types-document-custom-types-and-shapes
- T10 | functions-avoid-imperative-assembly-in-wide-scopes | 파일 상단이나 넓은 스코프에서 \`let\` 재대입, 배열 \`push\` 또는 조건부 누적으로 값을 조립하거나 리팩터링할 때.
- T11 | functions-extract-helpers-only-when-the-boundary-is-real | support function을 추출·이동·export·공유할 때. generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꿀 때. | reviewWith: docs-require-header-jsdoc-on-key-declarations
- T12 | functions-prefer-immutable-array-sorting | props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬할 때. 기존 \`.sort\(\)\` 호출을 추가·변경할 때.
- T13 | functions-replace-enum-with-as-const-objects | \`enum\` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경할 때.
- T14 | functions-use-named-object-params-for-complex-signatures | 매개변수 3개 이상 또는 같은 계열 인자를 받는 일반 함수를 추가·변경할 때. 객체 매개변수의 구조분해 위치를 바꿀 때. 제외: React 함수 컴포넌트의 props 수신·구조분해만 바꾸는 경우.
- T15 | functions-use-set-and-map-for-repeated-lookups | 같은 컬렉션에 \`includes\`, \`find\` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경할 때.
- T16 | absence-expose-optional-values-instead-of-silent-fallbacks | optional 값의 읽기·정규화·전달을 바꿀 때. \`??\`, \`\|\|\`, 기본값 또는 빈 값 대체 분기를 추가·변경할 때. | reviewWith: docs-keep-inline-comments-for-constraints-and-caveats
- T17 | docs-keep-inline-comments-for-constraints-and-caveats | 함수 본문의 \`//\` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명할 때.
- T18 | docs-require-header-jsdoc-on-key-declarations | query·mutation, 원격 함수, 비자명한 handler/effect, exported helper·hook, custom type·interface, store 선언을 추가·변경할 때. 선언 위 주석의 형식이나 태그를 정할 때.
- T19 | docs-write-concise-korean-comments-about-purpose-and-constraints | TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰할 때.
- T20 | guardrails-review-banned-typescript-shortcuts-before-finishing | TypeScript/TSX 변경을 완료 판정할 때. diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검할 때. | completionGate