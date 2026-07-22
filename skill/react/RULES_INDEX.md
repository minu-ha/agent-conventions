# React 컨벤션 Rule Index

> 모든 entry를 변경 semantic delta로 스캔합니다. 추가·삭제·이동·재선언은 포함하고 read-only 문맥은 제외합니다. 파일 이동의 동일 내부 선언은 diff에 삭제+추가로 보여도 별도 추가·변경·재선언으로 다시 세지 않습니다. N/A rule을 스스로 활성화하지 말고 최소 semantic patch만 구현합니다. Selected/Unknown guidance path는 `contracts/<stable-id>.md`입니다.

- Skill: `react`
- Version: `1.0.0`
- Routing digest: `sha256:624e51ea96f2dea6b775450def20d36142d70ffcf7960cf5169eacdf0ebb57c6`
- Local rules: 42

## Direct Companions

- `css` (`conditional`) · Applies when: class contract, stylesheet 또는 styling surface를 변경한다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)
- `typescript` (`required`) · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

### 1. Ownership and Boundaries (6)

- `R01` · `ownership-avoid-barrel-and-react-namespace-imports` · \`index.ts\`·barrel 재노출, \`React.\*\` namespace 타입과 direct \`import type\` 중 선택, type/value 혼합 import 또는 소유 출처를 숨긴 경로를 추가·수정한다. 일반 direct value import는 제외한다.
- `R02` · `ownership-prefer-plain-ts-for-local-react-helpers` · 화면 전용 계산·정규화·payload 조립을 custom hook 또는 별도 support module로 추출·이동하려 한다. · reviewWith: `screen-extract-utilities-selectively`, `screen-move-pure-support-code-out-of-entry-files`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`
- `R03` · `ownership-layer-component-boundaries` · 컴포넌트를 ui·widget·route-local 중 어느 소유 레이어에 둘지 결정하거나 레이어 사이에서 이동·공용화한다. · reviewWith: `css/naming-separate-local-and-route-style-scopes`, `ownership-place-route-local-files-by-scope`
- `R04` · `ownership-place-route-local-files-by-scope` · route 전용 컴포넌트·스타일·순수 로직을 새로 만들거나 \`-local\`과 route sibling \`.ts\` 사이에서 위치를 바꾼다. · reviewWith: `css/naming-separate-local-and-route-style-scopes`, `css/organization-keep-style-files-owned-by-one-component-or-route`
- `R05` · `ownership-shared-config-entry-points` · 둘 이상의 화면이 쓰는 상수·설정·순수 함수를 추가·이동하거나 leaf 파일에 중복 선언된 공용 값을 정리한다. · reviewWith: `typescript/naming-centralize-shared-config-namespaces`, `typescript/naming-preserve-config-origin-with-chained-access`
- `R06` · `ownership-use-consistent-file-and-symbol-naming` · React/TSX 파일·컴포넌트·exported symbol·공용 설정 이름을 정하거나 바꾸거나, React 작업에서 sibling \`.ts\` support 파일이나 exported support symbol을 만들거나 옮긴다. local query·mutation만이면 제외한다.

### 2. Typing and Contracts (2)

- `R07` · `typing-function-type-first` · React 이벤트 핸들러나 prop callback의 선언·시그니처를 추가·변경하며 기존 React alias 또는 callback 계약을 쓸 수 있다. · reviewWith: `ownership-avoid-barrel-and-react-namespace-imports`, `typing-reuse-existing-contracts`
- `R08` · `typing-reuse-existing-contracts` · Props callback 구현이나 API 응답 기반 view type을 추가·변경하며 기존 prop·API 계약과 같은 shape가 보인다. · reviewWith: `typescript/types-reuse-callback-signatures-from-existing-contracts`, `typescript/types-reuse-existing-contracts-before-new-types`

### 3. Composition Strategy (3)

- `R09` · `strategy-avoid-boolean-prop-proliferation` · 여러 곳에서 쓰는 shared component에 boolean mode·visibility prop을 추가하거나 기존 boolean 조합과 JSX 분기가 늘어난다.
- `R10` · `strategy-choose-single-composition-compound-and-variants` · exported shared component에 slot·public part·shared context/action·반복 preset·mode API를 추가하거나 조립 구조를 재설계한다. · reviewWith: `screen-avoid-premature-abstraction`, `strategy-avoid-boolean-prop-proliferation`, `strategy-prefer-children-over-render-props`
- `R11` · `strategy-prefer-children-over-render-props` · shared component에 header·footer·action 같은 정적 slot 또는 render prop을 추가·변경하며 runtime data 주입 필요가 불분명하다.

### 4. Component Structure and JSX (6)

- `R12` · `composition-destructure-props-inside` · props를 받는 함수 컴포넌트의 시그니처·본문 구조분해 방식을 추가·변경하거나 그 컴포넌트를 다른 파일로 이동·이름 변경한다.
- `R13` · `composition-do-not-define-components-inside-components` · 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가·이동하거나 재렌더 시 remount·focus reset 징후를 다룬다.
- `R14` · `composition-prefer-arrow-functions-and-object-params` · React 인접 코드에 function 선언이 생기거나 함수가 3개 이상 매개변수 또는 함께 이동하는 같은 계열 값을 받는다. · reviewWith: `typescript/functions-use-named-object-params-for-complex-signatures`
- `R15` · `composition-named-handlers-over-inline` · TSX event prop의 인라인 callback에 분기, 비동기 호출, 여러 동작·부수효과 또는 비자명한 state transition을 추가·수정한다. 단순 setter·인자 전달 한 줄 위임은 제외한다. · reviewWith: `events-keep-handler-flow-inline`, `events-run-user-actions-in-handlers-not-effects`
- `R16` · `composition-use-activity-for-render-branches` · 이미 마운트된 subtree의 표시 상태를 보존하려고 조건부 렌더링과 Activity 또는 동등한 visibility primitive 사이를 바꾼다.
- `R17` · `composition-use-ref-prop-instead-of-forwardref-in-react-19` · React 19 컴포넌트에 focus·scroll·measure용 ref 공개 API를 추가·변경하거나 새 \`forwardRef\` wrapper를 도입한다.

### 5. Screen File Discipline (6)

- `R18` · `screen-avoid-premature-abstraction` · screen 코드를 helper·hook·component·module로 추출하거나 한 곳에서만 쓰는 기존 추상화를 접어 넣는다. · reviewWith: `screen-extract-local-section-components-for-runtime-boundaries`, `screen-extract-utilities-selectively`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`
- `R19` · `screen-extract-local-section-components-for-runtime-boundaries` · route-local section component를 새로 추출하거나 기존 section이 async·state·provider·interaction·library·performance 경계를 소유하는지 바꾼다.
- `R20` · `screen-extract-utilities-selectively` · 화면 계산·변환·preset·option·column meta를 별도 함수/support module로 추출·이동하거나 support 경계를 바꾼다. query \`select\` 내부 shaping만이면 제외한다. · reviewWith: `screen-move-pure-support-code-out-of-entry-files`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`
- `R21` · `screen-keep-derived-values-close` · response·state·search·props의 오리진을 끊는 alias·flag·표시값을 넓은 screen scope에 추가·이동·제거하거나 \`let\`/\`push\` 조립을 바꾼다.
- `R22` · `screen-keep-route-flow-visible` · route entry의 search·navigate·query·mutation·effect·section 조립을 이동·분리하거나 재구성한다. 순수 type·payload builder만 sibling \`.ts\`로 옮기고 이 orchestration을 그대로 두면 제외한다. · reviewWith: `screen-extract-local-section-components-for-runtime-boundaries`, `screen-move-pure-support-code-out-of-entry-files`
- `R23` · `screen-move-pure-support-code-out-of-entry-files` · route entry에 여러 줄 pure helper·preset·option·화면 전용 type이 쌓이거나 추출한 support code의 목적지 파일을 정한다. · reviewWith: `docs-require-jsdoc-on-key-declarations`

### 6. Events and Interaction Flow (3)

- `R24` · `events-keep-handler-flow-inline` · 화면 전용 named handler의 분기·mutation·navigation·후처리를 여러 helper나 hook으로 나누거나 다시 합친다. · reviewWith: `screen-extract-utilities-selectively`
- `R25` · `events-name-and-curry-handlers` · 이벤트 핸들러를 새로 만들거나 이름, target/event 표현, 추가 인자 전달 방식 또는 최종 React handler 시그니처를 바꾼다. · reviewWith: `typescript/naming-use-consistent-file-and-symbol-naming`, `typing-function-type-first`
- `R26` · `events-run-user-actions-in-handlers-not-effects` · 제출·저장·삭제·닫기 같은 one-shot 사용자 액션을 handler와 state+effect 사이에서 이동하거나 실행 흐름을 바꾼다.

### 7. State and Data Flow (13)

- `R27` · `state-avoid-fallback-defaults-and-loading-flags` · optional 응답에 \`??\`·\`||\` 기본값을 넣거나 Suspense 화면 본문에 초기 loading return을 추가·변경하고 결측·로딩 UX를 다룬다. · reviewWith: `screen-keep-derived-values-close`, `state-preserve-origin-chaining`, `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`
- `R28` · `state-calculate-derived-values-during-render` · 현재 props·state·search·response에서 계산 가능한 값을 별도 state와 effect로 동기화하거나 그 동기화를 제거한다.
- `R29` · `state-choose-state-tools-by-source-of-truth` · 로컬 UI·전역 client·server 데이터를 새 state 도구로 옮기거나 서로 다른 source of truth 사이에 복제·동기화한다. · reviewWith: `state-store-derived-authority`
- `R30` · `state-name-query-and-mutation-bindings-consistently` · React Query query·mutation hook의 로컬 binding을 추가·이름 변경하거나 역할이 드러나지 않는 별칭이 diff에 보인다. · reviewWith: `state-preserve-origin-chaining`
- `R31` · `state-compiler-first-memoization` · \`useMemo\`·\`useCallback\`을 추가·제거하거나 참조 동일성·실측 병목·무거운 deferred 계산을 이유로 수동 memoization을 검토한다.
- `R32` · `state-preserve-origin-chaining` · page·layout·screen 넓은 스코프에서 response·mutation·store를 구조분해하거나 별칭으로 끊고 원본 값 접근을 바꾼다. · reviewWith: `screen-keep-derived-values-close`
- `R33` · `state-shape-query-data-with-select` · 서버 응답의 list·items·meta 등을 렌더에서 가공·반복 소비하거나 React Query \`select\`의 결과 shape를 추가·변경한다. · reviewWith: `state-name-query-and-mutation-bindings-consistently`, `state-preserve-origin-chaining`
- `R34` · `state-store-derived-authority` · 여러 화면·메뉴·route guard가 쓰는 권한·capability 같은 derived decision을 store에 저장·동기화하거나 단일 화면 값까지 store로 올린다. · reviewWith: `docs-require-jsdoc-on-key-declarations`
- `R35` · `state-use-functional-setstate-updates` · 다음 state가 현재 state에 의존하는 handler·async callback·반복 갱신에서 \`setState\` 호출 방식을 추가·변경한다.
- `R36` · `state-use-lazy-state-initializers-for-expensive-defaults` · \`useState\` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 추가·변경한다.
- `R37` · `state-use-starttransition-for-non-urgent-updates` · 클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 state update의 우선순위나 transition 처리를 바꾼다.
- `R38` · `state-use-usedeferredvalue-for-heavy-derived-renders` · 검색어·필터·정렬 입력이 무거운 파생 view를 갱신해 typing 지연이 생기거나 \`useDeferredValue\` 기반 계산을 추가·변경한다. · reviewWith: `state-compiler-first-memoization`, `state-use-starttransition-for-non-urgent-updates`
- `R39` · `state-use-effectevent-for-non-reactive-effect-callbacks` · subscription effect가 최신 prop·state callback을 읽도록 ref 동기화 hack, dependency 재설치 또는 \`useEffectEvent\`를 추가·변경한다. · reviewWith: `events-run-user-actions-in-handlers-not-effects`

### 8. Documentation and Comments (3)

- `R40` · `docs-document-compound-parts-with-part-and-description` · compound component의 exported public part·props interface·part 내부 handler를 추가·변경하거나 public part 문서를 수정한다.
- `R41` · `docs-limit-inline-comments-to-non-obvious-logic` · React 함수·handler·JSX 인접 로직 안의 \`//\` 주석을 추가·수정하거나 자명한 설명과 실제 제약을 구분해 정리한다.
- `R42` · `docs-require-jsdoc-on-key-declarations` · query·mutation, 비자명한 handler/effect, exported helper/custom hook/store, exported 또는 re-exported public type/interface, 예외 memo 선언을 추가·변경한다.
