---
title: Use Set and Map for Repeated Lookups
titleKo: 같은 조회를 반복하면 `Set` 이나 `Map` 으로 정리합니다
impact: MEDIUM
impactDescription: 조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다
appliesWhen:
  - 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때
tags: functions
---

## Use Set and Map for Repeated Lookups

**Impact: MEDIUM (조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다)**

같은 목록에 포함 검사나 키 조회를 여러 번 한다면 `includes`와 `find`를 매번 돌리지 않습니다.
`Set`이나 `Map`으로 한 번 정리합니다.
다음 중 하나면 바꿉니다. 그 밖에는 그대로 둡니다.

- 같은 목록을 겨냥한 조회가 루프나 `map`·`filter`·`some` 콜백 안에 있습니다.
- 같은 목록을 겨냥한 조회가 서로 다른 세 지점 이상에서 일어납니다.

**Incorrect (같은 배열을 반복 순회하며 포함 여부를 확인):**

```ts
const visibleEntries = entries.filter((entry) => allowedEntryIds.includes(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIds.includes(entry.id));
```

**Correct (반복 조회는 `Set`으로 승격):**

```ts
const allowedEntryIdSet = new Set(allowedEntryIds);

const visibleEntries = entries.filter((entry) => allowedEntryIdSet.has(entry.id));
const disabledEntries = archivedEntries.filter((entry) => allowedEntryIdSet.has(entry.id));
```

**Correct (반복 키 조회는 `Map`으로 승격):**

```ts
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
```
