---
name: convention-playwright-test
description: Use when editing Playwright browser tests, integration vs e2e boundaries, locator strategy, waiting rules, mocking, or test data isolation.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Playwright Test Conventions

Comprehensive Playwright browser test conventions for agent-assisted teams. This guide currently contains 25 rules across 7 categories and organizes test-level boundaries, spec placement, setup visibility, data isolation, locator strategy, and waiting rules into rule files plus a compiled `AGENTS.md`.

## When to Use
- Playwright spec, feature-local helper, 공용 support 파일을 만들거나 수정할 때 사용합니다.
- Integration과 E2E 범위를 의도적으로 나누고, locator, mocking, seed, cleanup, waiting 규칙을 일관되게 유지해야 할 때 사용합니다.
- 브라우저 테스트 house style 기준으로 테스트 코드를 리뷰할 때 사용합니다.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Strategy and Test Levels | CRITICAL | `strategy-` |
| 2 | File Placement and Shared Support | HIGH | `naming-` |
| 3 | General Authoring and Data Isolation | HIGH | `authoring-` |
| 4 | Integration Boundaries and Mocking | CRITICAL | `integration-` |
| 5 | E2E Boundaries and Real-system Control | CRITICAL | `e2e-` |
| 6 | Locators, Assertions, and Waiting | HIGH | `locator-` |
| 7 | Guardrails and Review Checks | MEDIUM | `guardrails-` |

## Quick Reference

### 1. Strategy and Test Levels (CRITICAL)

- `strategy-use-playwright-as-the-single-browser-ui-tool` - Use Playwright as the single browser UI tool
- `strategy-default-to-integration-plus-minimal-e2e` - Default to state coverage in integration plus minimal critical e2e
- `strategy-keep-vitest-out-of-browser-ui-tests` - Keep Vitest out of browser UI testing by default
- `strategy-classify-integration-tests-by-mocked-dependency-boundary` - Classify integration tests by mocked dependency boundaries
- `strategy-classify-e2e-tests-by-real-backend-and-auth` - Classify e2e tests by real backend and auth dependence
- `strategy-never-mix-integration-and-e2e-in-one-file` - Never mix integration and e2e in one spec file

### 2. File Placement and Shared Support (HIGH)

- `naming-place-specs-by-feature-path` - Place specs by feature path
- `naming-use-discoverable-spec-file-names` - Use discoverable feature-based spec filenames
- `naming-promote-shared-support-only-after-real-reuse` - Promote shared support only after real reuse appears

### 3. General Authoring and Data Isolation (HIGH)

- `authoring-name-tests-by-user-action-and-result` - Name tests by user action and result
- `authoring-keep-one-behavior-per-test` - Keep one behavior per test
- `authoring-keep-beforeeach-limited-and-visible` - Keep `beforeEach` limited and visible
- `authoring-isolate-and-clean-up-test-data` - Isolate test data and clean it up explicitly
- `authoring-follow-the-integration-or-e2e-first-writing-sequence` - Follow the declared integration/e2e writing sequence
- `authoring-write-comments-only-for-non-obvious-setup-boundaries` - Write comments only for non-obvious setup boundaries

### 4. Integration Boundaries and Mocking (CRITICAL)

- `integration-mock-only-the-endpoints-required-by-the-spec` - Mock only the endpoints required by the spec
- `integration-cover-state-matrices-and-user-visible-results` - Cover state matrices and user-visible results in integration
- `integration-wait-for-state-not-time` - Wait for state, not time, in integration tests

### 5. E2E Boundaries and Real-system Control (CRITICAL)

- `e2e-use-real-backend-auth-and-routing` - Use real backend, auth, and routing in e2e
- `e2e-seed-with-api-helpers-and-clean-up-in-finally` - Seed with API helpers and clean up in `finally`
- `e2e-avoid-destructive-shared-account-scenarios-and-parallel-collisions` - Avoid destructive shared-account scenarios and parallel collisions

### 6. Locators, Assertions, and Waiting (HIGH)

- `locator-prefer-accessible-playwright-locators` - Prefer accessible Playwright locators
- `locator-use-web-first-assertions-for-ui-results` - Use web-first assertions for UI results
- `locator-allow-explicit-waits-only-for-real-async-boundaries` - Allow explicit waits only for real async boundaries

### 7. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-playwright-shortcuts-before-finishing` - Review banned Playwright shortcuts before finish

## Use With
- 테스트가 화면 구조나 라우팅 규칙과 강하게 묶이면 `convention-react`나 `convention-tanstack-route`를 함께 사용합니다.
- seed helper, payload builder, support 타입이 함께 바뀌면 `convention-typescript`를 함께 사용합니다.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/strategy-never-mix-integration-and-e2e-in-one-file.md
rules/locator-prefer-accessible-playwright-locators.md
```

Each rule file contains:
- Brief explanation of why the rule matters
- Incorrect test example with explanation
- Correct test example with explanation
- Guidance that can be applied directly during implementation or review

## Full Compiled Document

For the complete guide with all rules expanded: `./AGENTS.md`
