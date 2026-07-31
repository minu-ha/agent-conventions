---
title: Name Top-level Groups by Shell Meaning
titleKo: 최상위 그룹의 셸 의미 기반 명명
impact: HIGH
impactDescription: 최상위 route 그룹이 우연히 담고 있는 기능이 아니라 소속 셸을 말하게 합니다
tags: naming, layout-shell, route-groups
---

## Name Top-level Groups by Shell Meaning

**Impact: HIGH (최상위 route 그룹이 우연히 담고 있는 기능이 아니라 소속 셸을 말하게 합니다)**

최상위 그룹 이름은 기능명이 아니라 레이아웃 셸 의미가 드러나야 합니다.
`public/app`, `auth/workspace`, `marketing/admin`처럼 셸 단위를 표현하고, 같은 셸이면 새 그룹 이름을 만들지 않습니다.

**Incorrect (기능명으로 최상위 그룹 의미를 대신함):**

```txt
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.index.tsx
<route-root>/(reports)/reports.index.tsx
```

**Correct (셸 의미가 드러나는 이름을 사용):**

```txt
<route-root>/(public)/home.index.tsx
<route-root>/(workspace)/workspace.index.tsx
<route-root>/(workspace)/workspace/(reports)/reports.index.tsx
```
