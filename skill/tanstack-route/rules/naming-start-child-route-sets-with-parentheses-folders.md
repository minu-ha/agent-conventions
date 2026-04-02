---
title: Start Child Route Sets With Parentheses Folders
impact: HIGH
impactDescription: makes child route groups explicit before filenames grow long or sibling routes become hard to scan
tags: child-routes, grouping, folders
---

## Start Child Route Sets With Parentheses Folders

**Impact: HIGH (makes child route groups explicit before filenames grow long or sibling routes become hard to scan)**

하위 라우트가 생기면 기본적으로 먼저 `(<feature>)` 그룹 폴더를 만들고, 그 안에 해당 feature 파일을 둡니다. 이렇게 하면 pathless 그룹 단위가 분명해지고, sibling route가 늘어나도 파일명이 불필요하게 길어지지 않습니다.

**Incorrect (하위 라우트를 플랫 파일명으로 계속 누적):**

```txt
<route-root>/app/settings.index.tsx
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (하위 라우트 묶음을 그룹 폴더로 먼저 감쌈):**

```txt
<route-root>/app/(settings)/settings.index.tsx
<route-root>/app/(settings)/(profile)/profile.index.tsx
<route-root>/app/(settings)/(security)/security.index.tsx
```
