---
title: Split Top-level Route Groups by Layout Shell
impact: CRITICAL
impactDescription: keeps top-level route boundaries aligned with real shell differences instead of feature names
tags: layout-shell, grouping, route-tree
---

## Split Top-level Route Groups by Layout Shell

**Impact: CRITICAL (keeps top-level route boundaries aligned with real shell differences instead of feature names)**

최상위 라우트 그룹은 기능명 기준이 아니라 레이아웃 셸 기준으로 나눕니다.
헤더, 사이드바, 접근 가드, 브레드크럼, 전역 래퍼가 다르면 별도 최상위 그룹으로 분리하고, 모든 화면이 같은 셸을 공유하면
기능별 최상위 그룹으로 쪼개지 않습니다.

**Incorrect (같은 레이아웃인데 기능명으로 최상위 그룹을 분리):**

```txt
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.index.tsx
<route-root>/(settings)/settings.index.tsx
```

**Correct (셸 차이가 있을 때만 최상위 그룹을 분리):**

```txt
<route-root>/(public)/home.index.tsx
<route-root>/(workspace)/workspace.layout.tsx
<route-root>/(workspace)/workspace.index.tsx
<route-root>/(workspace)/workspace/(settings)/settings.index.tsx
```
