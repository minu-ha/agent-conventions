---
title: Start Child Route Sets With Parentheses Folders
titleKo: 자식 route 세트는 괄호 폴더로 시작
impact: HIGH
impactDescription: makes child route groups explicit before filenames grow long or sibling routes become hard to scan
tags: child-routes, grouping, folders
---

## Start Child Route Sets With Parentheses Folders

**Impact: HIGH (makes child route groups explicit before filenames grow long or sibling routes become hard to scan)**

하위 라우트가 생기면 기본적으로 먼저 `(<feature>)` 그룹 폴더를 만들고, 그 안에 해당 feature의 4-file set(`feature.css`,
`feature.ts`, `feature.layout.tsx`, `feature.index.tsx`)과 `-local/`을 정리합니다.
이 규칙의 목적은 URL semantics를 바꾸는 것이 아니라 route asset 묶음을 한 feature 단위로 보이게 유지하는 것입니다.
이렇게 하면 sibling route가 늘어나도 같은 계층의 route asset이 서로 섞이지 않고, 파일명이 불필요하게 길어지지 않습니다.

**Incorrect (하위 라우트를 플랫 파일명으로 계속 누적):**

```txt
<route-root>/app/settings.index.tsx
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (하위 라우트 묶음을 그룹 폴더로 먼저 감쌈):**

```txt
<route-root>/app/(settings)/settings.css
<route-root>/app/(settings)/settings.ts
<route-root>/app/(settings)/settings.layout.tsx
<route-root>/app/(settings)/settings.index.tsx
<route-root>/app/(settings)/(profile)/profile.index.tsx
<route-root>/app/(settings)/(security)/security.index.tsx
```
