---
title: Prefer Immutable Array Sorting
titleKo: 원본을 바꾸지 않고 배열을 정렬합니다
impact: MEDIUM
impactDescription: 프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다
appliesWhen:
  - 프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때
  - 기존 `.sort()` 호출을 추가·변경할 때
tags: functions, arrays, immutability
---

## Prefer Immutable Array Sorting

**Impact: MEDIUM (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

이 함수가 만들지 않은 배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이 그 경우입니다.

`.toSorted()`를 먼저 씁니다.
쓰려면 `tsconfig`의 `lib`에 `ES2023` 이상이 있어야 하고, **실행 환경도 지원해야 합니다.**
`lib`는 타입 검사만 열어 주고 폴리필하지 않습니다.
둘 중 하나라도 안 되면 `[...list].sort()`로 복사한 뒤 정렬합니다.

**Incorrect (매개변수로 받은 배열을 제자리에서 변경):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.sort((left, right) => left.name.localeCompare(right.name));
};
```

**Correct (`toSorted()`로 새 배열을 만듦):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.toSorted((left, right) => left.name.localeCompare(right.name));
};
```

**Correct (`lib`나 실행 환경이 안 되면 복사 후 정렬):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return [...users].sort((left, right) => left.name.localeCompare(right.name));
};
```
