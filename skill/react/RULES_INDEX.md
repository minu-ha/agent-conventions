# React 컨벤션 Rule Index

- Skill: `react`
- Routing digest: `sha256:1c696d5b4e0ea9a919e090ca31c5f02e2ebcad67922bf1eec092f6c51b2d9d83`

## Direct Companions

- `css` (`conditional`) · Applies when: class contract, stylesheet 또는 styling surface를 변경한다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)
- `typescript` (`required`) · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- R01 | ownership-layer-component-boundaries | 컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때. | reviewWith: css/ownership-choose-scope-prefix-by-reuse-range, ownership-place-owner-files-in-role-folders
- R02 | ownership-prefix-layer-names-on-files-and-symbols | 컴포넌트 파일이나 심볼 이름을 새로 지을 때. 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때. | reviewWith: ownership-layer-component-boundaries, typescript/naming-use-consistent-file-and-symbol-naming
- R03 | ownership-place-owner-files-in-role-folders | 소유자 아래 \`component\`·\`config\`·\`function\`·\`hook\`·\`type\` 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우. | reviewWith: css/ownership-choose-scope-prefix-by-reuse-range, ownership-keep-component-imports-flowing-downward
- R04 | ownership-keep-component-imports-flowing-downward | \`component\` 폴더 안의 파일을 다른 파일에서 가져오기할 때. \`../\`나 \`@/page\` 경로로 컴포넌트를 가져오려 할 때. 여러 자식이 같은 컴포넌트를 필요로 해 배치를 다시 정할 때. | reviewWith: ownership-layer-component-boundaries
- R05 | ownership-prefer-plain-ts-for-local-react-helpers | 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때. | reviewWith: ownership-keep-lifecycle-in-the-owning-component, ownership-place-owner-files-in-role-folders, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R06 | ownership-keep-lifecycle-in-the-owning-component | 외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때. 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때. 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우. | reviewWith: ownership-prefer-plain-ts-for-local-react-helpers
- R07 | typing-take-handler-types-from-existing-contracts | 커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때. \`Ui\*\` 래퍼 사용처에서 프롭스 타입을 참조할 때. 제외: \`query.select\` 같은 훅 옵션의 일회성 문맥 콜백인 경우.
- R08 | typing-narrow-library-wrapper-contracts | 라이브러리 컴포넌트를 감싸는 \`Ui\*\` 래퍼의 프롭스 타입을 만들거나 바꿀 때. 래퍼에 프롭을 추가하거나 여는 범위를 넓힐 때. | reviewWith: css/values-do-not-style-through-the-style-attribute, typing-choose-wrapper-shape-and-forwarding, typing-take-handler-types-from-existing-contracts
- R09 | typing-choose-wrapper-shape-and-forwarding | 래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가·변경할 때. 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때.
- R10 | strategy-choose-single-composition-compound-and-variants | 내보낸 공용 컴포넌트에 슬롯·공개 부품·공용 컨텍스트/동작을 추가할 때. 반복되는 기본 설정이나 모드 API를 추가할 때. 공용 컴포넌트의 조립 구조를 재설계할 때. | reviewWith: screen-avoid-premature-abstraction, strategy-avoid-boolean-prop-proliferation, strategy-expose-only-assembled-compound-parts, strategy-prefer-children-over-render-props
- R11 | strategy-expose-only-assembled-compound-parts | 합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때. 상태 없는 합성에 상태를 넣으면서 공개 이름을 바꾸려 할 때. | reviewWith: css/composition-do-not-add-wrapper-elements-for-styling, strategy-choose-single-composition-compound-and-variants
- R12 | strategy-avoid-boolean-prop-proliferation | 여러 곳에서 쓰는 공용 컴포넌트에 불리언 모드·표시 프롭을 추가할 때. 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때.
- R13 | strategy-prefer-children-over-render-props | 공용 컴포넌트에 머리말·꼬리말·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때.
- R14 | composition-read-props-without-destructuring | 함수 컴포넌트의 시그니처나 본문에서 프롭스를 읽는 코드를 추가·변경할 때. 컴포넌트 안에서 \`props\`를 구조분해하는 줄을 넣거나 뺄 때. | reviewWith: data-preserve-origin-chaining, screen-keep-derived-values-close
- R15 | composition-do-not-define-components-inside-components | 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 재마운트·focus 초기화 징후를 다룰 때.
- R16 | composition-named-handlers-over-inline | TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 읽어서 의도가 안 보이는 상태 전환이 들어갈 때. 제외: 인자 없이 핸들러 참조만 넘기는 경우. | reviewWith: events-keep-handler-flow-inline, events-run-user-actions-in-handlers-not-effects
- R17 | composition-open-ref-props-only-for-imperative-contracts | 컴포넌트에 \`ref\` 프롭을 추가하거나 공개할 대상을 바꿀 때. 제외: 이미 있는 \`ref\` 계약의 타입만 바꾸는 경우. | reviewWith: strategy-avoid-boolean-prop-proliferation
- R18 | composition-use-activity-only-to-preserve-mounted-subtrees | 조건부 렌더링과 \`Activity\` 사이를 오갈 때. \`\<Activity\>\`를 추가·삭제하거나 \`mode\`를 계산하는 식을 바꿀 때. | reviewWith: composition-do-not-define-components-inside-components
- R19 | composition-declare-props-interface-above-the-component | 컴포넌트 프롭스 타입을 새로 선언할 때. 프롭스 타입의 위치나 공개 범위를 바꿀 때. | reviewWith: composition-read-props-without-destructuring, typescript/types-document-custom-types-and-shapes
- R20 | composition-name-fragments-explicitly | JSX에서 여러 요소를 감쌀 조각 문법을 추가·변경할 때. 조각에 \`key\`를 붙이거나 떼어 낼 때.
- R21 | composition-render-one-branch-with-and | JSX 안에 조건부 렌더링을 추가하거나 조건식을 바꿀 때. 기존 \`조건 ? … : null\`을 넣거나 뺄 때.
- R22 | screen-keep-route-flow-visible | 라우트 진입의 검색·화면 이동·쿼리·뮤테이션·화면 전체 이펙트를 옮기거나 나눌 때. page 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우. | reviewWith: ownership-place-owner-files-in-role-folders, screen-extract-local-section-components-for-runtime-boundaries
- R23 | screen-avoid-premature-abstraction | 화면 코드를 보조 함수·훅·컴포넌트·모듈로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때. | reviewWith: screen-extract-local-section-components-for-runtime-boundaries, typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R24 | screen-extract-local-section-components-for-runtime-boundaries | 화면 지역 섹션 컴포넌트를 새로 추출할 때. 기존 섹션이 비동기·상태·프로바이더·상호작용·라이브러리·성능을 직접 소유하는지 바꿀 때.
- R25 | screen-keep-derived-values-close | 화면 진입 파일이나 섹션 최상단에 \`const\` 별칭·플래그·표시값을 추가·이동·제거할 때. 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 \`const\`로 빼거나 되돌릴 때.
- R26 | screen-place-suspense-boundaries-at-the-section-owner | \`Suspense\` 쿼리를 쓰는 화면에서 로딩 대체 화면의 위치를 정할 때. \`Suspense\` 경계를 추가하거나 옮길 때. | reviewWith: screen-extract-local-section-components-for-runtime-boundaries
- R27 | screen-avoid-ad-hoc-loading-branches | Suspense 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때. \`isFetching\`이나 뮤테이션 \`isPending\`으로 화면을 가리는 분기를 넣을 때. 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우. | reviewWith: data-preserve-origin-chaining, screen-keep-derived-values-close
- R28 | events-keep-handler-flow-inline | 화면 전용 이름 붙인 핸들러의 분기·뮤테이션·화면 이동·후처리를 여러 보조 함수나 훅으로 나눌 때. 쪼개져 있던 핸들러 흐름을 다시 합칠 때. | reviewWith: typescript/functions-extract-helpers-only-when-the-boundary-is-real
- R29 | events-name-handlers-predictably | 이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때. | reviewWith: typescript/naming-use-consistent-file-and-symbol-naming
- R30 | events-curry-extra-handler-arguments | DOM 이벤트 프롭에 추가 인자를 넘기는 핸들러를 추가·변경할 때. 인라인 래퍼로 인자를 넘기던 자리를 바꿀 때. 제외: 이벤트 객체를 받지 않는 프롭 콜백인 경우. | reviewWith: composition-named-handlers-over-inline
- R31 | events-run-user-actions-in-handlers-not-effects | 제출·저장·삭제·닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때. 한 번뿐인 사용자 액션의 실행 흐름을 바꿀 때.
- R32 | data-name-query-and-mutation-bindings-consistently | 리액트 Query 쿼리·뮤테이션 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때. 역할이 드러나지 않는 별칭이 diff에 보일 때. | reviewWith: data-preserve-origin-chaining
- R33 | data-shape-query-data-with-select | 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. 리액트 Query \`select\`의 결과 형태를 추가·변경할 때. | reviewWith: data-name-query-and-mutation-bindings-consistently, data-preserve-origin-chaining
- R34 | data-preserve-origin-chaining | page·레이아웃·화면 넓은 스코프에서 응답·뮤테이션·스토어를 구조분해할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때. | reviewWith: screen-keep-derived-values-close
- R35 | state-calculate-derived-values-during-render | 현재 프롭스·상태·검색·응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 그런 동기화를 제거할 때.
- R36 | state-choose-state-tools-by-source-of-truth | 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때. 합성 컴포넌트나 컴포넌트 묶음에 공유 상태를 넣을 때. 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때. | reviewWith: state-store-derived-authority, strategy-choose-single-composition-compound-and-variants
- R37 | state-store-derived-authority | 여러 화면·메뉴·라우트 가드가 쓰는 접근 권한 같은 파생 판단을 스토어에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때. | reviewWith: docs-require-jsdoc-on-key-declarations
- R38 | state-use-functional-setstate-updates | 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때. 핸들러·비동기 콜백·연속 호출에서 \`setState\` 방식을 바꿀 때.
- R39 | state-use-effectevent-for-non-reactive-effect-callbacks | 구독 이펙트가 최신 프롭·상태 콜백을 읽어야 할 때. ref 동기화 우회, 의존성 재설치, \`useEffectEvent\`를 추가·변경할 때. | reviewWith: events-run-user-actions-in-handlers-not-effects
- R40 | perf-avoid-defensive-memoization | \`useMemo\`·\`useCallback\`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때. | reviewWith: perf-use-usedeferredvalue-for-heavy-derived-renders
- R41 | perf-use-lazy-state-initializers-for-expensive-defaults | \`useState\` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때.
- R42 | perf-use-starttransition-for-non-urgent-updates | 클릭·선택·필터 변경 뒤 큰 목록·표·트리를 다시 그리는 상태 갱신을 다룰 때. 상태 갱신의 우선순위나 전환 처리를 바꿀 때.
- R43 | perf-use-usedeferredvalue-for-heavy-derived-renders | 검색어·필터·정렬 입력마다 큰 목록이나 표를 다시 계산해 입력 반응이 늦어질 때. \`useDeferredValue\` 기반 계산을 추가·변경할 때. | reviewWith: perf-avoid-defensive-memoization, perf-use-starttransition-for-non-urgent-updates
- R44 | docs-require-jsdoc-on-key-declarations | 쿼리·뮤테이션이나 읽어서 의도가 안 보이는 핸들러/이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때. 다시 내보내기 포함 공개 타입·인터페이스를 추가·변경할 때.