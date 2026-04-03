---
title: Prefer Immutable Array Sorting
impact: MEDIUM
impactDescription: avoids mutation bugs when sorted arrays come from props, state, or shared inputs
tags: functions, arrays, sorting, immutability
---

## Prefer Immutable Array Sorting

**Impact: MEDIUM (avoids mutation bugs when sorted arrays come from props, state, or shared inputs)**

정렬이 필요한데 원본 배열을 계속 써야 한다면 `.sort()`로 제자리 mutation을 하지 않습니다. 최신 런타임이면 `.toSorted()`를 우선하고, 그렇지 않으면 복사 후 정렬합니다.

**Incorrect (원본 배열을 직접 mutation):**

```ts
const sortedUsers = users.sort((left, right) => left.name.localeCompare(right.name));
```

**Correct (`toSorted()` 또는 복사 후 정렬로 불변성 유지):**

```ts
const sortedUsers = users.toSorted((left, right) => left.name.localeCompare(right.name));
```

```ts
const sortedUsers = [...users].sort((left, right) => left.name.localeCompare(right.name));
```
