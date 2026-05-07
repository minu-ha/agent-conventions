# React Skill Pressure Tests

React skill을 수정하거나 새로운 rule을 추가했을 때, 실제 에이전트가 이 skill을 제대로 따르는지 확인하기 위한 유지보수용 pressure scenario 모음입니다.

이 문서는 source of truth는 아니지만, React skill 품질을 올리기 위한 회귀 테스트 자산으로 사용합니다.

## 목적

- React skill이 실제 프롬프트 압박 아래서도 일관된 판단을 내리는지 확인합니다.
- rule 간 충돌, 애매한 예시, companion skill 누락, 잘못된 추상화 습관을 조기에 발견합니다.
- "문서상으로는 맞아 보이는데 실제 agent는 다르게 행동하는" 문제를 재현 가능한 prompt 세트로 관리합니다.

## 실행 방법

1. 가능하면 실제 React/TanStack Query/TanStack Router 기반 코드베이스에서 실행합니다.
2. 각 scenario는 최소 2번 돌립니다.
   - baseline: React skill 없이 실행
   - candidate: `convention-react`와 필요한 companion skill을 함께 로드한 상태로 실행
     - annotation role audit가 걸린 scenario는 기본적으로 `convention-typescript`도 함께 로드합니다.
3. 결과를 아래 항목으로 비교합니다.
   - 어떤 파일을 만들거나 수정했는지
   - route entry / `page.ts` / `-local/` 경계를 어떻게 나눴는지
   - handler, state, query binding, JSDoc, fallback 처리 방식이 skill 기준과 맞는지
   - companion skill을 실제로 함께 언급하거나 반영했는지
4. 한 scenario에서 2회 이상 같은 종류의 오작동이 반복되면, rule wording 또는 example 문제가 있는 것으로 봅니다.

## 평가 기준

각 scenario는 아래 기준으로 `pass`, `soft-fail`, `fail` 중 하나로 기록합니다.

- `pass`
  - 핵심 규칙을 따르고, companion skill 필요성도 적절히 반영함
- `soft-fail`
  - 결과물은 쓸 수 있지만 naming, file placement, docs, origin preservation 같은 세부 rule이 흔들림
- `fail`
  - rule을 정면으로 어기거나, React skill이 막아야 할 안 좋은 추상화로 회귀함

## 기록 템플릿

```md
### Scenario <id>
- Date:
- Repo / fixture:
- Skills loaded:
- Result: pass | soft-fail | fail
- What the agent did:
- Violated rules:
- Ambiguous rules or examples:
- Suggested doc fix:
```

## Common Red Flags

- route entry를 `HeaderSection`, `ContentSection`, `FooterSection` 같은 layout wrapper로 쪼갬
- pure logic를 `useSomething` custom hook으로 추출함
- `page.ts` 대신 `utils.ts`, `helpers.ts`, `common.ts`를 만듦
- query response를 render body에서 계속 map/filter 하거나 상단 alias로 퍼뜨림
- query/mutation 선언에 `@api`가 없음
- pure support helper에 `@helper`가 없음
- 분기나 부수효과가 있는 handler, 동기화 effect에 `@event` / `@watch`가 없음
- `response...` / `mutation...` naming을 유지하지 않음
- shared component에 boolean prop을 계속 추가함
- `renderHeader`, `renderFooter` 같은 render prop을 정적 조립에도 남용함
- JSX 안에 async handler를 숨김
- `?? []`, `?? ""`, ad-hoc `Spinner` return으로 결측/로딩을 감춤
- compound component public part에 `@part` / `@description` 문서화가 없음
- React 변경인데 `convention-typescript`, `convention-css`, `convention-tanstack-route`, `convention-playwright-test` 같은 companion skill을 전혀 고려하지 않음

## Scenario Set

### R1. Route Entry Orchestration Visibility

- Focus
  - `screen-keep-route-flow-visible`
  - `screen-extract-local-section-components-for-runtime-boundaries`
  - `docs-require-jsdoc-on-key-declarations`
- Prompt
  - "entries 화면 route가 너무 길어. tree/sidebar와 detail/table 영역을 읽기 쉽게 정리해줘. 다만 search param, navigate, query, mutation 흐름은 route entry에서 계속 보여야 하고, 실제 runtime boundary가 있는 경우에만 local section component로 분리해줘."
