# React 컨벤션 Rule Index

- Skill: `react`
- Routing digest: `sha256:64280aa680b7e54506fc572db915b49e5caa566849edf182a0c2e208cd3c2d8d`

## Direct Companions

- `css` (`conditional`) · Applies when: class contract, stylesheet 또는 styling surface를 변경한다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)
- `typescript` (`required`) · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- R01 | ownership-import-react-types-directly | \`React.\*\` 네임스페이스 타입과 직접 \`import type\` 중 선택할 때. 같은 모듈 경로에서 타입과 값 중 무엇을 가져올지 추가·삭제·전환할 때. 제외: 일반 직접 값 가져오기만 바꾸는 경우.
- R02 | ownership-prefer-plain-ts-for-local-react-helpers | 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈으로 옮기려 할 때. | reviewWith: ownership-keep-lifecycle-in-the-owning-component, ownership-place-owner-files-in-role-folders, screen-extract-utilities-selectively, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R03 | ownership-layer-component-boundaries | 컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때. | reviewWith: css/ownership-choose-scope-prefix-by-reuse-range, ownership-place-owner-files-in-role-folders
- R04 | ownership-place-owner-files-in-role-folders | 소유자 아래 \`component\`·\`config\`·\`function\`·\`hook\`·\`type\` 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우. | reviewWith: css/ownership-choose-scope-prefix-by-reuse-range, ownership-keep-component-imports-flowing-downward
- R05 | ownership-shared-config-entry-points | 둘 이상의 화면이 쓰는 상수·설정·순수 함수를 추가하거나 옮길 때. 말단 파일에 중복 선언된 공용 값을 정리할 때. | reviewWith: typescript/naming-centralize-shared-config-namespaces, typescript/naming-preserve-config-origin-with-chained-access
- R06 | ownership-use-consistent-file-and-symbol-naming | 리액트 파일, 컴포넌트, 내보낸 심볼, 공용 설정 이름을 정하거나 바꿀 때. 형제 \`.ts\` 보조 파일·심볼을 만들거나 옮길 때. 제외: 지역 질의·변경 요청 바인딩 이름만 바꾸는 경우.
- R07 | ownership-keep-component-imports-flowing-downward | \`component\` 폴더 안의 파일을 다른 파일에서 가져오기할 때. \`../\`나 \`@/page\` 경로로 컴포넌트를 가져오려 할 때. 여러 자식이 같은 컴포넌트를 필요로 해 배치를 다시 정할 때. | reviewWith: ownership-layer-component-boundaries
- R08 | ownership-keep-lifecycle-in-the-owning-component | 외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때. 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때. 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우. | reviewWith: ownership-prefer-plain-ts-for-local-react-helpers
- R09 | typing-function-type-first | 리액트 이벤트 핸들러나 prop 콜백의 선언·시그니처를 추가·변경할 때. 기존 리액트 별칭이나 콜백 계약을 그대로 쓸 수 있는 상황일 때. 커링한 팩토리가 최종 반환하는 핸들러를 다룰 때. | reviewWith: ownership-import-react-types-directly, typing-reuse-existing-contracts
- R10 | typing-reuse-existing-contracts | Props 콜백 구현을 추가·변경할 때. API 응답 기반 화면 타입을 추가·변경하는데 기존 prop·API 계약과 같은 형태가 보일 때. 래퍼 컴포넌트 사용처에서 Props 타입을 참조할 때. | reviewWith: typescript/types-reuse-callback-signatures-from-existing-contracts, typescript/types-reuse-existing-contracts-before-new-types
- R11 | strategy-avoid-boolean-prop-proliferation | 여러 곳에서 쓰는 공용 컴포넌트에 불리언 모드·표시 prop을 추가할 때. 기존 불리언 prop 조합과 JSX 분기가 늘어날 때.
- R12 | strategy-choose-single-composition-compound-and-variants | 내보낸 공용 컴포넌트에 슬롯·공개 부품·공용 컨텍스트/동작을 추가할 때. 반복되는 기본 설정이나 모드 API를 추가할 때. 공용 컴포넌트의 조립 구조를 재설계할 때. | reviewWith: screen-avoid-premature-abstraction, strategy-avoid-boolean-prop-proliferation, strategy-prefer-children-over-render-props
- R13 | strategy-prefer-children-over-render-props | 공용 컴포넌트에 머리말·꼬리말·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 prop을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때.
- R14 | composition-destructure-props-inside | props를 받는 함수 컴포넌트의 시그니처나 구조분해 방식을 추가·변경할 때. props를 받는 컴포넌트를 다른 파일로 옮기거나 이름을 바꿀 때.
- R15 | composition-do-not-define-components-inside-components | 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 재마운트·focus 초기화 징후를 다룰 때.
- R16 | composition-prefer-arrow-functions-and-object-params | 리액트 인접 코드에 \`function\` 선언이 생길 때. 함수가 매개변수를 3개 이상 받을 때. 함수가 함께 이동하는 같은 계열 값을 받을 때. | reviewWith: typescript/functions-use-named-object-params-for-complex-signatures
- R17 | composition-named-handlers-over-inline | TSX 이벤트 prop의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 비자명한 상태 전환이 들어갈 때. 제외: 단순 설정 함수나 인자 전달 한 줄 위임만 있는 경우. | reviewWith: events-keep-handler-flow-inline, events-run-user-actions-in-handlers-not-effects
- R18 | composition-use-ref-prop-instead-of-forwardref-in-react-19 | 리액트 19 컴포넌트에 focus·스크롤·측정용 ref 공개 API를 추가·변경할 때. 새 \`forwardRef\` 래퍼를 도입하려 할 때.
- R19 | composition-use-activity-for-render-branches | 마운트된 하위 트리의 표시 상태를 보존하려고 조건부 렌더링을 Activity로 바꿀 때. Activity 등 표시 방식과 조건부 렌더링 사이를 오갈 때.
- R20 | screen-avoid-premature-abstraction | 화면 코드를 보조 함수·훅·컴포넌트·모듈으로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때. | reviewWith: screen-extract-local-section-components-for-runtime-boundaries, screen-extract-utilities-selectively, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R21 | screen-extract-local-section-components-for-runtime-boundaries | 화면 지역 섹션 컴포넌트를 새로 추출할 때. 기존 섹션이 비동기·상태·프로바이더·상호작용·라이브러리·성능 경계를 소유하는지 바꿀 때.
- R22 | screen-extract-utilities-selectively | 화면 계산·변환·기본 설정·옵션·열 메타를 별도 함수나 보조 모듈으로 옮길 때. 화면 보조 경계를 바꿀 때. 제외: 질의 \`select\` 내부 가공만 바꾸는 경우. | reviewWith: ownership-place-owner-files-in-role-folders, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R23 | screen-keep-derived-values-close | 오리진을 끊는 별칭·플래그·표시값을 넓은 화면 범위에 추가·이동·제거할 때. \`let\` 재할당이나 배열 \`push\` 기반 조립을 바꿀 때.
- R24 | screen-keep-route-flow-visible | 라우트 진입의 검색·화면 이동·질의·변경 요청·화면 전체 이펙트를 옮기거나 나눌 때. page 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우. | reviewWith: ownership-place-owner-files-in-role-folders, screen-extract-local-section-components-for-runtime-boundaries
- R25 | events-keep-handler-flow-inline | 화면 전용 이름 붙인 핸들러의 분기·변경 요청·화면 이동·후처리를 여러 보조 함수나 훅으로 나눌 때. 쪼개져 있던 핸들러 흐름을 다시 합칠 때. | reviewWith: screen-extract-utilities-selectively
- R26 | events-name-and-curry-handlers | 이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때. 추가 인자 전달 방식이나 최종 리액트 핸들러 시그니처를 바꿀 때. | reviewWith: typescript/naming-use-consistent-file-and-symbol-naming, typing-function-type-first
- R27 | events-run-user-actions-in-handlers-not-effects | 제출·저장·삭제·닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때. 한 번뿐인 사용자 액션의 실행 흐름을 바꿀 때.
- R28 | data-avoid-fallback-defaults-and-loading-flags | 선택 응답에 \`??\`·\`\|\|\` 기본값을 넣을 때. Suspense 화면 본문에 초기 로딩 반환을 추가·변경할 때. 결측·로딩 사용성를 다룰 때. | reviewWith: data-preserve-origin-chaining, screen-keep-derived-values-close, typescript/absence-expose-optional-values-instead-of-silent-fallbacks
- R29 | data-name-query-and-mutation-bindings-consistently | 리액트 Query 질의·변경 요청 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때. 역할이 드러나지 않는 별칭이 diff에 보일 때. | reviewWith: data-preserve-origin-chaining
- R30 | data-preserve-origin-chaining | page·레이아웃·화면 넓은 스코프에서 응답·변경 요청·스토어를 구조분해할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때. | reviewWith: screen-keep-derived-values-close
- R31 | data-shape-query-data-with-select | 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. 리액트 Query \`select\`의 결과 형태를 추가·변경할 때. | reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
- R32 | state-calculate-derived-values-during-render | 현재 props·상태·검색·응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 그런 동기화를 제거할 때.
- R33 | state-choose-state-tools-by-source-of-truth | 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때. 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때. | reviewWith: state-store-derived-authority
- R34 | state-store-derived-authority | 여러 화면·메뉴·라우트 가드가 쓰는 권한·권한 같은 파생 판단을 스토어에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때. | reviewWith: docs-require-jsdoc-on-key-declarations
- R35 | state-use-functional-setstate-updates | 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때. 핸들러·비동기 콜백·연속 호출에서 \`setState\` 방식을 바꿀 때.
- R36 | state-use-effectevent-for-non-reactive-effect-callbacks | 구독 이펙트가 최신 prop·상태 콜백을 읽어야 할 때. ref 동기화 우회, 의존성 재설치, \`useEffectEvent\`를 추가·변경할 때. | reviewWith: events-run-user-actions-in-handlers-not-effects
- R37 | perf-compiler-first-memoization | \`useMemo\`·\`useCallback\`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때.
- R38 | perf-use-lazy-state-initializers-for-expensive-defaults | \`useState\` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때.
- R39 | perf-use-starttransition-for-non-urgent-updates | 클릭·선택·필터 변경 뒤 큰 목록·표·트리를 다시 그리는 상태 갱신을 다룰 때. 상태 갱신의 우선순위나 전환 처리를 바꿀 때.
- R40 | perf-use-usedeferredvalue-for-heavy-derived-renders | 검색어·필터·정렬 입력이 무거운 파생 화면을 갱신해 타입 지정 지연이 생길 때. \`useDeferredValue\` 기반 계산을 추가·변경할 때. | reviewWith: perf-compiler-first-memoization, perf-use-starttransition-for-non-urgent-updates
- R41 | docs-limit-inline-comments-to-non-obvious-logic | 리액트 함수·핸들러·JSX 인접 로직 안의 \`//\` 주석을 추가·수정할 때. 자명한 설명과 실제 제약을 구분해 주석을 정리할 때.
- R42 | docs-require-jsdoc-on-key-declarations | 질의·변경 요청이나 비자명한 핸들러/이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때. 다시 내보내기 포함 공개 타입·인터페이스나 합성 공개 부품을 추가·변경할 때.