---
title: Run Convention Audit for React, CSS, and TypeScript Diffs
impact: CRITICAL
impactDescription: 변경된 domain만 정확히 활성화하면서 audit 자체 gate는 빠뜨리지 않음
tags: trigger, scope, companion
---

## Run Convention Audit for React, CSS, and TypeScript Diffs

**Impact: CRITICAL (변경된 domain만 정확히 활성화하면서 audit 자체 gate는 빠뜨리지 않음)**

React/TypeScript/CSS convention이 걸리는 변경은 완료 전 audit 대상입니다. audit은 non-progressive local skill이므로 먼저 local `AGENTS.md`의 8개 audit gate rule 전체를 읽습니다. 그 뒤 actual changed surface를 diff와 파일 목록으로 판별해 companion을 조건부 활성화합니다.

- React: component, TSX render, screen/route-local 경계, hook, handler, state/query, rendered behavior
- TypeScript: type, schema, config, API, helper, import/export, fallback, JSDoc
- CSS: stylesheet, selector, token/CSS variable, className contract, visual styling surface

TSX 변경은 `react`와 `typescript`를 함께 활성화합니다. CSS는 TSX 확장자만으로 켜지 않으며 stylesheet, selector, token/CSS variable, className contract 또는 visual styling 변경이 있어야 합니다. 반대로 `.ts`라도 React hook ownership을 바꾸면 React와 TypeScript를 활성화합니다. scope drift가 생기면 activation을 다시 판단합니다.

**Incorrect (세 companion을 무조건 켜거나 한 domain만 대충 선택):**

```md
TSX 파일이 있으므로 React, TypeScript, CSS 전체 handbook을 읽었습니다.
```

**Correct (변경 surface로 activation을 고정):**

```md
Audit local gate: AGENTS.md 8 rules loaded
Activated: react, typescript
Inactive: css — stylesheet, selector, token, className, visual styling 변경 없음
```
