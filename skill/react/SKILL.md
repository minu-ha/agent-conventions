---
name: convention-react
description: React 또는 TSX 파일을 수정할 때, 컴포넌트 소유 경계, route-local 분리, handler 흐름, state 오리진, 문서화 규칙을 함께 적용해야 하면 사용합니다.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# React 컨벤션

에이전트 협업 팀을 위한 React 코딩 컨벤션 모음입니다. 현재 이 가이드는 7개 카테고리의 29개 local 규칙으로 구성되어 있습니다.  
공용 컴포넌트 소유 경계, route-local 분리, React 계약에 맞는 handler/prop 시그니처, 화면 흐름, state 오리진, React 경계 문서화 규칙을 `rules/*.md`와 compiled `AGENTS.md`로 관리합니다.  
compiled guide에는 `convention-typescript` base rule이 함께 포함됩니다.

## 사용할 때

- React 컴포넌트, 화면 파일, TSX 렌더링 흐름, React 인접 `*.ts` 파일을 수정할 때 사용합니다.
- 컴포넌트 소유 경계, handler 구조, 파생값 위치, React Query/Zustand 데이터 흐름이 중요한 변경에 사용합니다.
- React 코드를 house style 기준으로 리뷰할 때 사용합니다.

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리                        | 영향도         | Prefix         |
|------|-----------------------------|-------------|----------------|
| 1    | Ownership and Boundaries    | CRITICAL    | `ownership-`   |
| 2    | Typing and Contracts        | HIGH        | `typing-`      |
| 3    | Component Structure and JSX | HIGH        | `composition-` |
| 4    | Screen File Discipline      | HIGH        | `screen-`      |
| 5    | Events and Interaction Flow | MEDIUM-HIGH | `events-`      |
| 6    | State and Data Flow         | CRITICAL    | `state-`       |
| 7    | Documentation and Comments  | MEDIUM      | `docs-`        |

## 빠른 참조

### 1. Ownership and Boundaries (CRITICAL)

- `ownership-use-consistent-file-and-symbol-naming` - 파일, 심볼, 상수 네이밍을 예측 가능하게 유지
- `ownership-avoid-barrel-and-react-namespace-imports` - barrel export와 `React.*` namespace 타입 사용 금지
- `ownership-layer-component-boundaries` - `ui`, `widget`, `-local` 소유 경계 분리
- `ownership-place-route-local-files-by-scope` - route-local 컴포넌트와 helper를 scope 기준으로 배치
- `ownership-prefer-plain-ts-for-local-react-helpers` - 불필요한 custom hook보다 일반 helper 선호
- `ownership-shared-config-entry-points` - 공용 상수는 config entry point를 통해 노출

### 2. Typing and Contracts (HIGH)

- `typing-function-type-first` - 매개변수 타입보다 함수 변수 타입 선언 우선
- `typing-reuse-existing-contracts` - 새 타입을 만들기 전에 prop/API 계약 재사용

### 3. Component Structure and JSX (HIGH)

- `composition-prefer-arrow-functions-and-object-params` - 복잡한 시그니처는 화살표 함수와 객체 매개변수 사용
- `composition-destructure-props-inside` - `props` 전체를 받고 본문 안에서 구조분해
- `composition-use-activity-for-render-branches` - 렌더 분기는 `Activity`로 표현
- `composition-named-handlers-over-inline` - 분기와 비동기 로직을 JSX 바깥으로 드러냄

### 4. Screen File Discipline (HIGH)

- `screen-keep-route-flow-visible` - route entry 파일은 화면 흐름 중심으로 유지
- `screen-avoid-premature-abstraction` - 실제 재사용 근거가 생길 때까지 추출 보류
- `screen-extract-utilities-selectively` - 경계가 정당할 때만 helper 추출
- `screen-keep-derived-values-close` - 파생값과 alias를 사용 위치 가까이에 유지
- `screen-move-pure-support-code-out-of-entry-files` - route 지원 타입, preset, 순수 helper는 entry 파일 밖으로 이동

### 5. Events and Interaction Flow (MEDIUM-HIGH)

- `events-name-and-curry-handlers` - handler 이름을 예측 가능하게 짓고 추가 인자는 curry로 전달
- `events-keep-handler-flow-inline` - 실제 utility 경계가 생길 때까지 화면 전용 흐름은 inline으로 유지

### 6. State and Data Flow (CRITICAL)

- `state-choose-state-tools-by-source-of-truth` - 소유권과 수명에 맞는 state 도구 선택
- `state-name-query-and-mutation-bindings-consistently` - response/mutation 바인딩 이름을 예측 가능하게 유지
- `state-store-derived-authority` - 공용 권한 판별 결과는 한 번만 저장
- `state-shape-query-data-with-select` - 서버 응답은 `query.select`에서 변환
- `state-preserve-origin-chaining` - 넓은 스코프에서 response/store 오리진 유지
- `state-compiler-first-memoization` - 방어적 memoization보다 compiler 기본값 우선
- `state-avoid-fallback-defaults-and-loading-flags` - 조용한 fallback과 ad-hoc loading 분기 지양

### 7. Documentation and Comments (MEDIUM)

- `docs-require-jsdoc-on-key-declarations` - API, handler, effect, custom type에 JSDoc 요구
- `docs-summary-vs-description` - API 호출은 `@description`, 나머지는 `@summary` 사용
- `docs-limit-inline-comments-to-non-obvious-logic` - inline comment는 제약과 caveat 설명에만 사용

## 함께 쓰기

- 이 skill의 compiled guide는 `convention-typescript` base rule을 함께 포함합니다.
  SKILL.md만 읽는 환경이라면 필요 시 `convention-typescript`도 함께 로드합니다.
- 스타일, `className`, CSS import가 바뀌면 `convention-css`를 함께 사용합니다.
- route 파일이나 router API가 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- Playwright 테스트 범위가 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

```text
rules/state-shape-query-data-with-select.md
rules/docs-require-jsdoc-on-key-declarations.md
```

각 rule 파일에는 아래 내용이 들어 있습니다.

- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 예시
- 설명이 붙은 Correct 코드 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 `./AGENTS.md`에서 확인할 수 있습니다.
