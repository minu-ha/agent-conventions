---
name: convention-react
description: Use when editing React or TSX components, screen files, local UI boundaries, handler flow, state/data flow, or React-adjacent TypeScript that shapes rendered behavior.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# React 컨벤션

에이전트 협업 팀을 위한 React 코딩 컨벤션 모음입니다. 현재 이 가이드는 8개 카테고리의 42개 local 규칙으로 구성되어 있습니다.  
공용 컴포넌트 소유 경계, single component·compound component·explicit variant 사이의 선택, React 계약에 맞는 handler/prop 시그니처, 화면 흐름, state 오리진, transition 패턴, React 경계 문서화 규칙을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [AGENTS.md](./AGENTS.md)로 관리합니다.  
이 skill은 TanStack Query, Zustand, React 19 ref prop/Activity/useEffectEvent/transition 패턴을 쓰는 React codebase를 기본 전제로 합니다. 기본 compiled guide는 local React rule만 담고 `convention-typescript`를 companion skill로 함께 사용합니다.

## 사용할 때

- React 컴포넌트, 화면 파일, TSX 렌더링 흐름, React 인접 `*.ts` 파일을 수정할 때 사용합니다.
- 컴포넌트 소유 경계, handler 구조, 파생값 위치, React Query/Zustand 데이터 흐름이 중요한 변경에 사용합니다.
- React 코드를 house style 기준으로 리뷰할 때 사용합니다.

## 활성화 체크리스트
- 변경 범위가 React 컴포넌트, screen entry, `-local` UI, TSX 렌더링 흐름, React 인접 support code인지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [AGENTS.md](./AGENTS.md)를 열어 Ownership, Typing, Strategy, Composition, Screen, Events, State, Docs 중 어떤 카테고리가 직접 관련되는지 빠르게 훑습니다.
- 실제로 바꾸는 관심사에 맞는 `rules/*.md`를 추가로 읽습니다. 컴포넌트 경계를 바꾸면 ownership/strategy, handler 흐름을 바꾸면 events, 데이터 흐름을 바꾸면 state, 주석/JSDoc을 바꾸면 docs rule을 확인합니다.
- React 변경은 기본적으로 `convention-typescript`를 함께 로드하고, `className`/style import가 바뀌면 `convention-css`, route entry나 navigation/search가 바뀌면 `convention-tanstack-route`, 브라우저 테스트까지 바뀌면 `convention-playwright-test`도 같이 로드합니다.

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리                        | 영향도         | Prefix         |
|------|-----------------------------|-------------|----------------|
| 1    | Ownership and Boundaries    | CRITICAL    | `ownership-`   |
| 2    | Typing and Contracts        | HIGH        | `typing-`      |
| 3    | Composition Strategy       | HIGH        | `strategy-`    |
| 4    | Component Structure and JSX | HIGH       | `composition-` |
| 5    | Screen File Discipline      | HIGH       | `screen-`      |
| 6    | Events and Interaction Flow | MEDIUM-HIGH | `events-`     |
| 7    | State and Data Flow         | CRITICAL   | `state-`       |
| 8    | Documentation and Comments  | MEDIUM     | `docs-`        |

## 빠른 참조

### 1. Ownership and Boundaries (CRITICAL)

- `ownership-use-consistent-file-and-symbol-naming` - 파일, 심볼, 상수 네이밍을 예측 가능하게 유지
- `ownership-avoid-barrel-and-react-namespace-imports` - barrel export와 `React.*` namespace 타입 사용 금지
- `ownership-layer-component-boundaries` - `ui`, `widget`, `-local` 소유 경계 분리
- `ownership-place-route-local-files-by-scope` - route-local 컴포넌트와 helper를 scope 기준으로 배치
- `ownership-prefer-plain-ts-for-local-react-helpers` - screen-local custom hook 대신 sibling `.ts` support code를 우선
- `ownership-shared-config-entry-points` - 공용 상수는 `shared/config.ts`를 통해 노출

### 2. Typing and Contracts (HIGH)

- `typing-function-type-first` - 매개변수 타입보다 함수 변수 타입 선언 우선
- `typing-reuse-existing-contracts` - 새 타입을 만들기 전에 prop과 callback 계약 재사용

### 3. Composition Strategy (HIGH)

- `strategy-choose-single-composition-compound-and-variants` - single component, compound component, explicit variant를 의도적으로 선택
- `strategy-avoid-boolean-prop-proliferation` - shared component에 boolean prop 조합을 늘리지 않음
- `strategy-prefer-children-over-render-props` - stateless compound component는 render prop보다 children과 slot part를 우선

### 4. Component Structure and JSX (HIGH)

- `composition-do-not-define-components-inside-components` - component 안에서 component를 새로 정의하지 않음
- `composition-prefer-arrow-functions-and-object-params` - 복잡한 시그니처는 화살표 함수와 객체 매개변수 사용
- `composition-destructure-props-inside` - `props` 전체를 받고 본문 안에서 구조분해
- `composition-use-ref-prop-instead-of-forwardref-in-react-19` - React 19에서는 새 `forwardRef`보다 `ref` prop을 우선
- `composition-use-activity-for-render-branches` - visibility primitive는 show/hide 의도일 때만 사용
- `composition-named-handlers-over-inline` - 분기와 비동기 로직을 JSX 바깥으로 드러냄

