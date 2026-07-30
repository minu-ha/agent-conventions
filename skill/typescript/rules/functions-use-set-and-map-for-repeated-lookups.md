---
title: Use Set and Map for Repeated Lookups
titleKo: 반복 조회에는 Set과 Map
impact: MEDIUM
impactDescription: keeps repeated membership and keyed access code explicit once lookup count grows
impactDescriptionKo: 조회 횟수가 늘어나면 반복되는 포함 검사와 키 접근을 명시적으로 드러냄
appliesWhen: 같은 컬렉션에 `includes`, `find` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경한다.
tags: functions, set, map, lookups, performance
---

## Use Set and Map for Repeated Lookups

**Impact: MEDIUM (keeps repeated membership and keyed access code explicit once lookup count grows)**

같은 컬렉션에 대해 membership check나 keyed access를 여러 번 반복한다면 배열 `includes`,
`find`를 매번 다시 돌리지 말고 `Set`이나 `Map`으로 한 번 정리합니다.
단발성 한두 번 조회면 그대로 두고, 반복 lookup이 실제로 있는 경우에만 승격합니다.

**Incorrect (같은 배열을 반복 순회하며 membership를 확인):**

```ts
const visibleEntries = entries.filter((entry) => allowedEntryIds.includes(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIds.includes(entry.id));
```

**Correct (반복 lookup은 `Set`으로 승격):**

```ts
const allowedEntryIdSet = new Set(allowedEntryIds);

const visibleEntries = entries.filter((entry) => allowedEntryIdSet.has(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIdSet.has(entry.id));
```

**Correct (반복 keyed access는 `Map`으로 승격):**

```ts
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
```