- Expected pass signals
  - route entry가 `search`, `navigate`, page-level query/mutation, cross-section orchestration을 계속 소유함
  - local section component는 실제 state, interaction, async, provider, widget adapter 같은 runtime boundary를 가질 때만 생김
  - query/mutation 선언에는 `@api`가 붙어 있음
  - 비자명한 handler에는 `@event`가 붙어 있음
- Likely fail signals
  - `HeaderSection`, `ContentSection`, `FooterSection` 같은 layout wrapper만 추출함
  - route entry가 orchestration owner 역할을 잃고 section 조립 껍데기만 남음

### R2. Screen-local Hook Misuse

- Focus
  - `ownership-prefer-plain-ts-for-local-react-helpers`
  - `screen-avoid-premature-abstraction`
  - `screen-extract-utilities-selectively`
- Prompt
  - "submit handler 안의 payload normalization과 request 조립 코드가 길어. 가독성 좋게 정리해줘."
- Expected pass signals
  - pure calculation은 local function 또는 sibling `page.ts` named export로 감
  - 추출된 pure helper에는 `@helper`가 붙어 있음
  - custom hook은 실제 state/effect/context/form/store orchestration이 있을 때만 만들어짐
- Likely fail signals
  - `useEntryPayload`, `useSubmitRequest`, `useMediaUploadPayload` 같은 hook을 순수 로직에 붙임
  - `utils.ts`나 `helpers.ts` generic 파일을 만듦

### R3. Shared Toolbar Boolean Explosion

- Focus
  - `strategy-avoid-boolean-prop-proliferation`
  - `strategy-choose-single-composition-compound-and-variants`
- Prompt
  - "세 화면에서 재사용하는 toolbar에 compact, edit, search, focus 모드를 추가해줘."
- Expected pass signals
  - shared component 하나에 boolean prop을 계속 넣지 않음
  - explicit variant component 또는 compound composition으로 구조를 분리함
- Likely fail signals
  - `isCompact`, `isEditing`, `showSearch`, `showFocus`가 한 component props에 누적됨
  - JSX 분기가 shared component 내부에서 폭증함

### R4. Static Composition vs Render Props

- Focus
  - `strategy-prefer-children-over-render-props`
  - `strategy-choose-single-composition-compound-and-variants`
- Prompt
  - "Panel에 header/footer를 꽂을 수 있게 확장해줘. 다양한 화면에서 재사용할 예정이야."
- Expected pass signals
  - 정적 조립이면 `children`과 compound part를 우선함
  - runtime data injection이 실제로 필요할 때만 render prop을 씀
- Likely fail signals
  - `renderHeader`, `renderFooter`, `renderActions` 같은 render prop을 정적 layout 조립에 씀

### R5. Handler Flow Visibility

- Focus
  - `composition-named-handlers-over-inline`
  - `events-keep-handler-flow-inline`
  - `events-run-user-actions-in-handlers-not-effects`
  - `events-name-and-curry-handlers`
  - `docs-require-jsdoc-on-key-declarations`
- Prompt
  - "delete 버튼의 onClick 안에 분기, mutation, navigate가 섞여 있어. React skill 기준으로 정리해줘."
- Expected pass signals
  - JSX에서 async/branching inline handler를 걷어냄
  - named handler로 올리되, 흐름은 쓸데없이 잘게 helper로 쪼개지 않음
  - handler 이름이 `handle...` 패턴을 따름
  - 분기나 부수효과가 있는 handler에는 `@event`가 붙어 있음
- Likely fail signals
  - JSX 안에 여전히 async callback이 남음
  - `validate()`, `buildRequest()`, `runMutation()`처럼 작은 helper로 과분해함
  - 사용자 액션을 state + effect로 모델링함

### R6. Derived State Synchronization

- Focus
  - `state-calculate-derived-values-during-render`
  - `screen-keep-derived-values-close`
  - `state-use-functional-setstate-updates`
- Prompt
  - "selectedIds에서 파생되는 count, flags, filtered summary가 많아졌어. state sync 코드와 derived value 배치를 정리해줘."
- Expected pass signals
  - render에서 계산 가능한 값은 `useEffect` + `useState` 동기화를 없앰
  - 파생값을 사용 지점 가까이에 둠
  - 이전 state 기반 갱신은 functional updater를 사용함
- Likely fail signals
  - `selectedCount` 같은 값을 effect로 다시 state에 넣음
  - 화면 상단 alias 상수가 불필요하게 늘어남
  - toggle/update 핸들러가 stale closure를 그대로 둠

### R7. Query Shaping and Origin Preservation

