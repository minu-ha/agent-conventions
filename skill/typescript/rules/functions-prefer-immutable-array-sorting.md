---
title: Prefer Immutable Array Sorting
impact: MEDIUM
impactDescription: avoids mutation bugs when sorted arrays come from props, state, or shared inputs
appliesWhen: props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬하거나 기존 `.sort()` 호출을 추가·변경한다.
tags: functions, arrays, sorting, immutability
---

## Prefer Immutable Array Sorting

**Impact: MEDIUM (avoids mutation bugs when sorted arrays come from props, state, or shared inputs)**

정렬이 필요한데 원본 배열을 계속 써야 한다면 `.sort()`로 제자리 mutation을 하지 않습니다.
프로젝트 런타임이 ES2023 이상이거나 `toSorted()` 지원이 보장되면
`.toSorted()`를 우선하고,
그렇지 않으면 복사 후 정렬합니다.
companion skill이므로 지원 여부가 불분명한 환경에 무조건 `toSorted()`를 강제하지는 않습니다.

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
