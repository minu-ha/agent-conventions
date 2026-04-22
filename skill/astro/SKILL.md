---
name: convention-astro
description: Use when editing Astro page/layout/component files, rendering mode decisions, file-based routes, framework islands, content collections, Astro Actions, or server islands.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Astro 컨벤션

에이전트 협업 팀을 위한 Astro 코딩 컨벤션 모음입니다. 현재 이 가이드는 10개 카테고리의 25개 local 규칙으로 구성되어 있습니다.  
Astro entry 구조, page asset naming, `.astro` 컴포넌트 경계, framework island 사용법, file-based routing, SSG/SSR/CSR rendering 선택, build-time/live collections, Actions와 endpoints, layout/page/island 책임, Astro 전용 검토 흐름을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [AGENTS.md](./AGENTS.md)로 관리합니다.  
기본 compiled guide는 local Astro 규칙만 담고, 공통 TypeScript 규칙은 `convention-typescript` companion skill로 함께 사용합니다.

## 사용할 때

- `src/pages`, `src/layouts`, `src/components`의 `.astro` 파일과 Astro page entry를 만들거나 수정할 때 사용합니다.
- `output`, `prerender`, `getStaticPaths()`, dynamic route, `client:*`, `client:only`, `server:defer`처럼 rendering mode나 delivery mode 판단이 필요한 변경에 사용합니다.
- React/Preact/Vue/Svelte island를 Astro 안에서 연결하거나 hydration directive를 고를 때 사용합니다.
- `src/content.config.ts`, `src/live.config.ts`, `src/actions/index.ts`, API endpoint, content collection query가 중요한 변경에 사용합니다.
- Astro 프로젝트 구조나 page/layout/island ownership을 house style 기준으로 리뷰할 때 사용합니다.

## 활성화 체크리스트

- 변경 범위가 `.astro` 페이지/레이아웃/컴포넌트, rendering mode, file-based route, content collection, Actions/endpoints, server islands, framework island인지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [AGENTS.md](./AGENTS.md)를 열어 Structure, Naming, Component, Island, Routing, Rendering, Content, Server, Responsibility, Workflow 중 어떤 카테고리가 직접 걸리는지 빠르게 훑습니다.
- 실제로 바꾸는 관심사에 맞는 `rules/*.md`를 추가로 읽습니다. page asset과 dynamic segment 이름을 바꾸면 naming rule, static/on-demand/server mode 판단이면 rendering rule, layout/page/island 경계를 조정하면 responsibility rule을 확인합니다.
- Astro 변경은 기본적으로 `convention-typescript`를 함께 로드하고, React island나 TSX를 만지면 `convention-react`, 스타일과 `class`/`class:list` 조합을 바꾸면 `convention-css`, hydration/form/server 흐름을 브라우저 테스트로 검증하면 `convention-playwright-test`도 함께 로드합니다.
- `client:*`, `client:only`, `server:defer`, Actions, endpoints, content collections처럼 버전 민감한 Astro API를 건드리면 가능하면 `astro-docs` MCP 같은 공식 문서 경로를 먼저 확인합니다.

## 우선순위별 규칙 카테고리

1. Project Structure and File Ownership
   영향도: CRITICAL
   Prefix: `structure-`
2. File Naming and Page Assets
   영향도: HIGH
   Prefix: `naming-`
3. Astro Components and Layout Composition
   영향도: HIGH
   Prefix: `component-`
4. Islands and Framework Boundaries
   영향도: CRITICAL
   Prefix: `island-`
5. Routing and Navigation Contracts
   영향도: HIGH
   Prefix: `routing-`
6. Rendering Strategy and Delivery Modes
   영향도: CRITICAL
   Prefix: `rendering-`
7. Content Collections and Data Loading
   영향도: HIGH
   Prefix: `content-`
8. Server Features and Mutation Boundaries
   영향도: HIGH
   Prefix: `server-`
9. Page, Layout, and Island Responsibilities
   영향도: HIGH
   Prefix: `responsibility-`
10. Workflow and Review Checks
    영향도: MEDIUM
    Prefix: `workflow-`

## 빠른 참조

### 1. Project Structure and File Ownership (CRITICAL)

- `structure-prefer-src-pages-for-page-entrypoints` - URL을 만드는 page entry는 `src/pages`에서 소유
- `structure-keep-pages-layouts-components-and-content-in-native-directories` - pages/layouts/components/content를 고유 디렉터리에 분리

### 2. File Naming and Page Assets (HIGH)

- `naming-grow-complex-pages-into-a-predictable-asset-set` - 복잡한 page는 owner-named asset set으로 자라나게 유지
- `naming-use-domain-specific-dynamic-segment-names` - `[param]`과 `[...param]` 이름은 도메인 의미를 드러내기

### 3. Astro Components and Layout Composition (HIGH)

- `component-prefer-astro-for-static-shells-and-layouts` - 정적 shell과 layout은 React보다 `.astro`를 우선
- `component-keep-frontmatter-server-only-and-template-focused` - frontmatter는 server-only 준비 코드에 집중하고 browser 동작은 template `<script>`나 island로 넘김