- Focus
  - `state-shape-query-data-with-select`
  - `state-preserve-origin-chaining`
  - `state-name-query-and-mutation-bindings-consistently`
  - `docs-require-jsdoc-on-key-declarations`
- Prompt
  - "query response의 `data.list`, `data.items`, `data.meta`를 화면 여러 군데서 직접 쓰고 있어. React skill 기준으로 정리해줘."
- Expected pass signals
  - `query.select`에서 screen-friendly shape로 변환함
  - route/page 스코프에서 `response...`, `mutation...` naming을 유지함
  - query/mutation 선언에는 `@api`가 붙어 있음
  - 넓은 스코프 destructuring과 alias를 줄임
- Likely fail signals
  - render body에서 매번 `data.list.map(...)`를 반복함
  - `const { data } = response...` 같은 광범위 destructuring을 유지함
  - `tableList`, `deleteApi` 같은 naming이 남음

### R8. Silent Fallbacks and Local Loading Branches

- Focus
  - `state-avoid-fallback-defaults-and-loading-flags`
  - `state-preserve-origin-chaining`
  - `screen-keep-derived-values-close`
- Prompt
  - "Suspense query 화면인데 optional chaining과 local loading branch가 많아. 안전하게 정리해줘."
- Expected pass signals
  - `?? []`, `?? ""`, `|| "-"` 같은 습관적 fallback을 줄임
  - 결측은 explicit empty state나 명시적 branch로 드러냄
  - `isPending` / `isFetching`는 보조 UI에만 좁게 사용함
  - fallback을 걷어낸 뒤에도 `response...` origin을 넓은 스코프 alias로 다시 잃지 않음
- Likely fail signals
  - `const rows = response.data?.items ?? []`
  - Suspense screen 본문에서 `if (isPending) return <Spinner />`
  - `const entryTitle = responseEntryGetItemSuspense.data?.title` 같은 상단 alias를 새로 만듦

### R9. Heavy Render Responsiveness

- Focus
  - `state-use-starttransition-for-non-urgent-updates`
  - `state-use-usedeferredvalue-for-heavy-derived-renders`
  - `state-compiler-first-memoization`
- Prompt
  - "검색 입력과 필터 변경 때 대형 리스트가 버벅여. React 19 기준으로 개선해줘."
- Expected pass signals
  - non-urgent visual update에 `startTransition`을 검토함
  - 무거운 derived render에는 `useDeferredValue`를 검토함
  - `useMemo` / `useCallback`은 필요한 경우에만 근거와 함께 사용함
- Likely fail signals
  - 모든 파생값에 방어적으로 `useMemo`를 붙임
  - transition/deferred 없이 urgent state만 남김
  - 반대로 가벼운 계산까지 전부 defer/memo함

### R10. Non-reactive Effect Callbacks

- Focus
  - `state-use-effectevent-for-non-reactive-effect-callbacks`
  - `events-run-user-actions-in-handlers-not-effects`
  - `docs-require-jsdoc-on-key-declarations`
- Prompt
  - "socket subscription 안에서 최신 callback을 읽어야 해서 ref sync hack을 쓰고 있어. React 19 기준으로 다듬어줘."
- Expected pass signals
  - 구독 effect 안의 최신 callback 문제를 `useEffectEvent`로 다룸
  - 사용자 액션 handler와 subscription effect를 혼동하지 않음
  - `useEffectEvent` binding에는 `@event`, subscription effect에는 `@watch`가 붙어 있음
- Likely fail signals
  - `useRef` + sync effect hack을 유지함
  - 클릭/submit handler까지 effect 쪽으로 이동시킴

### R11. Compound Component Documentation

- Focus
  - `docs-document-compound-parts-with-part-and-description`
  - `docs-require-jsdoc-on-key-declarations`
- Prompt
  - "Dialog compound component를 만들었는데 public part 문서화도 React skill 기준으로 맞춰줘."
- Expected pass signals
  - props interface 바로 위에 `@part`, `@description`
  - public part 내부 handler에 `@event`
  - 필요한 boundary declaration에 JSDoc이 붙음
- Likely fail signals
  - props type과 component에 각각 따로 `@summary`만 붙임
  - compound part인데 public boundary 문서화가 없음

### R12. Companion Skill Activation

- Focus
  - React skill activation discipline
  - companion loading expectations
- Prompt
  - "route screen TSX와 related styles, search params, Playwright smoke test까지 같이 고쳐줘."
