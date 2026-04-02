---
name: convention-css
description: Use when editing CSS files, TSX class composition, wrapper-scoped third-party styling, or token-based interactive UI styles.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# CSS Conventions

Comprehensive CSS conventions for agent-assisted teams. This guide currently contains 20 rules across 5 categories and organizes naming, class composition, selector depth, token usage, wrapper-based third-party styling, and file-level guardrails into rule files plus a compiled `AGENTS.md`.

## When to Use
- CSS 파일, route/컴포넌트 전용 `*.css`, TSX의 `className` 조합을 만들거나 수정할 때 사용합니다.
- wrapper 기반 서드파티 DOM 스타일링, modifier 규칙, selector depth, 디자인 토큰 사용이 중요한 변경에 사용합니다.
- CSS 구조나 클래스 네이밍을 house style 기준으로 리뷰할 때 사용합니다.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Naming and Ownership | CRITICAL | `naming-` |
| 2 | Class Composition and Wrapper Boundaries | HIGH | `composition-` |
| 3 | Selectors and Nesting Boundaries | CRITICAL | `selector-` |
| 4 | Values, Layout, and Interaction States | HIGH | `values-` |
| 5 | File Organization and Guardrails | MEDIUM | `organization-` |

## Quick Reference

### 1. Naming and Ownership (CRITICAL)

- `naming-use-scope-slug-element-modifier-syntax` - Name classes with explicit scope, slug, element, and modifier segments
- `naming-name-elements-and-modifiers-by-role` - Name classes after UI role, not structure or spacing
- `naming-preserve-route-slug-traceability` - Keep route slugs traceable to route hierarchy
- `naming-keep-scope-slug-unique-per-owner` - Keep each `scope_slug` namespace owned by one route or component
- `naming-separate-local-and-route-style-scopes` - Separate `loc_*` local styles from route-level `rt_*` styles

### 2. Class Composition and Wrapper Boundaries (HIGH)

- `composition-compose-classes-with-clsx` - Compose TSX classes with `clsx()`
- `composition-keep-classes-single-purpose` - Give each class one visual responsibility
- `composition-do-not-build-structural-variants-with-modifiers` - Reserve modifiers for state, not layout structure
- `composition-style-ui-components-through-owned-wrappers` - Style `Ui*` components through owned wrappers
- `composition-prefer-ui-wrapper-prop-types` - Prefer wrapper prop types over library-native prop types

### 3. Selectors and Nesting Boundaries (CRITICAL)

- `selector-keep-project-selectors-flat` - Keep project-owned selectors flat
- `selector-use-pseudo-classes-for-dom-owned-states` - Use pseudo-classes for DOM-owned states
- `selector-target-third-party-dom-from-owned-roots` - Target third-party DOM only from owned root classes
- `selector-avoid-deep-descendant-dependencies` - Avoid deep descendant selector dependencies

### 4. Values, Layout, and Interaction States (HIGH)

- `values-tokenize-repeated-visual-values` - Tokenize repeated colors, spacing, type, and shadows
- `values-always-provide-css-variable-fallbacks` - Always include fallbacks for CSS variables
- `values-keep-layout-intent-explicit` - Keep layout intent and sticky/fixed context explicit
- `values-separate-domain-state-modifiers-from-dom-interaction-states` - Separate app state modifiers from browser interaction states

### 5. File Organization and Guardrails (MEDIUM)

- `organization-keep-style-files-owned-by-one-component-or-route` - Keep each stylesheet owned by one route or component
- `organization-review-banned-css-patterns-before-finishing` - Review banned selector and modifier patterns before finish

## Use With
- JSX 구조와 스타일 조합이 함께 바뀌면 `convention-react`를 함께 사용합니다.
- route 레벨 스타일이나 route 로컬 스타일이 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- helper, config, wrapper prop 타입이 함께 바뀌면 `convention-typescript`를 함께 사용합니다.
- 브라우저 기반 스타일 회귀를 검증하면 `convention-playwright-test`를 함께 사용합니다.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/selector-target-third-party-dom-from-owned-roots.md
rules/naming-use-scope-slug-element-modifier-syntax.md
```

Each rule file contains:
- Brief explanation of why the rule matters
- Incorrect CSS or TSX example with explanation
- Correct CSS or TSX example with explanation
- Guidance that can be applied directly during implementation or review

## Full Compiled Document

For the complete guide with all rules expanded: `./AGENTS.md`
