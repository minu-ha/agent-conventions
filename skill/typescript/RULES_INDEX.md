# TypeScript 컨벤션 Rule Index

- Skill: `typescript`
- Routing digest: `sha256:8cc16f41b206935f6920eb5913153e48ee65fe9e2a6355a91efc6b15613ce44e`

## Local Rules

- T01 | naming-centralize-shared-config-namespaces | 여러 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때. 공용 설정 경계를 바꿀 때. | reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
- T02 | naming-place-owner-config-in-the-owner-config-folder | 소유자 하나만 쓰는 선언형 설정을 추가하거나 옮길 때. 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때. | reviewWith: naming-centralize-shared-config-namespaces, naming-use-consistent-file-and-symbol-naming
- T03 | naming-preserve-config-origin-with-chained-access | \`config\`나 \`util\` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때.
- T04 | naming-use-consistent-file-and-symbol-naming | TypeScript 파일, 지역 변수·함수·타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.
- T05 | naming-use-direct-imports-and-public-entry-points | 가져오기·내보내기, 배럴, 공용 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.
- T06 | naming-restrict-absolute-aliases-to-layer-roots | 절대경로 별칭으로 다른 모듈을 가져올 때. 별칭이 가리키는 경로 깊이를 바꿀 때. | reviewWith: naming-use-direct-imports-and-public-entry-points
- T07 | naming-read-environment-values-through-shared-config | \`import.meta.env\` 나 \`process.env\`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값을 새로 들여올 때. | reviewWith: absence-expose-optional-values-instead-of-silent-fallbacks, naming-centralize-shared-config-namespaces
- T08 | types-reuse-existing-contracts-before-new-types | 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없는 새 형태, 소유자만 옮긴 경우, 그대로인 계약을 새 자리에서 쓰는 경우. | reviewWith: types-document-custom-types-and-shapes
- T09 | types-prefer-function-variable-types-over-parameter-annotations | 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우. | reviewWith: types-mark-unused-parameters-with-underscore
- T10 | types-document-custom-types-and-shapes | 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 익명으로 추론된 반환인 경우.
- T11 | types-mark-unused-parameters-with-underscore | 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.
- T12 | types-narrow-unknown-instead-of-asserting | \`as\` 단언, \`\!\` 비-널 단언, \`any\`, \`@ts-expect-error\`를 추가할 때. 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때. | reviewWith: docs-justify-convention-exceptions-with-a-reason-comment, tooling-configure-biome-to-enforce-these-rules
- T13 | functions-declare-functions-as-arrow-consts | 이름 붙인 함수를 새로 만들거나 선언 형태를 바꿀 때. 제외: 클래스 메서드, 제너레이터, 오버로드 선언. | reviewWith: functions-use-named-object-params-for-complex-signatures
- T14 | functions-use-named-object-params-for-complex-signatures | 매개변수가 3개를 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수를 어디서 구조분해할지 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받고 구조분해하는 방식만 바꾸는 경우.
- T15 | functions-extract-helpers-only-when-the-boundary-is-real | 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때. | reviewWith: docs-require-header-jsdoc-on-key-declarations, functions-place-and-promote-support-functions
- T16 | functions-place-and-promote-support-functions | 보조 함수를 둘 파일이나 폴더를 정할 때. \`shared/\` 아래로 파일을 옮기거나 \`util.\*\`에 항목을 추가할 때.
- T17 | functions-avoid-imperative-assembly-in-wide-scopes | 파일 위쪽이나 넓은 스코프에서 \`let\` 재대입, 배열 \`push\`, 조건부 누적으로 값을 만들거나 정리할 때. | reviewWith: functions-extract-helpers-only-when-the-boundary-is-real
- T18 | functions-name-a-value-only-when-it-is-reused | 순수 계산의 결과를 지역 \`const\`로 받는 줄을 추가·삭제할 때. 식을 그 자리에 적을지 이름을 붙일지 정할 때. | reviewWith: functions-avoid-imperative-assembly-in-wide-scopes
- T19 | functions-prefer-immutable-array-sorting | 프롭스, 상태, 매개변수, 공유 입력에서 온 배열을 정렬할 때. 기존 \`.sort\(\)\` 호출을 추가·변경할 때.
- T20 | functions-replace-enum-with-as-const-objects | \`enum\`이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때.
- T21 | functions-use-set-and-map-for-repeated-lookups | 같은 목록에 \`includes\`, \`find\`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.
- T22 | functions-name-functions-by-what-comes-out | 이름 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 외부 패키지가 정한 이름을 별칭 없이 그대로 쓰는 경우.
- T23 | absence-expose-optional-values-instead-of-silent-fallbacks | 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. \`??\`, \`\|\|\`, 기본값, 빈 값 대체 분기를 추가·변경할 때.
- T24 | docs-keep-body-comments-for-intent-and-steps | 함수 본문의 \`//\` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때. | reviewWith: docs-write-concise-korean-comments-about-purpose-and-constraints
- T25 | docs-require-header-jsdoc-on-key-declarations | 쿼리·뮤테이션, 원격 함수, 분기나 \`await\`가 있는 핸들러와 이펙트, 내보낸 보조 함수와 훅, 커스텀 타입, 스토어 선언을 추가·변경할 때.
- T26 | docs-write-concise-korean-comments-about-purpose-and-constraints | TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때.
- T27 | docs-write-doc-comments-as-multiline-blocks | 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 \`/\*\* … \*/\`이나 \`//\`로 선언을 설명하려 할 때. | reviewWith: docs-require-header-jsdoc-on-key-declarations
- T28 | docs-justify-convention-exceptions-with-a-reason-comment | 규칙이 허용한 예외를 코드에 남길 때. 이미 있는 예외 주석의 내용을 바꿀 때. 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우. | reviewWith: docs-write-concise-korean-comments-about-purpose-and-constraints
- T29 | tooling-configure-biome-to-enforce-these-rules | 프로젝트에 \`biome\` 설정을 처음 넣거나 lint 규칙을 바꿀 때. \`biome.json\`의 \`linter.rules\`에 항목을 추가·삭제할 때.