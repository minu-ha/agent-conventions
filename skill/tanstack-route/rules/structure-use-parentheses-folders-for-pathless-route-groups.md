---
title: Use Parentheses Folders for Pathless Route Groups
impact: HIGH
impactDescription: separates URL hierarchy from grouping hierarchy so nested routes stay organized without changing paths
tags: pathless-routes, grouping, folders
---

## Use Parentheses Folders for Pathless Route Groups

**Impact: HIGH (separates URL hierarchy from grouping hierarchy so nested routes stay organized without changing paths)**

일반 폴더는 실제 URL 세그먼트를 반영하는 상위 계층이고,
괄호 폴더 `()`는 하위 라우트를 그룹화하기 위한 pathless 계층입니다.
URL에 보여야 하는 상위 계층만 일반 폴더로 두고, 하위 라우트 묶음은 괄호 폴더로 분리합니다.

**Incorrect (URL 계층과 그룹 계층을 같은 폴더 규칙으로 섞음):**

```txt
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (URL 폴더와 pathless 그룹 폴더를 구분):**

```txt
<route-root>/app/
  app.layout.tsx
  app.index.tsx
  (settings)/
    settings.index.tsx
    (security)/
      security.index.tsx
```
