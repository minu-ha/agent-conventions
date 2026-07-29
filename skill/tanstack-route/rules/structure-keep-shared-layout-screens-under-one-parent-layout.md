---
title: Keep Shared-layout Screens Under One Parent Layout
impact: HIGH
impactDescription: avoids duplicating top-level route shells when screens share the same layout
tags: layout, grouping, shells
---

## Keep Shared-layout Screens Under One Parent Layout

**Impact: HIGH (avoids duplicating top-level route shells when screens share the same layout)**

여러 화면이 같은 레이아웃 셸을 쓰면 같은 부모 `layout` 아래에 두고 하위 그룹만 늘립니다.
기능이 다르다는 이유만으로 최상위 레이아웃을 새로 만들지 말고, 동일 셸이라면 기존 부모 아래에서 확장합니다.
각 feature가 자기 `feature.layout.tsx` tunnel route를 따로 가질 수는 있지만, 공통 shell을 대신하는 상위 layout를 feature별로 중복 만들지는 않습니다.

**Incorrect (같은 셸인데 기능별로 상위 layout을 새로 만듦):**

```txt
<route-root>/(orders)/orders.layout.tsx
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.layout.tsx
<route-root>/(members)/members.index.tsx
```

**Correct (같은 셸이면 하나의 부모 layout 아래에 유지):**

```txt
<route-root>/app.layout.tsx
<route-root>/app.index.tsx
<route-root>/app/(orders)/orders.layout.tsx
<route-root>/app/(orders)/orders.index.tsx
<route-root>/app/(members)/members.layout.tsx
<route-root>/app/(members)/members.index.tsx
<route-root>/app/(settings)/settings.layout.tsx
<route-root>/app/(settings)/settings.index.tsx
```
