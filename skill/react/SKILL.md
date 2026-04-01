---
name: convention-react
description: Use when editing React or TSX files and consistent component ownership, route-local boundaries, handler flow, state origin, and documentation rules must be applied.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# React Conventions

Comprehensive React coding conventions for agent-assisted teams. This guide currently contains 33 rules across 7 categories and organizes shared component ownership, route-local boundaries, type contracts, handler flow, state origin, and Korean documentation rules into rule files plus a compiled `AGENTS.md`.

## When to Use
- React 컴포넌트, 화면 파일, TSX 렌더링 흐름, React 인접 `*.ts` 파일을 수정할 때 사용합니다.
- 컴포넌트 소유 경계, handler 구조, 파생값 위치, React Query/Zustand 데이터 흐름이 중요한 변경에 사용합니다.
- React 코드를 house style 기준으로 리뷰할 때 사용합니다.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Ownership and Boundaries | CRITICAL | `ownership-` |
| 2 | Typing and Contracts | HIGH | `typing-` |
| 3 | Component Structure and JSX | HIGH | `composition-` |
| 4 | Screen File Discipline | HIGH | `screen-` |
| 5 | Events and Interaction Flow | MEDIUM-HIGH | `events-` |
| 6 | State and Data Flow | CRITICAL | `state-` |
| 7 | Documentation and Comments | MEDIUM | `docs-` |

## Quick Reference

### 1. Ownership and Boundaries (CRITICAL)

- `ownership-use-consistent-file-and-symbol-naming` - Keep file, symbol, and constant naming predictable
- `ownership-avoid-barrel-and-react-namespace-imports` - Ban barrel exports and `React.*` namespace types
- `ownership-layer-component-boundaries` - Separate `ui`, `widget`, and `-local`
- `ownership-place-route-local-files-by-scope` - Place route-local components and helpers by scope
- `ownership-prefer-plain-ts-for-local-react-helpers` - Prefer plain helpers over unnecessary custom hooks
- `ownership-shared-config-entry-points` - Route shared constants through config entry points

### 2. Typing and Contracts (HIGH)

- `typing-function-type-first` - Prefer function variable types over parameter annotations
- `typing-mark-unused-parameters-with-underscore` - Keep ignored parameters explicit with `_`
- `typing-reuse-existing-contracts` - Reuse prop and API contracts before creating new types
- `typing-document-custom-types` - Document custom interfaces and object types at file top

### 3. Component Structure and JSX (HIGH)

- `composition-prefer-arrow-functions-and-object-params` - Use arrow functions and object params for complex signatures
- `composition-prefer-as-const-over-enum` - Replace `enum` with object literals plus `as const`
- `composition-destructure-props-inside` - Accept `props` whole and destructure inside
- `composition-use-activity-for-render-branches` - Use `Activity` for render branches
- `composition-named-handlers-over-inline` - Keep branching and async logic out of JSX

### 4. Screen File Discipline (HIGH)

- `screen-keep-route-flow-visible` - Keep route entry files focused on screen flow
- `screen-avoid-premature-abstraction` - Delay extraction until reuse is real
- `screen-extract-utilities-selectively` - Extract helpers only when the boundary is justified
- `screen-keep-derived-values-close` - Keep derived values and aliases close to usage
- `screen-move-pure-support-code-out-of-entry-files` - Move route support types, presets, and pure helpers out of entry files

### 5. Events and Interaction Flow (MEDIUM-HIGH)

- `events-name-and-curry-handlers` - Name handlers predictably and curry extra arguments
- `events-keep-handler-flow-inline` - Keep screen-specific flow inline until a real utility emerges

### 6. State and Data Flow (CRITICAL)

- `state-choose-state-tools-by-source-of-truth` - Match state tool to ownership and lifetime
- `state-name-query-and-mutation-bindings-consistently` - Keep response/mutation bindings predictable
- `state-store-derived-authority` - Persist shared authority decisions once
- `state-shape-query-data-with-select` - Transform server responses in `query.select`
- `state-preserve-origin-chaining` - Preserve response and store origin in wide scopes
- `state-compiler-first-memoization` - Prefer compiler defaults over defensive memoization
- `state-avoid-fallback-defaults-and-loading-flags` - Avoid silent fallbacks and ad-hoc loading branches

### 7. Documentation and Comments (MEDIUM)

- `docs-require-jsdoc-on-key-declarations` - Require JSDoc on APIs, handlers, effects, and custom types
- `docs-summary-vs-description` - Use `@description` for API calls and `@summary` elsewhere
- `docs-limit-inline-comments-to-non-obvious-logic` - Keep inline comments for constraints and caveats only
- `docs-korean-purpose-comments` - Write concise Korean comments about purpose and constraints

## Use With
- 일반 TypeScript 규칙은 `convention-typescript`를 함께 사용합니다.
- 스타일, `className`, CSS import가 바뀌면 `convention-css`를 함께 사용합니다.
- route 파일이나 router API가 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- Playwright 테스트 범위가 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/state-shape-query-data-with-select.md
rules/docs-require-jsdoc-on-key-declarations.md
```

Each rule file contains:
- Brief explanation of why the rule matters
- Incorrect code example with explanation
- Correct code example with explanation
- Guidance that can be applied directly during implementation or review

## Full Compiled Document

For the complete guide with all rules expanded: `./AGENTS.md`
