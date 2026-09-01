---
title: Use Set and Map for Repeated Lookups
titleKo: 같은 조회를 반복하면 `Set`이나 `Map`으로 정리합니다
impact: MEDIUM
impactDescription: 목록이 길어질수록 곱으로 늘어나는 비교를 한 번 만든 조회로 바꿉니다
appliesWhen:
  - 같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때
  - 제외: 조회하는 목록이 짧고 길이가 정해져 있는 경우
tags: functions
---

## Use Set and Map for Repeated Lookups

**Impact: MEDIUM (목록이 길어질수록 곱으로 늘어나는 비교를 한 번 만든 조회로 바꿉니다)**

`includes`와 `find`는 목록을 처음부터 훑습니다.
이 호출이 다른 목록을 도는 콜백 안에 있으면 비교 횟수가 두 목록 길이의 곱이 됩니다.
행 20개에 허용 목록 20개면 400번이라 아무 문제가 없습니다.
행 5,000개에 허용 목록 800개면 400만 번입니다.
두 코드는 모양이 같아서 데이터가 늘어난 뒤에도 눈에 띄지 않습니다.

`Set`과 `Map`은 이 곱을 없앱니다.
길이와 상관없이 한 번에 찾기 때문입니다.
목록 길이를 우리가 정하지 못할 때 차이가 벌어집니다.
서버에서 받은 행이나 사용자가 고른 항목이 그 경우입니다.

다음 중 하나면 바꿉니다.
그 밖에는 그대로 둡니다.

- 같은 목록을 겨냥한 조회가 루프나 `map`·`filter`·`some` 콜백 안에 있습니다.
- 같은 목록을 겨냥한 조회가 서로 다른 세 지점 이상에서 일어납니다.

**길이가 정해진 짧은 목록은 대상이 아닙니다.**
상태 다섯 개를 적어 둔 상수에 `includes`를 한 번 부르는 쪽이 `Set`을 만드는 것보다 읽기 쉽습니다.

**목록을 만들려고 `Set`을 쓰는 것은 이 규칙이 아닙니다.**
`[...new Set(values)]`는 `uniq`, `filter((value) => !set.has(value))`는 `difference`나 `without`입니다.
`values-use-es-toolkit-for-value-helpers`가 그 자리를 봅니다.
`Set`은 만든 뒤에 `has`를 여러 번 부를 때만 남깁니다.

`es-toolkit`의 `keyBy`가 돌려주는 평범한 객체도 조회 자체는 한 번에 합니다.
그래도 조회 자리에는 `Map`을 씁니다.
평범한 객체는 `constructor`나 `toString` 같은 프로토타입 키에 걸립니다.
`Record<string, T>`를 읽으면 없는 키도 `T`로 잡혀 빠진 값이 드러나지 않습니다.
`map.get()`은 언제나 `T | undefined`라 없다는 사실이 타입에 남습니다.
`groupBy`와 `keyBy`는 조회가 아니라 목록을 다시 짜는 자리에서 씁니다.

**Incorrect (같은 배열을 반복 순회하며 포함 여부를 확인합니다):**

```ts
const visibleProducts = products.filter((product) => allowedProductIds.includes(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIds.includes(product.id));
```

**Correct (반복 조회는 `Set`으로 승격합니다):**

```ts
const allowedProductIdSet = new Set(allowedProductIds);

const visibleProducts = products.filter((product) => allowedProductIdSet.has(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIdSet.has(product.id));
```

**Correct (반복 키 조회는 `Map`으로 승격합니다):**

```ts
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
```

**Correct (길이가 정해진 짧은 목록은 `includes`를 그대로 씁니다):**

```ts
const isEditableStatus = editable_order_statuses.includes(order.status);
```