- Expected pass signals
  - React 외에 `convention-typescript`, `convention-css`, `convention-tanstack-route`, `convention-playwright-test` 필요성을 함께 언급하거나 반영함
  - `@api`, `@event`, `@watch`, `@helper` 같은 annotation role도 companion skill 기준으로 맞춤
  - 파일 surface에 따라 rule 판단이 달라짐
- Likely fail signals
  - React rule만 보고 route/search/style/test 경계를 무시함
  - CSS나 route rule을 React 내부 스타일처럼 처리함

### R13. Single-component Helper Collapse

- Focus
  - `screen-avoid-premature-abstraction`
  - `screen-extract-utilities-selectively`
  - `state-shape-query-data-with-select`
- Prompt
  - "record list screen에 `buildEditHref`, `readOptionalFilter`, `mapResponseToRows` 같은 작은 helper가 많아. React skill 기준으로 과한 모듈화 없이 정리해줘."
- Expected pass signals
  - component 하나만 쓰는 href/filter helper는 사용 지점으로 접음
  - query response shape는 필요하면 `query.select`에서 직접 보이게 변환함
  - handler 안의 mutation/query invalidation flow는 helper로 과분해하지 않음
  - `response...` / `mutation...` naming과 origin chaining은 유지함
- Likely fail signals
  - helper 이름만 바꾸거나 JSDoc만 추가하고 경계를 유지함
  - `_local/helpers.ts`, `utils.ts`, `row-utils.ts`를 새로 만듦
  - query result를 상단 alias로 퍼뜨리거나 `data` destructuring으로 origin을 잃음

### R14. File Placement and Owner Naming

- Focus
  - `ownership-layer-component-boundaries`
  - `ownership-place-route-local-files-by-scope`
  - `ownership-use-consistent-file-and-symbol-naming`
- Prompt
  - "화면 전용 tree renderer, shared button, route-local dialog를 한 번에 정리해줘."
- Expected pass signals
  - `ui`, `widget`, `-local`, sibling `.ts`의 owner 경계를 지킴
  - `widget/` 폴더는 유지하되 widget-owned 파일명은 `wg-*`, symbol은 `Wg*`로 맞춤
  - JSX를 가진 것은 component 쪽에, pure mapping/adapters는 same-level `.ts`에 둠
  - same-level `.ts`로 뺀 pure mapping/adapters에는 `@helper`가 붙어 있음
  - 파일명과 symbol naming이 경계를 드러냄
- Likely fail signals
  - route-local component를 shared `ui` 아래로 올림
  - JSX를 `folders.ts` 같은 pure module에 넣음
  - naming casing과 owner prefix가 섞임

### R15. Pressure Scenario for Rule Conflicts

- Focus
  - cross-rule consistency
- Prompt
  - "entries route를 정리하되, `page.ts` 추출은 최소화하고, pure support code는 entry 밖으로 옮기고, handler와 query/select 흐름도 개선해줘."
- Expected pass signals
  - agent가 `extract 여부 판단`과 `extract 후 목적지`를 분리해서 판단함
  - `page.ts`를 무조건 만들지도, 무조건 inline으로 남기지도 않음
  - route entry orchestration은 유지하면서 pure support code만 선별적으로 이동함
  - query/mutation boundary와 exported helper boundary의 annotation role도 함께 유지함
- Likely fail signals
  - 같은 요청 안에서 서로 충돌하는 rule을 동시에 잘못 적용함
  - `page.ts`를 helper 창고로 만들거나, 반대로 아무것도 못 옮김

## 추천 실행 순서

1. R8, R7, R5
   - state/data flow와 handler 규칙은 가장 자주 깨집니다.
2. R1, R2, R13, R15
   - route entry / `page.ts` / `-local` 경계와 rule 충돌을 점검합니다.
3. R3, R4, R11
   - shared component 설계와 docs 품질을 점검합니다.
4. R9, R10
   - React 19 성능/구독 패턴을 점검합니다.
5. R12, R14
   - companion skill activation과 file placement discipline을 점검합니다.

## 유지보수 원칙

- 새로운 React rule을 추가했다면, 최소 1개의 pressure scenario를 이 문서에 추가합니다.
- 기존 scenario가 반복해서 애매하다고 나오면 prompt를 더 구체적으로 고치고, rule 본문도 함께 보정합니다.
- scenario는 특정 프로젝트 전용 세부사항보다, 여러 React codebase에서 반복되는 판단 문제를 우선 다룹니다.
