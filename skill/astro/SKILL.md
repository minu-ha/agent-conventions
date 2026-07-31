---
name: convention-astro
description: Use when editing Astro page/layout/component files, rendering mode decisions, file-based routes, framework islands, content collections, Astro Actions, or server islands.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Astro 컨벤션

에이전트 협업 팀을 위한 Astro 코딩 컨벤션 모음입니다. 현재 이 가이드는 11개 카테고리의 42개 local 규칙으로 구성되어 있습니다.
Astro entry 구조, route-local owner layer인 `src/pages`, pages-local `_document.astro`/`_head.astro`/`_document.css`, page-owned implementation, route-role aligned page asset naming과 `rt_*` surface ownership, `_local/` route-local UI/runtime boundary, owner-named support file, `.astro` 컴포넌트 경계, framework island 사용법, file-based routing, SSG/SSR/CSR rendering 선택, build-time/live collections, Actions와 endpoints, page/local/island 책임, `ui` primitive/`widget` reusable block taxonomy, selective extraction 기준, Astro 전용 문서화 규칙, Astro 전용 검토 흐름을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [HANDBOOK.md](./HANDBOOK.md)로 관리합니다.
Astro local rule은 기본 companion인 `convention-typescript`와 `convention-css`를 함께 사용하고, React island나 브라우저 테스트는 필요할 때 추가로 로드합니다.

## 사용할 때

- `src/pages`, `src/pages/**/_local`, `src/components`의 `.astro` 파일과 Astro page entry를 만들거나 수정할 때 사용합니다.
- `output`, `prerender`, `getStaticPaths()`, dynamic route, `client:*`, `client:only`, `server:defer`처럼 rendering mode나 delivery mode 판단이 필요한 변경에 사용합니다.
- React/Preact/Vue/Svelte island를 Astro 안에서 연결하거나 hydration directive를 고를 때 사용합니다.
- `src/content.config.ts`, `src/live.config.ts`, `src/actions/index.ts`, API endpoint, content collection query가 중요한 변경에 사용합니다.
- Astro 프로젝트 구조나 page/local/island/support ownership을 house style 기준으로 리뷰할 때 사용합니다.

## 활성화 체크리스트

- 변경 범위가 `.astro` 페이지/레이아웃/컴포넌트, `src/pages` route-local 구조, rendering mode, file-based route, content collection, Actions/endpoints, server islands, framework island인지 먼저 확인합니다.
- convention을 적용만 할 때는 compiled [HANDBOOK.md](./HANDBOOK.md)를 열어 Structure, Naming, Component, Island, Routing, Rendering, Content, Server, Responsibility, Workflow 중 어떤 카테고리가 직접 걸리는지 빠르게 훑습니다.
- 이 skill 자체를 편집하거나 리뷰할 때는 `rules/_sections.md`, `SKILL.md`, `README.md`, `metadata.json`, 관련 `rules/*.md`를 source of truth로 먼저 읽습니다. `HANDBOOK.md`는 build 결과 확인용으로만 사용합니다.
- 실제로 바꾸는 관심사에 맞는 `rules/*.md`를 추가로 읽습니다. `src/pages` route-local 배치와 `_local/` 구조를 조정하면 structure rule, owner-named route asset과 dynamic segment 이름을 바꾸면 naming rule, static/on-demand/server mode 판단이면 rendering rule, page/local/island/support 경계를 조정하면 responsibility rule을 확인합니다.
- Astro 변경은 기본적으로 `convention-typescript`와 `convention-css`를 함께 로드하고, React island나 TSX를 만지면 `convention-react`, hydration/form/server 흐름을 브라우저 테스트로 검증하면 `convention-playwright-test`도 함께 로드합니다.
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
10. Documentation and Comments
    영향도: MEDIUM
    Prefix: `docs-`
11. Workflow and Review Checks
    영향도: MEDIUM
    Prefix: `workflow-`

## 빠른 참조

### 1. Project Structure and File Ownership (CRITICAL)

- `structure-keep-src-pages-as-route-local-owner-layer` - `src/pages`는 route entry와 route-local 구현을 함께 소유
- `structure-place-page-adjacent-document-shells-under-src-pages-with-underscore-prefix` - `_document`, `_head`, `_document.css`는 `src/pages/_*` 아래에 둠
- `structure-place-route-implementations-under-src-pages` - 실제 route 구현은 routed page와 `_local/` 아래에 둠

### 2. File Naming and Page Assets (HIGH)

- `naming-use-underscore-prefixed-page-shell-names-for-document-head-and-chrome` - pages-local helper는 `_document`, `_head`, `_document.css` 같은 이름 사용
- `naming-align-route-page-assets-and-rt-surface-classes-with-route-role` - route page asset과 `rt_*` surface class를 route role 기준으로 정렬
- `naming-use-owner-named-route-support-files-instead-of-generic-local-files` - route-local support file은 generic `_local.ts` 대신 owner-named로 유지
- `naming-use-domain-specific-dynamic-segment-names` - `[param]`과 `[...param]` 이름은 도메인 의미를 드러내기

### 3. Astro Components and Layout Composition (HIGH)

