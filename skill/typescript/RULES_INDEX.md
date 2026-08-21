# TypeScript 컨벤션 Rule Index

- Skill: `typescript`
- Routing digest: `sha256:a5a3bc921a7508cd344636fe8e5f2314f8f0d05b4c680095a4411d0c5d2031c6`

## Local Rules

- T01-01 | types-reuse-existing-contracts-before-new-types | 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없거나 소유자만 옮긴 경우. 제외: 그대로인 계약을 새 자리에서 쓰는 경우. 제외: 고칠 수 없는 형태를 그대로 쓰는 경우. | reviewWith: types-document-custom-types-and-shapes
- T01-02 | types-prefer-function-variable-types-over-parameter-annotations | 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우. | reviewWith: types-mark-unused-parameters-with-underscore
- T01-03 | types-document-custom-types-and-shapes | 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 반환 타입이 익명으로 추론되는 경우.
- T01-04 | types-mark-unused-parameters-with-underscore | 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.
- T01-05 | types-narrow-unknown-instead-of-asserting | \`as\` 단언, \`\!\` \`null\` 아님 단언, \`any\`, \`@ts-expect-error\`를 추가할 때. 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때. | reviewWith: docs-justify-convention-exceptions-with-a-reason-comment, tooling-configure-biome-to-enforce-these-rules
- T01-06 | types-replace-enum-with-as-const-objects | \`enum\`이나 타입과 실행 양쪽에서 함께 쓰는 값 집합을 추가·변경할 때. 제외: 외부 패키지가 내보낸 \`enum\` 값을 그대로 읽어 쓰는 경우.
- T01-07 | types-choose-interface-for-object-contracts-and-type-for-composition | \`interface\`와 \`type\` 사이에서 선언 형식을 바꿀 때. 객체 계약, union, tuple, 함수 시그니처, mapped·conditional type에 이름을 붙여 선언할 때. 제외: 외부·생성된 계약을 그대로 참조하는 경우. | reviewWith: types-document-custom-types-and-shapes, types-reuse-existing-contracts-before-new-types
- T02-01 | naming-centralize-shared-config-namespaces | 프로젝트 전반이 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때. 공용 설정 경계를 바꿀 때. | reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
- T02-02 | naming-place-owner-config-in-the-owner-config-folder | 한 소유자의 선언형 설정을 추가하거나 옮길 때. 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때. | reviewWith: naming-centralize-shared-config-namespaces
- T02-03 | naming-preserve-config-origin-with-chained-access | \`config\`나 \`util\` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때. | reviewWith: functions-place-and-promote-support-functions, values-read-objects-through-chains
- T02-04 | naming-use-consistent-file-and-symbol-naming | TypeScript 파일, 폴더, 변수, 함수, 타입, 객체·스키마 키의 이름을 새로 만들거나 바꿀 때. 밖으로 나가는 키를 받는 쪽 표기로 적을지 판단할 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.
- T02-05 | naming-use-direct-imports-and-public-entry-points | 가져오기, 내보내기, \`index.ts\` 배럴, 공개 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때. | reviewWith: naming-restrict-absolute-aliases-to-layer-roots
- T02-06 | naming-restrict-absolute-aliases-to-layer-roots | 절대경로 별칭으로 다른 모듈을 가져올 때. 별칭이 가리키는 경로 깊이를 바꿀 때. | reviewWith: naming-use-direct-imports-and-public-entry-points
- T02-07 | naming-read-environment-values-through-shared-config | \`import.meta.env\`나 \`process.env\`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값을 새로 들여올 때. | reviewWith: absence-expose-optional-values-instead-of-silent-fallbacks, naming-centralize-shared-config-namespaces
- T02-08 | naming-name-types-by-role-and-lifetime | 타입·인터페이스나 그 파일의 이름을 새로 만들거나 바꿀 때. 타입을 소유자 폴더 안과 밖 사이에서 옮기며 이름을 바꿀 때. 제외: 외부·생성된 계약 이름을 그대로 쓰는 경우. | reviewWith: naming-use-consistent-file-and-symbol-naming
- T03-01 | functions-declare-functions-as-arrow-consts | 이름을 지어 선언하는 함수를 새로 만들거나 선언 형태나 본문 형태를 바꿀 때. 네임스페이스 객체에 멤버 함수를 추가·변경할 때. 제외: 인라인 콜백이거나 클래스 메서드, 제너레이터, 오버로드 선언인 경우. | reviewWith: functions-use-named-object-params-for-complex-signatures
- T03-02 | functions-use-named-object-params-for-complex-signatures | 매개변수가 셋을 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수의 필드를 읽는 방식을 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받는 방식만 바꾸는 경우. | reviewWith: types-reuse-existing-contracts-before-new-types, values-read-objects-through-chains
- T03-03 | functions-extract-helpers-only-when-the-boundary-is-real | 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때. | reviewWith: docs-require-header-jsdoc-on-key-declarations, functions-place-and-promote-support-functions
- T03-04 | functions-place-and-promote-support-functions | 보조 함수를 어느 파일이나 폴더에 둘지 정할 때. 파일 안에서 내보낸 함수와 비공개 보조의 선언 순서를 정할 때. \`shared/\` 아래로 파일을 옮기거나 \`util.\*\`에 항목을 추가할 때.
- T03-05 | functions-avoid-imperative-assembly-in-wide-scopes | 모듈 최상위나 함수 본문 전체를 덮는 스코프에서 \`let\` 재할당, 배열 \`push\`, 조건부 누적으로 값을 만들 때. | reviewWith: functions-extract-helpers-only-when-the-boundary-is-real
- T03-06 | functions-name-a-value-only-for-recompute-or-judgment | 순수 계산의 결과를 지역 변수\(\`const\`\)로 받는 줄을 추가·삭제할 때. 표현식을 쓰는 자리에 그대로 적을지 변수로 뺄지 정할 때. | reviewWith: functions-avoid-imperative-assembly-in-wide-scopes, values-read-objects-through-chains
- T03-07 | functions-name-functions-by-what-comes-out | 이름을 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 생성기·프레임워크·외부 계약이 정한 이름을 그대로 쓰는 경우.
- T04-01 | values-prefer-immutable-array-sorting | 프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때. 기존 \`.sort\(\)\` 호출을 추가·변경할 때.
- T04-02 | values-use-set-and-map-for-repeated-lookups | 같은 목록에 \`includes\`, \`find\`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.
- T04-03 | values-read-objects-through-chains | 구조분해로 객체에서 값을 꺼내는 줄을 추가·변경할 때. 객체 필드를 별칭 \`const\`에 담아 그 이름으로 쓰려 할 때. 제외: 배열이나 튜플을 자리로 푸는 경우. | reviewWith: functions-name-a-value-only-for-recompute-or-judgment
- T04-04 | values-declare-meaningful-numbers | 비교, 계산, 호출 인자에 숫자 리터럴을 새로 적을 때. 제외: 관용값이나 배열 인덱스처럼 뜻이 없는 숫자를 쓰는 경우. | reviewWith: absence-expose-optional-values-instead-of-silent-fallbacks, naming-centralize-shared-config-namespaces
- T04-05 | values-avoid-lookup-tables-for-simple-choices | 상태나 \`variant\`에 따라 쓸 값 하나를 고르는 객체·Map을 추가·변경할 때. 조회표의 키로 프롭이나 상태를 읽어 값을 넘기는 코드를 추가·변경할 때.
- T05-01 | absence-expose-optional-values-instead-of-silent-fallbacks | 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. \`??\`, \`\|\|\`, 기본값, 빈 값 대체 분기를 추가·변경할 때. | reviewWith: naming-centralize-shared-config-namespaces, naming-place-owner-config-in-the-owner-config-folder
- T06-01 | docs-keep-body-comments-for-intent-and-steps | 함수 본문의 \`//\` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때. | reviewWith: docs-justify-convention-exceptions-with-a-reason-comment, docs-write-concise-korean-comments-about-purpose-and-constraints
- T06-02 | docs-require-header-jsdoc-on-key-declarations | 쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 커스텀 타입, 스토어, 포매터 선언을 추가·변경할 때. 분기나 \`await\`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때. 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때.
- T06-03 | docs-write-concise-korean-comments-about-purpose-and-constraints | TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때. 문서 주석에 태그를 붙이거나 뺄 때.
- T06-04 | docs-write-doc-comments-as-multiline-blocks | 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 \`/\*\* … \*/\`이나 \`//\`로 선언을 설명하려 할 때. | reviewWith: docs-require-header-jsdoc-on-key-declarations
- T06-05 | docs-justify-convention-exceptions-with-a-reason-comment | 규칙이 허용한 예외를 코드에 남길 때. 이미 있는 예외 주석의 내용을 바꿀 때. 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우. | reviewWith: docs-write-concise-korean-comments-about-purpose-and-constraints
- T07-01 | tooling-configure-biome-to-enforce-these-rules | 프로젝트에 \`biome\` 설정을 처음 넣거나 lint 규칙을 바꿀 때. \`biome.json\`의 \`linter.rules\`에 항목을 추가·삭제할 때.