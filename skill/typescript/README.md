# TypeScript Conventions

A structured repository for creating and maintaining TypeScript conventions optimized for agents, reviewers, and AI-assisted refactoring. The current TypeScript guide is organized as 22 rule files across 6 sections and compiles into `AGENTS.md`.

## Structure

- `rules/` - Individual rule files
  - `_sections.md` - Section metadata
  - `_template.md` - Template for new rules
  - `area-description.md` - Individual rule files
- `metadata.json` - Compiled guide metadata
- `AGENTS.md` - Compiled output for agents
- `deprecated/typescript.md` - Legacy single-file guide kept for migration review
- `../../packages/` - Standalone TypeScript package for build, validation, typecheck, and tests across `skill/*`

## Getting Started

1. Validate rule files:
   ```bash
   npm --prefix packages run validate -- --skill=typescript
   ```

2. Build `AGENTS.md` from rules:
   ```bash
   npm --prefix packages run build -- --skill=typescript
   ```

3. Validate and build together:
   ```bash
   npm --prefix packages run dev -- --skill=typescript
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix packages run typecheck
   npm --prefix packages run test
   ```

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/area-description.md`
2. Choose the appropriate area prefix:
   - `naming-` for identifiers, imports, config namespaces, and origin-preserving access
   - `types-` for function types, callback reuse, unused params, type reuse, and custom shape docs
   - `functions-` for object params, enum replacement, helper extraction, and wide-scope assembly
   - `absence-` for optional value and fallback handling
   - `docs-` for JSDoc annotations and inline comment rules
   - `guardrails-` for banned shortcuts and review checks
3. Fill in the frontmatter and body
4. Include clear incorrect/correct examples with explanations
5. Run `npm --prefix packages run dev -- --skill=typescript` to regenerate `AGENTS.md`

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
- Rule files use `area-description.md` naming, for example `types-document-custom-types-and-shapes.md`
- Section is inferred from the filename prefix
- Rules are sorted alphabetically by title within each section
- Rule numbering in `AGENTS.md` is generated automatically

## Impact Levels

- `CRITICAL` - Highest priority, likely to affect type safety, contracts, or cross-file consistency
- `HIGH` - Significant impact on maintainability and readability
- `MEDIUM-HIGH` - Strongly recommended for common implementation work
- `MEDIUM` - Important for consistency and review discipline
- `LOW` - Useful refinement rules when context justifies them

## Scripts

- `npm --prefix packages run build -- --skill=typescript` - Compile the TypeScript rules into `AGENTS.md`
- `npm --prefix packages run validate -- --skill=typescript` - Validate TypeScript rule files
- `npm --prefix packages run dev -- --skill=typescript` - Validate and build TypeScript in sequence
- `npm --prefix packages run build -- --all` - Build every buildable skill under `skill/`
- `npm --prefix packages run typecheck` - Type-check the standalone build package
- `npm --prefix packages run test` - Run CLI and parser regression tests for the build package
- `cd packages && npm run build -- --skill=typescript` - Run the package-local build script directly

## Migration Notes

- `rules/*.md` is the source of truth
- `AGENTS.md` is the compiled document agents should read first
- `deprecated/typescript.md` is preserved so we can compare migration completeness against the original single-file guide
- The generic TypeScript build package can target one skill with `--skill=<name>` or every buildable skill with `--all`

## Contributing

When adding or modifying rules:

1. Use the correct filename prefix for your section
2. Follow the `_template.md` structure
3. Keep examples concrete and close to real TypeScript modules, helpers, and contracts
4. Update section metadata if you introduce a new category
5. Run `npm --prefix packages run dev -- --skill=typescript` before finishing
