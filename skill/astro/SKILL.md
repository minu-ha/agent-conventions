---
name: convention-astro
description: Use when editing Astro page/layout/component files, file-based routes, framework islands, content collections, Astro Actions, or server islands.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Astro 컨벤션

에이전트 협업 팀을 위한 Astro 코딩 컨벤션 모음입니다. 현재 이 가이드는 7개 카테고리의 15개 local 규칙으로 구성되어 있습니다.  
Astro entry 구조, `.astro` 컴포넌트 경계, React 같은 framework island 사용법, file-based routing, content collections, Actions/server islands, Astro 전용 검토 흐름을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [AGENTS.md](./AGENTS.md)로 관리합니다.  
기본 compiled guide는 local Astro 규칙만 담고, 공통 TypeScript 규칙은 `convention-typescript` companion skill로 함께 사용합니다.

## 사용할 때

- `src/pages`, `src/layouts`, `src/components`의 `.astro` 파일을 만들거나 수정할 때 사용합니다.
- React/Preact/Vue/Svelte island를 Astro 안에서 연결하거나 hydration directive를 고를 때 사용합니다.
- `src/content.config.ts`, `src/actions/index.ts`, `server:defer`, file-based routing, `getStaticPaths()`가 중요한 변경에 사용합니다.
- Astro 프로젝트 구조나 데이터 흐름을 house style 기준으로 리뷰할 때 사용합니다.

## 활성화 체크리스트

- 변경 범위가 `.astro` 페이지/레이아웃/컴포넌트, file-based route, content collections, Actions, server islands, framework island인지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [AGENTS.md](./AGENTS.md)를 열어 Structure, Component, Island, Routing, Content, Server, Workflow 중 어떤 카테고리가 직접 걸리는지 빠르게 훑습니다.
- 실제로 바꾸는 관심사에 맞는 `rules/*.md`를 추가로 읽습니다. 정적 shell과 layout을 바꾸면 component rule, hydration과 framework 섞기를 바꾸면 island rule, collections나 actions를 바꾸면 content/server rule을 확인합니다.
- Astro 변경은 기본적으로 `convention-typescript`를 함께 로드하고, React island나 TSX를 만지면 `convention-react`, 스타일과 `class`/`class:list` 조합을 바꾸면 `convention-css`, hydration/form/server 흐름을 브라우저 테스트로 검증하면 `convention-playwright-test`도 함께 로드합니다.
- `client:*`, `server:defer`, Actions, content collections처럼 버전 민감한 Astro API를 건드리면 가능하면 `astro-docs` MCP 같은 공식 문서 경로를 먼저 확인합니다.

## 우선순위별 규칙 카테고리

1. Project Structure and File Ownership
   영향도: CRITICAL
   Prefix: `structure-`
2. Astro Components and Layout Composition
   영향도: HIGH
   Prefix: `component-`
3. Islands and Framework Boundaries
   영향도: CRITICAL
   Prefix: `island-`
4. Routing and Navigation Contracts
   영향도: HIGH
   Prefix: `routing-`
5. Content Collections and Data Loading
   영향도: HIGH
   Prefix: `content-`
6. Server Features and Rendering Boundaries
   영향도: HIGH
   Prefix: `server-`
7. Workflow and Review Checks
   영향도: MEDIUM
   Prefix: `workflow-`

## 빠른 참조

### 1. Project Structure and File Ownership (CRITICAL)

- `structure-prefer-src-pages-for-page-entrypoints` - URL을 만드는 page entry는 `src/pages`에서 소유
- `structure-keep-pages-layouts-components-and-content-in-native-directories` - pages/layouts/components/content를 고유 디렉터리에 분리

### 2. Astro Components and Layout Composition (HIGH)

- `component-prefer-astro-for-static-shells-and-layouts` - 정적 shell과 layout은 React보다 `.astro`를 우선
- `component-keep-frontmatter-server-only-and-template-focused` - frontmatter는 server-only 준비 코드에 집중하고 browser 동작은 template `<script>`나 island로 넘김

### 3. Islands and Framework Boundaries (CRITICAL)

- `island-hydrate-only-true-interactive-widgets` - 인터랙션이 필요한 widget만 hydrate
- `island-do-not-import-astro-inside-framework-components` - framework component 안에서 `.astro`를 직접 import하지 않음
- `island-choose-client-directives-by-visibility-and-urgency` - `client:*` directive는 urgency와 visibility 기준으로 선택

### 4. Routing and Navigation Contracts (HIGH)

- `routing-use-html-anchors-before-framework-link-abstractions` - Astro page navigation은 기본적으로 plain `<a>` 사용
- `routing-keep-dynamic-route-generation-at-page-boundary` - `getStaticPaths()`와 동적 route 생성 책임은 page boundary에 유지

### 5. Content Collections and Data Loading (HIGH)

- `content-define-collections-in-src-content-config` - build-time collection 정의는 `src/content.config.ts`에 모음
- `content-give-collections-explicit-zod-schemas` - structured content는 명시적인 schema로 타입과 shape를 고정

### 6. Server Features and Rendering Boundaries (HIGH)

- `server-prefer-actions-over-ui-facing-api-endpoints` - UI가 직접 호출하는 mutation은 가능하면 Actions 우선
- `server-keep-server-islands-serializable-and-slot-fallbacks` - `server:defer`는 serializable props와 fallback slot 기준으로 사용

### 7. Workflow and Review Checks (MEDIUM)

- `workflow-consult-official-docs-for-version-sensitive-astro-features` - 버전 민감한 Astro 기능은 공식 문서 기준으로 확인
- `workflow-review-adapter-output-and-hydration-before-finishing` - 마무리 전 adapter, output mode, hydration 경계를 같이 점검

## 함께 쓰기

- 이 skill은 `convention-typescript`와 함께 로드하는 것을 기본으로 합니다.
- slim [AGENTS.md](./AGENTS.md)는 local Astro 규칙만 담고, support module과 config/action schema의 공통 TypeScript 규칙은 `convention-typescript`를 함께 로드해 보완합니다.
- React island, TSX component, client framework support code가 바뀌면 `convention-react`를 함께 사용합니다.
- Astro component의 class 조합, stylesheet import, plain CSS 구조가 바뀌면 `convention-css`를 함께 사용합니다.
- hydration, form action, server island fallback, navigation 회귀를 브라우저에서 검증하면 `convention-playwright-test`를 함께 사용합니다.

## 마무리 전 셀프 리뷰

- 이번 변경이 Structure, Island, Routing, Content, Server 중 어느 카테고리에 걸리는지 다시 대조하고 관련 rule을 빠뜨리지 않았는지 확인합니다.
- React island, CSS, TypeScript config/action schema, Playwright 검증까지 번졌는데 companion skill을 빼먹지 않았는지 점검합니다.
- 정적 shell을 불필요하게 hydrate하지 않았는지, `src/pages`와 collection/action 경계가 흐려지지 않았는지, `client:*`와 `server:defer` 선택 이유가 분명한지 마지막으로 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/island-hydrate-only-true-interactive-widgets.md](./rules/island-hydrate-only-true-interactive-widgets.md)
- [rules/server-prefer-actions-over-ui-facing-api-endpoints.md](./rules/server-prefer-actions-over-ui-facing-api-endpoints.md)

각 rule 파일에는 아래 내용이 들어 있습니다.

- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 또는 폴더 예시
- 설명이 붙은 Correct 코드 또는 폴더 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [AGENTS.md](./AGENTS.md)에서 확인할 수 있습니다.
