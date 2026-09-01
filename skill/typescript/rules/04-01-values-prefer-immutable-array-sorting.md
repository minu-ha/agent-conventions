---
title: Prefer Immutable Array Sorting
titleKo: 원본을 바꾸지 않고 배열을 정렬합니다
impact: HIGH
impactDescription: 프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다
appliesWhen:
  - 프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때
  - 기존 `.sort()` 호출을 추가·변경할 때
reviewWith: values-use-es-toolkit-for-value-helpers
tags: functions, arrays, immutability
---

## Prefer Immutable Array Sorting

**Impact: HIGH (프롭스, 상태, 모듈 상수에서 온 배열을 정렬할 때 원본이 바뀌는 버그를 피합니다)**

배열은 `.sort()`로 제자리에서 바꾸지 않습니다.
프롭스, 상태, 매개변수, 모듈 상수로 들어온 배열이면 원본까지 함께 바뀝니다.

정렬은 `es-toolkit`의 `sortBy`와 `orderBy`로 합니다.
키 하나면 `sortBy`, 정렬 방향이 섞이면 `orderBy`입니다.
둘 다 새 배열을 돌려주므로 원본은 그대로 남습니다.

비교 규칙을 키로 적을 수 없을 때만 `.toSorted()`를 씁니다.
한국어 이름을 `localeCompare`로 비교하는 정렬이 여기 해당합니다.

**Incorrect (매개변수로 받은 배열을 제자리에서 바꿉니다):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.sort((left, right) => left.age - right.age);
};
```

**Correct (키 기준 정렬은 `sortBy`를 씁니다):**

```ts
import {sortBy} from "es-toolkit";

const toSortedUsers = (users: User[]): User[] => {
	return sortBy(users, ["age"]);
};
```

**Correct (방향이 섞이면 `orderBy`를 씁니다):**

```ts
import {orderBy} from "es-toolkit";

const toSortedProducts = (products: Product[]): Product[] => {
	return orderBy(products, ["category", "price"], ["asc", "desc"]);
};
```

**Correct (비교 규칙을 키로 적을 수 없으면 `.toSorted()`를 씁니다):**

```ts
const toSortedUsers = (users: User[]): User[] => {
	return users.toSorted((left, right) => left.name.localeCompare(right.name));
};
```
