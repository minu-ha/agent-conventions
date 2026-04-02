# Skills Build Package

Standalone TypeScript package for building and validating convention guides under `../skill/*`.

## What Each Script Does

- `npm run build` - Generic build entry point. Pass `-- --skill=<name>` or `--all`.
- `npm run build:all` - Build every buildable skill under `skill/`. Non-migrated skills are skipped.
- `npm run build:<skill>` - Build one skill folder only. Example: `build:react`, `build:css`.
- `npm run validate` - Generic validation entry point. Pass `-- --skill=<name>` or `--all`.
- `npm run validate:all` - Validate every buildable skill under `skill/`.
- `npm run validate:<skill>` - Validate one skill folder only.
- `npm run dev` - Run `validate` and then `build` with the same CLI arguments.
- `npm run dev:all` - Run `validate` + `build` for every buildable skill.
- `npm run dev:<skill>` - Run `validate` + `build` for one skill folder only.
- `npm run typecheck` - Type-check the build package source and tests with `tsc --noEmit`.
- `npm run test` - Run regression tests for CLI behavior, documentation annotations, and script wiring.

If `metadata.json` declares an `extends` array, build and validate resolve those base skills recursively. The child skill keeps its own title and abstract, while the compiled `AGENTS.md` includes inherited base sections ahead of the local overlay sections.

## Per-Skill Aliases

- `react`
- `css`
- `nestjs`
- `playwright-test`
- `tanstack-route`
- `typescript`

Example commands:

```bash
npm run build:react
npm run validate:react
npm run dev:react
npm run build:all
```

## Current Limitation

The current structured, buildable skills are:

- `react`
- `css`
- `nestjs`
- `playwright-test`
- `tanstack-route`
- `typescript`

`java` is still a legacy single-document skill, so it is intentionally skipped by the structured build pipeline.
