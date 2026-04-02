---
name: convention-nestjs
description: Use when editing NestJS modules, controllers, services, DTOs, Prisma access, exception handling, or NestJS test boundaries.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# NestJS Conventions

Comprehensive NestJS conventions for agent-assisted teams. This guide currently contains 25 rules across 7 categories and organizes module boundaries, controller-service layering, DTO contracts, backend method rules, annotation patterns, and test strategy into rule files plus a compiled `AGENTS.md`.

## When to Use
- NestJS module, controller, service, DTO, Prisma 접근 코드, NestJS 테스트를 만들거나 수정할 때 사용합니다.
- controller/service 경계, DTO 계약, 예외 처리, backend unit/e2e 테스트 범위를 일관되게 유지해야 할 때 사용합니다.
- NestJS house style 기준으로 백엔드 변경을 리뷰할 때 사용합니다.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Module and Naming Boundaries | HIGH | `naming-` |
| 2 | Layer Responsibilities and Dependencies | CRITICAL | `layers-` |
| 3 | DTOs and Backend Type Contracts | HIGH | `dto-` |
| 4 | Methods, Async Flow, and Errors | HIGH | `methods-` |
| 5 | JSDoc and Comment Conventions | MEDIUM-HIGH | `docs-` |
| 6 | Testing Strategy and Placement | CRITICAL | `testing-` |
| 7 | Guardrails and Review Checks | MEDIUM | `guardrails-` |

## Quick Reference

### 1. Module and Naming Boundaries (HIGH)

- `naming-use-kebab-role-suffixed-nestjs-file-names` - Use kebab-case filenames with Nest role suffixes
- `naming-organize-domain-modules-and-shared-backend-code-by-scope` - Keep one domain per module folder and share code intentionally
- `naming-use-direct-file-imports-without-barrels` - Use direct file imports instead of barrels
- `naming-place-shared-and-module-local-constants-by-scope` - Store constants by their actual ownership scope

### 2. Layer Responsibilities and Dependencies (CRITICAL)

- `layers-keep-controllers-thin-and-boundary-focused` - Keep controllers focused on request/response boundaries
- `layers-keep-services-responsible-for-domain-rules-and-prisma` - Keep services responsible for domain rules and data orchestration
- `layers-preserve-one-way-dependencies-through-services` - Preserve one-way controller-to-service-to-prisma dependencies

### 3. DTOs and Backend Type Contracts (HIGH)

- `dto-validate-request-dtos-with-validator-transformer-and-swagger` - Validate request DTOs with decorators and explicit docs
- `dto-expose-response-fields-explicitly` - Expose response DTO fields intentionally
- `dto-reuse-prisma-generated-types-before-new-backend-types` - Reuse Prisma generated types before declaring new backend types
- `dto-replace-enum-with-as-const-except-prisma-enums` - Replace local enums with `as const` except for Prisma enums
- `dto-document-custom-backend-types-and-parameter-objects` - Document custom backend types and object params with JSDoc

### 4. Methods, Async Flow, and Errors (HIGH)

- `methods-use-nestjs-class-methods-and-explicit-async-returns` - Use NestJS-style class methods and explicit async return types
- `methods-use-async-await-and-mark-intentional-fire-and-forget` - Prefer async/await and mark intentional fire-and-forget calls
- `methods-expose-missing-values-instead-of-silent-fallbacks` - Expose absence instead of hiding it with fallback shortcuts
- `methods-throw-context-rich-nestjs-exceptions` - Throw context-rich NestJS exceptions instead of generic errors

### 5. JSDoc and Comment Conventions (MEDIUM-HIGH)

- `docs-write-concise-korean-comments-about-purpose-and-risks` - Write concise Korean comments about intent, constraints, and risks
- `docs-require-jsdoc-on-service-hooks-and-boundary-methods` - Require JSDoc on service, hook, and boundary declarations
- `docs-use-summary-and-description-on-service-and-prisma-boundaries` - Use `@summary` and `@description` on the right backend boundaries
- `docs-keep-inline-comments-for-domain-rules-and-library-caveats` - Keep inline comments for non-obvious domain or library caveats only

### 6. Testing Strategy and Placement (CRITICAL)

- `testing-separate-service-unit-tests-from-http-e2e-tests` - Separate service unit tests from HTTP e2e tests
- `testing-place-test-files-by-runtime-scope` - Place tests by runtime scope and ownership
- `testing-mock-unit-boundaries-and-verify-e2e-wiring` - Mock unit boundaries and verify real wiring in e2e
- `testing-add-tests-when-branches-endpoints-or-schema-change` - Add tests when branches, endpoints, or schema behavior changes

### 7. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-nestjs-shortcuts-before-finishing` - Review banned NestJS shortcuts before finish

## Use With
- 일반 TypeScript 규칙은 `convention-typescript`를 함께 사용합니다.
- DTO나 controller가 React/TanStack Route와 계약을 공유하면 해당 프론트엔드 skill과 함께 사용합니다.
- 백엔드 E2E와 브라우저 E2E가 함께 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/layers-keep-controllers-thin-and-boundary-focused.md
rules/testing-separate-service-unit-tests-from-http-e2e-tests.md
```

Each rule file contains:
- Brief explanation of why the rule matters
- Incorrect code example with explanation
- Correct code example with explanation
- Guidance that can be applied directly during implementation or review

## Full Compiled Document

For the complete guide with all rules expanded: `./AGENTS.md`