### 4. Islands and Framework Boundaries (CRITICAL)

- `island-hydrate-only-true-interactive-widgets` - 인터랙션이 필요한 widget만 hydrate
- `island-do-not-import-astro-inside-framework-components` - framework component 안에서 `.astro`를 직접 import하지 않음
- `island-choose-client-directives-by-visibility-and-urgency` - `client:*` directive는 urgency와 visibility 기준으로 선택
- `island-reserve-client-only-for-ssr-incompatible-components` - `client:only`는 SSR 불가 컴포넌트에만 제한

### 5. Routing and Navigation Contracts (HIGH)

- `routing-use-html-anchors-before-framework-link-abstractions` - Astro page navigation은 기본적으로 plain `<a>` 사용
- `routing-keep-dynamic-route-generation-at-page-boundary` - `getStaticPaths()`와 동적 route 생성 책임은 page boundary에 유지

### 6. Rendering Strategy and Delivery Modes (CRITICAL)

- `rendering-default-to-static-until-most-pages-need-on-demand` - 기본값은 static으로 두고 일부 route만 on-demand로 opt out
- `rendering-use-prerender-false-for-request-bound-or-personalized-routes` - 요청 헤더, 쿠키, 개인화에 묶인 경로는 `prerender = false`
- `rendering-reserve-output-server-for-mostly-dynamic-apps` - `output: "server"`는 대부분의 page가 request-time일 때만 사용

### 7. Content Collections and Data Loading (HIGH)

- `content-define-collections-in-src-content-config` - build-time collection 정의는 `src/content.config.ts`에 모음
- `content-distinguish-build-time-and-live-collections` - build-time과 live collection의 config/query/runtime을 구분
- `content-give-collections-explicit-zod-schemas` - structured content는 명시적인 schema로 타입과 shape를 고정

### 8. Server Features and Mutation Boundaries (HIGH)

- `server-choose-actions-vs-endpoints-by-caller-and-response-needs` - UI mutation, public API, webhook를 caller와 response needs 기준으로 선택
- `server-keep-server-islands-serializable-and-slot-fallbacks` - `server:defer`는 serializable props와 fallback slot 기준으로 사용

### 9. Page, Layout, and Island Responsibilities (HIGH)

- `responsibility-limit-layouts-to-shell-and-composition` - layout은 shell, slot, shared wrapper에 집중
- `responsibility-keep-page-files-focused-on-route-contract-and-data-handoff` - page는 route contract와 data handoff를 소유하고 렌더링 상세는 component로 분리

### 10. Workflow and Review Checks (MEDIUM)

- `workflow-add-new-pages-in-layout-and-rendering-first-order` - 새 page는 layout, rendering mode, island boundary부터 정리
- `workflow-consult-official-docs-for-version-sensitive-astro-features` - 버전 민감한 Astro 기능은 공식 문서 기준으로 확인
- `workflow-review-adapter-output-and-hydration-before-finishing` - 마무리 전 adapter, output mode, prerender, hydration 경계를 같이 점검

## 함께 쓰기

- 이 skill은 `convention-typescript`와 함께 로드하는 것을 기본으로 합니다.
- slim [AGENTS.md](./AGENTS.md)는 local Astro 규칙만 담고, support module과 config/action schema의 공통 TypeScript 규칙은 `convention-typescript`를 함께 로드해 보완합니다.
- React island, TSX component, client framework support code가 바뀌면 `convention-react`를 함께 사용합니다.
- Astro component의 class 조합, stylesheet import, plain CSS 구조가 바뀌면 `convention-css`를 함께 사용합니다.
- hydration, form action, server island fallback, navigation 회귀를 브라우저에서 검증하면 `convention-playwright-test`를 함께 사용합니다.

## 마무리 전 셀프 리뷰

- 이번 변경이 Naming, Rendering, Responsibility까지 포함한 어느 카테고리에 걸리는지 다시 대조하고 관련 rule을 빠뜨리지 않았는지 확인합니다.
- React island, CSS, TypeScript config/action schema, Playwright 검증까지 번졌는데 companion skill을 빼먹지 않았는지 점검합니다.
- static, on-demand, `output: "server"`, `client:only` 중 현재 선택이 과한지 다시 확인합니다.
- build-time/live collection 구분, layout/page/island ownership, endpoint와 Actions의 역할 분리가 마지막 diff에도 그대로 보이는지 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/rendering-default-to-static-until-most-pages-need-on-demand.md](./rules/rendering-default-to-static-until-most-pages-need-on-demand.md)
- [rules/server-choose-actions-vs-endpoints-by-caller-and-response-needs.md](./rules/server-choose-actions-vs-endpoints-by-caller-and-response-needs.md)

각 rule 파일에는 아래 내용이 들어 있습니다.

- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 또는 폴더 예시
- 설명이 붙은 Correct 코드 또는 폴더 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [AGENTS.md](./AGENTS.md)에서 확인할 수 있습니다.
