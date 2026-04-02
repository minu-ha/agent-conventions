---
name: convention-typescript
description: Use when editing TypeScript modules, imports, custom types, helper extraction boundaries, fallback handling, or JSDoc annotation rules.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TypeScript Conventions

Comprehensive TypeScript conventions for agent-assisted teams. This guide currently contains 22 rules across 6 categories and organizes naming, import ownership, type contracts, helper extraction, absence handling, and JSDoc annotation rules into rule files plus a compiled `AGENTS.md`.

## When to Use
- 일반 TypeScript 모듈, 유틸 파일, 설정 파일, React 전용이 아닌 `*.ts` 파일을 만들거나 수정할 때 사용합니다.
- import 구조, 타입 재사용, helper 분리, 옵셔널 값 처리, 주석 규칙이 중요한 변경에 사용합니다.
- TypeScript house style 기준으로 코드나 문서를 리뷰할 때 사용합니다.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Naming and Module Boundaries | HIGH | `naming-` |
| 2 | Types and Contracts | CRITICAL | `types-` |
| 3 | Functions and Helper Boundaries | HIGH | `functions-` |
| 4 | Absence and Fallback Handling | HIGH | `absence-` |
| 5 | JSDoc and Comment Conventions | MEDIUM-HIGH | `docs-` |
| 6 | Guardrails and Review Checks | MEDIUM | `guardrails-` |

## Quick Reference

### 1. Naming and Module Boundaries (HIGH)

- `naming-use-consistent-file-and-symbol-naming` - Keep filenames, symbol names, and field casing predictable
- `naming-use-direct-imports-and-public-entry-points` - Prefer direct imports and dedicated public entry points over barrels
- `naming-centralize-shared-config-namespaces` - Route shared config through one public namespace
- `naming-preserve-config-origin-with-chained-access` - Preserve config origin with chained access

### 2. Types and Contracts (CRITICAL)

- `types-prefer-function-variable-types-over-parameter-annotations` - Prefer function variable types when a callable contract exists
- `types-reuse-callback-signatures-from-existing-contracts` - Reuse callback signatures from existing contracts
- `types-mark-unused-parameters-with-underscore` - Keep ignored parameters explicit with `_`
- `types-reuse-existing-contracts-before-new-types` - Reuse existing contracts before declaring new types
- `types-document-custom-types-and-shapes` - Document custom types and declarative shapes with field-level JSDoc

### 3. Functions and Helper Boundaries (HIGH)

- `functions-use-named-object-params-for-complex-signatures` - Use named object params for complex function signatures
- `functions-replace-enum-with-as-const-objects` - Replace `enum` with object literals plus `as const`
- `functions-extract-helpers-only-when-the-boundary-is-real` - Extract helpers only when the boundary is justified
- `functions-avoid-imperative-assembly-in-wide-scopes` - Avoid imperative assembly in file-wide scopes

### 4. Absence and Fallback Handling (HIGH)

- `absence-expose-optional-values-instead-of-silent-fallbacks` - Expose missing values instead of hiding them with casual fallbacks

### 5. JSDoc and Comment Conventions (MEDIUM-HIGH)

- `docs-write-concise-korean-comments-about-purpose-and-constraints` - Write concise Korean comments about intent and constraints
- `docs-require-header-jsdoc-on-key-declarations` - Require declaration header JSDoc on key boundaries
- `docs-use-description-for-external-integration-functions` - Use `@description` for external integration functions
- `docs-use-helper-for-reusable-pure-helper-functions` - Use `@helper` for reusable pure helpers
- `docs-use-tool-for-model-callable-tool-factories` - Use `@tool` for model-callable tool factories
- `docs-keep-inline-comments-for-constraints-and-caveats` - Keep inline comments for non-obvious constraints only
- `docs-document-declarative-shapes-with-summary-and-field-blocks` - Document declarative shapes with `@summary` and `@field`

### 6. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-typescript-shortcuts-before-finishing` - Review banned TypeScript shortcuts before finish

## Use With
- React, TanStack Route, NestJS 같은 프레임워크 영역이라면 해당 전용 skill을 함께 사용합니다.
- route helper나 search schema처럼 router 경계가 함께 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- TSX 파일과 React component 경계가 함께 바뀌면 `convention-react`를 함께 사용합니다.
- 타입/주석 규칙을 테스트나 fixture에도 반영하면 `convention-playwright-test` 같은 테스트 전용 skill을 함께 사용합니다.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/types-document-custom-types-and-shapes.md
rules/functions-extract-helpers-only-when-the-boundary-is-real.md
```

Each rule file contains:
- Brief explanation of why the rule matters
- Incorrect code example with explanation
- Correct code example with explanation
- Guidance that can be applied directly during implementation or review

## Full Compiled Document

For the complete guide with all rules expanded: `./AGENTS.md`
