---
title: Prefer Immutable Array Sorting
titleKo: 원본을 바꾸지 않고 배열을 정렬합니다
impact: MEDIUM
impactDescription: 프롭스, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다
appliesWhen:
  - 프롭스, 상태, 매개변수, 공유 입력에서 온 배열을 정렬할 때
  - 기존 `.sort()` 호출을 추가·변경할 때
tags: functions, arrays, sorting, immutability
---

## Prefer Immutable Array Sorting

**Impact: MEDIUM (프롭스, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

원본 배열을 계속 써야 하면 `.sort()`로 제자리에서 바꾸지 않습니다.
실행 환경이 ES2023 이상이거나 `toSorted()`를 쓸 수 있으면 `.toSorted()`를 먼저 씁니다.
아니면 복사한 뒤 정렬합니다.
동반 스킬이므로 지원 여부가 불분명한 환경에 `toSorted()`를 강제하지는 않습니다.

**Incorrect (원본 배열을 직접 변경):**

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
