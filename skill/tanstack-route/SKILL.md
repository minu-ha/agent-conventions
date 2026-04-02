---
name: convention-tanstack-route
description: Use when editing TanStack Router file-based routes, layout shells, pathless groups, redirects, search params, or route-local helper ownership.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TanStack Route Conventions

Comprehensive TanStack Router conventions for agent-assisted teams. This guide currently contains 24 rules across 6 categories and organizes route structure, naming, router-boundary declarations, route-local responsibilities, generated artifacts, and repeatable route-addition workflow into rule files plus a compiled `AGENTS.md`.

## When to Use
- TanStack Router route 파일, route 폴더, route 인접 `*.ts` helper를 만들거나 수정할 때 사용합니다.
- `createFileRoute`, `beforeLoad`, `validateSearch`, pathless group, 동적 세그먼트, route grouping 규칙이 중요한 변경에 사용합니다.
- route 구조나 redirect/guard 동작을 house style 기준으로 리뷰할 때 사용합니다.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Route Structure and Grouping | CRITICAL | `structure-` |
| 2 | File Naming and Route Assets | HIGH | `naming-` |
| 3 | Route Definition and Navigation Boundaries | CRITICAL | `declaration-` |
| 4 | Route-local Ownership and Responsibilities | HIGH | `responsibility-` |
| 5 | Styles and Generated Artifacts | MEDIUM-HIGH | `styling-` |
| 6 | Workflow and Verification | MEDIUM | `workflow-` |

## Quick Reference

### 1. Route Structure and Grouping (CRITICAL)

- `structure-keep-root-responsibilities-in-root-route` - Keep app-wide concerns in `__root.tsx`
- `structure-split-top-level-route-groups-by-layout-shell` - Split top-level groups by layout shell
- `structure-avoid-folder-only-and-flat-only-route-trees` - Mix folders, groups, and feature entry names
- `structure-use-parentheses-folders-for-pathless-route-groups` - Use `()` folders for pathless grouping
- `structure-keep-shared-layout-screens-under-one-parent-layout` - Keep same-shell screens under one parent layout

### 2. File Naming and Route Assets (HIGH)

- `naming-prepare-the-basic-route-file-set` - Prepare CSS, helper, layout, and index files together
- `naming-use-searchable-feature-route-file-names` - Keep entry filenames searchable by feature
- `naming-start-child-route-sets-with-parentheses-folders` - Start nested route sets with a group folder
- `naming-use-domain-specific-dynamic-segment-names` - Prefer meaningful param names over generic ids
- `naming-create-route-local-helper-files-early` - Reserve same-level `*.ts` helpers early
- `naming-name-top-level-groups-by-shell-meaning` - Name top-level groups after shell meaning

### 3. Route Definition and Navigation Boundaries (CRITICAL)

- `declaration-export-route-at-file-top` - Export `Route` at the top of each route file
- `declaration-match-route-paths-to-file-structure` - Keep `createFileRoute()` strings aligned with files
- `declaration-redirect-empty-entry-routes-in-beforeload` - Redirect empty entry routes in `beforeLoad`
- `declaration-run-auth-and-permission-guards-in-beforeload` - Keep guards in router boundaries
- `declaration-validate-search-before-using-route-search` - Normalize search in `validateSearch`
- `declaration-read-params-and-search-from-local-route` - Read params and search from the local `Route`

### 4. Route-local Ownership and Responsibilities (HIGH)

- `responsibility-limit-layout-files-to-shell-concerns` - Keep `*.layout.tsx` focused on shell concerns
- `responsibility-keep-index-files-focused-on-screen-flow` - Keep `*.index.tsx` focused on screen flow
- `responsibility-place-route-only-modules-in-local` - Store route-only helpers and UI in `-local/`

### 5. Styles and Generated Artifacts (MEDIUM-HIGH)

- `styling-keep-route-css-at-route-scope` - Keep route CSS with the route that owns it
- `styling-never-edit-generated-route-tree-files` - Treat generated route trees as derived artifacts

### 6. Workflow and Verification (MEDIUM)

- `workflow-add-new-routes-in-layout-first-order` - Add routes in a layout-first sequence
- `workflow-review-route-structure-before-finishing` - Review structure with a route checklist before finish

## Use With
- route entry 화면이나 `-local` 컴포넌트가 바뀌면 `convention-react`를 함께 사용합니다.
- route helper, search schema, 정규화 로직이 바뀌면 `convention-typescript`를 함께 사용합니다.
- route 레벨 CSS나 `-local/*.css`가 바뀌면 `convention-css`를 함께 사용합니다.
- redirect, auth guard, navigation 흐름을 Playwright로 검증하면 `convention-playwright-test`를 함께 사용합니다.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/declaration-validate-search-before-using-route-search.md
rules/structure-split-top-level-route-groups-by-layout-shell.md
```

Each rule file contains:
- Brief explanation of why the rule matters
- Incorrect code or folder example with explanation
- Correct code or folder example with explanation
- Guidance that can be applied directly during implementation or review

## Full Compiled Document

For the complete guide with all rules expanded: `./AGENTS.md`
