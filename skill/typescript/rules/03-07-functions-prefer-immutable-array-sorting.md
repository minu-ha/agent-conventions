---
title: Prefer Immutable Array Sorting
titleKo: 원본을 바꾸지 않고 배열을 정렬합니다
impact: MEDIUM
impactDescription: 프롭스, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다
appliesWhen:
  - 프롭스, 상태, 매개변수, 공유 입력에서 온 배열을 정렬할 때
  - 기존 `.sort()` 호출을 추가·변경할 때
tags: functions
---

## Prefer Immutable Array Sorting

**Impact: MEDIUM (프롭스, 상태, 공유 입력에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

이 함수가 만들지 않은 배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이 그 경우입니다.

`.toSorted()`를 먼저 씁니다.
쓰려면 `tsconfig`의 `lib`에 `ES2023`이 있어야 하고, **실행 환경도 지원해야 합니다.**
`lib`는 타입 검사만 열어 주고 폴리필하지 않습니다.
지원하지 않는 환경이면 `[...list].sort()`를 씁니다.
아니면 복사한 뒤 정렬합니다.
`toSorted()`는 ES2023이라 `tsconfig`의 `lib`에 `ES2023` 이상이 있어야 씁니다.
없으면 복사 후 정렬을 씁니다.

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
