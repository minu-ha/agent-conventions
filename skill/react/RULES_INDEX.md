# React 컨벤션 Rule Index

- Skill: `react`
- Routing digest: `sha256:b1364cabfe065bf932888ccad5e3a9f0463185498c9e1f7c37546555e14156d5`

## Direct Companions

- `css` (`conditional`) · Applies when: class contract, stylesheet 또는 styling surface를 변경한다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)
- `typescript` (`required`) · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- R01 | ownership-import-react-types-directly | \`React.\*\` namespace 타입과 direct \`import type\` 중 선택할 때. 같은 module path의 type/value import 구성을 추가·삭제·전환할 때. 제외: 일반 direct value import만 바꾸는 경우.
- R02 | ownership-prefer-plain-ts-for-local-react-helpers | 화면 전용 계산·정규화·payload 조립을 custom hook으로 추출하려 할 때. 화면 전용 순수 로직을 별도 support module로 옮기려 할 때. | reviewWith: ownership-keep-lifecycle-in-the-owning-component, ownership-place-owner-files-in-role-folders, screen-extract-utilities-selectively, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R03 | ownership-layer-component-boundaries | 컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때. | reviewWith: css/ownership-choose-scope-prefix-by-reuse-range, ownership-place-owner-files-in-role-folders
- R04 | ownership-place-owner-files-in-role-folders | owner 아래 \`component\`·\`config\`·\`function\`·\`hook\`·\`type\` 폴더를 만들거나 옮길 때. 추출한 component·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우. | reviewWith: css/ownership-choose-scope-prefix-by-reuse-range, ownership-keep-component-imports-flowing-downward
- R05 | ownership-shared-config-entry-points | 둘 이상의 화면이 쓰는 상수·설정·순수 함수를 추가하거나 옮길 때. leaf 파일에 중복 선언된 공용 값을 정리할 때. | reviewWith: typescript/naming-centralize-shared-config-namespaces, typescript/naming-preserve-config-origin-with-chained-access
- R06 | ownership-use-consistent-file-and-symbol-naming | React/TSX 파일·컴포넌트·exported symbol·공용 설정 이름을 정하거나 바꿀 때. sibling \`.ts\` support 파일·symbol을 만들거나 옮길 때. 제외: local query·mutation binding 이름만 바꾸는 경우.
- R07 | ownership-keep-component-imports-flowing-downward | \`component\` 폴더 안의 파일을 다른 파일에서 import할 때. \`../\`나 \`@/page\` 경로로 component를 가져오려 할 때. 여러 자식이 같은 component를 필요로 해 배치를 다시 정할 때. | reviewWith: ownership-layer-component-boundaries
- R08 | ownership-keep-lifecycle-in-the-owning-component | 외부 library instance 생성·resize·구독·dispose를 한 component가 소유할 때. lifecycle 코드를 custom hook으로 옮겨 파일을 줄이려 할 때. 제외: 여러 owner가 같은 lifecycle 계약을 실제로 호출하는 경우. | reviewWith: ownership-prefer-plain-ts-for-local-react-helpers
- R09 | typing-function-type-first | React 이벤트 핸들러나 prop callback의 선언·시그니처를 추가·변경할 때. 기존 React alias나 callback 계약을 그대로 쓸 수 있는 상황일 때. curried factory가 최종 반환하는 handler를 다룰 때. | reviewWith: ownership-import-react-types-directly, typing-reuse-existing-contracts
- R10 | typing-reuse-existing-contracts | Props callback 구현을 추가·변경할 때. API 응답 기반 view type을 추가·변경하는데 기존 prop·API 계약과 같은 shape가 보일 때. wrapper 컴포넌트 사용처에서 Props 타입을 참조할 때. | reviewWith: typescript/types-reuse-callback-signatures-from-existing-contracts, typescript/types-reuse-existing-contracts-before-new-types
- R11 | strategy-avoid-boolean-prop-proliferation | 여러 곳에서 쓰는 shared component에 boolean mode·visibility prop을 추가할 때. 기존 boolean prop 조합과 JSX 분기가 늘어날 때.
- R12 | strategy-choose-single-composition-compound-and-variants | exported shared component에 slot·public part·shared context/action을 추가할 때. 반복되는 preset이나 mode API를 추가할 때. shared component의 조립 구조를 재설계할 때. | reviewWith: screen-avoid-premature-abstraction, strategy-avoid-boolean-prop-proliferation, strategy-prefer-children-over-render-props
- R13 | strategy-prefer-children-over-render-props | shared component에 header·footer·action 같은 정적 slot을 추가·변경할 때. render prop을 추가·변경하는데 runtime data 주입이 꼭 필요한지 불분명할 때.
- R14 | composition-destructure-props-inside | props를 받는 함수 컴포넌트의 시그니처나 구조분해 방식을 추가·변경할 때. props를 받는 컴포넌트를 다른 파일로 옮기거나 이름을 바꿀 때.
- R15 | composition-do-not-define-components-inside-components | 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 remount·focus reset 징후를 다룰 때.
- R16 | composition-prefer-arrow-functions-and-object-params | React 인접 코드에 \`function\` 선언이 생길 때. 함수가 매개변수를 3개 이상 받을 때. 함수가 함께 이동하는 같은 계열 값을 받을 때. | reviewWith: typescript/functions-use-named-object-params-for-complex-signatures
- R17 | composition-named-handlers-over-inline | TSX event prop의 인라인 callback에 분기나 비동기 호출을 추가·수정할 때. 인라인 callback에 여러 동작·부수효과나 비자명한 state transition이 들어갈 때. 제외: 단순 setter나 인자 전달 한 줄 위임만 있는 경우. | reviewWith: events-keep-handler-flow-inline, events-run-user-actions-in-handlers-not-effects
- R18 | composition-use-ref-prop-instead-of-forwardref-in-react-19 | React 19 컴포넌트에 focus·scroll·measure용 ref 공개 API를 추가·변경할 때. 새 \`forwardRef\` wrapper를 도입하려 할 때.
- R19 | composition-use-activity-for-render-branches | 마운트된 subtree의 표시 상태를 보존하려고 조건부 렌더링을 Activity로 바꿀 때. Activity 등 visibility primitive와 조건부 렌더링 사이를 오갈 때.
- R20 | screen-avoid-premature-abstraction | screen 코드를 helper·hook·component·module로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때. | reviewWith: screen-extract-local-section-components-for-runtime-boundaries, screen-extract-utilities-selectively, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R21 | screen-extract-local-section-components-for-runtime-boundaries | route-local section component를 새로 추출할 때. 기존 section이 async·state·provider·interaction·library·performance 경계를 소유하는지 바꿀 때.
- R22 | screen-extract-utilities-selectively | 화면 계산·변환·preset·option·column meta를 별도 함수나 support module로 옮길 때. 화면 support 경계를 바꿀 때. 제외: query \`select\` 내부 shaping만 바꾸는 경우. | reviewWith: ownership-place-owner-files-in-role-folders, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R23 | screen-keep-derived-values-close | 오리진을 끊는 alias·flag·표시값을 넓은 screen scope에 추가·이동·제거할 때. \`let\` 재할당이나 배열 \`push\` 기반 조립을 바꿀 때.
- R24 | screen-keep-route-flow-visible | route entry의 search·navigate·query·mutation·cross-section effect를 옮기거나 나눌 때. page section 조립의 순서나 owner를 바꿀 때. 제외: 같은 owner 안에서 표현만 바꾸는 경우. | reviewWith: ownership-place-owner-files-in-role-folders, screen-extract-local-section-components-for-runtime-boundaries
- R25 | events-keep-handler-flow-inline | 화면 전용 named handler의 분기·mutation·navigation·후처리를 여러 helper나 hook으로 나눌 때. 쪼개져 있던 handler 흐름을 다시 합칠 때. | reviewWith: screen-extract-utilities-selectively
- R26 | events-name-and-curry-handlers | 이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 target/event 표현을 바꿀 때. 추가 인자 전달 방식이나 최종 React handler 시그니처를 바꿀 때. | reviewWith: typescript/naming-use-consistent-file-and-symbol-naming, typing-function-type-first
- R27 | events-run-user-actions-in-handlers-not-effects | 제출·저장·삭제·닫기 같은 one-shot 사용자 액션을 handler와 state+effect 사이에서 옮길 때. one-shot 사용자 액션의 실행 흐름을 바꿀 때.
- R28 | data-avoid-fallback-defaults-and-loading-flags | optional 응답에 \`??\`·\`\|\|\` 기본값을 넣을 때. Suspense 화면 본문에 초기 loading return을 추가·변경할 때. 결측·로딩 UX를 다룰 때. | reviewWith: data-preserve-origin-chaining, screen-keep-derived-values-close, typescript/absence-expose-optional-values-instead-of-silent-fallbacks
- R29 | data-name-query-and-mutation-bindings-consistently | React Query query·mutation hook의 로컬 binding을 추가하거나 이름을 바꿀 때. 역할이 드러나지 않는 별칭이 diff에 보일 때. | reviewWith: data-preserve-origin-chaining
- R30 | data-preserve-origin-chaining | page·layout·screen 넓은 스코프에서 response·mutation·store를 구조분해할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때. | reviewWith: screen-keep-derived-values-close
- R31 | data-shape-query-data-with-select | 서버 응답의 list·items·meta 등을 렌더에서 가공하거나 반복 소비할 때. React Query \`select\`의 결과 shape를 추가·변경할 때. | reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
- R32 | state-calculate-derived-values-during-render | 현재 props·state·search·response에서 계산 가능한 값을 별도 state와 effect로 동기화할 때. 그런 동기화를 제거할 때.
- R33 | state-choose-state-tools-by-source-of-truth | 로컬 UI·전역 client·server 데이터를 새 state 도구로 옮길 때. 서로 다른 source of truth 사이에 값을 복제하거나 동기화할 때. | reviewWith: state-store-derived-authority
- R34 | state-store-derived-authority | 여러 화면·메뉴·route guard가 쓰는 권한·capability 같은 derived decision을 store에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 store로 올리려 할 때. | reviewWith: docs-require-jsdoc-on-key-declarations
- R35 | state-use-functional-setstate-updates | 다음 state가 현재 state에 의존하는 갱신을 추가·변경할 때. handler·async callback·연속 호출에서 \`setState\` 방식을 바꿀 때.
- R36 | state-use-effectevent-for-non-reactive-effect-callbacks | subscription effect가 최신 prop·state callback을 읽어야 할 때. ref 동기화 hack, dependency 재설치, \`useEffectEvent\`를 추가·변경할 때. | reviewWith: events-run-user-actions-in-handlers-not-effects
- R37 | perf-compiler-first-memoization | \`useMemo\`·\`useCallback\`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 deferred 계산을 이유로 수동 memoization을 검토할 때.
- R38 | perf-use-lazy-state-initializers-for-expensive-defaults | \`useState\` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때.
- R39 | perf-use-starttransition-for-non-urgent-updates | 클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 state update를 다룰 때. state update의 우선순위나 transition 처리를 바꿀 때.
- R40 | perf-use-usedeferredvalue-for-heavy-derived-renders | 검색어·필터·정렬 입력이 무거운 파생 view를 갱신해 typing 지연이 생길 때. \`useDeferredValue\` 기반 계산을 추가·변경할 때. | reviewWith: perf-compiler-first-memoization, perf-use-starttransition-for-non-urgent-updates
- R41 | docs-limit-inline-comments-to-non-obvious-logic | React 함수·handler·JSX 인접 로직 안의 \`//\` 주석을 추가·수정할 때. 자명한 설명과 실제 제약을 구분해 주석을 정리할 때.
- R42 | docs-require-jsdoc-on-key-declarations | query·mutation이나 비자명한 handler/effect를 추가·변경할 때. exported helper·hook·store 선언을 추가·변경할 때. re-export 포함 public type·interface나 compound public part를 추가·변경할 때.