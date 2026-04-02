# Playwright Test Conventions

A structured repository for creating and maintaining Playwright browser test conventions optimized for agents, reviewers, and AI-assisted refactoring. The current Playwright test guide is organized as 25 rule files across 7 sections and compiles into `AGENTS.md`.

## Structure

- `rules/` - Individual rule files
  - `_sections.md` - Section metadata
  - `_template.md` - Template for new rules
  - `area-description.md` - Individual rule files
- `metadata.json` - Compiled guide metadata
- `AGENTS.md` - Compiled output for agents
- `deprecated/playwright-test.md` - Legacy single-file guide kept for migration review
- `../../packages/` - Standalone TypeScript package for build, validation, typecheck, and tests across `skill/*`

## Getting Started

1. Validate rule files:
   ```bash
   npm --prefix packages run validate -- --skill=playwright-test
   ```

2. Build `AGENTS.md` from rules:
   ```bash
   npm --prefix packages run build -- --skill=playwright-test
   ```

3. Validate and build together:
   ```bash
   npm --prefix packages run dev -- --skill=playwright-test
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix packages run typecheck
   npm --prefix packages run test
   ```

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/area-description.md`
2. Choose the appropriate area prefix:
   - `strategy-` for tool choice, level classification, and test-level separation
   - `naming-` for file placement, filenames, and shared support promotion
   - `authoring-` for titles, setup visibility, data isolation, and comment rules
   - `integration-` for mocked boundary rules and state-oriented integration checks
   - `e2e-` for real backend/auth use, seed strategy, and shared-resource safety
   - `locator-` for locator priority, assertions, and explicit waiting rules
   - `guardrails-` for banned shortcuts and finishing review checks
3. Fill in the frontmatter and body
4. Include clear incorrect/correct examples with explanations
5. Run `npm --prefix packages run dev -- --skill=playwright-test` to regenerate `AGENTS.md`

## Rule File Structure

Each rule file should follow this structure:

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: Optional description
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (optional impact description)**

규칙의 핵심과 이유를 짧고 분명하게 설명합니다.

**Incorrect (무엇이 문제인지 설명):**

```ts
// Bad example
```

**Correct (무엇이 좋아졌는지 설명):**

```ts
// Good example
```
```

## File Naming Convention

- Files starting with `_` are special and excluded from the compiled guide
- Rule files use `area-description.md` naming, for example `integration-cover-state-matrices-and-user-visible-results.md`
- Section is inferred from the filename prefix
- Rules are sorted alphabetically by title within each section
- Rule numbering in `AGENTS.md` is generated automatically

## Impact Levels

- `CRITICAL` - Highest priority, likely to affect test meaning, boundary clarity, or CI reliability
- `HIGH` - Significant impact on maintainability and readability
- `MEDIUM-HIGH` - Strongly recommended for common test work
- `MEDIUM` - Important for consistency and review discipline
- `LOW` - Useful refinement rules when context justifies them

## Scripts

- `npm --prefix packages run build -- --skill=playwright-test` - Compile the Playwright test rules into `AGENTS.md`
- `npm --prefix packages run validate -- --skill=playwright-test` - Validate Playwright test rule files
- `npm --prefix packages run dev -- --skill=playwright-test` - Validate and build Playwright test rules in sequence
- `npm --prefix packages run build -- --all` - Build every buildable skill under `skill/`
- `npm --prefix packages run typecheck` - Type-check the standalone build package
- `npm --prefix packages run test` - Run CLI and parser regression tests for the build package
- `cd packages && npm run build -- --skill=playwright-test` - Run the package-local build script directly

## Migration Notes

- `rules/*.md` is the source of truth
- `AGENTS.md` is the compiled document agents should read first
- `deprecated/playwright-test.md` is preserved so we can compare migration completeness against the original single-file guide
- The generic TypeScript build package can target one skill with `--skill=<name>` or every buildable skill with `--all`

## Contributing

When adding or modifying rules:

1. Use the correct filename prefix for your section
2. Follow the `_template.md` structure
3. Keep examples concrete and close to real browser specs, support helpers, and route- or feature-level test flows
4. Update section metadata if you introduce a new category
5. Run `npm --prefix packages run dev -- --skill=playwright-test` before finishing
