# React Conventions

A structured repository for creating and maintaining React conventions optimized for agents, reviewers, and AI-assisted refactoring. The current React guide is organized as 33 rule files across 7 sections and compiles into `AGENTS.md`.

## Structure

- `rules/` - Individual rule files
  - `_sections.md` - Section metadata
  - `_template.md` - Template for new rules
  - `area-description.md` - Individual rule files
- `metadata.json` - Compiled guide metadata
- __`AGENTS.md`__ - Compiled output for agents
- `deprecated/react.md` - Legacy single-file guide kept for migration review
- `../../packages/` - standalone TypeScript npm package for build, validation, typecheck, and tests across `skill/*`

## Getting Started

1. Validate rule files:
   ```bash
   npm --prefix packages run validate:react
   ```

2. Build `AGENTS.md` from rules:
   ```bash
   npm --prefix packages run build:react
   ```

3. Validate and build together:
   ```bash
   npm --prefix packages run dev:react
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix packages run typecheck
   npm --prefix packages run test
   ```

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/area-description.md`
2. Choose the appropriate area prefix:
   - `ownership-` for shared-vs-local ownership and file placement
   - `typing-` for types, callbacks, props, and API contract rules
   - `composition-` for component signatures, JSX structure, and enum replacement
   - `screen-` for route-entry discipline and helper extraction boundaries
   - `events-` for handler naming and interaction flow
   - `state-` for server state, store access, memoization, and fallback rules
   - `docs-` for Korean comments and JSDoc conventions
3. Fill in the frontmatter and body
4. Include clear incorrect/correct examples with explanations
5. Run `npm --prefix packages run dev:react` to regenerate `AGENTS.md`

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

Short explanation of the rule and why it matters.

**Incorrect (description of what's wrong):**

```tsx
// Bad example
```

**Correct (description of what's right):**

```tsx
// Good example
```
```

## File Naming Convention

- Files starting with `_` are special and excluded from the compiled guide
- Rule files use `area-description.md` naming, for example `state-shape-query-data-with-select.md`
- Section is inferred from the filename prefix
- Rules are sorted alphabetically by title within each section
- Rule numbering in `AGENTS.md` is generated automatically

## Impact Levels

- `CRITICAL` - Highest priority, likely to affect correctness or large-scale consistency
- `HIGH` - Significant impact on maintainability and readability
- `MEDIUM-HIGH` - Strongly recommended for common feature work
- `MEDIUM` - Important for consistency but less urgent than core flow rules
- `LOW` - Useful refinement rules when context justifies them

## Scripts

- `npm --prefix packages run build:react` - Compile only the React rules into `AGENTS.md`
- `npm --prefix packages run validate:react` - Validate only the React rule files
- `npm --prefix packages run dev:react` - Validate and build only React in sequence
- `npm --prefix packages run build:all` - Build every buildable skill under `skill/`
- `npm --prefix packages run validate:all` - Validate every buildable skill under `skill/`
- `npm --prefix packages run dev:all` - Validate and build every buildable skill under `skill/`
- `npm --prefix packages run typecheck` - Type-check the standalone build package
- `npm --prefix packages run test` - Run CLI and parser regression tests for the build package
- `cd packages && npm run build:react` - Run the package-local React build script directly

## Migration Notes

- `rules/*.md` is the source of truth
- `AGENTS.md` is the compiled document agents should read first
- `deprecated/react.md` is preserved so we can compare migration completeness against the original single-file guide
- The generic TypeScript build package exposes both raw CLI forms and per-skill aliases
- `react` is buildable today, while other skill aliases are predeclared for the migration path and will fail until those skills get `rules/ + metadata.json`

## Contributing

When adding or modifying rules:

1. Use the correct filename prefix for your section
2. Follow the `_template.md` structure
3. Keep examples concrete and close to real route/component code
4. Update section metadata if you introduce a new category
5. Run `npm --prefix packages run dev:react` before finishing