- `component-compose-page-level-documents-through-_document-and-page-adjacent-shells` - page-level document는 `_document`가 `_head`와 `_document.css`를 조립
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
- `routing-prefer-flat-files-for-leaf-dynamic-routes` - 하위 route가 없는 dynamic leaf는 folder보다 flat `[slug].astro` 우선
- `routing-prefer-sibling-index-and-page-files-for-paginated-route-families` - pagination route는 `page/` 하위보다 sibling `[page].astro`를 우선
- `routing-preserve-established-public-url-contracts-when-normalizing-route-folders` - 폴더 정리를 위해 기존 공개 URL을 함부로 바꾸지 않음

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
- `server-keep-redirects-rewrites-and-auth-ownership-at-page-or-middleware-boundary` - redirect, rewrite, auth owner는 layout이 아니라 page나 middleware에 둠
- `server-keep-server-islands-serializable-and-slot-fallbacks` - `server:defer`는 serializable props와 fallback slot 기준으로 사용

### 9. Page, Layout, and Island Responsibilities (HIGH)

- `responsibility-limit-layouts-to-shell-and-composition` - layout은 document/route shell, slot, shared wrapper에 집중
- `responsibility-place-route-shells-under-owning-route-local-folder` - route shell은 shared tier로 올리지 않고 owning route의 `_local/` 아래에 둠
- `responsibility-compose-layouts-from-widget-and-ui-only` - layout 내부 조립은 `widget`과 `ui`로 제한
- `responsibility-keep-page-files-focused-on-route-contract-and-data-handoff` - page는 route contract, data handoff, 화면 흐름을 소유
- `responsibility-keep-page-adjacent-shells-imported-only-by-pages` - `_document`, `_head`, `_document.css`는 pages만 소유
- `responsibility-keep-route-page-files-focused-on-screen-flow` - route page는 `rt_*` surface owner이자 screen flow owner로 남음
- `responsibility-extract-route-local-sections-only-for-rendering-or-interaction-boundaries` - `_local/` section은 진짜 rendering/interaction boundary가 있을 때만 추출
- `responsibility-extract-route-support-code-only-when-the-boundary-is-real` - `_entry-admin.ts` 같은 support module은 진짜 data boundary가 있을 때만 사용
- `responsibility-place-route-local-ui-under-local` - route-local UI와 CSS는 `_local/` 아래에 둠

### 10. Documentation and Comments (MEDIUM)

- `docs-require-jsdoc-on-key-frontmatter-and-route-support-declarations` - frontmatter와 route-local support module의 핵심 선언에는 JSDoc 요구
- `docs-limit-inline-comments-to-rendering-ownership-and-integration-caveats` - inline comment는 rendering, ownership, integration caveat에만 제한

### 11. Workflow and Review Checks (MEDIUM)

- `workflow-add-new-pages-in-layout-and-rendering-first-order` - 새 page는 layout, rendering mode, island boundary부터 정리
- `workflow-consult-official-docs-for-version-sensitive-astro-features` - 버전 민감한 Astro 기능은 공식 문서 기준으로 확인
- `workflow-review-adapter-output-and-hydration-before-finishing` - 마무리 전 adapter, output mode, prerender, hydration 경계를 같이 점검

## 함께 쓰기

- 이 skill은 `convention-typescript`와 `convention-css`를 함께 로드하는 것을 기본으로 합니다.
- `convention-typescript`는 frontmatter TypeScript, route-local support module, JSDoc 태그 표준을 보완합니다.
- `convention-css`는 `.astro` template의 `class`/`class:list`, `rt_*` route surface ownership, `rt_document__*`, `wg_*`, `ui_*`, 드문 `pv_*` helper ownership, route-local stylesheet, wrapper 스타일링을 보완합니다.
- React island, TSX component, client framework support code가 바뀌면 `convention-react`를 추가로 함께 사용합니다.
- hydration, form action, server island fallback, navigation 회귀를 브라우저에서 검증하면 `convention-playwright-test`를 함께 사용합니다.

## 마무리 전 셀프 리뷰

- 이번 변경이 Naming, Rendering, Responsibility, Docs까지 포함한 어느 카테고리에 걸리는지 다시 대조하고 관련 rule을 빠뜨리지 않았는지 확인합니다.
- React island, CSS, TypeScript config/action schema, JSDoc/comment, Playwright 검증까지 번졌는데 companion skill을 빼먹지 않았는지 점검합니다.
- static, on-demand, `output: "server"`, `client:only` 중 현재 선택이 과한지 다시 확인합니다.
- `src/pages` route-local owner layer, `src/pages/_document.astro`/`_head.astro`/`_document.css`, route role에 맞는 page-adjacent asset naming, `rt_*` surface ownership, `rt_document__*`/`wg_*`/`ui_*`/드문 `pv_*` ownership, `_local/` route shell/runtime/component CSS, `ui`/`widget` taxonomy, route page orchestration, owner-named support module extraction 기준, build-time/live collection 구분, page/island ownership, endpoint와 Actions의 역할 분리, 핵심 frontmatter 선언의 JSDoc/comment가 마지막 diff에도 그대로 보이는지 확인합니다.

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

모든 규칙이 펼쳐진 전체 가이드는 [HANDBOOK.md](./HANDBOOK.md)에서 확인할 수 있습니다.
