---
title: Map Variables, Components, and Styles to Project Tokens
impact: HIGH
impactDescription: Figma token metadata를 확인할 수 있는데 raw visual value를 코드에 박는 일을 줄임
tags: integration, variables, tokens
---

## Map Variables, Components, and Styles to Project Tokens

**Impact: HIGH (Figma token metadata를 확인할 수 있는데 raw visual value를 코드에 박는 일을 줄임)**

권한이 있으면 Figma variables,
components,
styles metadata를 확인해 project token과 component mapping에 반영합니다. `file_variables:read` scope가 있으면
`GET /v1/files/:file_key/variables/local` 또는 published variables endpoint로 mode별 token 값을 확인합니다.
published component/style metadata가 필요하면 file/team component endpoints를 사용합니다.
scope, plan, rate limit 때문에 실패하면 repo의 CSS variable, design token, component usage inventory로 fallback합니다.

**Incorrect (metadata 확인 없이 raw value를 늘림):**

```css
.card {
  color: #1a5cff;
  border-radius: 13px;
}
```

**Correct (Figma variable/style과 project token을 매핑):**

```md
Token mapping:
- Figma variable `color/action/primary` -> `--color-action-primary`
- Figma radius style `radius/card/default` -> `--radius-card`
- Figma Table component -> `DataTable` usage in src/components
```