### 5. Screen File Discipline (HIGH)

- `screen-keep-route-flow-visible` - route entry 파일은 화면 흐름 중심으로 유지
- `screen-avoid-premature-abstraction` - 실제 재사용 근거가 생길 때까지 추출 보류
- `screen-extract-local-section-components-for-runtime-boundaries` - async/state/provider/interaction 같은 runtime boundary가 있을 때만 route-local section component 추출
- `screen-extract-utilities-selectively` - 경계가 정당할 때만 screen support code 추출
- `screen-keep-derived-values-close` - 파생값과 alias를 사용 위치 가까이에 유지
- `screen-move-pure-support-code-out-of-entry-files` - route 지원 코드의 기본 추출 대상은 sibling `page.ts`

### 6. Events and Interaction Flow (MEDIUM-HIGH)

- `events-name-and-curry-handlers` - handler 이름을 예측 가능하게 짓고 추가 인자는 curry로 전달
- `events-keep-handler-flow-inline` - 실제 utility 경계가 생길 때까지 named handler 본문에 화면 전용 흐름 유지
- `events-run-user-actions-in-handlers-not-effects` - one-shot 사용자 액션은 effect가 아니라 handler에서 실행

### 7. State and Data Flow (CRITICAL)

- `state-calculate-derived-values-during-render` - 파생값은 effect/state 동기화 대신 render 중에 계산
- `state-choose-state-tools-by-source-of-truth` - 소유권과 수명에 맞는 state 도구 선택
- `state-name-query-and-mutation-bindings-consistently` - response/mutation 바인딩 이름을 예측 가능하게 유지
- `state-store-derived-authority` - 공용 권한 판별 결과는 한 번만 저장
- `state-shape-query-data-with-select` - 서버 응답은 `query.select`에서 변환
- `state-preserve-origin-chaining` - 넓은 스코프에서 response/store 오리진 유지
- `state-compiler-first-memoization` - 방어적 memoization보다 compiler 기본값 우선
- `state-use-lazy-state-initializers-for-expensive-defaults` - 무거운 초기값 계산은 lazy initializer 사용
- `state-use-effectevent-for-non-reactive-effect-callbacks` - 구독 effect 안의 최신 callback은 `useEffectEvent` 사용
- `state-use-functional-setstate-updates` - 이전 state 기반 갱신은 functional updater 사용
- `state-use-starttransition-for-non-urgent-updates` - 무거운 비긴급 시각 업데이트는 transition으로 내림
- `state-use-usedeferredvalue-for-heavy-derived-renders` - 무거운 파생 렌더는 deferred value로 분리
- `state-avoid-fallback-defaults-and-loading-flags` - 조용한 fallback과 ad-hoc loading 분기 지양

### 8. Documentation and Comments (MEDIUM)

- `docs-document-compound-parts-with-part-and-description` - compound component의 public part는 `@part`와 `@description`으로 한 경계처럼 문서화
- `docs-require-jsdoc-on-key-declarations` - 비자명한 api/event/watch/helper/summary 선언에 JSDoc 요구
- `docs-limit-inline-comments-to-non-obvious-logic` - inline comment는 제약과 caveat 설명에만 사용

## 함께 쓰기

- 이 skill은 `convention-typescript`와 함께 로드하는 것을 기본으로 합니다.
- slim [AGENTS.md](./AGENTS.md)는 local React rule만 담고, 공통 TypeScript 규칙은 `convention-typescript`를 함께 로드해 보완합니다.
- 스타일, `className`, CSS import가 바뀌면 `convention-css`를 함께 사용합니다.
- route 파일이나 router API가 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- Playwright 테스트 범위가 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## 권장 협업 방식

- 이 skill은 React 코드의 local rule과 리뷰 기준을 정의합니다. 서브에이전트 사용 자체를 직접 강제하지는 않습니다.
- 변경이 여러 독립 concern으로 나뉘거나 구현 후 review loop가 중요한 작업이면 context를 분리한 서브에이전트 협업을 우선 검토합니다.
- 병렬 작업은 write scope가 겹치지 않을 때만 허용하고, 최종 통합과 검증은 메인 에이전트가 담당합니다.
- 실제로 언제 서브에이전트 사용이 필수인지, 어떤 orchestration skill을 함께 쓸지는 consuming project의 `AGENTS.md`를 우선합니다.

## 마무리 전 셀프 리뷰
- 변경이 Ownership, Strategy, Screen, Events, State 중 어디에 걸리는지 다시 대조하고, 관련 rule을 빠뜨리지 않았는지 확인합니다.
- React 변경인데 `convention-typescript`를 함께 보지 않았거나, style/router/test 영향이 있는데 해당 companion skill을 빼먹지 않았는지 점검합니다.
- screen entry 파일이 과도하게 support code를 품고 있지 않은지, handler와 파생값과 state 오리진이 React 규칙에 맞게 남아 있는지 마지막으로 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/state-shape-query-data-with-select.md](./rules/state-shape-query-data-with-select.md)
- [rules/docs-require-jsdoc-on-key-declarations.md](./rules/docs-require-jsdoc-on-key-declarations.md)

각 rule 파일에는 아래 내용이 들어 있습니다.

- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 예시
- 설명이 붙은 Correct 코드 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [AGENTS.md](./AGENTS.md)에서 확인할 수 있습니다.
