# TanStack Route Conventions

A structured repository for creating and maintaining TanStack Router conventions optimized for agents, reviewers, and AI-assisted refactoring. The current TanStack Route guide is organized as 24 rule files across 6 sections and compiles into `AGENTS.md`.

## Structure

- `rules/` - Individual rule files
  - `_sections.md` - Section metadata
  - `_template.md` - Template for new rules
  - `area-description.md` - Individual rule files
- `metadata.json` - Compiled guide metadata
- `AGENTS.md` - Compiled output for agents
- `deprecated/tanstack-route.md` - Legacy single-file guide kept for migration review
- `../../packages/` - Standalone TypeScript package for build, validation, typecheck, and tests across `skill/*`

## Getting Started

1. Validate rule files:
   ```bash
   npm --prefix packages run validate -- --skill=tanstack-route
   ```

2. Build `AGENTS.md` from rules:
   ```bash
   npm --prefix packages run build -- --skill=tanstack-route
   ```

3. Validate and build together:
   ```bash
   npm --prefix packages run dev -- --skill=tanstack-route
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix packages run typecheck
   npm --prefix packages run test
   ```

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/area-description.md`
2. Choose the appropriate area prefix:
   - `structure-` for layout-shell grouping, root boundaries, and pathless group structure
   - `naming-` for searchable entry names, dynamic segments, and route asset sets
   - `declaration-` for `Route`, `createFileRoute`, redirects, guards, and `validateSearch`
   - `responsibility-` for `layout`, `index`, and `-local` ownership boundaries
   - `styling-` for route CSS placement and generated artifact protection
   - `workflow-` for route addition order and finishing checklists
3. Fill in the frontmatter and body
4. Include clear incorrect/correct examples with explanations
5. Run `npm --prefix packages run dev -- --skill=tanstack-route` to regenerate `AGENTS.md`

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

```tsx
// Bad example
```

**Correct (무엇이 좋아졌는지 설명):**

```tsx
// Good example
```
```

## File Naming Convention

- Files starting with `_` are special and excluded from the compiled guide
- Rule files use `area-description.md` naming, for example `declaration-validate-search-before-using-route-search.md`
- Section is inferred from the filename prefix
- Rules are sorted alphabetically by title within each section
- Rule numbering in `AGENTS.md` is generated automatically

## Impact Levels

- `CRITICAL` - Highest priority, likely to affect router correctness or route-tree consistency
- `HIGH` - Significant impact on maintainability and discoverability
- `MEDIUM-HIGH` - Strongly recommended for common feature work
- `MEDIUM` - Important for consistency and review discipline
- `LOW` - Useful refinement rules when context justifies them

## Scripts

- `npm --prefix packages run build -- --skill=tanstack-route` - Compile the TanStack Route rules into `AGENTS.md`
- `npm --prefix packages run validate -- --skill=tanstack-route` - Validate TanStack Route rule files
- `npm --prefix packages run dev -- --skill=tanstack-route` - Validate and build TanStack Route in sequence
- `npm --prefix packages run build -- --all` - Build every buildable skill under `skill/`
- `npm --prefix packages run typecheck` - Type-check the standalone build package
- `npm --prefix packages run test` - Run CLI and parser regression tests for the build package
- `cd packages && npm run build -- --skill=tanstack-route` - Run the package-local build script directly

## Migration Notes

- `rules/*.md` is the source of truth
- `AGENTS.md` is the compiled document agents should read first
- `deprecated/tanstack-route.md` is preserved so we can compare migration completeness against the original single-file guide
- The generic TypeScript build package can target one skill with `--skill=<name>` or every buildable skill with `--all`

## Contributing

When adding or modifying rules:

1. Use the correct filename prefix for your section
2. Follow the `_template.md` structure
3. Keep examples concrete and close to real route code or route-tree layouts
4. Update section metadata if you introduce a new category
5. Run `npm --prefix packages run dev -- --skill=tanstack-route` before finishing
